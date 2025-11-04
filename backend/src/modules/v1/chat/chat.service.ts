import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Chat } from '@/common/base-chat/entities/chat.entity';
import { ChatMessage } from '@/common/base-chat/entities/chat-message.entity';
import { CreateChatDto } from '@shared/dtos/chat-dtos/chat.dto';
import { BaseChatService } from '@/common/base-chat/base-chat.service';
import { ChatNotificationService } from './services/chat-notification.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly baseChatService: BaseChatService,
    private readonly chatNotificationService: ChatNotificationService,
  ) {}

  /**
   * Create or get existing chat between users
   */
  async createOrGetChat(userId: string, dto: CreateChatDto): Promise<Chat> {
    // For 1-on-1 chats, check if chat already exists with these two users
    // Get all chats where user is a participant
    const userChatUsers = await this.baseChatService.chatUserRepository.find({
      where: { userId },
      relations: ['chat', 'chat.chatUsers', 'chat.chatUsers.user'],
    });

    // Find a chat that has exactly 2 participants (1-on-1) with both users
    for (const userChatUser of userChatUsers) {
      if (
        userChatUser.chat?.chatUsers &&
        userChatUser.chat.chatUsers.length === 2
      ) {
        const hasOtherUser = userChatUser.chat.chatUsers.some(
          (cu) => cu.userId === dto.participantId,
        );
        if (hasOtherUser) {
          return userChatUser.chat;
        }
      }
    }

    // Create new chat
    const chat = this.baseChatService.chatRepository.create({});
    const savedChat = await this.baseChatService.chatRepository.save(chat);

    // Add both users to the chat
    const chatUser1 = this.baseChatService.chatUserRepository.create({
      chatId: savedChat.id,
      userId,
      joinedAt: new Date(),
    });

    const chatUser2 = this.baseChatService.chatUserRepository.create({
      chatId: savedChat.id,
      userId: dto.participantId,
      joinedAt: new Date(),
    });

    await this.baseChatService.chatUserRepository.save([chatUser1, chatUser2]);

    return savedChat;
  }

  /**
   * Add user(s) to an existing chat
   */
  async addUsersToChat(
    chatId: string,
    userIds: string[],
    addedBy: string,
  ): Promise<Chat> {
    // Verify the user adding others is part of the chat
    await this.verifyUserInChat(addedBy, chatId);

    const chat = await this.baseChatService.getSingle(chatId);

    // Check which users are not already in the chat
    const existingChatUsers = await this.baseChatService.getSingle(chatId, {
      _relations: ['chatUsers'],
    });

    const existingUserIds =
      existingChatUsers.chatUsers?.map((cu) => cu.userId) || [];
    const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      return chat;
    }

    // Add new users to the chat
    const newChatUsers = newUserIds.map((userId) =>
      this.baseChatService.chatUserRepository.create({
        chatId,
        userId,
        joinedAt: new Date(),
      }),
    );

    await this.baseChatService.chatUserRepository.save(newChatUsers);

    return chat;
  }

  /**
   * Send a message
   */
  async sendMessage(
    senderId: string,
    chatIdOrRecipientId: string,
    message: string,
    initialRecipientId?: string,
  ): Promise<ChatMessage> {
    let chat: Chat | null;

    // If initialRecipientId is provided, create or get chat
    if (initialRecipientId) {
      chat = await this.createOrGetChat(senderId, {
        participantId: initialRecipientId,
      });
    } else {
      // Get existing chat
      chat = await this.baseChatService.chatRepository.findOne({
        where: { id: chatIdOrRecipientId },
      });

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }

      // Verify user is part of chat
      const chatUser = await this.baseChatService.chatUserRepository.findOne({
        where: { chatId: chat.id, userId: senderId },
      });

      if (!chatUser) {
        throw new ForbiddenException('You are not a participant of this chat');
      }
    }

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Create message
    const chatMessage = this.baseChatService.messageRepository.create({
      chatId: chat.id,
      senderId,
      message,
      messageType: 'text',
    });

    const savedMessage =
      await this.baseChatService.messageRepository.save(chatMessage);

    // Update chat's last message
    chat.lastMessageId = savedMessage.id;
    await this.baseChatService.chatRepository.save(chat);

    // Load relations for response
    const messageWithRelations =
      await this.baseChatService.messageRepository.findOne({
        where: { id: savedMessage.id },
        relations: ['sender', 'chat'],
      });

    if (!messageWithRelations) {
      throw new NotFoundException('Message not found after creation');
    }

    // Send notification to all other participants
    const chatUsers = await this.baseChatService.chatUserRepository.find({
      where: { chatId: chat.id },
    });

    const otherParticipants = chatUsers.filter((cu) => cu.userId !== senderId);

    // Send notifications to all other participants
    for (const participant of otherParticipants) {
      try {
        await this.chatNotificationService.notifyNewMessage(
          messageWithRelations,
          chat,
          participant.userId,
        );
      } catch (error) {
        // Log but don't fail message sending
        console.error(
          `Failed to send chat notification to ${participant.userId}:`,
          error,
        );
      }
    }

    return messageWithRelations;
  }

  /**
   * Get chats for a user
   */
  async getUserChats(userId: string): Promise<Chat[]> {
    // Get all chat users for this user
    const chatUsers = await this.baseChatService.chatUserRepository.find({
      where: { userId },
      relations: ['chat'],
    });

    const chatIds = chatUsers.map((cu) => cu.chatId);

    if (chatIds.length === 0) {
      return [];
    }

    return await this.baseChatService.chatRepository.find({
      where: chatIds.map((id) => ({ id })),
      relations: [
        'lastMessage',
        'lastMessage.sender',
        'chatUsers',
        'chatUsers.user',
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Get messages for a chat
   */
  async getChatMessages(
    chatId: string,
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<ChatMessage[]> {
    // Verify user is part of chat
    await this.verifyUserInChat(userId, chatId);

    return await this.baseChatService.messageRepository.find({
      where: { chatId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.baseChatService.messageRepository.findOne({
      where: { id: messageId },
      relations: ['chat'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify user is part of chat
    await this.verifyUserInChat(userId, message.chatId);

    // Only mark as read if user is not the sender
    if (message.senderId !== userId && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await this.baseChatService.messageRepository.save(message);
    }
  }

  /**
   * Verify user is part of chat
   */
  async verifyUserInChat(userId: string, chatId: string): Promise<void> {
    const chat = await this.baseChatService.chatRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const chatUser = await this.baseChatService.chatUserRepository.findOne({
      where: { chatId, userId },
    });

    if (!chatUser) {
      throw new ForbiddenException('You are not a participant of this chat');
    }
  }
}

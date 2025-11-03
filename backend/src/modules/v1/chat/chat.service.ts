import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Conversation } from '@/common/base-chat/entities/conversation.entity';
import { ChatMessage } from '@/common/base-chat/entities/chat-message.entity';
import { SendMessageDto, CreateChatDto } from '@shared/dtos/chat-dtos/chat.dto';
import { BaseChatService } from '@/common/base-chat/base-chat.service';

@Injectable()
export class ChatService {
  constructor(private readonly baseChatService: BaseChatService) {}

  /**
   * Create or get existing conversation between two users
   */
  async createOrGetConversation(
    userId: string,
    dto: CreateChatDto,
  ): Promise<Conversation> {
    // Check if conversation already exists
    const existing = await this.baseChatService.conversationRepository.findOne({
      where: [
        {
          participantOneId: userId,
          participantTwoId: dto.participantId,
        },
        {
          participantOneId: dto.participantId,
          participantTwoId: userId,
        },
      ],
    });

    if (existing) {
      return existing;
    }

    // Create new conversation
    const conversation = this.baseChatService.conversationRepository.create({
      participantOneId: userId,
      participantTwoId: dto.participantId,
    });

    return await this.baseChatService.conversationRepository.save(
      conversation,
    );
  }

  /**
   * Send a message
   */
  async sendMessage(
    senderId: string,
    chatIdOrRecipientId: string,
    message: string,
    recipientId?: string,
  ): Promise<ChatMessage> {
    let conversation: Conversation;

    // If recipientId is provided, create or get conversation
    if (recipientId) {
      conversation = await this.createOrGetConversation(senderId, {
        participantId: recipientId,
      });
    } else {
      // Get existing conversation
      conversation =
        await this.baseChatService.conversationRepository.findOne({
          where: { id: chatIdOrRecipientId },
        });

      if (!conversation) {
        throw new NotFoundException('Chat not found');
      }

      // Verify user is part of conversation
      if (
        conversation.participantOneId !== senderId &&
        conversation.participantTwoId !== senderId
      ) {
        throw new ForbiddenException('You are not a participant of this chat');
      }
    }

    // Create message
    const chatMessage = this.baseChatService.messageRepository.create({
      conversationId: conversation.id,
      senderId,
      message,
      messageType: 'text',
    });

    const savedMessage =
      await this.baseChatService.messageRepository.save(chatMessage);

    // Update conversation's last message
    conversation.lastMessageId = savedMessage.id;
    await this.baseChatService.conversationRepository.save(conversation);

    // Load relations for response
    return await this.baseChatService.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'sender.profile', 'sender.profile.image'],
    });
  }

  /**
   * Get conversations for a user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await this.baseChatService.conversationRepository.find({
      where: [{ participantOneId: userId }, { participantTwoId: userId }],
      relations: [
        'lastMessage',
        'lastMessage.sender',
        'lastMessage.sender.profile',
        'lastMessage.sender.profile.image',
        'participantOne',
        'participantOne.profile',
        'participantOne.profile.image',
        'participantTwo',
        'participantTwo.profile',
        'participantTwo.profile.image',
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<ChatMessage[]> {
    // Verify user is part of conversation
    await this.verifyUserInConversation(userId, conversationId);

    return await this.baseChatService.messageRepository.find({
      where: { conversationId },
      relations: ['sender', 'sender.profile', 'sender.profile.image'],
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
      relations: ['conversation'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify user is part of conversation
    await this.verifyUserInConversation(userId, message.conversationId);

    // Only mark as read if user is not the sender
    if (message.senderId !== userId && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await this.baseChatService.messageRepository.save(message);
    }
  }

  /**
   * Verify user is part of conversation
   */
  async verifyUserInConversation(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    const conversation =
      await this.baseChatService.conversationRepository.findOne({
        where: { id: conversationId },
      });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participantOneId !== userId &&
      conversation.participantTwoId !== userId
    ) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }
  }
}



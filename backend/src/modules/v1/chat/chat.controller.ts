import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, CreateChatDto } from '@shared/dtos/chat-dtos/chat.dto';
import { ChatMessageDto, ChatDto } from '@shared/dtos/chat-dtos/chat.dto';
import { AuthUser } from '@/decorators/user.decorator';
import { User } from '@/common/base-user/entities/user.entity';
import { ChatWebSocketService } from './services/chat-websocket.service';

@ApiTags('Chat')
@ApiBearerAuth('access-token')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatWebSocketService: ChatWebSocketService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create or get existing chat with a user' })
  @ApiResponse({
    status: 201,
    description: 'Chat created or retrieved successfully',
    type: ChatDto,
  })
  async createOrGetChat(
    @AuthUser() currentUser: User,
    @Body() dto: CreateChatDto,
  ): Promise<ChatDto> {
    const chat = await this.chatService.createOrGetChat(currentUser.id, {
      participantId: dto.participantId,
    });
    return chat as unknown as ChatDto;
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Chats retrieved successfully',
    type: [ChatDto],
  })
  async getMyChats(@AuthUser() currentUser: User): Promise<ChatDto[]> {
    const chats = await this.chatService.getUserChats(currentUser.id);
    return chats as unknown as ChatDto[];
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Get messages for a chat' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [ChatMessageDto],
  })
  async getChatMessages(
    @AuthUser() currentUser: User,
    @Param('chatId') chatId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ChatMessageDto[]> {
    const messages = await this.chatService.getChatMessages(
      chatId,
      currentUser.id,
      limit || 50,
      offset || 0,
    );
    return messages.reverse() as unknown as ChatMessageDto[]; // Reverse to show oldest first
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    type: ChatMessageDto,
  })
  async sendMessage(
    @AuthUser() currentUser: User,
    @Body() dto: SendMessageDto,
  ): Promise<ChatMessageDto> {
    const message = await this.chatService.sendMessage(
      currentUser.id,
      dto.chatId,
      dto.message,
      dto.recipientId,
    );

    // Get chat with users
    const chatWithUsers = await this.chatService.getUserChats(currentUser.id);
    const currentChat = chatWithUsers.find((c) => c.id === message.chatId);

    if (currentChat?.chatUsers && currentChat.chatUsers.length > 0) {
      const sender = message.sender as any;
      const messageData = {
        id: message.id,
        senderId: message.senderId,
        message: message.message,
        chatId: message.chatId,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        sender: sender
          ? {
              id: sender.id,
              firstName: sender.firstName,
              lastName: sender.lastName,
            }
          : undefined,
      };

      // Emit to chat room for all participants (most efficient way)
      this.chatWebSocketService.emitToChatRoom(
        message.chatId,
        'newMessage',
        messageData,
      );
    }

    return message as unknown as ChatMessageDto;
  }

  @Post('messages/:messageId/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read successfully',
  })
  async markMessageAsRead(
    @AuthUser() currentUser: User,
    @Param('messageId') messageId: string,
  ): Promise<{ success: boolean }> {
    await this.chatService.markMessageAsRead(messageId, currentUser.id);
    return { success: true };
  }
}

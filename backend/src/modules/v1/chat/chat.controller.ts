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
import { ServerGateway } from '@/common/gateways/server.gateway';

@ApiTags('Chat')
@ApiBearerAuth('access-token')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly serverGateway: ServerGateway,
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
    const chat = await this.chatService.createOrGetConversation(
      currentUser.id,
      { participantId: dto.participantId },
    );
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
    const chats = await this.chatService.getUserConversations(currentUser.id);
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
    const messages = await this.chatService.getConversationMessages(
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
      dto.conversationId,
      dto.message,
      dto.recipientId,
    );

    // Emit via ServerGateway for real-time updates
    const recipientId =
      message.conversation?.participantOneId === currentUser.id
        ? message.conversation?.participantTwoId
        : message.conversation?.participantOneId;

    if (recipientId) {
      // Get socket IDs for recipient
      const recipientSocketIds = this.getRecipientSocketIds(recipientId);

      const sender = message.sender as any;
      const messageData = {
        id: message.id,
        senderId: message.senderId,
        message: message.message,
        chatId: message.conversationId,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        sender: sender
          ? {
              id: sender.id,
              firstName: sender.firstName,
              lastName: sender.lastName,
              profile: sender.profile
                ? {
                    image: sender.profile.image
                      ? {
                          url: sender.profile.image.url,
                        }
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
      };

      // Emit to recipient via socket
      recipientSocketIds.forEach((socketId) => {
        this.serverGateway.emitToClient(socketId, 'newMessage', messageData);
      });

      // Also emit to conversation room if exists
      this.serverGateway.server
        ?.to(`chat:${message.conversationId}`)
        .emit('newMessage', messageData);
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

  private getRecipientSocketIds(userId: string): string[] {
    // Get all connected sockets and find those belonging to the user
    if (!this.serverGateway.server) return [];

    const socketIds: string[] = [];
    this.serverGateway.server.sockets.sockets.forEach((socket, socketId) => {
      const socketUserId =
        socket.handshake.auth?.userId || socket.handshake.query?.userId;
      if (socketUserId === userId) {
        socketIds.push(socketId);
      }
    });
    return socketIds;
  }
}



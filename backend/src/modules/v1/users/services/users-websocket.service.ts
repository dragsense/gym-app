import { Injectable } from '@nestjs/common';
import {
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ServerGateway } from '@/gateways/server.gateway';

/**
 * User WebSocket Service
 * Add this to your users module to handle user-specific WebSocket events
 */
@Injectable()
export class UsersWebSocketService {
  constructor(private readonly serverGateway: ServerGateway) {}

  /**
   * Send notification to a specific user
   */
  sendNotificationToUser(userId: number, message: string) {
    this.serverGateway.emitToClient(`user_${userId}`, 'notification', {
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle user joining their room
   */
  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @MessageBody('userId') userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const userRoom = `user_${userId}`;
    void client.join(userRoom);
    console.log(`👤 User ${userId} joined room: ${userRoom}`);
    return { success: true, message: `Joined user room ${userId}` };
  }

  /**
   * Handle user leaving their room
   */
  @SubscribeMessage('leaveUserRoom')
  handleLeaveUserRoom(
    @MessageBody('userId') userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const userRoom = `user_${userId}`;
    void client.leave(userRoom);
    console.log(`👤 User ${userId} left room: ${userRoom}`);
    return { success: true, message: `Left user room ${userId}` };
  }
}

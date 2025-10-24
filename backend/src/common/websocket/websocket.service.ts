import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { Server } from 'socket.io';

@Injectable()
export class WebSocketService {
  private readonly logger = new LoggerService(WebSocketService.name);
  private server: Server;

  /**
   * Set the server instance (called by ServerGateway)
   */
  setServer(server: Server): void {
    this.server = server;
    this.logger.log('🔌 WebSocket service initialized with server instance');
  }

  /**
   * Emit a message to all connected clients
   * @param event - The event name to emit
   * @param data - The data to send
   */
  emitToAll(event: string, data: unknown): void {
    if (!this.server) {
      this.logger.warn(
        'WebSocket server not initialized. Cannot emit message.',
      );
      return;
    }

    this.server.emit(event, data);
    this.logger.log(`📡 Emitted '${event}' to all clients`);
  }

  /**
   * Emit a message to a specific user room
   * @param userId - The user ID
   * @param event - The event name to emit
   * @param data - The data to send
   */
  emitToUser(userId: number, event: string, data: unknown): void {
    const userRoom = `user_${userId}`;
    this.emitToRoom(userRoom, event, data);
  }

  /**
   * Emit a message to multiple users
   * @param userIds - Array of user IDs
   * @param event - The event name to emit
   * @param data - The data to send
   */
  emitToUsers(userIds: number[], event: string, data: unknown): void {
    if (!this.server) {
      this.logger.warn(
        'WebSocket server not initialized. Cannot emit message.',
      );
      return;
    }

    userIds.forEach((userId) => {
      const userRoom = `user_${userId}`;
      this.server.to(userRoom).emit(event, data);
    });

    this.logger.log(`📡 Emitted '${event}' to ${userIds.length} users`);
  }

  /**
   * Emit a message to a specific room
   * @param room - The room name
   * @param event - The event name to emit
   * @param data - The data to send
   */
  emitToRoom(room: string, event: string, data: unknown): void {
    if (!this.server) {
      this.logger.warn(
        'WebSocket server not initialized. Cannot emit message.',
      );
      return;
    }

    this.server.to(room).emit(event, data);
    this.logger.log(`📡 Emitted '${event}' to room '${room}'`);
  }

  /**
   * Emit a message to a specific socket ID
   * @param socketId - The socket ID
   * @param event - The event name to emit
   * @param data - The data to send
   */
  emitToSocket(socketId: string, event: string, data: unknown): void {
    if (!this.server) {
      this.logger.warn(
        'WebSocket server not initialized. Cannot emit message.',
      );
      return;
    }

    this.server.to(socketId).emit(event, data);
    this.logger.log(`📡 Emitted '${event}' to socket '${socketId}'`);
  }

  /**
   * Get the number of connected clients
   * @returns Number of connected clients
   */
  getConnectedClientsCount(): number {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized.');
      return 0;
    }

    return this.server.sockets.sockets.size;
  }

  /**
   * Get all connected socket IDs
   * @returns Array of socket IDs
   */
  getConnectedSocketIds(): string[] {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized.');
      return [];
    }

    return Array.from(this.server.sockets.sockets.keys());
  }

  /**
   * Check if a specific socket is connected
   * @param socketId - The socket ID to check
   * @returns True if socket is connected
   */
  isSocketConnected(socketId: string): boolean {
    if (!this.server) {
      return false;
    }

    return this.server.sockets.sockets.has(socketId);
  }

  /**
   * Get all sockets in a specific room
   * @param room - The room name
   * @returns Array of socket IDs in the room
   */
  getSocketsInRoom(room: string): string[] {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized.');
      return [];
    }

    const roomSockets = this.server.sockets.adapter.rooms.get(room);
    return roomSockets ? Array.from(roomSockets) : [];
  }

  /**
   * Disconnect a specific socket
   * @param socketId - The socket ID to disconnect
   */
  disconnectSocket(socketId: string): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized.');
      return;
    }

    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect();
      this.logger.log(`🔌 Disconnected socket '${socketId}'`);
    } else {
      this.logger.warn(`Socket '${socketId}' not found`);
    }
  }
}

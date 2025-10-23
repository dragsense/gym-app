import { config } from '@/config';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

export const SOCKET_API_URL = config.baseUrl || 'http://localhost:5000';

interface ServerToClientEvents {
  connect_error: (error: Error) => void;
  disconnect: (reason: string) => void;
  newNotification: (data: any) => void;
  unreadCountUpdate: (data: { count: number }) => void;
}

interface ClientToServerEvents {
  joinUserRoom: (
    data: { userId: number },
    callback: (response: { success: boolean; message: string } | { error: { message: string } }) => void
  ) => void;
  leaveUserRoom: (
    data: { userId: number },
    callback: (response: { success: boolean; message: string } | { error: { message: string } }) => void
  ) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_API_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 10000,
  autoConnect: true,
  forceNew: true,
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('connect_error', (error: any) => {
  console.error('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason: any) => {
  console.warn('🔌 Disconnected:', reason);
});

export const socketEmitter = <TResponse>(
  event: keyof ClientToServerEvents,
  data?: unknown
): Promise<TResponse> => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      return reject(new Error('Socket not connected'));
    }

    socket.emit(event as any, data, (response: any) => {
      if (response?.error) {
        return reject(new Error(response.error.message));
      }
      resolve(response as TResponse);
    });
  });
};

// === User Room (Notifications) ===

export const joinUserRoom = (userId: number) =>
  socketEmitter<{ success: boolean; message: string }>('joinUserRoom', { userId });

export const leaveUserRoom = (userId: number) =>
  socketEmitter<{ success: boolean; message: string }>('leaveUserRoom', { userId });

export default socket;

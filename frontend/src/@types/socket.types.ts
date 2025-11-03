import type { IChatMessage } from '@shared/interfaces/chat.interface';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  read?: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Use shared interface for chat messages
export type ChatMessage = IChatMessage & {
  senderName?: string;
  senderAvatar?: string;
  timestamp?: string;
};


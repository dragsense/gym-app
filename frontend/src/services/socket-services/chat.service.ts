import socket from "@/utils/socket.service";
import type { ChatMessage } from "@/@types/socket.types";

class ChatService {
  /**
   * Listen for new messages
   */
  onMessage(callback: (data: ChatMessage) => void) {
    socket.on("newMessage", callback);
    return () => {
      socket.off("newMessage", callback);
    };
  }

  /**
   * Listen for message read status updates
   */
  onMessageRead(callback: (messageId: string) => void) {
    socket.on("messageRead", callback);
    return () => {
      socket.off("messageRead", callback);
    };
  }

  /**
   * Listen for user typing indicators
   */
  onUserTyping(
    callback: (data: {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }) => void
  ) {
    socket.on("userTyping", callback);
    return () => {
      socket.off("userTyping", callback);
    };
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    message: string,
    recipientId?: string
  ): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      if (!socket.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      socket.emit(
        "sendMessage",
        { conversationId, message, recipientId },
        (response) => {
          if ("error" in response) {
            reject(new Error(response.error.message));
          } else if (response.message) {
            resolve(response.message);
          } else {
            reject(new Error("No message returned"));
          }
        }
      );
    });
  }

  /**
   * Join a conversation room
   */
  async joinConversation(conversationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!socket.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      socket.emit("joinConversation", { conversationId }, (response) => {
        if ("error" in response) {
          reject(new Error(response.error.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Leave a conversation room
   */
  async leaveConversation(conversationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!socket.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      socket.emit("leaveConversation", { conversationId }, (response) => {
        if ("error" in response) {
          reject(new Error(response.error.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    if (!socket.connected) return;
    socket.emit("typing", { conversationId, isTyping });
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return socket.connected;
  }
}

export const chatService = new ChatService();



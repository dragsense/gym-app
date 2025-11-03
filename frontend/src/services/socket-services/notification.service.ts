import socket from "@/utils/socket.service";
import type { NotificationData } from "@/@types/socket.types";

class NotificationService {
  /**
   * Listen for new notifications
   */
  onNotification(callback: (data: NotificationData) => void) {
    socket.on("newNotification", callback);
    return () => {
      socket.off("newNotification", callback);
    };
  }

  /**
   * Listen for notification read status updates
   */
  onNotificationRead(callback: (notificationId: string) => void) {
    socket.on("notificationRead", callback);
    return () => {
      socket.off("notificationRead", callback);
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!socket.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      socket.emit("markNotificationRead", { notificationId }, (response) => {
        if ("error" in response) {
          reject(new Error(response.error.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return socket.connected;
  }
}

export const notificationService = new NotificationService();



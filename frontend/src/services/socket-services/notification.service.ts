import socket from "@/utils/socket.service";
import type { INotification } from "@shared/interfaces/notification.interface";

class NotificationService {
  /**
   * Listen for new notifications
   */
  onNotification(callback: (data: INotification) => void) {
    const handler = (data: INotification) => callback(data);
    socket.on("notification", handler);
    socket.on("newNotification", handler);
    return () => {
      socket.off("notification", handler);
      socket.off("newNotification", handler);
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

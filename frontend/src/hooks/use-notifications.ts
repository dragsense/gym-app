import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { notificationService } from "@/services/socket-services/notification.service";
import type { NotificationData } from "@/@types/socket.types";
import { useAuthUser } from "./use-auth-user";

export interface UseNotificationsReturn {
  notifications: NotificationData[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuthUser();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isConnected, setIsConnected] = useState(notificationService.isConnected);

  // Load existing notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as NotificationData[];
        setNotifications(parsed);
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  // Handle connection status
  useEffect(() => {
    setIsConnected(notificationService.isConnected);
    // Connection status updates are handled by the socket service
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const handleNewNotification = (data: NotificationData) => {
      setNotifications((prev) => {
        // Check if notification already exists
        if (prev.some((n) => n.id === data.id)) {
          return prev;
        }
        return [data, ...prev].slice(0, 100); // Keep last 100 notifications
      });

      // Show toast notification
      toast.info(data.title, {
        description: data.message,
        duration: 5000,
      });

      // Request browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(data.title, {
          body: data.message,
          icon: "/favicon.ico",
          tag: data.id,
        });
      }
    };

    const handleNotificationRead = (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    };

    const unsubscribeNotification = notificationService.onNotification(handleNewNotification);
    const unsubscribeRead = notificationService.onNotificationRead(handleNotificationRead);

    return () => {
      unsubscribeNotification();
      unsubscribeRead();
    };
  }, [user?.id]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );

    // Notify server via service
    notificationService.markAsRead(notificationId).catch((error) => {
      console.error("Failed to mark notification as read:", error);
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Mark all on server
    notifications.forEach((n) => {
      if (!n.read) {
        notificationService.markAsRead(n.id).catch(() => {
          // Silently fail for bulk operations
        });
      }
    });
  }, [notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected,
  };
}

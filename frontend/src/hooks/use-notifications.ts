import { useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/socket-services/notification.service";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "@/services/notification.api";
import { useApiPaginatedQuery } from "./use-api-paginated-query";
import { useApiMutation } from "./use-api-mutation";
import type { INotification } from "@shared/interfaces/notification.interface";
import type { IPaginatedResponse } from "@shared/interfaces/api/response.interface";
import { useAuthUser } from "./use-auth-user";

export interface UseNotificationsReturn {
  notifications: INotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  isConnected: boolean;
  isLoading: boolean;
  loadMore: () => void;
  hasMore: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["notifications", user?.id], [user?.id]);

  // Use infinite mode for load more functionality
  const { data, isLoading, pagination, setPage, error } =
    useApiPaginatedQuery<INotification>(
      queryKey,
      fetchNotifications,
      { page: 1, limit: 20 },
      { mode: "infinite", reverseOrder: true }
    );

  // Show error toast for fetch failures
  useEffect(() => {
    if (error) {
      toast.error("Failed to load notifications", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    }
  }, [error]);

  // Mark notification as read mutation
  const markAsReadMutation = useApiMutation(markNotificationAsRead, {
    onMutate: async (notificationId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData =
        queryClient.getQueryData<IPaginatedResponse<INotification>>(queryKey);

      // Optimistically update
      queryClient.setQueryData<IPaginatedResponse<INotification>>(
        queryKey,
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
          };
        }
      );

      return { previousData } as {
        previousData: IPaginatedResponse<INotification> | undefined;
      };
    },
    onError: (
      error,
      notificationId,
      context: { previousData?: IPaginatedResponse<INotification> }
    ) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error("Failed to mark notification as read", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Handle connection status
  const isConnected = notificationService.isConnected;

  // Listen for real-time notifications
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const handleNewNotification = (notification: INotification) => {
      // Update React Query cache
      queryClient.setQueryData<IPaginatedResponse<INotification>>(
        queryKey,
        (old) => {
          if (!old) return old;

          // Check if notification already exists
          if (old.data.some((n) => n.id === notification.id)) {
            return old;
          }

          // Add new notification at the beginning (reverseOrder: true)
          return {
            ...old,
            data: [notification, ...old.data],
            total: (old.total ?? 0) + 1,
          };
        }
      );

      toast.info(notification.title, {
        description: notification.message,
        duration: 5000,
      });

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          tag: notification.id,
        });
      }
    };

    const unsubscribeNotification = notificationService.onNotification(
      handleNewNotification
    );

    return () => {
      unsubscribeNotification();
    };
  }, [user?.id, queryClient, queryKey]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(() => {
    const notifications = data?.data ?? [];
    notifications.forEach((n) => {
      if (!n.isRead) {
        markAsReadMutation.mutate(n.id);
      }
    });
  }, [data?.data, markAsReadMutation]);

  const clearNotifications = useCallback(() => {
    queryClient.setQueryData<IPaginatedResponse<INotification>>(
      queryKey,
      (old) => {
        if (!old) return old;
        return {
          ...old,
          data: [],
          total: 0,
        };
      }
    );
  }, [queryClient, queryKey]);

  const loadMore = useCallback(() => {
    if (isLoading || !pagination.hasNextPage) return;
    setPage((pagination.page ?? 1) + 1);
  }, [isLoading, pagination.hasNextPage, pagination.page, setPage]);

  const notifications = useMemo(() => data?.data ?? [], [data?.data]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected,
    isLoading,
    loadMore,
    hasMore: pagination.hasNextPage,
  };
}

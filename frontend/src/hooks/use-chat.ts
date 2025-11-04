import { useEffect, useState, useCallback, useRef } from "react";
import { chatService } from "@/services/socket-services/chat.service";
import type { ChatMessage } from "@/@types/socket.types";
import { useAuthUser } from "./use-auth-user";
import {
  fetchMyChats,
  fetchChatMessages,
  sendChatMessage,
  createOrGetChat,
} from "@/services/chat.api";
import type { IChat } from "@shared/interfaces/chat.interface";

export interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

// Helper to convert IChat to Chat
const convertChatToChat = (chat: IChat, currentUserId: string): Chat => {
  // Get chatUsers from the chat (from chatUsers relation)
  const chatUsers = (chat as any).chatUsers || [];

  // Find the other participant(s) - exclude current user
  const otherParticipants = chatUsers.filter(
    (cu: any) => cu.user?.id !== currentUserId && cu.user
  );

  // For 1-on-1 chats, use the single other participant
  // For group chats, use the first other participant or chat name
  const otherParticipant = otherParticipants[0]?.user;
  const isGroupChat = chatUsers.length > 2 || chat.name;

  const firstName = (otherParticipant as any)?.firstName;
  const lastName = (otherParticipant as any)?.lastName;

  // Determine participant name
  let participantName: string;
  if (isGroupChat && chat.name) {
    participantName = chat.name;
  } else if (isGroupChat) {
    participantName = `Group Chat (${chatUsers.length} members)`;
  } else {
    participantName =
      firstName && lastName ? `${firstName} ${lastName}` : "User";
  }

  // For group chats, use first participant's avatar or null
  // For 1-on-1, use the other participant's avatar
  const participantAvatar = isGroupChat ? undefined : undefined;

  // For 1-on-1 chats, use the other participant's ID
  // For group chats, use the first participant's ID (or empty)
  const participantId = isGroupChat ? "" : otherParticipant?.id || "";

  return {
    id: chat.id,
    participantId,
    participantName,
    participantAvatar,
    lastMessage: chat.lastMessage
      ? {
          ...chat.lastMessage,
          timestamp: chat.lastMessage.createdAt,
        }
      : undefined,
    unreadCount: 0, // TODO: Calculate from unread messages
  };
};

export interface UseChatReturn {
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  isTyping: { [userId: string]: boolean };
  setCurrentChat: (chatId: string | null, recipientId?: string) => void;
  sendMessage: (message: string, recipientId?: string) => Promise<void>;
  markMessagesAsRead: (chatId: string) => void;
  startNewChat: (recipientId: string, recipientName?: string) => void;
  isConnected: boolean;
  loadMoreMessages: (
    scrollContainer?: HTMLDivElement,
    previousScrollHeightRef?: React.MutableRefObject<number>
  ) => Promise<void>;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  shouldAutoScroll: boolean;
  setShouldAutoScroll: (value: boolean) => void;
}

export function useChat(): UseChatReturn {
  const { user } = useAuthUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChatState] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<{ [userId: string]: boolean }>({});
  const [isConnected, setIsConnected] = useState(chatService.isConnected);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageOffset, setMessageOffset] = useState(0);
  const typingTimeoutRef = useRef<{
    [key: string]: ReturnType<typeof setTimeout>;
  }>({});

  // Handle connection status
  useEffect(() => {
    setIsConnected(chatService.isConnected);
  }, []);

  // Fetch chats from API on mount
  useEffect(() => {
    if (!user?.id) return;

    fetchMyChats()
      .then((chatsData) => {
        const convertedChats = chatsData.map((chat) =>
          convertChatToChat(chat, user.id)
        );
        setChats(convertedChats);
      })
      .catch((error) => {
        console.error("Failed to fetch chats:", error);
      });
  }, [user?.id]);

  // Save chats to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chat_chats", JSON.stringify(chats));
    }
  }, [chats]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0 && currentChat) {
      const stored = localStorage.getItem("chat_messages");
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[currentChat.id] = messages;
      localStorage.setItem("chat_messages", JSON.stringify(parsed));
    }
  }, [messages, currentChat]);

  // Listen for real-time messages (socket only for updates, not initial fetch)
  useEffect(() => {
    if (!user?.id) return;

    const handleNewMessage = (data: ChatMessage) => {
      console.log("📬 New message received:", data);

      // Update messages if this is the current chat
      if (currentChat?.id === data.chatId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }

      // Update chats list to show new message
      setChats((prev) => {
        return prev.map((chat) => {
          if (chat.id === data.chatId) {
            return {
              ...chat,
              lastMessage: {
                ...data,
                timestamp: data.timestamp || data.createdAt,
              },
            };
          }
          return chat;
        });
      });

      // Refresh chats to get updated last message from API
      fetchMyChats()
        .then((chatsData) => {
          const convertedChats = chatsData.map((chat) =>
            convertChatToChat(chat, user.id)
          );
          setChats(convertedChats);
        })
        .catch((error) => {
          console.error("Failed to refresh chats:", error);
        });
    };

    const handleUserTyping = (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => {
      if (currentChat?.id === data.chatId) {
        setIsTyping((prev) => ({
          ...prev,
          [data.userId]: data.isTyping,
        }));

        // Clear typing indicator after 3 seconds
        if (data.isTyping) {
          if (typingTimeoutRef.current[data.userId]) {
            clearTimeout(typingTimeoutRef.current[data.userId]);
          }
          typingTimeoutRef.current[data.userId] = setTimeout(() => {
            setIsTyping((prev) => ({
              ...prev,
              [data.userId]: false,
            }));
          }, 3000);
        }
      }
    };

    const unsubscribeMessage = chatService.onMessage(handleNewMessage);
    const unsubscribeTyping = chatService.onUserTyping(handleUserTyping);

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [user?.id, currentChat?.id]);

  const setCurrentChat = useCallback(
    (chatId: string | null, recipientId?: string) => {
      // Leave previous chat room before switching
      if (
        currentChat?.id &&
        chatService.isConnected &&
        !currentChat.id.startsWith("chat_")
      ) {
        chatService.leaveChat(currentChat.id).catch((error) => {
          console.error("Failed to leave chat room:", error);
        });
      }

      if (!chatId && !recipientId) {
        setCurrentChatState(null);
        setMessages([]);
        return;
      }

      // If recipientId is provided but no chatId, create a new chat object
      if (recipientId && !chatId) {
        const tempChatId = `chat_${user?.id}_${recipientId}`;
        const existingChat = chats.find(
          (c) => c.participantId === recipientId || c.id === tempChatId
        );

        if (existingChat) {
          setCurrentChatState(existingChat);
          const stored = localStorage.getItem("chat_messages");
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as {
                [key: string]: ChatMessage[];
              };
              setMessages(parsed[existingChat.id] || []);
            } catch {
              setMessages([]);
            }
          } else {
            setMessages([]);
          }
          // Join chat room for real-time updates
          if (chatService.isConnected) {
            chatService.joinChat(existingChat.id).catch((error) => {
              console.error("Failed to join chat:", error);
            });
          }
        } else {
          // Create temporary chat for new chat
          const tempChat: Chat = {
            id: tempChatId,
            participantId: recipientId,
            participantName: "", // Will be filled when message is sent
            unreadCount: 0,
          };
          setCurrentChatState(tempChat);
          setMessages([]);
        }
        return;
      }

      // Existing chat logic
      if (chatId) {
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          setCurrentChatState(chat);

          // Reset pagination state
          setMessageOffset(0);
          setHasMoreMessages(true);

          // Fetch messages from API
          fetchChatMessages(chatId, 50, 0)
            .then((apiMessages) => {
              const convertedMessages: ChatMessage[] = apiMessages.map(
                (msg) => {
                  const sender = msg.sender as any;
                  const firstName = sender?.firstName;
                  const lastName = sender?.lastName;
                  return {
                    ...msg,
                    timestamp: msg.createdAt,
                    senderName:
                      firstName && lastName
                        ? `${firstName} ${lastName}`
                        : undefined,
                  };
                }
              );
              setMessages(convertedMessages);
              setMessageOffset(apiMessages.length);
              setHasMoreMessages(apiMessages.length === 50);
            })
            .catch((error) => {
              console.error("Failed to fetch messages:", error);
              setMessages([]);
            });

          // Join chat room for real-time updates
          if (chatService.isConnected) {
            chatService.joinChat(chatId).catch((error) => {
              console.error("Failed to join chat room:", error);
            });
          }

          // Mark messages as read (local state)
          if (chat.unreadCount > 0) {
            markMessagesAsRead(chatId);
          }
        }
      }
    },
    [chats, user?.id, currentChat?.id]
  );

  const startNewChat = useCallback(
    (recipientId: string, recipientName?: string) => {
      const tempChatId = `chat_${user?.id}_${recipientId}`;
      const tempChat: Chat = {
        id: tempChatId,
        participantId: recipientId,
        participantName: recipientName || "User",
        unreadCount: 0,
      };
      setCurrentChatState(tempChat);
      setMessages([]);
    },
    [user?.id]
  );

  const sendMessage = useCallback(
    async (message: string, recipientId?: string) => {
      if (!message.trim() || !user?.id) return;

      let chatId = currentChat?.id;

      // Check if chatId is a temporary ID (starts with "chat_") or missing
      const isTempChatId = chatId?.startsWith("chat_");

      // Create or get chat if starting new chat or using temp ID
      if ((!chatId || isTempChatId) && recipientId) {
        try {
          const chat = await createOrGetChat({ participantId: recipientId });
          chatId = chat.id;
          const newChat = convertChatToChat(chat, user.id);
          setCurrentChatState(newChat);
          setChats((prev) => {
            if (prev.find((c) => c.id === chat.id)) return prev;
            return [newChat, ...prev];
          });

          // Join chat room after creating/getting chat
          if (chatService.isConnected) {
            chatService.joinChat(chatId).catch((error) => {
              console.error("Failed to join chat room:", error);
            });
          }
        } catch (error) {
          console.error("Failed to create/get chat:", error);
          throw error;
        }
      }

      if (!chatId) {
        throw new Error("No chat ID available");
      }

      // Send message via API
      try {
        const sentMessage = await sendChatMessage({
          chatId,
          message,
          recipientId,
        });

        // Add to messages (optimistic update)
        const sender = sentMessage.sender as any;
        const firstName = sender?.firstName;
        const lastName = sender?.lastName;
        const chatMessage: ChatMessage = {
          ...sentMessage,
          timestamp: sentMessage.createdAt,
          senderName:
            firstName && lastName ? `${firstName} ${lastName}` : undefined,
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === chatMessage.id)) return prev;
          return [...prev, chatMessage];
        });

        // Refresh chats to update last message
        fetchMyChats()
          .then((chatsData) => {
            const convertedChats = chatsData.map((chat) =>
              convertChatToChat(chat, user.id)
            );
            setChats(convertedChats);
          })
          .catch((error) => {
            console.error("Failed to refresh chats:", error);
          });
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    },
    [user, currentChat]
  );

  const markMessagesAsRead = useCallback((chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  // Load more messages (older messages)
  const loadMoreMessages = useCallback(
    async (
      scrollContainer?: HTMLDivElement,
      previousScrollHeightRef?: React.MutableRefObject<number>
    ) => {
      if (!currentChat?.id || isLoadingMore || !hasMoreMessages) return;

      setIsLoadingMore(true);
      try {
        const olderMessages = await fetchChatMessages(
          currentChat.id,
          50,
          messageOffset
        );

        if (olderMessages.length === 0) {
          setHasMoreMessages(false);
          setIsLoadingMore(false);
          return;
        }

        const convertedMessages: ChatMessage[] = olderMessages.map((msg) => {
          const sender = msg.sender as any;
          const firstName = sender?.firstName;
          const lastName = sender?.lastName;
          return {
            ...msg,
            timestamp: msg.createdAt,
            senderName:
              firstName && lastName ? `${firstName} ${lastName}` : undefined,
          };
        });

        // Store scroll position before adding messages
        if (scrollContainer && previousScrollHeightRef) {
          previousScrollHeightRef.current = scrollContainer.scrollHeight;
        }

        // Prepend older messages
        setMessages((prev) => [...convertedMessages, ...prev]);
        setMessageOffset((prev) => prev + olderMessages.length);
        setHasMoreMessages(olderMessages.length === 50);
      } catch (error) {
        console.error("Failed to load more messages:", error);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [currentChat?.id, isLoadingMore, hasMoreMessages, messageOffset]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  // Auto-scroll to bottom for new messages (when user is at bottom)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Update shouldAutoScroll when new messages arrive in current chat
  useEffect(() => {
    if (currentChat && messages.length > 0) {
      // Auto-scroll when new message arrives (user expects to see new messages)
      setShouldAutoScroll(true);
    }
  }, [messages.length, currentChat?.id]);

  return {
    chats,
    currentChat,
    messages,
    isTyping,
    setCurrentChat,
    sendMessage,
    markMessagesAsRead,
    startNewChat,
    isConnected,
    loadMoreMessages,
    isLoadingMore,
    hasMoreMessages,
    shouldAutoScroll,
    setShouldAutoScroll,
  };
}

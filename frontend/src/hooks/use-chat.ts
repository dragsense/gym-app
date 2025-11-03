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

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

// Helper to convert IChat to Conversation
const convertChatToConversation = (
  chat: IChat,
  currentUserId: string
): Conversation => {
  const otherParticipant =
    chat.participantOne?.id === currentUserId
      ? chat.participantTwo
      : chat.participantOne;

  const firstName = (otherParticipant as any)?.firstName;
  const lastName = (otherParticipant as any)?.lastName;

  return {
    id: chat.id,
    participantId: otherParticipant?.id || "",
    participantName:
      firstName && lastName ? `${firstName} ${lastName}` : "User",
    participantAvatar: otherParticipant?.profile?.image?.url,
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
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  isTyping: { [userId: string]: boolean };
  setCurrentConversation: (
    conversationId: string | null,
    recipientId?: string
  ) => void;
  sendMessage: (message: string, recipientId?: string) => Promise<void>;
  markMessagesAsRead: (conversationId: string) => void;
  startNewConversation: (recipientId: string, recipientName?: string) => void;
  isConnected: boolean;
}

export function useChat(): UseChatReturn {
  const { user } = useAuthUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversationState] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<{ [userId: string]: boolean }>({});
  const [isConnected, setIsConnected] = useState(chatService.isConnected);
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
      .then((chats) => {
        const convertedChats = chats.map((chat) =>
          convertChatToConversation(chat, user.id)
        );
        setConversations(convertedChats);
      })
      .catch((error) => {
        console.error("Failed to fetch chats:", error);
      });
  }, [user?.id]);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("chat_conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0 && currentConversation) {
      const stored = localStorage.getItem("chat_messages");
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[currentConversation.id] = messages;
      localStorage.setItem("chat_messages", JSON.stringify(parsed));
    }
  }, [messages, currentConversation]);

  // Listen for real-time messages (socket only for updates, not initial fetch)
  useEffect(() => {
    if (!user?.id) return;

    const handleNewMessage = (data: ChatMessage) => {
      // Only update if message not already in list (optimistic updates)
      if (currentConversation?.id === data.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }

      // Refresh chats to get updated last message
      fetchMyChats()
        .then((chats) => {
          const convertedChats = chats.map((chat) =>
            convertChatToConversation(chat, user.id)
          );
          setConversations(convertedChats);
        })
        .catch((error) => {
          console.error("Failed to refresh chats:", error);
        });
    };

    const handleUserTyping = (data: {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }) => {
      if (currentConversation?.id === data.conversationId) {
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
  }, [user?.id, currentConversation]);

  const setCurrentConversation = useCallback(
    (conversationId: string | null, recipientId?: string) => {
      if (!conversationId && !recipientId) {
        setCurrentConversationState(null);
        setMessages([]);
        return;
      }

      // If recipientId is provided but no conversationId, create a new conversation object
      if (recipientId && !conversationId) {
        const tempConversationId = `conv_${user?.id}_${recipientId}`;
        const existingConversation = conversations.find(
          (c) => c.participantId === recipientId || c.id === tempConversationId
        );

        if (existingConversation) {
          setCurrentConversationState(existingConversation);
          const stored = localStorage.getItem("chat_messages");
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as {
                [key: string]: ChatMessage[];
              };
              setMessages(parsed[existingConversation.id] || []);
            } catch {
              setMessages([]);
            }
          } else {
            setMessages([]);
          }
          chatService
            .joinConversation(existingConversation.id)
            .catch((error) => {
              console.error("Failed to join conversation:", error);
            });
        } else {
          // Create temporary conversation for new chat
          const tempConversation: Conversation = {
            id: tempConversationId,
            participantId: recipientId,
            participantName: "", // Will be filled when message is sent
            unreadCount: 0,
          };
          setCurrentConversationState(tempConversation);
          setMessages([]);
        }
        return;
      }

      // Existing conversation logic
      if (conversationId) {
        const conversation = conversations.find((c) => c.id === conversationId);
        if (conversation) {
          setCurrentConversationState(conversation);

          // Fetch messages from API
          fetchChatMessages(conversationId)
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
                    senderAvatar: sender?.profile?.image?.url,
                  };
                }
              );
              setMessages(convertedMessages);
            })
            .catch((error) => {
              console.error("Failed to fetch messages:", error);
              setMessages([]);
            });

          // Join conversation room for real-time updates
          if (chatService.isConnected) {
            chatService.joinConversation(conversationId).catch((error) => {
              console.error("Failed to join conversation:", error);
            });
          }

          // Mark messages as read (local state)
          if (conversation.unreadCount > 0) {
            markMessagesAsRead(conversationId);
          }
        }
      }
    },
    [conversations, user?.id]
  );

  const startNewConversation = useCallback(
    (recipientId: string, recipientName?: string) => {
      const tempConversationId = `conv_${user?.id}_${recipientId}`;
      const tempConversation: Conversation = {
        id: tempConversationId,
        participantId: recipientId,
        participantName: recipientName || "User",
        unreadCount: 0,
      };
      setCurrentConversationState(tempConversation);
      setMessages([]);
    },
    [user?.id]
  );

  const sendMessage = useCallback(
    async (message: string, recipientId?: string) => {
      if (!message.trim() || !user?.id) return;

      let conversationId = currentConversation?.id;

      // Create or get chat if starting new conversation
      if (!conversationId && recipientId) {
        try {
          const chat = await createOrGetChat({ participantId: recipientId });
          conversationId = chat.id;
          const newConversation = convertChatToConversation(chat, user.id);
          setCurrentConversationState(newConversation);
          setConversations((prev) => {
            if (prev.find((c) => c.id === chat.id)) return prev;
            return [newConversation, ...prev];
          });
        } catch (error) {
          console.error("Failed to create/get chat:", error);
          throw error;
        }
      }

      if (!conversationId) {
        throw new Error("No conversation ID available");
      }

      // Send message via API
      try {
        const sentMessage = await sendChatMessage({
          conversationId,
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
          senderAvatar: sender?.profile?.image?.url,
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === chatMessage.id)) return prev;
          return [...prev, chatMessage];
        });

        // Refresh chats to update last message
        fetchMyChats()
          .then((chats) => {
            const convertedChats = chats.map((chat) =>
              convertChatToConversation(chat, user.id)
            );
            setConversations(convertedChats);
          })
          .catch((error) => {
            console.error("Failed to refresh chats:", error);
          });
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    },
    [user, currentConversation]
  );

  const markMessagesAsRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  return {
    conversations,
    currentConversation,
    messages,
    isTyping,
    setCurrentConversation,
    sendMessage,
    markMessagesAsRead,
    startNewConversation,
    isConnected,
  };
}

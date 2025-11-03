// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import type { IChat, IChatMessage } from "@shared/interfaces/chat.interface";
import type {
  SendMessageDto,
  CreateChatDto,
} from "@shared/dtos/chat-dtos/chat.dto";

// Constants
const CHAT_API_PATH = "/chat";

/**
 * Get all chats for the current user
 */
export const fetchMyChats = async (): Promise<IChat[]> => {
  return apiRequest<IChat[]>(CHAT_API_PATH, "GET");
};

/**
 * Create or get existing chat with a user
 */
export const createOrGetChat = async (
  dto: CreateChatDto
): Promise<IChat> => {
  return apiRequest<IChat>(CHAT_API_PATH, "POST", dto);
};

/**
 * Get messages for a chat
 */
export const fetchChatMessages = async (
  chatId: string,
  limit = 50,
  offset = 0
): Promise<IChatMessage[]> => {
  return apiRequest<IChatMessage[]>(
    `${CHAT_API_PATH}/${chatId}/messages?limit=${limit}&offset=${offset}`,
    "GET"
  );
};

/**
 * Send a message
 */
export const sendChatMessage = async (
  dto: SendMessageDto
): Promise<IChatMessage> => {
  return apiRequest<IChatMessage>(`${CHAT_API_PATH}/messages`, "POST", dto);
};

/**
 * Mark a message as read
 */
export const markMessageAsRead = async (
  messageId: string
): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(
    `${CHAT_API_PATH}/messages/${messageId}/read`,
    "POST"
  );
};



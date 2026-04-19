import { apiClient } from './apiClient';
import type {
  PageResponse,
  ChatRoomAdminResponse,
  ChatMessageAdminResponse,
} from '../types/api';

// Generated aliases (Phase 3.11.3).
export type ChatRoomItem = ChatRoomAdminResponse;
export type ChatMessageItem = ChatMessageAdminResponse;

export const chatManagementService = {
  async getChatRooms(params: { page?: number; size?: number }): Promise<PageResponse<ChatRoomItem>> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.size !== undefined) queryParams.set('size', params.size.toString());

    const response = await apiClient.get(`/chat/rooms?${queryParams.toString()}`);
    return response.data;
  },

  async getRoomMessages(roomId: number, page = 0): Promise<PageResponse<ChatMessageItem>> {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages?page=${page}`);
    return response.data;
  },

  async deleteMessage(messageId: number): Promise<void> {
    await apiClient.delete(`/chat/messages/${messageId}`);
  },

  async deleteRoom(roomId: number): Promise<void> {
    await apiClient.delete(`/chat/rooms/${roomId}`);
  },
};

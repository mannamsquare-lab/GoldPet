import { apiClient } from './apiClient';
import type { PageResponse } from '../types/api';

export interface ChatRoomItem {
  id: number;
  name: string;
  type: 'DIRECT' | 'GROUP' | 'AI_PET';
  participantCount: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface ChatMessageItem {
  id: number;
  roomId: number;
  senderId: number;
  senderNickname: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  createdAt: string;
}

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

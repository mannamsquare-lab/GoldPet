// Chat Service - API integration for Chat features

import apiClient from './api/client';

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participants: {
    id: number;
    nickname: string;
    profileImageUrl?: string;
  }[];
  isGroup: boolean;
}

export interface FileInfo {
  id: number;
  url: string;
  fileType: string;
  mimeType: string;
  originalFileName?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'file' | 'system';
  // API response fields
  textContent?: string;
  createdAt?: string;
  messageType?: string;
  fileId?: number;
  file?: FileInfo;
}

export const chatService = {
  getChatRooms: async (): Promise<ChatRoom[]> => {
    const response = await apiClient.get('/chat/rooms');
    return response.data;
  },

  getMessages: async (roomId: string, page = 0): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages?page=${page}`);
    return response.data.content || response.data;
  },

  sendMessage: async (
    roomId: string,
    content: string,
    options?: { messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE'; fileId?: number }
  ): Promise<ChatMessage> => {
    try {
      const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
        content: content || null,
        messageType: options?.messageType || 'TEXT',
        fileId: options?.fileId || null,
      });
      return response.data;
    } catch {
      throw new Error('메시지 전송에 실패했습니다.');
    }
  },

  uploadFile: async (file: File): Promise<{ id: number; url: string; fileType: string; mimeType: string }> => {
    try {
      if (file.type.startsWith('image/')) {
        const { compressImage } = await import('../utils/imageCompression');
        file = await compressImage(file);
      }
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch {
      throw new Error('파일 업로드에 실패했습니다.');
    }
  },

  createRoom: async (participantIds: number[], name?: string): Promise<ChatRoom> => {
    try {
      const response = await apiClient.post('/chat/rooms', {
        roomType: 'GROUP',
        title: name || null,
        participantUserIds: participantIds,
      });
      return response.data;
    } catch {
      throw new Error('채팅방 생성에 실패했습니다.');
    }
  },

  markAsRead: async (roomId: string): Promise<void> => {
    try {
      await apiClient.post(`/chat/rooms/${roomId}/read`);
    } catch {
      // Ignore read marking errors
    }
  },

  leaveRoom: async (roomId: string): Promise<void> => {
    try {
      await apiClient.delete(`/chat/rooms/${roomId}/leave`);
    } catch {
      throw new Error('채팅방 나가기에 실패했습니다.');
    }
  },

  /**
   * Get or create a direct chat room with a matched user.
   * Returns the chat room (existing or newly created).
   */
  getOrCreateDirectRoom: async (targetUserId: number): Promise<ChatRoom> => {
    try {
      const response = await apiClient.post(`/chat/rooms/direct/${targetUserId}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 400) {
        throw new Error('매칭된 상대가 아닙니다.');
      }
      throw new Error('채팅방 생성에 실패했습니다.');
    }
  },
};

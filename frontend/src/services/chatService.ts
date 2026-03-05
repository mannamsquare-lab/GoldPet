// Chat Service - API integration for Chat features

import apiClient from './api/client';

export interface ChatRoom {
  id: number;
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
  roomType?: 'DIRECT' | 'GROUP';
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
  id: number;
  roomId: number;
  senderId: number;
  senderNickname: string;
  textContent: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'file' | 'system' | 'emoticon';
  // API response fields
  createdAt?: string;
  messageType?: string;
  fileId?: number;
  file?: FileInfo;
  emoticonId?: number;
  emoticonImageUrl?: string;
  emoticonName?: string;
  // Reply fields
  replyToId?: number;
  replyToSenderNickname?: string;
  replyToTextContent?: string;
  replyToMessageType?: string;
  replyToFileUrl?: string;
  replyToFileName?: string;
  replyToEmoticonImageUrl?: string;
  // Soft delete
  deletedAt?: string;
}

export interface ChatRequestItem {
  id: number;
  requesterNickname: string;
  requesterProfileImage?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export const chatService = {
  getChatRooms: async (): Promise<ChatRoom[]> => {
    const response = await apiClient.get('/chat/rooms');
    return response.data;
  },

  getMessages: async (roomId: string, page = 0): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages?page=${page}`);
    const messages: ChatMessage[] = response.data.content || response.data;

    // Resolve presigned URLs for private bucket files
    const fileKeysToResolve = new Set<string>();
    for (const msg of messages) {
      if (msg.file?.url && !msg.file.url.startsWith('http')) {
        fileKeysToResolve.add(msg.file.url);
      }
      if (msg.replyToFileUrl && !msg.replyToFileUrl.startsWith('http')) {
        fileKeysToResolve.add(msg.replyToFileUrl);
      }
    }

    if (fileKeysToResolve.size > 0) {
      const resolvedUrls = new Map<string, string>();
      await Promise.all(
        Array.from(fileKeysToResolve).map(async (fileKey) => {
          try {
            const res = await apiClient.get(`/files/${encodeURIComponent(fileKey)}/url`);
            resolvedUrls.set(fileKey, res.data.url);
          } catch { /* ignore resolution failures */ }
        })
      );

      for (const msg of messages) {
        if (msg.file?.url && resolvedUrls.has(msg.file.url)) {
          msg.file.url = resolvedUrls.get(msg.file.url)!;
        }
        if (msg.replyToFileUrl && resolvedUrls.has(msg.replyToFileUrl)) {
          msg.replyToFileUrl = resolvedUrls.get(msg.replyToFileUrl)!;
        }
      }
    }

    return messages;
  },

  sendMessage: async (
    roomId: string,
    content: string | null,
    options?: { messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'EMOTICON'; fileId?: number; emoticonId?: number; replyToId?: number }
  ): Promise<ChatMessage> => {
    try {
      const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
        content: content || null,
        messageType: options?.messageType || 'TEXT',
        fileId: options?.fileId || null,
        emoticonId: options?.emoticonId || null,
        replyToId: options?.replyToId || null,
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
      formData.append('category', 'chat');

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

  inviteToRoom: async (roomId: number, userId: number): Promise<{ roomType: string }> => {
    try {
      const response = await apiClient.post(`/chat/rooms/${roomId}/invite`, { userId });
      return response.data;
    } catch {
      throw new Error('초대에 실패했습니다.');
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

  getChatRequests: async (): Promise<ChatRequestItem[]> =>
    apiClient.get('/chat/rooms/requests').then(r => r.data),

  acceptChatRequest: async (requestId: number): Promise<ChatRoom> =>
    apiClient.post(`/chat/rooms/requests/${requestId}/accept`).then(r => r.data),

  rejectChatRequest: async (requestId: number): Promise<void> =>
    apiClient.post(`/chat/rooms/requests/${requestId}/reject`).then(r => r.data),

  deleteChatRequest: async (requestId: number): Promise<void> =>
    apiClient.delete(`/chat/rooms/requests/${requestId}`).then(r => r.data),

  deleteMessage: async (roomId: string, messageId: number): Promise<void> => {
    await apiClient.delete(`/chat/rooms/${roomId}/messages/${messageId}`);
  },
};

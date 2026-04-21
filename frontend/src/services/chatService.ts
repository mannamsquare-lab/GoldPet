// Chat Service - API integration for Chat features

import apiClient from './api/client';
import { typedClient } from './api/typedClient';
import type { ChatRoomType, FileInfo } from '../types/api';

export interface ChatRoom {
  id: number;
  name: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  participants: {
    id: number;
    nickname: string;
    profileImageUrl?: string;
  }[];
  isGroup: boolean;
  // Sourced from OpenAPI schema via types/api.ts; AI_PET added in Phase 3.3.
  roomType?: ChatRoomType;
}

// Generated alias (Phase 4 sweep).
export type { FileInfo };

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderNickname: string;
  textContent: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'file' | 'system' | 'emoticon' | 'emoji';
  // API response fields
  createdAt?: string;
  messageType?: string;
  fileId?: number;
  file?: FileInfo;
  emoticonId?: number;
  emoticonImageUrl?: string;
  emoticonImageUrlThumbnail?: string;
  emoticonImageUrlViewer?: string;
  emoticonName?: string;
  // Reply fields
  replyToId?: number;
  replyToSenderNickname?: string;
  replyToTextContent?: string;
  replyToMessageType?: string;
  replyToFileUrl?: string;
  replyToFileName?: string;
  replyToEmoticonImageUrl?: string;
  replyToEmoticonImageUrlThumbnail?: string;
  replyToEmoticonImageUrlViewer?: string;
  // Soft delete
  deletedAt?: string;
  // Read receipt
  unreadCount?: number;
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
    const response = await typedClient.get('/api/v1/chat/rooms');
    return response.data as unknown as ChatRoom[];
  },

  getMessages: async (roomId: string, page = 0): Promise<ChatMessage[]> => {
    const response = await typedClient.getPath(
      '/api/v1/chat/rooms/{roomId}/messages',
      { roomId },
      { params: { page } },
    );
    const data = response.data as { content?: ChatMessage[] } | ChatMessage[];
    const messages: ChatMessage[] = Array.isArray(data) ? data : (data.content ?? []);

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
            const res = await typedClient.getPath(
              '/api/v1/files/{fileKey}/url',
              { fileKey },
            );
            resolvedUrls.set(fileKey, (res.data as { url: string }).url);
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
      const response = await typedClient.postPath(
        '/api/v1/chat/rooms/{roomId}/messages',
        { roomId },
        {
          content: content ?? undefined,
          messageType: options?.messageType ?? 'TEXT',
          fileId: options?.fileId,
          emoticonId: options?.emoticonId,
          replyToId: options?.replyToId,
        },
      );
      return response.data as unknown as ChatMessage;
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

      // Multipart — stays on apiClient; typedClient is JSON-only.
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
      const response = await typedClient.post('/api/v1/chat/rooms', {
        roomType: 'GROUP',
        title: name,
        participantUserIds: participantIds,
      } as unknown as Parameters<typeof typedClient.post<'/api/v1/chat/rooms'>>[1]);
      return response.data as unknown as ChatRoom;
    } catch {
      throw new Error('채팅방 생성에 실패했습니다.');
    }
  },

  markAsRead: async (roomId: string): Promise<void> => {
    try {
      await typedClient.postPath(
        '/api/v1/chat/rooms/{roomId}/read',
        { roomId },
        undefined,
      );
    } catch {
      // Ignore read marking errors
    }
  },

  leaveRoom: async (roomId: string): Promise<void> => {
    try {
      await typedClient.deletePath(
        '/api/v1/chat/rooms/{roomId}/leave',
        { roomId },
      );
    } catch {
      throw new Error('채팅방 나가기에 실패했습니다.');
    }
  },

  inviteToRoom: async (roomId: number, userId: number): Promise<{ roomType: string }> => {
    try {
      const response = await typedClient.postPath(
        '/api/v1/chat/rooms/{roomId}/invite',
        { roomId },
        { userId } as unknown as Parameters<typeof typedClient.postPath<'/api/v1/chat/rooms/{roomId}/invite'>>[2],
      );
      return response.data as unknown as { roomType: string };
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
      const response = await typedClient.postPath(
        '/api/v1/chat/rooms/direct/{targetUserId}',
        { targetUserId },
        undefined,
      );
      return response.data as unknown as ChatRoom;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 400) {
        throw new Error('매칭된 상대가 아닙니다.');
      }
      throw new Error('채팅방 생성에 실패했습니다.');
    }
  },

  getChatRequests: async (): Promise<ChatRequestItem[]> =>
    typedClient.get('/api/v1/chat/rooms/requests').then(r => r.data as unknown as ChatRequestItem[]),

  acceptChatRequest: async (requestId: number): Promise<ChatRoom> =>
    typedClient
      .postPath('/api/v1/chat/rooms/requests/{requestId}/accept', { requestId }, undefined)
      .then(r => r.data as unknown as ChatRoom),

  rejectChatRequest: async (requestId: number): Promise<void> => {
    await typedClient.postPath(
      '/api/v1/chat/rooms/requests/{requestId}/reject',
      { requestId },
      undefined,
    );
  },

  deleteChatRequest: async (requestId: number): Promise<void> => {
    await typedClient.deletePath(
      '/api/v1/chat/rooms/requests/{requestId}',
      { requestId },
    );
  },

  deleteMessage: async (roomId: string, messageId: number): Promise<void> => {
    await typedClient.deletePath(
      '/api/v1/chat/rooms/{roomId}/messages/{messageId}',
      { roomId, messageId },
    );
  },
};

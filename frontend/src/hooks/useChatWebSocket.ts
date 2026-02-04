/**
 * React hook for WebSocket chat integration
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatWebSocket } from '../services/websocket/chatWebSocket';
import { chatService } from '../services/chatService';
import type { ChatMessage } from '../services/chatService';

interface UseChatWebSocketOptions {
  roomId: string | undefined;
  currentUserId?: number;
  enabled?: boolean;
}

export function useChatWebSocket({ roomId, currentUserId, enabled = true }: UseChatWebSocketOptions) {
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const typingTimeoutRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Handle incoming WebSocket messages
  const handleMessage = useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData(
        ['chatMessages', roomId],
        (oldMessages: ChatMessage[] | undefined) => {
          if (!oldMessages) return [message];
          // Avoid duplicates by checking ID (compare as strings to handle type mismatch)
          const messageId = String(message.id);
          if (oldMessages.some((m) => String(m.id) === messageId)) {
            return oldMessages;
          }
          return [...oldMessages, message];
        }
      );

      // Mark as read immediately when receiving new message while in chat room
      // This prevents unread count from showing for messages received while viewing
      if (roomId) {
        chatService.markAsRead(roomId).then(() => {
          queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
        });
      }
    },
    [queryClient, roomId]
  );

  // Handle typing events
  const handleTyping = useCallback(
    (userId: number, isTyping: boolean) => {
      // Ignore own typing events
      if (userId === currentUserId) return;

      // Clear existing timeout for this user
      const existingTimeout = typingTimeoutRef.current.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        typingTimeoutRef.current.delete(userId);
      }

      if (isTyping) {
        setTypingUsers(prev => new Set(prev).add(userId));
        // Auto-clear typing after 1.5 seconds of no updates
        const timeout = setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          typingTimeoutRef.current.delete(userId);
        }, 1500);
        typingTimeoutRef.current.set(userId, timeout);
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    [currentUserId]
  );

  // Connect and subscribe to room
  useEffect(() => {
    if (!roomId || !enabled) return;

    const connectAndSubscribe = async () => {
      try {
        await chatWebSocket.connect();
        chatWebSocket.subscribeToRoom(roomId, handleMessage);
        chatWebSocket.subscribeToTyping(roomId, handleTyping);
        isConnectedRef.current = true;
      } catch (error) {
        console.error('[useChatWebSocket] Connection failed:', error);
        isConnectedRef.current = false;
      }
    };

    connectAndSubscribe();

    return () => {
      if (roomId) {
        chatWebSocket.unsubscribeFromRoom(roomId);
        chatWebSocket.unsubscribeFromTyping(roomId);
        // Clear all typing timeouts
        typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
        typingTimeoutRef.current.clear();
      }
    };
  }, [roomId, enabled, handleMessage, handleTyping]);

  // Send message via WebSocket
  const sendMessage = useCallback(
    (senderId: number, content: string) => {
      if (!roomId) return;

      if (chatWebSocket.connected) {
        chatWebSocket.sendMessage(roomId, senderId, content);
      } else {
        console.warn('[useChatWebSocket] Not connected, message not sent via WebSocket');
      }
    },
    [roomId]
  );

  // Send typing event
  const sendTypingEvent = useCallback(
    (isTyping: boolean) => {
      if (!roomId || !currentUserId) return;
      chatWebSocket.sendTypingEvent(roomId, currentUserId, isTyping);
    },
    [roomId, currentUserId]
  );

  return {
    sendMessage,
    sendTypingEvent,
    typingUsers,
    isConnected: chatWebSocket.connected,
  };
}

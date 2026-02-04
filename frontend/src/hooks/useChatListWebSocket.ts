/**
 * React hook for WebSocket chat list notifications
 * Subscribes to user-specific topic to get notified of new messages in any chat room
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatWebSocket } from '../services/websocket/chatWebSocket';
import { useAuthStore } from '../stores/authStore';

interface UseChatListWebSocketOptions {
  enabled?: boolean;
}

export function useChatListWebSocket({ enabled = true }: UseChatListWebSocketOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !user?.id) return;

    const topic = `/topic/user/${user.id}/chats`;

    const connectAndSubscribe = async () => {
      try {
        await chatWebSocket.connect();

        if (isSubscribedRef.current) return;

        chatWebSocket.subscribeToTopic(topic, () => {
          // When a new message notification arrives, invalidate the chat rooms query
          // This will trigger a refetch of the chat list with updated lastMessage and unreadCount
          queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
        });

        isSubscribedRef.current = true;
      } catch (error) {
        console.error('[useChatListWebSocket] Connection failed:', error);
      }
    };

    connectAndSubscribe();

    return () => {
      if (user?.id) {
        chatWebSocket.unsubscribeFromTopic(topic);
        isSubscribedRef.current = false;
      }
    };
  }, [enabled, user?.id, queryClient]);

  return {
    isConnected: chatWebSocket.connected,
  };
}

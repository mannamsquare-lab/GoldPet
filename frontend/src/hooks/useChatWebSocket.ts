/**
 * React hook for WebSocket chat integration
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatWebSocket } from '../services/websocket/chatWebSocket';
import type { ChatMessage } from '../services/chatService';

interface UseChatWebSocketOptions {
  roomId: string | undefined;
  enabled?: boolean;
}

export function useChatWebSocket({ roomId, enabled = true }: UseChatWebSocketOptions) {
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(false);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData(
        ['chatMessages', roomId],
        (oldMessages: ChatMessage[] | undefined) => {
          if (!oldMessages) return [message];
          // Avoid duplicates by checking ID
          if (oldMessages.some((m) => m.id === message.id)) {
            return oldMessages;
          }
          return [...oldMessages, message];
        }
      );
    },
    [queryClient, roomId]
  );

  // Connect and subscribe to room
  useEffect(() => {
    if (!roomId || !enabled) return;

    const connectAndSubscribe = async () => {
      try {
        await chatWebSocket.connect();
        chatWebSocket.subscribeToRoom(roomId, handleMessage);
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
      }
    };
  }, [roomId, enabled, handleMessage]);

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

  return {
    sendMessage,
    isConnected: chatWebSocket.connected,
  };
}

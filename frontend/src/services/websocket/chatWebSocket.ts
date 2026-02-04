/**
 * WebSocket service for real-time chat messaging using STOMP over SockJS
 */

import { Client } from '@stomp/stompjs';
import type { IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../chatService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const WS_URL = `${API_BASE_URL}/ws`;

type MessageHandler = (message: ChatMessage) => void;

class ChatWebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private connectPromise: Promise<void> | null = null;

  connect(): Promise<void> {
    // Return existing connection promise if already connecting
    if (this.connectPromise) {
      return this.connectPromise;
    }

    // Already connected
    if (this.isConnected && this.client?.connected) {
      return Promise.resolve();
    }

    this.connectPromise = new Promise((resolve, reject) => {

      const token = localStorage.getItem('accessToken');

      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: (str) => {
          if (import.meta.env.DEV) {
            console.log('[WebSocket Debug]', str);
          }
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('[WebSocket] Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectPromise = null;
          resolve();
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected');
          this.isConnected = false;
        },
        onStompError: (frame) => {
          console.error('[WebSocket] STOMP Error:', frame.headers['message']);
          this.connectPromise = null;
          reject(new Error(frame.headers['message']));
        },
        onWebSocketError: (event) => {
          console.error('[WebSocket] WebSocket Error:', event);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.connectPromise = null;
            reject(new Error('WebSocket connection failed after max attempts'));
          }
        },
      });

      this.client.activate();
    });

    return this.connectPromise;
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.messageHandlers.clear();
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  subscribeToRoom(roomId: string, onMessage: MessageHandler): void {
    if (!this.client || !this.isConnected) {
      console.warn('[WebSocket] Not connected. Call connect() first.');
      return;
    }

    const destination = `/topic/chat/${roomId}`;

    // Check if already subscribed
    if (this.subscriptions.has(roomId)) {
      // Just add the handler
      const handlers = this.messageHandlers.get(roomId) || [];
      handlers.push(onMessage);
      this.messageHandlers.set(roomId, handlers);
      return;
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const chatMessage = this.parseMessage(message.body);
        const handlers = this.messageHandlers.get(roomId) || [];
        handlers.forEach((handler) => handler(chatMessage));
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    });

    this.subscriptions.set(roomId, subscription);
    this.messageHandlers.set(roomId, [onMessage]);
  }

  unsubscribeFromRoom(roomId: string): void {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
      this.messageHandlers.delete(roomId);
    }
  }

  sendMessage(roomId: string, senderId: number, content: string): void {
    if (!this.client || !this.isConnected) {
      console.error('[WebSocket] Not connected. Cannot send message.');
      return;
    }

    const message = {
      roomId: parseInt(roomId, 10),
      senderId,
      messageType: 'TEXT',
      textContent: content,
    };

    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(message),
    });
  }

  private parseMessage(body: string): ChatMessage {
    const data = JSON.parse(body);
    return {
      id: data.id?.toString() || `msg-${Date.now()}`,
      roomId: data.roomId?.toString() || '',
      senderId: data.senderId || 0,
      content: data.textContent || data.content || '',
      timestamp: data.createdAt || data.timestamp || new Date().toISOString(),
      type: this.mapMessageType(data.messageType || data.type),
      // Include additional fields for file attachments
      textContent: data.textContent,
      createdAt: data.createdAt,
      messageType: data.messageType,
      fileId: data.fileId,
      file: data.file ? {
        id: data.file.id,
        url: data.file.url,
        fileType: data.file.fileType,
        mimeType: data.file.mimeType,
        sizeBytes: data.file.sizeBytes,
        width: data.file.width,
        height: data.file.height,
      } : undefined,
    };
  }

  private mapMessageType(type: string): 'text' | 'image' | 'video' | 'file' | 'system' {
    switch (type?.toUpperCase()) {
      case 'IMAGE':
        return 'image';
      case 'VIDEO':
        return 'video';
      case 'FILE':
        return 'file';
      case 'SYSTEM':
        return 'system';
      default:
        return 'text';
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const chatWebSocket = new ChatWebSocketService();

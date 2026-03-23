'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { Message } from '@/lib/types';
import { chatService } from '@/services';

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  loadMessages: (ticketId: string) => Promise<void>;
  sendMessage: (ticketId: string, content: string) => Promise<void>;
  clearMessages: () => void;
  startAutoRefresh: (ticketId: string) => void;
  stopAutoRefresh: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadMessages = useCallback(async (ticketId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await chatService.getMessages(ticketId);
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (ticketId: string, content: string) => {
    try {
      const newMessage = await chatService.sendMessage(ticketId, content);
      setMessages(prev => [...prev, newMessage]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    stopAutoRefresh();
  }, []);

  const startAutoRefresh = useCallback((ticketId: string) => {
    stopAutoRefresh();
    refreshIntervalRef.current = setInterval(() => {
      loadMessages(ticketId);
    }, 3000);
  }, [loadMessages]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        error,
        loadMessages,
        sendMessage,
        clearMessages,
        startAutoRefresh,
        stopAutoRefresh,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export default ChatContext;

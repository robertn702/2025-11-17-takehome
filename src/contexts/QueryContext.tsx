'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';

interface QueryContextType {
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
  chat: UseChatHelpers<UIMessage>;
  error: string | null;
  setError: (error: string | null) => void;
  clearChat: () => void;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export function QueryProvider({ children }: { children: ReactNode }) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/api/answer',
    }),
    onError: (err) => {
      console.error('Chat error:', err);
      setError(err.message);
    },
  });

  const clearChat = () => {
    chat.setMessages([]);
    setSearchResults([]);
    setError(null);
  };

  return (
    <QueryContext.Provider value={{ searchResults, setSearchResults, chat, error, setError, clearChat }}>
      {children}
    </QueryContext.Provider>
  );
}

export function useQuery() {
  const context = useContext(QueryContext);
  if (context === undefined) {
    throw new Error('useQuery must be used within a QueryProvider');
  }
  return context;
}
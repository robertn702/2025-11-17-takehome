'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface QueryContextType {
  query: string;
  setQuery: (query: string) => void;
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export function QueryProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  return (
    <QueryContext.Provider value={{ query, setQuery, searchResults, setSearchResults }}>
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
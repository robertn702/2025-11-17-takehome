'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@/contexts/QueryContext';

export default function Home() {
  const [localQuery, setLocalQuery] = useState('');
  const { setQuery } = useQuery();
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localQuery.trim()) return;

    // Set query in context and navigate to search page
    setQuery(localQuery.trim());
    router.push('/search');
  };

  const suggestedQueries = [
    "What is the latest in AI research?",
    "Explain quantum computing",
    "Best practices for React development",
    "Climate change solutions"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Search
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Where knowledge begins
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ask anything and get instant, accurate answers powered by AI
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <div className="relative flex items-center">
              <svg
                className="absolute left-4 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Ask anything..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
            </div>
            {localQuery && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            )}
          </div>
        </form>

        {/* Suggested Queries */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Try asking:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestedQueries.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setLocalQuery(suggestion)}
                className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {suggestion}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Powered by AI</span>
            <span className="hidden sm:inline">•</span>
            <span>Fast, accurate, and reliable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

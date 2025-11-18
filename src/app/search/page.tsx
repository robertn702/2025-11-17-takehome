'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@/contexts/QueryContext';
import { useCompletion } from '@ai-sdk/react';

export default function SearchPage() {
  const { query, searchResults, setSearchResults } = useQuery();
  const router = useRouter();
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/answer',
    onFinish: (prompt, completion) => {
      console.log('Completion finished:', { prompt, completion });
    },
    onError: (error) => {
      console.error('Completion error:', error);
      setError(error.message);
    },
  });

  console.log("completion: ", completion)

  useEffect(() => {
    // If no query, redirect back to home
    if (!query) {
      router.push('/');
      return;
    }

    // Trigger the search
    const performSearch = async () => {
      setIsLoadingSources(true);
      setError(null);

      try {
        // First, fetch sources
        const searchResponse = await fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!searchResponse.ok) {
          throw new Error('Failed to fetch sources');
        }

        const searchData = await searchResponse.json();
        setSearchResults(searchData.results || []);
        setIsLoadingSources(false);

        // Then stream the AI response
        await complete(query);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
        setIsLoadingSources(false);
      }
    };

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (!query) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Query Display */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {query}
          </h1>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Response Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Answer
              </h2>

              {isLoading && !completion && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Generating answer...</span>
                </div>
              )}

              {completion && (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed min-h-[100px] transition-none">
                    {completion}
                    {isLoading && (
                      <span className="inline-block w-1 h-4 ml-1 bg-blue-600 animate-pulse"></span>
                    )}
                  </div>
                </div>
              )}

              {!isLoading && !completion && !error && (
                <p className="text-gray-500 dark:text-gray-400">
                  No response generated yet.
                </p>
              )}
            </div>
          </div>

          {/* Sources Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Sources
              </h2>

              {isLoadingSources && searchResults.length === 0 && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Loading sources...</span>
                </div>
              )}

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((result, idx) => (
                    <a
                      key={idx}
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                            {result.title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {result.snippet}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                            {new URL(result.link).hostname}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                !isLoadingSources && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No sources available yet.
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

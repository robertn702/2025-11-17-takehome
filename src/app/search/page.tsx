'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@/contexts/QueryContext';

export default function SearchPage() {
  const { chat, searchResults, setSearchResults, error, setError } = useQuery();
  const router = useRouter();
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const latestQuestionRef = useRef<HTMLDivElement>(null);

  const { messages, status, sendMessage } = chat;
  const isLoading = status === 'streaming' || status === 'submitted';

  // Fetch sources whenever a new user message is added
  useEffect(() => {
    if (messages.length === 0) {
      // No messages yet, redirect to home
      router.push('/');
      return;
    }

    const lastMessage = messages[messages.length - 1];

    // Only fetch sources for user messages
    if (lastMessage.role === 'user') {
      const fetchSources = async () => {
        setIsLoadingSources(true);
        setError(null);

        try {
          // Extract text from the message
          const query = lastMessage.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('');

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
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch results');
        } finally {
          setIsLoadingSources(false);
        }
      };

      fetchSources();

      // Scroll to the latest question with smooth behavior and header offset
      setTimeout(() => {
        if (latestQuestionRef.current) {
          const element = latestQuestionRef.current;
          const headerOffset = 100; // Offset for sticky header + some padding
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  if (messages.length === 0) {
    return null; // Will redirect
  }

  // Get the latest user message for the page title
  const userMessages = messages.filter(m => m.role === 'user');
  const latestQuery = userMessages.length > 0
    ? userMessages[userMessages.length - 1].parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('')
    : '';

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
              Ask Hanover
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conversation Section */}
          <div className="lg:col-span-2 space-y-8">
            {(() => {
              const userMessages = messages.filter(m => m.role === 'user');

              return userMessages.map((userMsg, userIdx) => {
                const userText = userMsg.parts
                  .filter((part) => part.type === 'text')
                  .map((part) => (part as any).text)
                  .join('');

                const isLatestUser = userIdx === userMessages.length - 1;

                // Find the corresponding assistant response
                const userMsgIndex = messages.indexOf(userMsg);
                const assistantMsg = messages.find(
                  (msg, idx) => idx > userMsgIndex && msg.role === 'assistant'
                );

                const assistantText = assistantMsg
                  ? assistantMsg.parts
                      .filter((part) => part.type === 'text')
                      .map((part) => (part as any).text)
                      .join('')
                  : '';

                return (
                  <div key={userMsg.id || userIdx}>
                    {/* User Message as Prominent Header */}
                    <div ref={isLatestUser ? latestQuestionRef : null}>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        {userText}
                      </h1>
                    </div>

                    {/* AI Response Card - always shown, min-height for latest question */}
                    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm ${isLatestUser ? 'min-h-[calc(100vh-200px)]' : ''}`}>
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {assistantText && (
                            <>
                              <span className="streaming-text">{assistantText}</span>
                              {isLoading && isLatestUser && (
                                <span className="inline-block w-1 h-4 ml-1 bg-blue-600 animate-pulse"></span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Sources Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
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

      {/* Sticky Follow-up Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!followUpInput.trim() || isLoading) return;
              sendMessage({ text: followUpInput });
              setFollowUpInput('');
            }}
            className="relative"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!followUpInput.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span>Ask</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

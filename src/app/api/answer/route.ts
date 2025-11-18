import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, smoothStream, convertToCoreMessages } from 'ai';
import { z } from 'zod';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1, 'At least one message is required'),
});

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface SerpApiResponse {
  organic_results?: Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
  }>;
}

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new Error('SERPAPI_KEY is not configured');
  }

  const params = new URLSearchParams({
    q: query,
    api_key: apiKey,
    engine: 'google',
    num: '10',
  });

  const response = await fetch(`https://serpapi.com/search?${params}`);

  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.statusText}`);
  }

  const data: SerpApiResponse = await response.json();

  return (data.organic_results || []).map((result) => ({
    title: result.title,
    link: result.link,
    snippet: result.snippet,
    position: result.position,
  }));
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({error: 'Messages array is required'}),
        {status: 400, headers: {'Content-Type': 'application/json'}}
      );
    }

    // Get the latest user message as the query
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content;

    // Fetch search results
    const searchResults = await fetchSearchResults(query);

    if (searchResults.length === 0) {
      return new Response(
        JSON.stringify({error: 'No search results found'}),
        {status: 404, headers: {'Content-Type': 'application/json'}}
      );
    }

    // Prepare context for AI
    const context = searchResults
      .map((result, idx) =>
        `[${idx + 1}] ${result.title}\n${result.snippet}\nSource: ${result.link}`
      )
      .join('\n\n');

    const systemMessage = `You are a helpful AI assistant that answers questions based on search results.

Search results for the current question:
${context}

Instructions:
- Provide comprehensive answers based on the search results above
- Use inline citations in the format [1], [2], etc. to reference the search results
- Be concise but thorough
- If the search results don't contain enough information, say so
- Synthesize information from multiple sources when relevant
- For follow-up questions, maintain context from the conversation`;

    // Stream AI response with smooth streaming and conversation history
    const result = streamText({
      model: anthropic('claude-3-haiku-20240307'),
      system: systemMessage,
      messages: convertToCoreMessages(messages),
      temperature: 0.7,
      experimental_transform: smoothStream({
        delayInMs: 25,
        chunking: 'word',
      }),
    });

    // Return streaming response compatible with useCompletion
    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error('Error in /api/answer:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate answer',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {status: 500, headers: {'Content-Type': 'application/json'}}
    );
  }
}

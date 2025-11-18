import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, convertToCoreMessages } from 'ai';
import { z } from 'zod';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

// UIMessage schema - accepts messages in the format sent by useChat
const uiMessagePartSchema = z.object({
  type: z.string(),
}).passthrough(); // Allow additional properties like 'text'

const uiMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(uiMessagePartSchema),
  metadata: z.any().optional(),
}).passthrough();

const requestSchema = z.object({
  messages: z.array(uiMessageSchema).min(1, 'At least one message is required'),
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
    const body = await req.json();

    // Validate request body with Zod
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: validation.error.issues
        }),
        {status: 400, headers: {'Content-Type': 'application/json'}}
      );
    }

    const { messages } = validation.data;

    // Get the latest user message as the query
    // Extract text from UIMessage parts
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.parts
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join('');

    // Fetch search results
    const searchResults = await fetchSearchResults(query);

    if (!searchResults || searchResults.length === 0) {
      return new Response(
        JSON.stringify({error: 'No search results found'}),
        {status: 404, headers: {'Content-Type': 'application/json'}}
      );
    }

    // Prepare context for AI
    const context = searchResults
      .map((result, idx) =>
        `[${idx + 1}] ${result.title || 'Untitled'}\n${result.snippet || ''}\nSource: ${result.link}`
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

    // Convert UIMessages to CoreMessages and stream AI response
    const coreMessages = convertToCoreMessages(messages as any);

    const result = streamText({
      model: anthropic('claude-3-haiku-20240307'),
      system: systemMessage,
      messages: coreMessages,
      temperature: 0.7,
    });

    // Return streaming response compatible with useChat
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

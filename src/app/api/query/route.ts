import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

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
    const {query} = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({error: 'Query is required'}),
        {status: 400, headers: {'Content-Type': 'application/json'}}
      );
    }

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

    const prompt = `You are a helpful AI assistant that answers questions based on search results.

User question: ${query}

Search results:
${context}

Instructions:
- Provide a comprehensive answer to the user's question based on the search results above
- Use inline citations in the format [1], [2], etc. to reference the search results
- Be concise but thorough
- If the search results don't contain enough information to answer the question, say so
- Synthesize information from multiple sources when relevant

Answer:`;

    // Stream AI response
    const result = streamText({
      model: anthropic('claude-3-haiku-20240307'),
      prompt,
      temperature: 0.7,
    });

    // Return streaming response
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Error in /api/query:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {status: 500, headers: {'Content-Type': 'application/json'}}
    );
  }
}

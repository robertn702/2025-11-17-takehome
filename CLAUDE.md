# Hanover Takehome Interview Question

## Prompt
This is an open book exercise. Use any apps, tools, AI, etc you would normally use when programming. We ask that you choose TS as the language, but choose any framework (recommended to choose one you are familiar and can get started with quickly), libraries, tools, etc you would like within that.

## Task
Build a simple clone of Perplexity. https://www.perplexity.ai/

At a minimum, your app should include a page where a user can submit a query and receive a combination of the search results and an AI response to their query based on the results, with citations.

Anything you can add in addition to this functionality is extra, and you may choose how best to spend your time on the additions, whatever you think is most valuable or interesting.

Feel free to use any AI API calls, frameworks, libraries, etc that you like. One option for search results is SerpAPI https://github.com/serpapi/serpapi-javascript (or similar alternative), but choose any option. Choose any LLM provider.

If you are relying on free API keys as you build, be careful with testing as you don't want to hit your limit (or you may need to find another API or key).

This specification is intentionally vague as we want to see how you use your best judgment in these scenarios.

## Submission
Email a link to a public GitHub repo or a zip file with source code and a 20-120 second recording of functionality to nick@hanoverpark.com and chris@hanoverpark.com

## Notes
Backwards compatibility is not important. Nothing is deployed to production.

## API Endpoints

### POST /api/sources
Fetches search results from Google via SerpAPI.

**Request Body:**
```json
{
  "query": "string" // Required, minimum 1 character
}
```

**Response:**
```json
{
  "results": [
    {
      "title": "string",
      "link": "string",
      "snippet": "string",
      "position": number
    }
  ]
}
```

**Use Case:** Used to retrieve search results without AI response generation. Returns top 10 Google search results for the given query.

### POST /api/answer
Streams an AI-generated response based on search results, with support for conversation history.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user" | "assistant" | "system",
      "content": "string"
    }
  ] // Required, minimum 1 message
}
```

**Response:** Streaming text response compatible with Vercel AI SDK's `useChat` hook.

**Use Case:** Main endpoint for the Perplexity-like experience. Takes a conversation history, performs a search using the latest user message, and streams an AI response with inline citations [1], [2], etc. that reference the search results. Uses Claude 3 Haiku for response generation.
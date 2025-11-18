# Perplexity Clone - Project Documentation

## Overview
A conversational AI search application built with Next.js and TypeScript that provides AI-generated responses with citations based on real-time web search results.

## Development Notes
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
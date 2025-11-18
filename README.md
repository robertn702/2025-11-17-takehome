# Perplexity Clone

A simple clone of Perplexity built with Next.js, TypeScript, and the AI SDK. This application allows users to submit search queries and receive AI-generated responses based on search results with citations.

## Features

- **Search query interface** with suggested queries for quick start
- **Conversational AI** - Multi-turn conversations with follow-up questions
- **Real-time search integration** - Fetches relevant web results via SerpAPI
- **AI-generated responses** with inline citations using Anthropic's Claude
- **Interactive citations**:
  - Clickable citations that scroll to and highlight sources
  - Hover popovers showing citation preview with title, snippet, and URL
- **Source panel** - Numbered references with links to original content
- **Auto-scroll** - Automatically scrolls to latest questions for better UX
- **Clear chat** - Start fresh conversations with one click
- **Dark mode UI** - Full dark mode support throughout the application
- **Responsive design** - Optimized for desktop and mobile devices
- **Streaming responses** - Real-time AI response generation

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Anthropic API key
- Search API key (e.g., SerpAPI or similar)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd takehome
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your API keys:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SEARCH_API_KEY=your_search_api_key_here
```

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── search/       # Search results page
│   └── page.tsx      # Landing page
├── contexts/         # React contexts for state management
└── ...
```

## Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **AI SDK**: Vercel AI SDK with Anthropic provider
- **Styling**: Tailwind CSS
- **State Management**: React Context API

## Development Notes

- This is a development project - backwards compatibility is not a concern
- Nothing is deployed to production
- Use the typecheck script to validate TypeScript before committing changes

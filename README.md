# Perplexity Clone

A simple clone of Perplexity built with Next.js, TypeScript, and the AI SDK. This application allows users to submit search queries and receive AI-generated responses based on search results with citations.

## Features

- Search query interface with suggested queries
- Integration with search API for retrieving web results
- AI-powered responses using Anthropic's Claude
- Citation support for transparency
- Dark mode UI
- Responsive design

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

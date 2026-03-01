# AI Content Planner Backend

Simple Express.js proxy server to handle Claude API requests and avoid CORS issues.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## Development

For auto-restart on file changes:
```bash
npm run dev
```

## Endpoints

- `POST /api/generate` - Proxy endpoint for Claude API
- `GET /health` - Health check endpoint

## How It Works

1. Your React app sends requests to `http://localhost:3001/api/generate`
2. This server forwards the request to Claude API with your API key
3. The response is sent back to your React app
4. No CORS issues because the server acts as a proxy

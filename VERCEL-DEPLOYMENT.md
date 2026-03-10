# Vercel Deployment

## What Changed

- Frontend AI requests now use same-origin `/api/generate` in production.
- Vercel serverless endpoints now exist at:
  - `/api/generate`
  - `/api/health`
- Local development still falls back to `http://localhost:3001` when the app runs on `localhost`.

## Required Vercel Environment Variables

Add these in the Vercel project settings before redeploying:

```env
GROQ_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=
APP_BASE_URL=https://your-vercel-domain.vercel.app
```

`APP_BASE_URL` is recommended so OpenRouter receives your production domain instead of `localhost`.

## Verify After Deploy

1. Open `https://your-vercel-domain.vercel.app/api/health`
2. Confirm the `providers` object shows `true` for the keys you configured
3. Open the app and generate titles/content again

## Optional Local Override

If you want the frontend to call a custom backend during development, set:

```env
VITE_API_BASE_URL=http://localhost:3001
```

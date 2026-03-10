import { generateWithFallback } from "./_lib/aiProxy.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { model, max_tokens, system, messages } = req.body || {};

    if (!system || !Array.isArray(messages) || typeof max_tokens !== "number") {
      return res.status(400).json({
        error: "Invalid request",
        message: "Expected model, max_tokens, system, and messages"
      });
    }

    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const referer = process.env.APP_BASE_URL || `${protocol}://${host}`;

    const result = await generateWithFallback({
      model,
      max_tokens,
      system,
      messages,
      referer
    });

    if (!result) {
      return res.status(503).json({
        error: "All AI providers unavailable",
        message: "Check your Vercel environment variables and provider quotas"
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("API generate error", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}

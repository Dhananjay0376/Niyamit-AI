const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const OPENROUTER_API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const ANTHROPIC_API_ENDPOINT = "https://api.anthropic.com/v1/messages";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENROUTER_MODEL = "meta-llama/llama-3.2-3b-instruct:free";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

function sanitizeJsonResponse(text) {
  let clean = text.replace(/```json|```/g, "").trim();
  clean = clean.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "");
  return clean;
}

function toClaudeFormat(content, model) {
  return {
    content: [{ text: content, type: "text" }],
    model,
    role: "assistant"
  };
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function tryGroq(system, messages, maxTokens, env) {
  if (!env.GROQ_API_KEY) return null;

  try {
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: system },
          ...messages
        ],
        max_tokens: maxTokens,
        temperature: 0.9
      })
    });

    const data = await parseJsonSafe(response);
    if (response.ok && data.choices?.[0]?.message?.content) {
      return toClaudeFormat(sanitizeJsonResponse(data.choices[0].message.content), GROQ_MODEL);
    }

    console.error("Groq failed", data.error?.message || data.raw || response.statusText);
    return null;
  } catch (error) {
    console.error("Groq error", error);
    return null;
  }
}

async function tryGemini(system, messages, maxTokens, env) {
  if (!env.GEMINI_API_KEY) return null;

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${system}\n\n${messages[0]?.content || ""}` }]
        }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.9
        }
      })
    });

    const data = await parseJsonSafe(response);
    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return toClaudeFormat(
        sanitizeJsonResponse(data.candidates[0].content.parts[0].text),
        "gemini-1.5-flash"
      );
    }

    console.error("Gemini failed", data.error?.message || data.raw || response.statusText);
    return null;
  } catch (error) {
    console.error("Gemini error", error);
    return null;
  }
}

async function tryOpenRouter(system, messages, maxTokens, env, referer) {
  if (!env.OPENROUTER_API_KEY) return null;

  try {
    const response = await fetch(OPENROUTER_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": referer,
        "X-Title": "AI Content Planner"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: system },
          ...messages
        ],
        max_tokens: maxTokens,
        temperature: 0.9
      })
    });

    const data = await parseJsonSafe(response);
    if (response.ok && data.choices?.[0]?.message?.content) {
      return toClaudeFormat(
        sanitizeJsonResponse(data.choices[0].message.content),
        OPENROUTER_MODEL
      );
    }

    console.error("OpenRouter failed", data.error?.message || data.raw || response.statusText);
    return null;
  } catch (error) {
    console.error("OpenRouter error", error);
    return null;
  }
}

async function tryAnthropic(system, messages, maxTokens, requestedModel, env) {
  if (!env.ANTHROPIC_API_KEY) return null;

  try {
    const response = await fetch(ANTHROPIC_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: requestedModel || ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        system,
        messages
      })
    });

    const data = await parseJsonSafe(response);
    if (response.ok) {
      return data;
    }

    console.error("Anthropic failed", data.error?.message || data.raw || response.statusText);
    return null;
  } catch (error) {
    console.error("Anthropic error", error);
    return null;
  }
}

export function getProviderStatus(env = process.env) {
  return {
    groq: Boolean(env.GROQ_API_KEY),
    gemini: Boolean(env.GEMINI_API_KEY),
    openrouter: Boolean(env.OPENROUTER_API_KEY),
    anthropic: Boolean(env.ANTHROPIC_API_KEY)
  };
}

export async function generateWithFallback({ model, max_tokens, system, messages, referer }, env = process.env) {
  const providerEnv = {
    GROQ_API_KEY: env.GROQ_API_KEY,
    GEMINI_API_KEY: env.GEMINI_API_KEY,
    OPENROUTER_API_KEY: env.OPENROUTER_API_KEY,
    ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY
  };

  let provider = null;
  let result = await tryGroq(system, messages, max_tokens, providerEnv);
  if (result) provider = "groq";

  if (!result) {
    result = await tryGemini(system, messages, max_tokens, providerEnv);
    if (result) provider = "gemini";
  }

  if (!result) {
    result = await tryOpenRouter(system, messages, max_tokens, providerEnv, referer);
    if (result) provider = "openrouter";
  }

  if (!result) {
    result = await tryAnthropic(system, messages, max_tokens, model, providerEnv);
    if (result) provider = "anthropic";
  }

  return { result, provider, providers: getProviderStatus(providerEnv) };
}

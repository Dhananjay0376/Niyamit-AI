require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// AI API Configuration from environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// API Endpoints
const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const OPENROUTER_API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const ANTHROPIC_API_ENDPOINT = "https://api.anthropic.com/v1/messages";

// Models
const GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENROUTER_MODEL = "meta-llama/llama-3.2-3b-instruct:free"; // Free model
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// Helper function to sanitize AI response for JSON parsing
function sanitizeJsonResponse(text) {
  // Remove markdown code blocks
  let clean = text.replace(/```json|```/g, "").trim();
  
  // Remove only problematic control characters that break JSON parsing
  // Keep the text as-is otherwise since it's already formatted JSON
  clean = clean.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');
  
  return clean;
}

// Helper function to convert to Claude format
function toClaudeFormat(content, model) {
  return {
    content: [{ text: content, type: 'text' }],
    model: model,
    role: 'assistant'
  };
}

// 1. Try Groq (Primary - FREE)
async function tryGroq(system, messages, max_tokens) {
  try {
    console.log('1️⃣ Trying Groq API (FREE)...');
    
    const groqMessages = [
      { role: 'system', content: system },
      ...messages
    ];

    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        max_tokens: max_tokens,
        temperature: 0.9  // Higher temperature for more creative variation
      })
    });

    const data = await response.json();

    if (response.ok && data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      console.log('✅ Groq API success (FREE!)');
      // Sanitize response before returning
      const sanitized = sanitizeJsonResponse(content);
      return toClaudeFormat(sanitized, GROQ_MODEL);
    } else {
      console.log('❌ Groq failed:', data.error?.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.log('❌ Groq error:', error.message);
    return null;
  }
}

// 2. Try Gemini (Secondary - FREE)
async function tryGemini(system, messages, max_tokens) {
  try {
    console.log('2️⃣ Trying Gemini API (FREE)...');
    
    // Combine system and user message for Gemini
    const userMessage = messages[0]?.content || '';
    const fullPrompt = `${system}\n\n${userMessage}`;

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          maxOutputTokens: max_tokens,
          temperature: 0.9  // Higher temperature for more creative variation
        }
      })
    });

    const data = await response.json();

    if (response.ok && data.candidates && data.candidates[0]) {
      const content = data.candidates[0].content.parts[0].text;
      console.log('✅ Gemini API success (FREE!)');
      // Sanitize response before returning
      const sanitized = sanitizeJsonResponse(content);
      return toClaudeFormat(sanitized, 'gemini-1.5-flash');
    } else {
      console.log('❌ Gemini failed:', data.error?.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.log('❌ Gemini error:', error.message);
    return null;
  }
}

// 3. Try OpenRouter (Tertiary - FREE model)
async function tryOpenRouter(system, messages, max_tokens) {
  try {
    console.log('3️⃣ Trying OpenRouter API (FREE model)...');
    
    const openRouterMessages = [
      { role: 'system', content: system },
      ...messages
    ];

    const response = await fetch(OPENROUTER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'AI Content Planner'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: openRouterMessages,
        max_tokens: max_tokens,
        temperature: 0.9  // Higher temperature for more creative variation
      })
    });

    const data = await response.json();

    if (response.ok && data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      console.log('✅ OpenRouter API success (FREE!)');
      // Sanitize response before returning
      const sanitized = sanitizeJsonResponse(content);
      return toClaudeFormat(sanitized, OPENROUTER_MODEL);
    } else {
      console.log('❌ OpenRouter failed:', data.error?.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.log('❌ OpenRouter error:', error.message);
    return null;
  }
}

// 4. Try Anthropic Claude (Quaternary - PAID)
async function tryAnthropic(system, messages, max_tokens, model) {
  try {
    console.log('4️⃣ Trying Anthropic Claude API (PAID - last resort)...');
    
    const response = await fetch(ANTHROPIC_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || ANTHROPIC_MODEL,
        max_tokens: max_tokens,
        system: system,
        messages: messages
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Anthropic Claude API success (PAID)');
      return data;
    } else {
      console.log('❌ Anthropic failed:', data.error?.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.log('❌ Anthropic error:', error.message);
    return null;
  }
}

// Main proxy endpoint with 4-level fallback
app.post('/api/generate', async (req, res) => {
  try {
    const { model, max_tokens, system, messages } = req.body;

    console.log('\n🚀 Received request:', { 
      model, 
      max_tokens, 
      systemLength: system?.length, 
      messagesCount: messages?.length 
    });

    // Try providers in order: Groq → Gemini → OpenRouter → Anthropic
    let result = await tryGroq(system, messages, max_tokens);
    
    if (!result) {
      result = await tryGemini(system, messages, max_tokens);
    }
    
    if (!result) {
      result = await tryOpenRouter(system, messages, max_tokens);
    }
    
    if (!result) {
      result = await tryAnthropic(system, messages, max_tokens, model);
    }

    if (result) {
      return res.json(result);
    } else {
      console.log('❌ All AI providers failed!');
      return res.status(503).json({ 
        error: 'All AI providers unavailable',
        message: 'Please try again later or check your API keys'
      });
    }

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend proxy is running',
    providers: {
      groq: !!GROQ_API_KEY,
      gemini: !!GEMINI_API_KEY,
      openrouter: !!OPENROUTER_API_KEY,
      anthropic: !!ANTHROPIC_API_KEY
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend proxy server running on http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for all origins`);
  console.log(`\n📡 AI Provider Fallback Chain:`);
  console.log(`   1️⃣ Groq (FREE) ${GROQ_API_KEY ? '✅' : '❌'}`);
  console.log(`   2️⃣ Gemini (FREE) ${GEMINI_API_KEY ? '✅' : '❌'}`);
  console.log(`   3️⃣ OpenRouter (FREE) ${OPENROUTER_API_KEY ? '✅' : '❌'}`);
  console.log(`   4️⃣ Anthropic (PAID) ${ANTHROPIC_API_KEY ? '✅' : '❌'}`);
  console.log(`\n🔒 API keys loaded from .env file (secure!)\n`);
});

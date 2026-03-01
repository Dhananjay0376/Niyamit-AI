# 🚀 New Setup Guide - Secure Multi-Provider AI

## ✅ What's New?

Your AI Content Planner now has:
1. **4-Level AI Fallback System** (Groq → Gemini → OpenRouter → Claude)
2. **Secure API Key Storage** (in `.env` file, not in code)
3. **New API Keys** (old ones should be revoked)
4. **GitHub-Safe** (`.env` is in `.gitignore`)

---

## 🎯 Quick Start

### Step 1: Install Dependencies
```bash
cd server
npm install
```

### Step 2: Verify .env File
Check that `server/.env` exists and contains your keys:
```bash
cat server/.env
```

Should show:
```
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### Step 3: Start Backend
```bash
npm start
```

You should see:
```
🚀 Backend proxy server running on http://localhost:3001
✅ CORS enabled for all origins

📡 AI Provider Fallback Chain:
   1️⃣ Groq (FREE) ✅
   2️⃣ Gemini (FREE) ✅
   3️⃣ OpenRouter (FREE) ✅
   4️⃣ Anthropic (PAID) ✅

🔒 API keys loaded from .env file (secure!)
```

### Step 4: Start Frontend (New Terminal)
```bash
npm run dev
```

### Step 5: Test It!
1. Go to http://localhost:5173
2. Click "Demo Login"
3. Create a plan with custom niche
4. Watch the backend terminal to see which AI provider is used

---

## 📊 AI Provider Fallback Chain

### How It Works:

```
User Request
    ↓
1️⃣ Try Groq (FREE)
    ↓ (if fails)
2️⃣ Try Gemini (FREE)
    ↓ (if fails)
3️⃣ Try OpenRouter (FREE)
    ↓ (if fails)
4️⃣ Try Anthropic (PAID)
    ↓ (if fails)
❌ Return error
```

### What You'll See in Backend Logs:

**Success with Groq:**
```
🚀 Received request: { ... }
1️⃣ Trying Groq API (FREE)...
✅ Groq API success (FREE!)
```

**Groq fails, Gemini succeeds:**
```
🚀 Received request: { ... }
1️⃣ Trying Groq API (FREE)...
❌ Groq failed: ...
2️⃣ Trying Gemini API (FREE)...
✅ Gemini API success (FREE!)
```

**All free providers fail, Claude succeeds:**
```
🚀 Received request: { ... }
1️⃣ Trying Groq API (FREE)...
❌ Groq failed: ...
2️⃣ Trying Gemini API (FREE)...
❌ Gemini failed: ...
3️⃣ Trying OpenRouter API (FREE model)...
❌ OpenRouter failed: ...
4️⃣ Trying Anthropic Claude API (PAID - last resort)...
✅ Anthropic Claude API success (PAID)
```

---

## 🔒 Security Checklist

### ✅ Done:
- [x] API keys moved to `.env` file
- [x] `.env` added to `.gitignore`
- [x] New API keys generated
- [x] Code uses environment variables
- [x] `.env.example` created for reference

### ⚠️ To Do:
- [ ] **Revoke old API keys** (IMPORTANT!)
  - Groq: https://console.groq.com/keys
  - Anthropic: https://console.anthropic.com/settings/keys
  - Gemini: https://aistudio.google.com/app/apikey
  - OpenRouter: https://openrouter.ai/keys

- [ ] **Verify .env is not tracked**
  ```bash
  git status
  # Should NOT show server/.env
  ```

- [ ] **(Optional) Clean Git history**
  - See `SECURITY-GUIDE.md` for instructions

---

## 🧪 Testing Each Provider

### Test Groq:
```bash
cd server
node test-api.js
```

### Test Manually:
```bash
# Health check
curl http://localhost:3001/health

# Should show all providers with ✅
```

---

## 💰 Cost Breakdown

| Provider | Cost | Daily Limit | Quality |
|----------|------|-------------|---------|
| **Groq** | 🆓 FREE | 14,400 requests | ⭐⭐⭐⭐ |
| **Gemini** | 🆓 FREE | 1,500 requests | ⭐⭐⭐⭐⭐ |
| **OpenRouter** | 🆓 FREE | Varies by model | ⭐⭐⭐ |
| **Anthropic** | 💰 PAID | Depends on credits | ⭐⭐⭐⭐⭐ |

**Expected behavior:**
- 99% of requests will use Groq (FREE)
- 1% might use Gemini if Groq is down (FREE)
- OpenRouter is backup (FREE)
- Claude is last resort (PAID - rarely used)

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
cd server
npm install
npm start
```

### "Cannot find module 'dotenv'"?
```bash
cd server
npm install dotenv
```

### .env file not found?
```bash
# Check if it exists
ls server/.env

# If not, create it
cp server/.env.example server/.env
# Then edit and add your keys
```

### Still getting API errors?
1. Check backend terminal for detailed error messages
2. Verify all API keys in `server/.env`
3. Test each provider individually
4. Check provider dashboards for rate limits

### Want to test a specific provider?
Edit `server/server.js` and comment out the others:
```javascript
// Skip Groq for testing
// let result = await tryGroq(system, messages, max_tokens);

// Test Gemini directly
let result = await tryGemini(system, messages, max_tokens);
```

---

## 📚 Documentation

- **Security Guide**: `SECURITY-GUIDE.md`
- **Groq Integration**: `GROQ-INTEGRATION.md`
- **Main README**: `README.md`
- **Quick Start**: `QUICK-START.md`

---

## ✅ Summary

You now have:
- ✅ 4 AI providers (3 free, 1 paid)
- ✅ Automatic fallback system
- ✅ Secure API key storage
- ✅ GitHub-safe configuration
- ✅ Cost-effective solution

**Total cost: $0/month** (using free providers)

**Start the servers and test it!** 🚀

```bash
# Terminal 1
cd server
npm start

# Terminal 2
npm run dev
```

Then go to http://localhost:5173 and create a plan!

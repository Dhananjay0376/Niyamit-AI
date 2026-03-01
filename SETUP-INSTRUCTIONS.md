# AI Content Planner - Setup Instructions

## 🎯 What Changed?

Your app now uses a **backend proxy server** to call the Claude API, which solves the CORS issue you were experiencing.

## 📁 New Files Created

```
project/
├── server/                    # NEW: Backend proxy server
│   ├── server.js             # Express server that calls Claude API
│   ├── package.json          # Backend dependencies
│   ├── .gitignore           # Ignore node_modules
│   └── README.md            # Backend documentation
├── start-all.bat            # NEW: Easy startup script (Windows)
└── ai-content-planner.jsx   # UPDATED: Now calls backend instead of Claude directly
```

## 🚀 Quick Start

### Option 1: Use the Startup Script (Easiest)

**Windows:**
```bash
start-all.bat
```

This will automatically:
1. Install backend dependencies
2. Start the backend server on port 3001
3. Start your frontend on port 5173

### Option 2: Manual Start (More Control)

**Step 1: Start the Backend**
```bash
cd server
npm install
npm start
```

You should see:
```
🚀 Backend proxy server running on http://localhost:3001
✅ CORS enabled for all origins
📡 Proxying requests to Claude API
```

**Step 2: Start the Frontend** (in a new terminal)
```bash
npm run dev
```

## ✅ How to Verify It's Working

1. **Check Backend Health:**
   - Open: http://localhost:3001/health
   - You should see: `{"status":"ok","message":"Backend proxy is running"}`

2. **Test in Your App:**
   - Create a new content plan
   - Select any niche (including custom!)
   - Click "Generate My Calendar"
   - Check the browser console - you should see NO CORS errors
   - Titles should be AI-generated (not templates)

3. **Generate a Post:**
   - Click the "⚡ Gen" button on any post
   - Wait a few seconds
   - You should get AI-generated content!

## 🔍 Troubleshooting

### Backend won't start?
```bash
cd server
npm install
npm start
```

### Still seeing CORS errors?
- Make sure the backend is running on port 3001
- Check that `http://localhost:3001/health` returns OK
- Restart both servers

### API key issues?
- The API key is now stored in `server/server.js` (line 11)
- It's no longer exposed in the frontend code
- More secure! 🔒

### Port already in use?
If port 3001 is taken, edit `server/server.js` line 5:
```javascript
const PORT = 3002; // Change to any available port
```

Then update `ai-content-planner.jsx` line 4:
```javascript
const BACKEND_API_ENDPOINT = "http://localhost:3002/api/generate";
```

## 🎉 What You Can Do Now

✅ Generate AI-powered titles for any niche
✅ Generate AI-powered post content
✅ Use custom niches (they work perfectly now!)
✅ No more CORS errors
✅ API key is secure (not exposed in browser)
✅ Automatic fallback to templates if API fails

## 📊 Monitoring

Watch the backend terminal to see:
- Incoming requests
- API call success/failures
- Error messages (if any)

Example output:
```
Received request: { model: 'claude-sonnet-4-20250514', max_tokens: 500, ... }
Claude API success
```

## 🛑 Stopping the Servers

**If using start-all.bat:**
- Press any key in the startup window

**If started manually:**
- Press `Ctrl+C` in each terminal window

## 🔐 Security Note

Your API key is now stored in the backend server (`server/server.js`), which is more secure than having it in the frontend. However, for production:

1. Move the API key to an environment variable
2. Create a `.env` file in the `server/` folder
3. Add `CLAUDE_API_KEY=your-key-here`
4. Update `server.js` to use `process.env.CLAUDE_API_KEY`

## 📝 Next Steps

1. Test creating a plan with a custom niche
2. Generate some posts
3. Check the console logs to see the AI working
4. Enjoy your AI-powered content planner! 🎨

---

**Need help?** Check the console logs in both:
- Browser DevTools (F12) → Console tab
- Backend terminal window

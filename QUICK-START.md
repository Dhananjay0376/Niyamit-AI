# 🚀 Quick Start Guide

## Step-by-Step Setup (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd server
npm install
```

Wait for installation to complete...

### Step 2: Start the Backend Server
```bash
npm start
```

You should see:
```
🚀 Backend proxy server running on http://localhost:3001
✅ CORS enabled for all origins
📡 Proxying requests to Claude API
```

✅ **Backend is ready!** Keep this terminal open.

### Step 3: Start the Frontend (New Terminal)
```bash
# Go back to project root
cd ..

# Start Vite dev server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ **Frontend is ready!**

### Step 4: Open Your Browser
Go to: **http://localhost:5173**

---

## 🎯 First Time Using the App?

1. **Click "Demo Login"** (email: demo@creator.in)

2. **Create Your First Plan:**
   - Click "＋ Create First Plan"
   - Choose a niche (try "Custom" and type "Anime Reviews"!)
   - Select Instagram
   - Pick Hinglish + Motivational
   - Choose 15 posts per month
   - Click "Generate My Calendar ✨"

3. **Generate AI Content:**
   - Click "⚡ Gen" on any date
   - Wait 3-5 seconds
   - See AI-generated content!

---

## ✅ How to Know It's Working

### Backend Working:
- Terminal shows: `🚀 Backend proxy server running`
- Visit: http://localhost:3001/health
- Should show: `{"status":"ok","message":"Backend proxy is running"}`

### Frontend Working:
- Browser opens to http://localhost:5173
- No CORS errors in console (F12)
- Beautiful dark UI with aurora effects

### AI Working:
- When you generate titles, they're unique (not templates)
- When you generate posts, content is custom
- Console shows: `Claude API success` in backend terminal

---

## 🐛 Something Not Working?

### Backend won't start?
```bash
cd server
npm install
npm start
```

### Frontend won't start?
```bash
npm install
npm run dev
```

### Still seeing CORS errors?
1. Make sure backend is running (check terminal)
2. Visit http://localhost:3001/health
3. Restart both servers

### Want to test the backend?
```bash
cd server
node test-api.js
```

---

## 🎉 You're All Set!

Now you can:
- ✅ Generate AI-powered titles
- ✅ Create custom niche content
- ✅ Generate complete social media posts
- ✅ Plan your entire month's content

**Enjoy your AI Content Planner!** 🎨

---

## 📚 Need More Help?

- **Detailed Setup**: See `SETUP-INSTRUCTIONS.md`
- **Full Documentation**: See `README.md`
- **Backend Info**: See `server/README.md`

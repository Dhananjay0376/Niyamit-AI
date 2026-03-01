# 🎨 AI Content Planner

India's first AI-powered content planning tool for social media creators. Generate viral post titles and content using Claude AI, with automatic fallback to curated templates.

## ✨ Features

- 🤖 **AI-Powered Generation**: Dynamic titles and content using Claude API
- 📅 **Smart Scheduling**: Multiple posting frequency options (Mon/Wed/Fri, Daily, etc.)
- 🌐 **Multi-Platform**: Instagram, YouTube, LinkedIn, Twitter/X
- 🗣️ **Multi-Language**: English, Hindi, Hinglish
- 🎯 **10+ Niches**: Exam tips, Startup, Finance, Fitness, Astrology, and more
- ✏️ **Custom Niches**: Create content for any topic you want
- 📊 **Visual Calendar**: See your entire month's content at a glance
- 🔄 **Graceful Fallback**: Automatically uses templates if API fails
- 🎨 **Beautiful UI**: Aurora-themed dark interface with smooth animations

## 🏗️ Architecture

```
Frontend (React + Vite)          Backend (Express.js)          AI APIs
     Port 5173              →        Port 3001           →    Groq (FREE!)
                                                              ↓ (fallback)
User creates plan           →   Proxy receives request   →   Claude (Paid)
                                                              
User sees content          ←    Proxy returns response  ←    
```

**Why a backend?**
- Solves CORS issues (browsers can't call AI APIs directly)
- Keeps API keys secure (not exposed in frontend code)
- Enables request logging and monitoring
- Supports multiple AI providers with fallback

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or download this project**

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd server
npm install
cd ..
```

### Running the App

**Option 1: Use the startup script (Windows)**
```bash
start-all.bat
```

**Option 2: Manual start**

Terminal 1 (Backend):
```bash
cd server
npm start
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Access the App
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📖 Usage

1. **Create Account / Login**
   - Use demo login or create your own account

2. **Create a Content Plan**
   - Choose your niche (or create a custom one!)
   - Select platform (Instagram, YouTube, LinkedIn, Twitter)
   - Pick language and tone
   - Set posting frequency
   - Generate your calendar

3. **Generate Posts**
   - Click "⚡ Gen" on any date
   - AI generates complete post with:
     - Hook (attention-grabbing opener)
     - Caption (full post content)
     - Hashtags (15-20 relevant tags)
     - CTA (call-to-action)
     - Platform tips

4. **Edit & Export**
   - Edit titles inline
   - Copy generated content
   - Mark posts as skipped if needed

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- CSS-in-JS (inline styles)
- Google Fonts (Playfair Display, Outfit, JetBrains Mono)

**Backend:**
- Node.js
- Express.js
- node-fetch
- CORS enabled

**AI:**
- Groq API (Primary - FREE!)
- Claude API (Fallback - Paid)
- Model: Llama 3.1 70B (Groq) / Claude Sonnet 4 (fallback)

## 📁 Project Structure

```
ai-content-planner/
├── src/
│   └── main.jsx                 # React entry point
├── server/
│   ├── server.js                # Express backend proxy
│   ├── package.json             # Backend dependencies
│   ├── test-api.js              # API test script
│   └── README.md                # Backend docs
├── ai-content-planner.jsx       # Main React component
├── index.html                   # HTML entry point
├── package.json                 # Frontend dependencies
├── vite.config.js               # Vite configuration
├── start-all.bat                # Windows startup script
├── SETUP-INSTRUCTIONS.md        # Detailed setup guide
└── README.md                    # This file
```

## 🧪 Testing

**Test the backend:**
```bash
cd server
node test-api.js
```

This will:
1. Check if the backend is running
2. Test AI title generation
3. Display results

## 🔧 Configuration

### Change Backend Port

Edit `server/server.js`:
```javascript
const PORT = 3001; // Change to your preferred port
```

Then update `ai-content-planner.jsx`:
```javascript
const BACKEND_API_ENDPOINT = "http://localhost:YOUR_PORT/api/generate";
```

### API Key

The Claude API key is stored in `server/server.js` (line 11).

**For production**, use environment variables:
1. Create `server/.env`:
```
CLAUDE_API_KEY=your-api-key-here
```

2. Update `server/server.js`:
```javascript
require('dotenv').config();
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
```

3. Install dotenv:
```bash
cd server
npm install dotenv
```

## 🐛 Troubleshooting

### CORS Errors
- Make sure the backend is running on port 3001
- Check `http://localhost:3001/health` returns OK
- Restart both servers

### API Not Working
- Check backend terminal for error messages
- Verify API key is correct in `server/server.js`
- Test with `node server/test-api.js`

### Port Already in Use
- Change the port in `server/server.js`
- Update the endpoint in `ai-content-planner.jsx`

### Frontend Won't Start
```bash
npm install
npm run dev
```

### Backend Won't Start
```bash
cd server
npm install
npm start
```

## 📊 Monitoring

**Backend logs show:**
- Incoming requests
- API call success/failures
- Error details

**Browser console shows:**
- Frontend errors
- API call results
- Fallback triggers

## 🔐 Security

✅ API key stored in backend (not exposed to browser)
✅ CORS enabled only for development
✅ No sensitive data in frontend code

**For production:**
- Use environment variables for API key
- Implement rate limiting
- Add authentication
- Use HTTPS
- Restrict CORS to your domain

## 🎯 Roadmap

- [ ] User authentication with database
- [ ] Save generated posts
- [ ] Export to CSV/PDF
- [ ] Schedule posts to social media
- [ ] Analytics dashboard
- [ ] Team collaboration
- [ ] Multiple API key support
- [ ] Custom prompt templates

## 📝 License

This project is for educational and personal use.

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 💬 Support

Having issues? Check:
1. `SETUP-INSTRUCTIONS.md` for detailed setup
2. Browser console for frontend errors
3. Backend terminal for API errors
4. Run `node server/test-api.js` to test the backend

## 🎉 Acknowledgments

- Built with Claude AI (Anthropic)
- Inspired by Indian content creators
- UI design inspired by modern SaaS apps

---

**Made with ❤️ for Indian creators**

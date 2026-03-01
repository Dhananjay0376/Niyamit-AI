# 🔒 Security Guide - API Key Management

## ⚠️ IMPORTANT: Your API Keys Are Now Secure!

All API keys are now stored in the `.env` file which is:
- ✅ Excluded from Git (in `.gitignore`)
- ✅ Never committed to GitHub
- ✅ Only stored locally on your machine

---

## 🔑 API Keys Location

Your API keys are stored in: `server/.env`

**NEVER commit this file to GitHub!**

---

## 🛡️ What We Did to Secure Your Keys

### 1. Created `.env` File
All API keys moved from code to environment variables:
```
server/.env  ← Your actual keys (NEVER commit!)
```

### 2. Updated `.gitignore`
Added `.env` to both:
- `server/.gitignore`
- `.gitignore` (root)

This ensures `.env` is NEVER tracked by Git.

### 3. Created `.env.example`
Template file for others (no real keys):
```
server/.env.example  ← Safe to commit (no real keys)
```

### 4. Updated `server.js`
Now loads keys from environment variables:
```javascript
require('dotenv').config();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
```

---

## 🚨 GitHub Leaked Your Old Keys

### What Happened:
- Old API keys were in `server.js`
- You committed and pushed to GitHub
- GitHub detected the keys and blocked the push
- Keys are now in commit history

### What You Need to Do:

#### 1. ✅ DONE: New Keys Added
We've already added your new API keys to `.env`:
- ✅ New Groq key
- ✅ New Gemini key  
- ✅ New OpenRouter key
- ✅ New Anthropic key

#### 2. ⚠️ IMPORTANT: Revoke Old Keys

**Groq:**
1. Go to: https://console.groq.com/keys
2. Find your old key
3. Click "Revoke" or "Delete"

**Anthropic:**
1. Go to: https://console.anthropic.com/settings/keys
2. Find your old key
3. Click "Revoke" or "Delete"

**Gemini:**
1. Go to: https://aistudio.google.com/app/apikey
2. Find your old key
3. Click "Delete"

**OpenRouter:**
1. Go to: https://openrouter.ai/keys
2. Find your old key
3. Click "Delete"

#### 3. 🧹 Clean Git History (Optional but Recommended)

If you want to remove the old keys from Git history:

**Option A: Force Push (if repo is private and you're the only user)**
```bash
# Remove last commit with keys
git reset --hard HEAD~1

# Force push
git push --force
```

**Option B: Use BFG Repo-Cleaner (for thorough cleaning)**
```bash
# Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clean the repo
java -jar bfg.jar --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

**Option C: Start Fresh (easiest)**
1. Delete the GitHub repository
2. Create a new repository
3. Push clean code (without old keys)

---

## ✅ Current Security Status

### Secure ✅
- API keys in `.env` file
- `.env` in `.gitignore`
- New API keys generated
- Code uses environment variables

### To Do ⚠️
- [ ] Revoke old API keys from providers
- [ ] (Optional) Clean Git history
- [ ] Verify `.env` is not tracked: `git status`

---

## 🔍 Verify Security

### Check 1: .env is Ignored
```bash
git status
```
Should NOT show `server/.env` in the list.

### Check 2: .env is in .gitignore
```bash
cat .gitignore | grep .env
```
Should show `.env` entries.

### Check 3: No Keys in Code
```bash
grep -r "sk-ant-" server/server.js
grep -r "gsk_" server/server.js
```
Should return nothing (keys are in .env, not code).

---

## 📋 Setup for New Developers

If someone else wants to run your project:

1. **Clone the repo**
   ```bash
   git clone your-repo-url
   ```

2. **Copy .env.example to .env**
   ```bash
   cd server
   cp .env.example .env
   ```

3. **Add their own API keys**
   ```bash
   # Edit server/.env and add their keys
   nano .env
   ```

4. **Install and run**
   ```bash
   npm install
   npm start
   ```

---

## 🎯 Best Practices Going Forward

### DO ✅
- Keep API keys in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables in code
- Commit `.env.example` (without real keys)
- Rotate keys regularly
- Use different keys for dev/prod

### DON'T ❌
- Never hardcode API keys in code
- Never commit `.env` file
- Never share API keys in chat/email
- Never push keys to public repos
- Never reuse keys across projects

---

## 🆘 If Keys Are Leaked Again

1. **Immediately revoke the leaked keys**
2. **Generate new keys**
3. **Update `.env` file**
4. **Restart the server**
5. **Clean Git history (if needed)**

---

## 📚 Resources

- **Groq Console**: https://console.groq.com
- **Anthropic Console**: https://console.anthropic.com
- **Google AI Studio**: https://aistudio.google.com
- **OpenRouter**: https://openrouter.ai
- **Git Secrets**: https://github.com/awslabs/git-secrets
- **BFG Repo-Cleaner**: https://rtyley.github.io/bfg-repo-cleaner/

---

## ✅ Summary

Your API keys are now secure! 🎉

- ✅ Keys in `.env` (not in code)
- ✅ `.env` in `.gitignore` (not tracked)
- ✅ New keys generated
- ✅ 4-level fallback system (Groq → Gemini → OpenRouter → Claude)

**Next steps:**
1. Revoke old keys from provider dashboards
2. Test the app: `cd server && npm install && npm start`
3. Verify it works with new keys

**Your app is now secure and ready to use!** 🔒

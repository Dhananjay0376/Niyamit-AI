# 🚀 Production Readiness Guide

## Executive Summary

This guide provides a comprehensive analysis of the AI Content Planner application and outlines all changes, additions, and improvements required to make it globally production-ready at enterprise scale.

**Current Status**: Development/MVP ✅  
**Target Status**: Production-Grade Global Platform 🎯  
**Estimated Effort**: 3-6 months with a team of 4-6 developers

---

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [Critical Security Issues](#critical-security-issues)
3. [Authentication & Authorization](#authentication--authorization)
4. [Database & Data Persistence](#database--data-persistence)
5. [Backend Infrastructure](#backend-infrastructure)
6. [Frontend Improvements](#frontend-improvements)
7. [AI System Enhancements](#ai-system-enhancements)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Observability](#monitoring--observability)
10. [Testing Strategy](#testing-strategy)
11. [Deployment & DevOps](#deployment--devops)
12. [Compliance & Legal](#compliance--legal)
13. [Scalability Planning](#scalability-planning)
14. [Cost Optimization](#cost-optimization)
15. [Implementation Roadmap](#implementation-roadmap)

---


## 1. Current Architecture Analysis

### ✅ What's Working Well

**Frontend:**
- Clean React architecture with hooks
- Responsive UI with good UX
- localStorage for client-side persistence
- Platform-specific content optimization
- Multi-language support

**Backend:**
- Multi-provider AI fallback system
- CORS handling
- Environment variable management
- Request/response logging
- JSON sanitization

**AI Integration:**
- 4-level fallback chain (99.9% uptime)
- Cost optimization (free providers first)
- Platform-specific prompts
- Temperature tuning for variation

### ❌ Critical Gaps for Production

**Security:**
- No user authentication
- No authorization/access control
- API keys in plain text .env file
- No rate limiting
- No input validation
- No CSRF protection
- No XSS protection

**Data Management:**
- localStorage only (no server-side persistence)
- No data backup
- No data recovery
- No multi-device sync
- Data loss on browser clear

**Infrastructure:**
- Single server (no redundancy)
- No load balancing
- No auto-scaling
- No CDN
- No caching layer

**Monitoring:**
- No error tracking
- No performance monitoring
- No user analytics
- No uptime monitoring
- No alerting system


---

## 2. Critical Security Issues

### 🔴 HIGH PRIORITY (Fix Immediately)

#### 2.1 Authentication System
**Current**: Demo login with no validation  
**Required**: Secure authentication with JWT/OAuth

**Implementation:**
```javascript
// Add to backend
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// User registration
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Validate input
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Store in database
  const user = await db.users.create({
    email,
    password: hashedPassword,
    name,
    createdAt: new Date()
  });
  
  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({ token, user: { id: user.id, email, name } });
});

// User login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await db.users.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Protect routes
app.post('/api/generate', authenticateToken, async (req, res) => {
  // ... existing code
});
```

**Dependencies to Add:**
```bash
npm install jsonwebtoken bcrypt express-validator
```


#### 2.2 Input Validation & Sanitization
**Current**: No validation  
**Required**: Comprehensive validation on all inputs

**Implementation:**
```javascript
const { body, validationResult } = require('express-validator');

// Validation middleware
const validatePlanCreation = [
  body('niche').trim().isLength({ min: 1, max: 100 }).escape(),
  body('platform').isIn(['instagram', 'youtube', 'linkedin', 'twitter']),
  body('language').isIn(['english', 'hindi', 'hinglish']),
  body('tone').trim().isLength({ min: 1, max: 50 }).escape(),
  body('posts_per_month').isInt({ min: 1, max: 31 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

app.post('/api/plans', authenticateToken, validatePlanCreation, async (req, res) => {
  // ... create plan
});
```

#### 2.3 Rate Limiting
**Current**: No rate limiting  
**Required**: Prevent abuse and DDoS

**Implementation:**
```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

// AI generation rate limit (more restrictive)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: 'AI generation rate limit exceeded'
});

app.use('/api/', apiLimiter);
app.use('/api/generate', aiLimiter);
```

**Dependencies:**
```bash
npm install express-rate-limit
```

#### 2.4 HTTPS & Security Headers
**Current**: HTTP only  
**Required**: HTTPS with security headers

**Implementation:**
```javascript
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// HTTPS server (production)
if (process.env.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  };
  
  https.createServer(options, app).listen(443, () => {
    console.log('HTTPS server running on port 443');
  });
}
```

**Dependencies:**
```bash
npm install helmet
```


#### 2.5 API Key Management
**Current**: Plain text in .env  
**Required**: Secrets management service

**Implementation Options:**

**Option A: AWS Secrets Manager**
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getSecret(secretName) {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    return JSON.parse(data.SecretString);
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}

// Load secrets on startup
const secrets = await getSecret('ai-content-planner/api-keys');
const GROQ_API_KEY = secrets.GROQ_API_KEY;
const GEMINI_API_KEY = secrets.GEMINI_API_KEY;
```

**Option B: HashiCorp Vault**
```javascript
const vault = require('node-vault')({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN
});

async function getSecrets() {
  const result = await vault.read('secret/data/ai-content-planner');
  return result.data.data;
}
```

**Option C: Azure Key Vault**
```javascript
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

const credential = new DefaultAzureCredential();
const client = new SecretClient(process.env.AZURE_KEYVAULT_URL, credential);

async function getSecret(name) {
  const secret = await client.getSecret(name);
  return secret.value;
}
```

#### 2.6 CORS Configuration
**Current**: Allow all origins  
**Required**: Whitelist specific domains

**Implementation:**
```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = process.env.ALLOWED_ORIGINS.split(',');
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

**.env:**
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```


---

## 3. Authentication & Authorization

### 3.1 OAuth Integration
**Why**: Allow users to sign in with Google, Facebook, Twitter

**Implementation:**
```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    // Find or create user
    let user = await db.users.findOne({ googleId: profile.id });
    
    if (!user) {
      user = await db.users.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value,
        provider: 'google'
      });
    }
    
    return done(null, user);
  }
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET);
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
);
```

### 3.2 Role-Based Access Control (RBAC)
**Why**: Different user tiers (Free, Pro, Enterprise)

**Database Schema:**
```javascript
// User roles
const roles = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
  ADMIN: 'admin'
};

// User limits by role
const limits = {
  free: {
    plansPerMonth: 3,
    postsPerPlan: 15,
    aiGenerationsPerDay: 50
  },
  pro: {
    plansPerMonth: 20,
    postsPerPlan: 100,
    aiGenerationsPerDay: 500
  },
  enterprise: {
    plansPerMonth: -1, // unlimited
    postsPerPlan: -1,
    aiGenerationsPerDay: -1
  }
};

// Middleware to check limits
const checkLimit = (limitType) => async (req, res, next) => {
  const user = await db.users.findById(req.user.userId);
  const userLimits = limits[user.role];
  
  // Check usage
  const usage = await db.usage.findOne({
    userId: user.id,
    date: new Date().toISOString().split('T')[0]
  });
  
  if (usage && usage[limitType] >= userLimits[limitType]) {
    return res.status(429).json({
      error: 'Limit exceeded',
      limit: userLimits[limitType],
      upgrade: user.role === 'free' ? 'pro' : 'enterprise'
    });
  }
  
  next();
};

// Apply to routes
app.post('/api/generate',
  authenticateToken,
  checkLimit('aiGenerationsPerDay'),
  async (req, res) => {
    // ... generate content
    
    // Increment usage
    await db.usage.increment({
      userId: req.user.userId,
      date: new Date().toISOString().split('T')[0],
      field: 'aiGenerationsPerDay'
    });
  }
);
```

### 3.3 Session Management
**Current**: No session management  
**Required**: Secure session handling

**Implementation:**
```javascript
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));
```


---

## 4. Database & Data Persistence

### 4.1 Database Selection
**Current**: localStorage only  
**Required**: Production database

**Recommended**: PostgreSQL + Redis

**Why PostgreSQL:**
- ACID compliance
- JSON support (for flexible schemas)
- Full-text search
- Excellent performance
- Strong community support

**Why Redis:**
- Session storage
- Caching layer
- Rate limiting
- Real-time features

### 4.2 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'free',
  provider VARCHAR(50) DEFAULT 'email',
  provider_id VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Content plans table
CREATE TABLE content_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  niche VARCHAR(100) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  language VARCHAR(50) NOT NULL,
  tone VARCHAR(50) NOT NULL,
  posts_per_month INTEGER NOT NULL,
  distribution_mode VARCHAR(50) NOT NULL,
  month VARCHAR(7) NOT NULL, -- YYYY-MM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES content_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  day INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  generated_content JSONB, -- stores hook, caption, hashtags, cta, platform_note
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  generated_at TIMESTAMP
);

-- Usage tracking table
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  ai_generations INTEGER DEFAULT 0,
  plans_created INTEGER DEFAULT 0,
  posts_generated INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- API keys table (for user's own API keys if needed)
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  UNIQUE(user_id, provider)
);

-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_plans_user_id ON content_plans(user_id);
CREATE INDEX idx_plans_month ON content_plans(month);
CREATE INDEX idx_posts_plan_id ON posts(plan_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_usage_user_date ON usage_tracking(user_id, date);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
```


### 4.3 Database Connection & ORM

**Recommended**: Prisma ORM

**Installation:**
```bash
npm install prisma @prisma/client
npx prisma init
```

**Prisma Schema (prisma/schema.prisma):**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String?  @map("password_hash")
  name          String
  avatarUrl     String?  @map("avatar_url")
  role          String   @default("free")
  provider      String   @default("email")
  providerId    String?  @map("provider_id")
  emailVerified Boolean  @default(false) @map("email_verified")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  lastLoginAt   DateTime? @map("last_login_at")
  deletedAt     DateTime? @map("deleted_at")
  
  plans         ContentPlan[]
  usage         UsageTracking[]
  apiKeys       UserApiKey[]
  auditLogs     AuditLog[]
  
  @@map("users")
}

model ContentPlan {
  id               String   @id @default(uuid())
  userId           String   @map("user_id")
  niche            String
  platform         String
  language         String
  tone             String
  postsPerMonth    Int      @map("posts_per_month")
  distributionMode String   @map("distribution_mode")
  month            String
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  deletedAt        DateTime? @map("deleted_at")
  
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  posts            Post[]
  
  @@map("content_plans")
}

model Post {
  id                String   @id @default(uuid())
  planId            String   @map("plan_id")
  title             String
  day               Int
  status            String   @default("pending")
  generatedContent  Json?    @map("generated_content")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  generatedAt       DateTime? @map("generated_at")
  
  plan              ContentPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  
  @@map("posts")
}

// ... other models
```

**Usage in Code:**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    passwordHash: hashedPassword
  }
});

// Create plan with posts
const plan = await prisma.contentPlan.create({
  data: {
    userId: user.id,
    niche: 'fitness',
    platform: 'instagram',
    language: 'english',
    tone: 'motivational',
    postsPerMonth: 15,
    distributionMode: 'mon_wed_fri',
    month: '2025-08',
    posts: {
      create: [
        { title: 'Post 1', day: 1, status: 'pending' },
        { title: 'Post 2', day: 3, status: 'pending' }
      ]
    }
  },
  include: {
    posts: true
  }
});

// Get user's plans
const userPlans = await prisma.contentPlan.findMany({
  where: {
    userId: user.id,
    deletedAt: null
  },
  include: {
    posts: true
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

### 4.4 Data Migration Strategy

**From localStorage to Database:**

```javascript
// Migration endpoint (one-time use)
app.post('/api/migrate-data', authenticateToken, async (req, res) => {
  const { plans } = req.body; // Plans from localStorage
  
  try {
    for (const plan of plans) {
      await prisma.contentPlan.create({
        data: {
          userId: req.user.userId,
          niche: plan.niche,
          platform: plan.platform,
          language: plan.language,
          tone: plan.tone,
          postsPerMonth: plan.posts_per_month,
          distributionMode: plan.distribution_mode,
          month: plan.month,
          posts: {
            create: plan.posts.map(post => ({
              title: post.title,
              day: post.day,
              status: post.status,
              generatedContent: post.generatedPost
            }))
          }
        }
      });
    }
    
    res.json({ success: true, migrated: plans.length });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed' });
  }
});
```


---

## 5. Backend Infrastructure

### 5.1 API Restructuring

**Current**: Single monolithic file  
**Required**: Modular architecture

**New Structure:**
```
server/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── secrets.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimit.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── plans.routes.js
│   │   ├── posts.routes.js
│   │   └── ai.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── plans.controller.js
│   │   ├── posts.controller.js
│   │   └── ai.controller.js
│   ├── services/
│   │   ├── ai.service.js
│   │   ├── email.service.js
│   │   └── storage.service.js
│   ├── models/
│   │   └── (Prisma handles this)
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── prisma/
│   └── schema.prisma
├── .env.example
├── package.json
└── server.js (entry point)
```

### 5.2 Error Handling

**Centralized Error Handler:**
```javascript
// middleware/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production: don't leak error details
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Programming or unknown error
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }
};

module.exports = { AppError, errorHandler };
```

### 5.3 Logging System

**Winston Logger:**
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-content-planner' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write errors to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Production: send logs to external service
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Http({
    host: process.env.LOG_SERVICE_HOST,
    port: process.env.LOG_SERVICE_PORT,
    path: '/logs'
  }));
}

module.exports = logger;
```

**Usage:**
```javascript
const logger = require('./utils/logger');

logger.info('User logged in', { userId: user.id, email: user.email });
logger.error('AI generation failed', { error: err.message, provider: 'groq' });
logger.warn('Rate limit approaching', { userId: user.id, usage: 95 });
```


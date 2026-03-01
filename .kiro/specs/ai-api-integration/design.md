# Design Document: AI API Integration

## Overview

This design document describes the technical implementation for integrating Claude API-powered content generation into the AI Content Planner application. The system will replace hardcoded template-based content generation with dynamic AI-generated titles and posts while maintaining a graceful fallback mechanism to ensure uninterrupted user experience.

The implementation focuses on minimal, surgical changes to the existing single-file React application (`ai-content-planner.jsx`). The design prioritizes backward compatibility, proper error handling, and secure API authentication.

### Key Design Goals

- Enable real AI-powered content generation using Claude API
- Maintain existing template system as fallback mechanism
- Support custom user-defined niches beyond predefined categories
- Ensure proper authentication with required API headers
- Handle async operations correctly in React component lifecycle
- Provide clear user feedback during generation process

## Architecture

### System Components

The architecture maintains the existing single-file React structure with focused modifications to three key areas:

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Content Planner                        │
│                  (ai-content-planner.jsx)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  API Configuration Layer                           │    │
│  │  - CLAUDE_API_KEY constant                         │    │
│  │  - API endpoint configuration                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Content Generation Functions                      │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ generateTitlesWithAI()                       │ │    │
│  │  │ - Calls Claude API for title generation     │ │    │
│  │  │ - Falls back to getSampleTitles() on error  │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ simulateGenerate() [MODIFIED]                │ │    │
│  │  │ - Adds authentication headers                │ │    │
│  │  │ - Improves error handling                    │ │    │
│  │  │ - Falls back to DEMO_POSTS on error          │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Template Fallback System (Existing)               │    │
│  │  - SAMPLE_TITLES                                   │    │
│  │  - GENERIC_TITLES                                  │    │
│  │  - DEMO_POSTS                                      │    │
│  │  - getSampleTitles()                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Claude API          │
              │   (External Service)  │
              └───────────────────────┘
```

### Component Interaction Flow

#### Title Generation Flow (Plan Creation)

```
User creates plan
      │
      ▼
CreatePlanPage.handleCreate()
      │
      ▼
generateTitlesWithAI(niche, count, platform, language, tone)
      │
      ├─── API Call Success ──────► Parse titles ──► Return titles
      │
      └─── API Call Failure ──────► getSampleTitles(niche, count)
                                            │
                                            ├─── Known niche ──► SAMPLE_TITLES[niche]
                                            │
                                            └─── Custom niche ──► GENERIC_TITLES
```

#### Post Content Generation Flow

```
User clicks "⚡ Gen" button
      │
      ▼
simulateGenerate(post)
      │
      ├─── Set status to "confirmed"
      │
      ▼
Call Claude API with authentication
      │
      ├─── API Success ──────► Parse JSON ──────► Validate fields
      │                              │                    │
      │                              │                    ├─── Valid ──► Update post
      │                              │                    │
      │                              │                    └─── Invalid ──► Fallback
      │                              │
      │                              └─── Parse Error ──► Fallback
      │
      └─── API Failure ──────► Fallback to DEMO_POSTS
                                      │
                                      ├─── Exact match ──► Use matching template
                                      │
                                      └─── No match ──► Use closest match
```

## Components and Interfaces

### 1. API Configuration

**Location:** Top of `ai-content-planner.jsx` (after imports, before DEMO_POSTS)

```javascript
// ─── CLAUDE API CONFIGURATION ────────────────────────────────────────────────
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY; // Loaded from .env file
const CLAUDE_API_ENDPOINT = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_VERSION = "2023-06-01";
```

**Design Rationale:**
- Constants at file top for easy configuration
- Clear naming convention with CLAUDE_ prefix
- Centralized configuration for maintainability
- Future enhancement: move to environment variables

### 2. Title Generation Function

**Function Signature:**
```javascript
async function generateTitlesWithAI(niche, count, platform, language, tone)
```

**Parameters:**
- `niche` (string): Content niche (e.g., "exam", "startup", or custom value)
- `count` (number): Number of titles to generate
- `platform` (string): Target platform ("instagram", "youtube", "linkedin", "twitter")
- `language` (string): Content language ("english", "hindi", "hinglish")
- `tone` (string): Content tone (e.g., "Motivational", "Educational")

**Returns:** `Promise<string[]>` - Array of generated titles

**Implementation Strategy:**

```javascript
async function generateTitlesWithAI(niche, count, platform, language, tone) {
  try {
    const response = await fetch(CLAUDE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        system: `You are an expert content strategist for Indian ${platform} creators. Generate exactly ${count} viral post titles for the ${niche} niche. Language: ${language}. Tone: ${tone}. Return ONLY a JSON array of strings, no other text.`,
        messages: [{
          role: "user",
          content: `Generate ${count} engaging post titles for ${niche} content on ${platform}. Make them scroll-stopping and relevant to Indian audiences.`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const titles = JSON.parse(clean);

    if (!Array.isArray(titles) || titles.length === 0) {
      throw new Error("Invalid response format");
    }

    return titles.slice(0, count);
  } catch (error) {
    console.error("AI title generation failed:", error);
    // Fallback to template system
    return getSampleTitles(niche, count);
  }
}
```

**Error Handling:**
- Network failures → fallback to getSampleTitles()
- Invalid JSON → fallback to getSampleTitles()
- Missing response fields → fallback to getSampleTitles()
- Non-array response → fallback to getSampleTitles()

### 3. Modified simulateGenerate Function

**Current Issues:**
- Missing `x-api-key` header
- Missing `anthropic-version` header
- Incomplete error handling
- No logging for debugging

**Modified Implementation:**

```javascript
const simulateGenerate = async (post) => {
  setGenerating(post.id);
  updatePost(post.id, { status: "confirmed" });
  await new Promise(r => setTimeout(r, 1500));

  let generatedPost;
  try {
    const response = await fetch(CLAUDE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        system: `You are an expert content creator for Indian ${plan.platform} creators. Return ONLY valid JSON with these exact keys: hook, caption, hashtags, cta, platform_note. Language: ${plan.language}. Tone: ${plan.tone}. Niche: ${plan.niche}. Rules: hook is 1-2 lines that stop the scroll. caption is the full post body with line breaks, ${plan.language === "hinglish" ? "use natural Hinglish as Indian creators do" : ""}. hashtags is 15-20 space-separated hashtags. cta is a warm call-to-action. platform_note is one practical posting tip. Return ONLY valid JSON.`,
        messages: [{
          role: "user",
          content: `Create a complete post for this title: "${post.title}". Platform: ${plan.platform}, Niche: ${plan.niche}, Tone: ${plan.tone}, Language: ${plan.language}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    
    if (!text) {
      throw new Error("Empty response from API");
    }

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Validate required fields
    const requiredFields = ["hook", "caption", "hashtags", "cta", "platform_note"];
    const missingFields = requiredFields.filter(field => !parsed[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    generatedPost = parsed;
  } catch (error) {
    console.error("AI generation failed:", error.message);
    // Fallback to demo data
    const key = `${plan.niche}_${plan.platform}_${plan.language}`;
    generatedPost = DEMO_POSTS[key] || DEMO_POSTS.exam_instagram_hinglish;
  }

  updatePost(post.id, { status: "generated", generatedPost });
  setGenerating(null);
  addToast(`"${post.title.slice(0, 30)}…" is ready! 🎉`, "success");
};
```

**Key Improvements:**
- Added `x-api-key` header with CLAUDE_API_KEY constant
- Added `anthropic-version` header
- Added response validation before parsing
- Added field validation after parsing
- Improved error logging with specific error messages
- Maintained fallback behavior for all error scenarios

### 4. Modified handleCreate Function (CreatePlanPage)

**Current Implementation:** Uses synchronous `getSampleTitles()`

**Modified Implementation:** Uses async `generateTitlesWithAI()`

```javascript
const handleCreate = async () => {
  setLoading(true);
  await new Promise(r => setTimeout(r, 1800));
  
  // Generate titles using AI
  const titles = await generateTitlesWithAI(
    resolvedNiche,
    resolvedPosts,
    form.platform,
    form.language,
    form.tone
  );
  
  const posts = previewDates.map((day, i) => ({
    id: `post-${Date.now()}-${i}`,
    title: titles[i],
    day,
    status: "pending",
    generatedPost: null,
  }));
  
  const displayNiche = form.niche === "custom" ? (customNiche.trim() || "Custom") : form.niche;
  onCreate({
    ...form,
    niche: displayNiche,
    posts_per_month: resolvedPosts,
    id: `plan-${Date.now()}`,
    posts,
    createdAt: new Date()
  });
  setLoading(false);
};
```

**Changes:**
- Function remains async (already was)
- Replace `getSampleTitles()` with `await generateTitlesWithAI()`
- Pass all required parameters to AI function
- Maintain existing loading states and UI feedback

### 5. Custom Niche Support

**Implementation:** Already supported in UI, needs backend integration

**Fallback Logic for Custom Niches:**

```javascript
function getSampleTitles(niche, count) {
  // Check if niche exists in SAMPLE_TITLES
  const titles = SAMPLE_TITLES[niche] || GENERIC_TITLES;
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(titles[i % titles.length]);
  }
  return result;
}
```

**DEMO_POSTS Fallback Logic:**

```javascript
// In simulateGenerate catch block
const key = `${plan.niche}_${plan.platform}_${plan.language}`;
let fallbackPost = DEMO_POSTS[key];

if (!fallbackPost) {
  // Try platform + language match
  const platformLangKey = Object.keys(DEMO_POSTS).find(k => 
    k.includes(plan.platform) && k.includes(plan.language)
  );
  fallbackPost = DEMO_POSTS[platformLangKey] || DEMO_POSTS.exam_instagram_hinglish;
}

generatedPost = fallbackPost;
```

## Data Models

### API Request Structure (Title Generation)

```typescript
interface TitleGenerationRequest {
  model: string;              // "claude-sonnet-4-20250514"
  max_tokens: number;         // 500
  system: string;             // System prompt with niche, platform, language, tone
  messages: Array<{
    role: "user";
    content: string;          // User prompt requesting titles
  }>;
}
```

### API Request Structure (Post Generation)

```typescript
interface PostGenerationRequest {
  model: string;              // "claude-sonnet-4-20250514"
  max_tokens: number;         // 1000
  system: string;             // System prompt with platform, niche, language, tone
  messages: Array<{
    role: "user";
    content: string;          // User prompt with post title
  }>;
}
```

### API Response Structure

```typescript
interface ClaudeAPIResponse {
  content: Array<{
    text: string;             // JSON string or markdown-wrapped JSON
    type: "text";
  }>;
  id: string;
  model: string;
  role: "assistant";
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

### Generated Post Structure

```typescript
interface GeneratedPost {
  hook: string;               // 1-2 line attention grabber
  caption: string;            // Full post body with line breaks
  hashtags: string;           // Space-separated hashtags (15-20)
  cta: string;                // Call-to-action
  platform_note: string;      // Platform-specific posting tip
}
```

### Post Object (Extended)

```typescript
interface Post {
  id: string;                 // Unique identifier
  title: string;              // Post title
  day: number;                // Day of month (1-31)
  status: "pending" | "confirmed" | "generated" | "skipped";
  generatedPost: GeneratedPost | null;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Request Headers Completeness

*For any* API request to Claude (title or post generation), the request headers SHALL include "Content-Type: application/json", "x-api-key" with the configured API key value, and "anthropic-version: 2023-06-01"

**Validates: Requirements 1.2, 1.3, 1.4, 3.2**

### Property 2: API Request Configuration

*For any* API request to Claude, the request SHALL be sent to "https://api.anthropic.com/v1/messages" with model "claude-sonnet-4-20250514"

**Validates: Requirements 2.2**

### Property 3: Prompt Parameter Inclusion

*For any* content generation request (title or post), the system prompt SHALL include the plan's niche, platform, language, and tone parameters

**Validates: Requirements 2.3, 2.5, 3.3, 5.1**

### Property 4: Title Count Accuracy

*For any* plan creation with posts_per_month value N, the title generation request SHALL request exactly N titles

**Validates: Requirements 2.4**

### Property 5: Title Generation Token Limit

*For any* title generation API request, max_tokens SHALL be set to a value >= 500

**Validates: Requirements 2.6**

### Property 6: Post Generation Token Limit

*For any* post content generation API request, max_tokens SHALL be set to exactly 1000

**Validates: Requirements 3.7**

### Property 7: Post Generation Output Format

*For any* post generation request, the system prompt SHALL specify JSON output format with required keys: hook, caption, hashtags, cta, platform_note

**Validates: Requirements 3.4**

### Property 8: API Response Parsing

*For any* valid Claude API response, the system SHALL successfully extract the text content from data.content[0].text

**Validates: Requirements 3.5, 6.2**

### Property 9: Title Generation Fallback

*For any* title generation API failure, the system SHALL fall back to getSampleTitles() with the appropriate title source (SAMPLE_TITLES for known niches, GENERIC_TITLES for custom niches)

**Validates: Requirements 4.1, 4.3, 5.5**

### Property 10: Post Generation Fallback

*For any* post generation API failure or validation failure, the system SHALL fall back to DEMO_POSTS with the closest matching template based on platform and language

**Validates: Requirements 4.2, 4.4**

### Property 11: Error Message Privacy

*For any* API error scenario, user-facing messages SHALL not contain API error details (status codes, error messages, or stack traces)

**Validates: Requirements 4.6**

### Property 12: Custom Niche Independence

*For any* custom niche value, the system SHALL generate content without requiring the niche to exist in SAMPLE_TITLES or DEMO_POSTS

**Validates: Requirements 5.4**

### Property 13: Response Structure Validation

*For any* API response, the system SHALL validate the presence of the expected structure before attempting to use the data

**Validates: Requirements 6.1**

### Property 14: JSON Parsing Fallback

*For any* API response where JSON parsing fails, the system SHALL fall back to the template system

**Validates: Requirements 6.3**

### Property 15: Required Fields Validation

*For any* parsed post generation response, if any required field (hook, caption, hashtags, cta, platform_note) is missing, the system SHALL fall back to the template system

**Validates: Requirements 6.4**

### Property 16: Status Transition on Start

*For any* post when generation starts, the post status SHALL transition to "confirmed"

**Validates: Requirements 7.1**

### Property 17: Status Transition on Completion

*For any* post when generation completes successfully, the post status SHALL transition to "generated"

**Validates: Requirements 7.2**

### Property 18: Success Notification

*For any* completed post generation (including fallback scenarios), the system SHALL display a success toast notification

**Validates: Requirements 7.3, 7.5**

### Property 19: Loading State Management

*For any* post during API request execution, the system SHALL display a loading indicator

**Validates: Requirements 7.4**

## Error Handling

### Error Categories and Responses

#### 1. Network Errors

**Scenarios:**
- No internet connection
- API endpoint unreachable
- Request timeout

**Handling:**
```javascript
catch (error) {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    console.error("Network error during AI generation:", error);
  }
  // Fall back to template system
  return getSampleTitles(niche, count);
}
```

**User Experience:** Seamless fallback to templates, success message still shown

#### 2. Authentication Errors

**Scenarios:**
- Invalid API key
- Expired API key
- Rate limiting

**Handling:**
```javascript
if (!response.ok) {
  if (response.status === 401) {
    console.error("Authentication failed: Invalid API key");
  } else if (response.status === 429) {
    console.error("Rate limit exceeded");
  }
  throw new Error(`API error: ${response.status}`);
}
```

**User Experience:** Fallback to templates, no error exposed to user

#### 3. Response Parsing Errors

**Scenarios:**
- Invalid JSON in response
- Markdown-wrapped JSON
- Missing expected fields

**Handling:**
```javascript
try {
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  
  // Validate required fields
  const requiredFields = ["hook", "caption", "hashtags", "cta", "platform_note"];
  const missingFields = requiredFields.filter(field => !parsed[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
  
  return parsed;
} catch (error) {
  console.error("Response parsing failed:", error.message);
  // Fall back to template
}
```

**User Experience:** Fallback to templates, success message still shown

#### 4. Validation Errors

**Scenarios:**
- Empty response text
- Non-array title response
- Missing content in response structure

**Handling:**
```javascript
const text = data.content?.[0]?.text || "";

if (!text) {
  throw new Error("Empty response from API");
}

// For title generation
if (!Array.isArray(titles) || titles.length === 0) {
  throw new Error("Invalid response format");
}
```

**User Experience:** Fallback to templates, success message still shown

### Error Logging Strategy

**Console Logging:**
- All errors logged to console with descriptive messages
- Include error type and context
- Never log sensitive information (API keys)

**Example Log Formats:**
```javascript
console.error("AI title generation failed:", error);
console.error("AI generation failed:", error.message);
console.error("Network error during AI generation:", error);
console.error("Authentication failed: Invalid API key");
```

### Fallback Decision Tree

```
API Call
   │
   ├─── Success ──────► Parse Response
   │                         │
   │                         ├─── Valid ──────► Use AI Content
   │                         │
   │                         └─── Invalid ────► Fallback
   │
   └─── Failure ──────► Fallback

Fallback Logic:
   │
   ├─── Title Generation
   │         │
   │         ├─── Known Niche ──────► SAMPLE_TITLES[niche]
   │         │
   │         └─── Custom Niche ─────► GENERIC_TITLES
   │
   └─── Post Generation
             │
             ├─── Exact Match ──────► DEMO_POSTS[niche_platform_lang]
             │
             ├─── Platform Match ───► DEMO_POSTS[*_platform_lang]
             │
             └─── Default ──────────► DEMO_POSTS.exam_instagram_hinglish
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both approaches are complementary and necessary for complete validation

### Unit Testing Focus Areas

Unit tests should focus on:

1. **Specific API Integration Examples**
   - Successful title generation with known niche
   - Successful post generation with valid response
   - Custom niche handling

2. **Edge Cases**
   - Markdown-wrapped JSON responses (```json ... ```)
   - Empty response handling
   - Missing optional fields in response

3. **Error Conditions**
   - Network failures
   - Authentication errors (401)
   - Rate limiting (429)
   - Invalid JSON responses
   - Missing required fields

4. **Integration Points**
   - handleCreate function with async title generation
   - simulateGenerate function with authentication headers
   - Fallback selection logic for DEMO_POSTS

### Property-Based Testing Configuration

**Library Selection:** Use `fast-check` for JavaScript property-based testing

**Configuration:**
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `Feature: ai-api-integration, Property {number}: {property_text}`

**Property Test Implementation Guidelines:**

Each correctness property must be implemented as a single property-based test. Example structure:

```javascript
// Feature: ai-api-integration, Property 1: API Request Headers Completeness
test('API requests include all required headers', () => {
  fc.assert(
    fc.property(
      fc.record({
        niche: fc.string(),
        platform: fc.constantFrom('instagram', 'youtube', 'linkedin', 'twitter'),
        language: fc.constantFrom('english', 'hindi', 'hinglish'),
        tone: fc.string()
      }),
      async (planConfig) => {
        const requestHeaders = await captureRequestHeaders(planConfig);
        expect(requestHeaders['Content-Type']).toBe('application/json');
        expect(requestHeaders['x-api-key']).toBe(CLAUDE_API_KEY);
        expect(requestHeaders['anthropic-version']).toBe('2023-06-01');
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Requirements

**Minimum Coverage Targets:**
- API integration functions: 100%
- Error handling paths: 100%
- Fallback logic: 100%
- Header configuration: 100%

**Critical Test Scenarios:**

1. **Title Generation**
   - AI success path
   - Network failure → fallback
   - Invalid response → fallback
   - Custom niche → GENERIC_TITLES fallback

2. **Post Generation**
   - AI success with valid JSON
   - AI success with markdown-wrapped JSON
   - Missing required fields → fallback
   - Network failure → fallback
   - Closest match fallback selection

3. **User Experience**
   - Status transitions (pending → confirmed → generated)
   - Toast notifications on success
   - Loading indicators during generation
   - No error details exposed to users

### Mock Strategy

**API Mocking:**
- Mock `fetch` calls to Claude API
- Simulate various response scenarios
- Test timeout and network error conditions

**Example Mock Setup:**
```javascript
global.fetch = jest.fn((url, options) => {
  if (url.includes('anthropic.com')) {
    // Return mocked Claude API response
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: '["Title 1", "Title 2", "Title 3"]' }]
      })
    });
  }
});
```

### Testing Checklist

- [ ] All 19 correctness properties implemented as property tests
- [ ] Unit tests for specific examples and edge cases
- [ ] Error handling paths tested with mocked failures
- [ ] Fallback logic tested for all scenarios
- [ ] Custom niche support validated
- [ ] Header configuration verified
- [ ] Status transitions validated
- [ ] User feedback mechanisms tested
- [ ] No API errors exposed to users
- [ ] Console logging verified for debugging


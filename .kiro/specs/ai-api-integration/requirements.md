# Requirements Document

## Introduction

The AI Content Planner currently relies on hardcoded templates (SAMPLE_TITLES and DEMO_POSTS) for generating content titles and posts. This feature will integrate real AI-powered content generation using the Claude API with proper authentication, while maintaining a graceful fallback mechanism to the existing template system when API calls fail. This enhancement will enable dynamic content generation for all niches, including custom user-defined niches that don't exist in the template system.

## Glossary

- **Content_Generator**: The system component responsible for generating post titles and content
- **API_Client**: The component that handles HTTP requests to the Claude API
- **Template_System**: The existing fallback mechanism using SAMPLE_TITLES and DEMO_POSTS
- **Custom_Niche**: A user-defined content category not present in the predefined niche list
- **API_Key**: The authentication credential required for Claude API access
- **Post_Title**: A short text string representing the topic of a social media post
- **Post_Content**: The complete generated content including hook, caption, hashtags, CTA, and platform notes

## Requirements

### Requirement 1: API Key Configuration

**User Story:** As a developer, I want to securely configure the Claude API key, so that the application can authenticate with the API service

#### Acceptance Criteria

1. THE API_Client SHALL store the API key securely in environment variables
2. WHEN making API requests, THE API_Client SHALL include the "x-api-key" header with the configured API key
3. WHEN making API requests, THE API_Client SHALL include the "anthropic-version" header with value "2023-06-01"
4. THE API_Client SHALL include the "Content-Type" header with value "application/json"

### Requirement 2: AI-Powered Title Generation

**User Story:** As a content creator, I want titles to be generated dynamically using AI, so that I get fresh, relevant content ideas instead of recycled templates

#### Acceptance Criteria

1. WHEN a user creates a content plan, THE Content_Generator SHALL generate post titles using the Claude API
2. THE Content_Generator SHALL send a request to "https://api.anthropic.com/v1/messages" with model "claude-sonnet-4-20250514"
3. THE Content_Generator SHALL include the niche, platform, language, and tone in the title generation prompt
4. THE Content_Generator SHALL request the exact number of titles specified by the user's posts_per_month setting
5. WHERE a Custom_Niche is specified, THE Content_Generator SHALL generate titles appropriate to that custom niche
6. THE Content_Generator SHALL set max_tokens to an appropriate value for title generation (minimum 500)

### Requirement 3: AI-Powered Post Content Generation

**User Story:** As a content creator, I want post content to be generated using AI with proper authentication, so that I receive high-quality, customized content

#### Acceptance Criteria

1. WHEN a user clicks the generate button for a post, THE Content_Generator SHALL call the Claude API with proper authentication headers
2. THE Content_Generator SHALL include the "x-api-key" header in the API request
3. THE Content_Generator SHALL send a system prompt specifying the platform, niche, language, and tone
4. THE Content_Generator SHALL request JSON output with keys: hook, caption, hashtags, cta, platform_note
5. WHEN the API returns a response, THE Content_Generator SHALL parse the JSON content from the response
6. THE Content_Generator SHALL handle JSON responses wrapped in markdown code blocks (```json)
7. THE Content_Generator SHALL set max_tokens to 1000 for post content generation

### Requirement 4: Graceful Fallback Mechanism

**User Story:** As a content creator, I want the application to continue working even when the API fails, so that I can still access template-based content

#### Acceptance Criteria

1. IF the Claude API request fails for title generation, THEN THE Content_Generator SHALL use the getSampleTitles function with SAMPLE_TITLES
2. IF the Claude API request fails for post content generation, THEN THE Content_Generator SHALL use DEMO_POSTS as fallback
3. WHEN falling back to templates for a Custom_Niche, THE Content_Generator SHALL use GENERIC_TITLES for title generation
4. WHEN falling back to templates for post content, THE Content_Generator SHALL select the closest matching template based on platform and language
5. THE Content_Generator SHALL log API failures for debugging purposes
6. THE Content_Generator SHALL not expose API error details to the end user

### Requirement 5: Custom Niche Support

**User Story:** As a content creator with a unique niche, I want to generate content for my custom niche, so that I'm not limited to predefined categories

#### Acceptance Criteria

1. WHEN a user selects a Custom_Niche, THE Content_Generator SHALL pass the custom niche name to the AI generation prompts
2. THE Content_Generator SHALL generate titles relevant to the Custom_Niche topic
3. THE Content_Generator SHALL generate post content appropriate for the Custom_Niche
4. WHERE the Custom_Niche is specified, THE Content_Generator SHALL not require the niche to exist in SAMPLE_TITLES or DEMO_POSTS
5. IF API generation fails for a Custom_Niche, THEN THE Content_Generator SHALL fall back to GENERIC_TITLES and a generic DEMO_POSTS entry

### Requirement 6: API Response Validation

**User Story:** As a developer, I want API responses to be validated, so that malformed responses don't break the application

#### Acceptance Criteria

1. WHEN receiving an API response, THE Content_Generator SHALL verify the response contains the expected structure
2. THE Content_Generator SHALL check for the presence of data.content[0].text in the API response
3. IF the JSON parsing fails, THEN THE Content_Generator SHALL fall back to the Template_System
4. IF required fields (hook, caption, hashtags, cta, platform_note) are missing, THEN THE Content_Generator SHALL fall back to the Template_System
5. THE Content_Generator SHALL handle both plain JSON and markdown-wrapped JSON responses

### Requirement 7: User Feedback and Status

**User Story:** As a content creator, I want to know when content is being generated and when it's ready, so that I understand the application state

#### Acceptance Criteria

1. WHEN content generation starts, THE Content_Generator SHALL update the post status to "confirmed"
2. WHEN content generation completes successfully, THE Content_Generator SHALL update the post status to "generated"
3. WHEN content generation completes, THE Content_Generator SHALL display a success toast notification
4. THE Content_Generator SHALL show a loading indicator while API requests are in progress
5. WHERE API fallback occurs, THE Content_Generator SHALL still display success feedback to avoid confusing the user

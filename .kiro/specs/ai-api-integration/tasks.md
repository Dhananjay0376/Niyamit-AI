# Implementation Plan: AI API Integration

## Overview

This implementation plan converts the AI API Integration design into discrete coding tasks for the ai-content-planner.jsx file. The tasks focus on adding Claude API integration for dynamic content generation while maintaining the existing template fallback system. All changes are surgical modifications to a single React component file.

## Tasks

- [x] 1. Add API configuration constants
  - Add CLAUDE_API_KEY, CLAUDE_API_ENDPOINT, CLAUDE_MODEL, and ANTHROPIC_VERSION constants at the top of ai-content-planner.jsx (after imports, before DEMO_POSTS)
  - Use clear naming convention with CLAUDE_ prefix
  - _Requirements: 1.1, 2.2_

- [ ] 2. Implement AI-powered title generation
  - [x] 2.1 Create generateTitlesWithAI() function
    - Write async function that accepts niche, count, platform, language, and tone parameters
    - Implement fetch call to Claude API with proper headers (Content-Type, x-api-key, anthropic-version)
    - Build system prompt including niche, platform, language, and tone
    - Set max_tokens to 500 for title generation
    - Parse response from data.content[0].text
    - Handle markdown-wrapped JSON (strip ```json markers)
    - Validate response is an array with at least one title
    - Return array of titles sliced to requested count
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 3.5_
  
  - [ ]* 2.2 Write property test for API request headers (title generation)
    - **Property 1: API Request Headers Completeness**
    - **Validates: Requirements 1.2, 1.3, 1.4**
  
  - [ ]* 2.3 Write property test for API endpoint and model configuration
    - **Property 2: API Request Configuration**
    - **Validates: Requirements 2.2**
  
  - [ ]* 2.4 Write property test for prompt parameter inclusion
    - **Property 3: Prompt Parameter Inclusion**
    - **Validates: Requirements 2.3, 2.5**
  
  - [ ]* 2.5 Write property test for title count accuracy
    - **Property 4: Title Count Accuracy**
    - **Validates: Requirements 2.4**
  
  - [ ]* 2.6 Write property test for title generation token limit
    - **Property 5: Title Generation Token Limit**
    - **Validates: Requirements 2.6**

- [ ] 3. Add error handling and fallback for title generation
  - [x] 3.1 Implement try-catch block in generateTitlesWithAI()
    - Catch network errors, API errors, and parsing errors
    - Log errors to console with descriptive messages
    - Fall back to getSampleTitles(niche, count) on any error
    - Ensure custom niches fall back to GENERIC_TITLES
    - _Requirements: 4.1, 4.3, 4.5, 5.5_
  
  - [ ]* 3.2 Write property test for title generation fallback
    - **Property 9: Title Generation Fallback**
    - **Validates: Requirements 4.1, 4.3, 5.5**
  
  - [ ]* 3.3 Write unit tests for title generation error scenarios
    - Test network failure fallback
    - Test invalid JSON fallback
    - Test empty response fallback
    - Test custom niche with GENERIC_TITLES fallback
    - _Requirements: 4.1, 4.3, 5.5_

- [ ] 4. Modify handleCreate() to use AI title generation
  - [x] 4.1 Update CreatePlanPage.handleCreate() function
    - Replace getSampleTitles() call with await generateTitlesWithAI()
    - Pass niche, posts_per_month, platform, language, and tone parameters
    - Maintain existing loading states and UI feedback
    - _Requirements: 2.1, 2.3, 2.4_
  
  - [ ]* 4.2 Write unit test for handleCreate with AI integration
    - Mock generateTitlesWithAI to return test titles
    - Verify titles are correctly assigned to posts
    - Verify all parameters passed correctly
    - _Requirements: 2.1, 2.3, 2.4_

- [x] 5. Checkpoint - Ensure title generation works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Modify simulateGenerate() for authenticated post generation
  - [x] 6.1 Add authentication headers to simulateGenerate()
    - Add x-api-key header with CLAUDE_API_KEY constant
    - Add anthropic-version header with ANTHROPIC_VERSION constant
    - Verify Content-Type header is present
    - _Requirements: 1.2, 1.3, 1.4, 3.2_
  
  - [x] 6.2 Update system prompt in simulateGenerate()
    - Include platform, niche, language, and tone in system prompt
    - Specify JSON output format with required keys: hook, caption, hashtags, cta, platform_note
    - Set max_tokens to 1000
    - _Requirements: 3.3, 3.4, 3.7_
  
  - [x] 6.3 Improve response parsing in simulateGenerate()
    - Extract text from data.content[0].text
    - Handle empty response text
    - Strip markdown code block markers (```json)
    - Parse JSON from cleaned text
    - _Requirements: 3.5, 3.6, 6.2_
  
  - [ ]* 6.4 Write property test for post generation token limit
    - **Property 6: Post Generation Token Limit**
    - **Validates: Requirements 3.7**
  
  - [ ]* 6.5 Write property test for post generation output format
    - **Property 7: Post Generation Output Format**
    - **Validates: Requirements 3.4**
  
  - [ ]* 6.6 Write property test for API response parsing
    - **Property 8: API Response Parsing**
    - **Validates: Requirements 3.5, 6.2**

- [ ] 7. Add response validation to simulateGenerate()
  - [x] 7.1 Implement required fields validation
    - Check for presence of hook, caption, hashtags, cta, platform_note
    - Throw error if any required field is missing
    - Log validation errors to console
    - _Requirements: 6.4_
  
  - [x] 7.2 Add response structure validation
    - Verify data.content[0].text exists before parsing
    - Throw error if structure is invalid
    - _Requirements: 6.1, 6.2_
  
  - [ ]* 7.3 Write property test for response structure validation
    - **Property 13: Response Structure Validation**
    - **Validates: Requirements 6.1**
  
  - [ ]* 7.4 Write property test for required fields validation
    - **Property 15: Required Fields Validation**
    - **Validates: Requirements 6.4**

- [ ] 8. Implement error handling and fallback for post generation
  - [x] 8.1 Add comprehensive try-catch to simulateGenerate()
    - Catch network errors, API errors, parsing errors, and validation errors
    - Log all errors to console with descriptive messages
    - Never expose API error details to user
    - _Requirements: 4.5, 4.6_
  
  - [x] 8.2 Implement DEMO_POSTS fallback logic
    - Build fallback key as `${plan.niche}_${plan.platform}_${plan.language}`
    - Try exact match first
    - If no exact match, find closest match by platform and language
    - Default to DEMO_POSTS.exam_instagram_hinglish if no match
    - _Requirements: 4.2, 4.4_
  
  - [ ]* 8.3 Write property test for post generation fallback
    - **Property 10: Post Generation Fallback**
    - **Validates: Requirements 4.2, 4.4**
  
  - [ ]* 8.4 Write property test for error message privacy
    - **Property 11: Error Message Privacy**
    - **Validates: Requirements 4.6**
  
  - [ ]* 8.5 Write property test for JSON parsing fallback
    - **Property 14: JSON Parsing Fallback**
    - **Validates: Requirements 6.3**
  
  - [ ]* 8.6 Write unit tests for post generation error scenarios
    - Test network failure with fallback
    - Test authentication error (401) with fallback
    - Test rate limiting (429) with fallback
    - Test invalid JSON with fallback
    - Test missing required fields with fallback
    - Test markdown-wrapped JSON parsing
    - Test empty response handling
    - _Requirements: 4.2, 4.4, 6.3, 6.4_

- [ ] 9. Verify custom niche support
  - [x] 9.1 Test custom niche in title generation
    - Verify custom niche value passed to AI prompt
    - Verify fallback uses GENERIC_TITLES for custom niches
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
  
  - [x] 9.2 Test custom niche in post generation
    - Verify custom niche value passed to AI prompt
    - Verify fallback logic handles custom niches
    - _Requirements: 5.1, 5.3, 5.4, 5.5_
  
  - [ ]* 9.3 Write property test for custom niche independence
    - **Property 12: Custom Niche Independence**
    - **Validates: Requirements 5.4**
  
  - [ ]* 9.4 Write unit tests for custom niche scenarios
    - Test custom niche with AI success
    - Test custom niche with AI failure and GENERIC_TITLES fallback
    - Test custom niche with post generation fallback
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Checkpoint - Ensure post generation works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Verify user feedback and status management
  - [ ]* 11.1 Write property test for status transition on start
    - **Property 16: Status Transition on Start**
    - **Validates: Requirements 7.1**
  
  - [ ]* 11.2 Write property test for status transition on completion
    - **Property 17: Status Transition on Completion**
    - **Validates: Requirements 7.2**
  
  - [ ]* 11.3 Write property test for success notification
    - **Property 18: Success Notification**
    - **Validates: Requirements 7.3, 7.5**
  
  - [ ]* 11.4 Write property test for loading state management
    - **Property 19: Loading State Management**
    - **Validates: Requirements 7.4**
  
  - [ ]* 11.5 Write unit tests for user feedback scenarios
    - Test status transitions (pending → confirmed → generated)
    - Test toast notification on success
    - Test toast notification on fallback success
    - Test loading indicator display during generation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 12. Final integration and verification
  - [x] 12.1 Verify all API calls use correct headers
    - Check both title and post generation include all three headers
    - Verify header values match constants
    - _Requirements: 1.2, 1.3, 1.4_
  
  - [x] 12.2 Verify all error paths fall back gracefully
    - Test that no error breaks the user experience
    - Verify all errors are logged but not exposed to users
    - _Requirements: 4.1, 4.2, 4.5, 4.6_
  
  - [x] 12.3 Verify all requirements are covered
    - Cross-reference implementation with requirements document
    - Ensure all acceptance criteria are met
    - _Requirements: All_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All code changes are in a single file: ai-content-planner.jsx
- Property tests should use fast-check library with minimum 100 iterations
- Mock fetch calls for all API testing
- Each property test must reference its design document property number
- Fallback behavior ensures the app never breaks from API failures
- Custom niche support works seamlessly with both AI and template fallback

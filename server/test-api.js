// Quick test script to verify the backend is working with Groq
const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3001';

async function testBackend() {
  console.log('🧪 Testing Backend Proxy Server with Groq (FREE!)...\n');

  // Test 1: Health check
  console.log('Test 1: Health Check');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check passed:', data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    console.log('   Make sure the backend is running: cd server && npm start');
    return;
  }

  console.log('\n---\n');

  // Test 2: Generate titles with Groq
  console.log('Test 2: Generate Titles with Groq (FREE AI)');
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        max_tokens: 500,
        system: 'You are an expert content strategist. Generate exactly 3 viral post titles for the fitness niche. Language: english. Tone: Motivational. Return ONLY a JSON array of strings, no other text.',
        messages: [{
          role: 'user',
          content: 'Generate 3 engaging post titles for fitness content on instagram. Make them scroll-stopping.'
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const titles = JSON.parse(clean);

    console.log('✅ Title generation passed with Groq (FREE!)');
    console.log('   Generated titles:');
    titles.forEach((title, i) => console.log(`   ${i + 1}. ${title}`));
  } catch (error) {
    console.log('❌ Title generation failed:', error.message);
  }

  console.log('\n---\n');
  console.log('🎉 Testing complete!');
  console.log('💡 Groq is FREE and FAST - perfect for your content planner!');
}

// Run the test
testBackend();

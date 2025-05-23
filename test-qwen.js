// Simple test script for Qwen AI connection
import axios from 'axios';

const API_KEY = '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';
const BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'qwen/qwen3-235b-a22b:free';

async function testQwenConnection() {
  console.log('🔍 Testing Qwen AI connection via OpenRouter...');
  console.log('Model:', MODEL);
  console.log('Base URL:', BASE_URL);
  
  const request = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant for educational content creation.'
      },
      {
        role: 'user',
        content: 'Hello! Please respond with "Connection successful" to test the API.'
      }
    ],
    max_tokens: 50,
    temperature: 0.1
  };

  try {
    console.log('📤 Sending request...');
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      request,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ai-lesson-planner.local',
          'X-Title': 'AI Lesson Planner'
        },
        timeout: 30000
      }
    );

    console.log('✅ Response received!');
    console.log('Status:', response.status);
    
    if (response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      console.log('📝 AI Response:', content);
      
      if (content.toLowerCase().includes('connection successful') || content.toLowerCase().includes('hello')) {
        console.log('🎉 Connection test PASSED!');
        return true;
      } else {
        console.log('⚠️  Connection test completed but response unexpected');
        return true; // Still working, just different response
      }
    } else {
      console.log('❌ No response content received');
      return false;
    }

  } catch (error) {
    console.error('❌ Connection test FAILED:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return false;
  }
}

// Run the test
testQwenConnection()
  .then(success => {
    if (success) {
      console.log('\n🚀 Qwen AI is ready for lesson plan generation!');
      console.log('You can now run:');
      console.log('  npm run generate:batch');
      console.log('  npm run automate data');
    } else {
      console.log('\n❌ Please check your API key and try again');
    }
  })
  .catch(error => {
    console.error('💥 Test script error:', error);
  });

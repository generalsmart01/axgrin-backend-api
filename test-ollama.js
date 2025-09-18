// test-ollama.js
// Simple script to test Ollama integration with Axgrin backend

const fetch = require('node-fetch');

const OLLAMA_URL = 'http://localhost:11434';
const AXGRIN_URL = 'http://localhost:3300';

async function testOllamaConnection() {
  console.log('🦙 Testing Ollama connection...');
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();
    
    console.log('✅ Ollama is running!');
    console.log('📦 Installed models:', data.models?.map(m => m.name).join(', ') || 'None');
    
    if (data.models?.length === 0) {
      console.log('⚠️  No models installed. Run: ollama pull llama2');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ Ollama is not running. Start it with: ollama serve');
    return false;
  }
}

async function testOllamaModel() {
  console.log('\n🧪 Testing Ollama model...');
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: 'Hello! Can you help me with financial advice?',
        stream: false,
      }),
    });
    
    const data = await response.json();
    console.log('✅ Model is working!');
    console.log('🤖 Response:', data.response?.substring(0, 100) + '...');
    
    return true;
  } catch (error) {
    console.log('❌ Model test failed:', error.message);
    return false;
  }
}

async function testAxgrinIntegration() {
  console.log('\n🔗 Testing Axgrin integration...');
  
  try {
    // First, you need to get a JWT token from your auth endpoint
    // This is a placeholder - replace with actual auth flow
    const authResponse = await fetch(`${AXGRIN_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });
    
    if (!authResponse.ok) {
      console.log('⚠️  Auth failed. Make sure you have a test user or skip this test.');
      return false;
    }
    
    const authData = await authResponse.json();
    const token = authData.access_token;
    
    // Test AI chat endpoint
    const chatResponse = await fetch(`${AXGRIN_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'How can I save more money?',
        context: {
          includeFinancialData: true,
          includeInsights: true,
        },
      }),
    });
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Axgrin AI integration is working!');
      console.log('🤖 AI Response:', chatData.response?.substring(0, 100) + '...');
      console.log('🎯 AI Generated:', chatData.aiGenerated);
      return true;
    } else {
      console.log('❌ Axgrin AI test failed:', chatResponse.status, chatResponse.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Axgrin integration test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Ollama Integration Tests\n');
  
  const ollamaConnected = await testOllamaConnection();
  if (!ollamaConnected) {
    console.log('\n❌ Ollama tests failed. Please install and start Ollama first.');
    return;
  }
  
  const modelWorking = await testOllamaModel();
  if (!modelWorking) {
    console.log('\n❌ Model tests failed. Please install a model first.');
    return;
  }
  
  const axgrinWorking = await testAxgrinIntegration();
  if (!axgrinWorking) {
    console.log('\n⚠️  Axgrin integration test failed, but Ollama is working.');
    console.log('   Make sure your Axgrin backend is running and configured correctly.');
    return;
  }
  
  console.log('\n🎉 All tests passed! Your Ollama integration is working perfectly!');
  console.log('\n📝 Next steps:');
  console.log('   1. Start your Axgrin backend: npm run start:dev');
  console.log('   2. Test the AI chat endpoint with your frontend');
  console.log('   3. Monitor performance and adjust model settings as needed');
}

// Run the tests
runTests().catch(console.error);

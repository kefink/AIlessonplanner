#!/usr/bin/env node

/**
 * Qwen API Setup Script for AI Lesson Planner
 * Helps users configure their Qwen API key and test the connection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔧 Qwen AI API Setup for AI Lesson Planner\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupQwenApi() {
  try {
    console.log('This script will help you configure Qwen AI for your lesson planner.\n');
    
    // Check if .env.local exists
    const envPath = path.join(projectRoot, '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ Found existing .env.local file\n');
    } else {
      console.log('📝 Creating new .env.local file\n');
    }

    // Get API key
    console.log('🔑 Qwen AI API Key Setup');
    console.log('You can get your API key from: https://dashscope.console.aliyun.com/');
    console.log('');
    
    const apiKey = await question('Enter your Qwen API key: ');
    
    if (!apiKey || apiKey.trim() === '') {
      console.log('❌ API key is required. Exiting...');
      process.exit(1);
    }

    // Get model preference
    console.log('\n🤖 Model Selection');
    console.log('Available Qwen models:');
    console.log('1. qwen-turbo (fast, cost-effective)');
    console.log('2. qwen-plus (balanced performance)');
    console.log('3. qwen-max (highest quality)');
    console.log('4. qwen-max-longcontext (for long texts)');
    
    const modelChoice = await question('\nSelect model (1-4) [default: 1]: ') || '1';
    
    const models = {
      '1': 'qwen-turbo',
      '2': 'qwen-plus', 
      '3': 'qwen-max',
      '4': 'qwen-max-longcontext'
    };
    
    const selectedModel = models[modelChoice] || 'qwen-turbo';
    console.log(`Selected model: ${selectedModel}`);

    // Get API base URL (optional)
    console.log('\n🌐 API Configuration');
    const defaultUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    const customUrl = await question(`API Base URL [default: ${defaultUrl}]: `);
    const apiUrl = customUrl.trim() || defaultUrl;

    // Update .env.local
    const newEnvContent = updateEnvFile(envContent, {
      QWEN_API_KEY: apiKey.trim(),
      QWEN_MODEL: selectedModel,
      QWEN_API_BASE_URL: apiUrl
    });

    fs.writeFileSync(envPath, newEnvContent);
    console.log('\n✅ Configuration saved to .env.local');

    // Test connection
    console.log('\n🔍 Testing Qwen AI connection...');
    
    try {
      // Set environment variables for testing
      process.env.QWEN_API_KEY = apiKey.trim();
      process.env.QWEN_MODEL = selectedModel;
      process.env.QWEN_API_BASE_URL = apiUrl;

      // Import and test the service
      const { qwenAiService } = await import('../services/qwenAiService.js');
      const connected = await qwenAiService.testConnection();
      
      if (connected) {
        console.log('✅ Connection successful! Qwen AI is ready to use.');
        
        // Test lesson plan generation
        console.log('\n🧪 Testing lesson plan generation...');
        const testResponse = await qwenAiService.generateContent(
          'Generate a simple test response for lesson planning: "Test successful"',
          { maxTokens: 50, temperature: 0.1 }
        );
        
        if (testResponse.toLowerCase().includes('test')) {
          console.log('✅ Lesson plan generation test passed!');
        } else {
          console.log('⚠️  Lesson plan generation test completed with unexpected response');
        }
        
      } else {
        console.log('❌ Connection failed. Please check your API key and try again.');
      }
      
    } catch (error) {
      console.log(`❌ Connection test failed: ${error.message}`);
      console.log('Please verify your API key and network connection.');
    }

    console.log('\n🎉 Setup completed!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Or run: npm run automate data');
    console.log('3. Or run: npm run generate:batch');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

function updateEnvFile(content, updates) {
  let lines = content ? content.split('\n') : [];
  
  // Remove existing entries for the keys we're updating
  const keysToUpdate = Object.keys(updates);
  lines = lines.filter(line => {
    const key = line.split('=')[0];
    return !keysToUpdate.includes(key);
  });

  // Add header if file is empty
  if (lines.length === 0 || !content.includes('# AI Lesson Planner')) {
    lines.unshift('# AI Lesson Planner Environment Configuration');
    lines.push('');
  }

  // Add Qwen AI section header if not present
  if (!content.includes('# Qwen AI Configuration')) {
    lines.push('# Qwen AI Configuration');
  }

  // Add the new values
  Object.entries(updates).forEach(([key, value]) => {
    lines.push(`${key}=${value}`);
  });

  // Add other default values if not present
  const defaults = {
    'NODE_ENV': 'development',
    'VITE_APP_NAME': 'AI Lesson Planner',
    'LOG_LEVEL': 'info'
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (!content.includes(key)) {
      lines.push(`${key}=${value}`);
    }
  });

  return lines.join('\n') + '\n';
}

// Show help
if (process.argv.includes('--help')) {
  console.log(`
Qwen AI Setup Script

Usage:
  node scripts/setupQwenApi.js

This script will:
1. Prompt for your Qwen API key
2. Let you select a model
3. Configure the API base URL
4. Test the connection
5. Save configuration to .env.local

Get your API key from: https://dashscope.console.aliyun.com/
`);
  process.exit(0);
}

// Run setup
setupQwenApi();

#!/usr/bin/env node

/**
 * Automated Setup Script for AI Lesson Planner
 * This script automates the initial setup process
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 Setting up AI Lesson Planner...\n');

// 1. Create necessary directories
const directories = [
  'data',
  'data/curriculum',
  'data/exports',
  'tests',
  'tests/components',
  'tests/services',
  'logs',
];

console.log('📁 Creating project directories...');
directories.forEach(dir => {
  const dirPath = path.join(projectRoot, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   ✓ Created ${dir}/`);
  } else {
    console.log(`   ✓ ${dir}/ already exists`);
  }
});

// 2. Create .env.local template if it doesn't exist
const envPath = path.join(projectRoot, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('\n🔑 Creating environment configuration...');
  const envTemplate = `# AI Lesson Planner Environment Configuration
# Copy this file to .env.local and fill in your actual values

# Qwen AI API Key (required) - Get from OpenRouter
QWEN_API_KEY=your_openrouter_api_key_here

# Qwen model via OpenRouter
QWEN_MODEL=qwen/qwen3-235b-a22b:free

# OpenRouter API base URL
QWEN_API_BASE_URL=https://openrouter.ai/api/v1

# Development settings
NODE_ENV=development
VITE_APP_NAME=AI Lesson Planner
VITE_APP_VERSION=0.0.0

# Logging level (error, warn, info, debug)
LOG_LEVEL=info
`;
  fs.writeFileSync(envPath, envTemplate);
  console.log('   ✓ Created .env.local template');
  console.log('   ⚠️  Please edit .env.local and add your OpenRouter API key');
} else {
  console.log('\n🔑 Environment file already exists');
}

// 3. Create sample curriculum data
const curriculumDataPath = path.join(projectRoot, 'data/curriculum/sample-curriculum.json');
if (!fs.existsSync(curriculumDataPath)) {
  console.log('\n📚 Creating sample curriculum data...');
  const sampleCurriculum = {
    metadata: {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      description: 'Sample curriculum data for AI Lesson Planner',
    },
    curriculum: [
      {
        id: 'grade9-pretech-term1-week1-lesson1',
        grade: 'Grade 9',
        subject: 'Pre-Technical Studies',
        term: 'Term 1',
        week: '1',
        lesson: '1',
        strand: 'FOUNDATIONS OF PRE-TECHNICAL STUDIES',
        subStrand: 'Safety on Raised Platforms - types of raised platforms (ladders & trestles)',
        specificLearningOutcomes: [
          'Identify types of raised platforms used in performing tasks.',
          'Explore the use of ladders and trestles.',
          'Appreciate working with raised platforms.',
        ],
        keyInquiryQuestions: [
          'What is the importance of observing safety when working on raised platforms?',
        ],
        learningExperiences: [
          'The learner is guided to walk around the school to explore types of raised platforms (ladders, trestles).',
          'The learner is guided to brainstorm on the types of raised platforms used in day-to-day life.',
        ],
        learningResources: [
          'Raised platforms (actual or pictures)',
          'Video clips and visual aids demonstrating use of ladders and trestles',
          'Personal protective equipment (PPEs) relevant to working on raised platforms',
          'Distinction Pretech. Studies Grade 9 P.B. Pg.1-4',
        ],
        assessmentMethods: [
          'Oral questioning on types and uses of ladders/trestles.',
          'Observation of learner participation in discussions and activities.',
          'Checklist for identifying safety aspects.',
          'Short written quiz on platform types and safety.',
          'Rubrics for practical demonstration (if applicable).',
          'Practical work involving safe setup/use (simulated if needed).',
        ],
      },
    ],
  };

  fs.writeFileSync(curriculumDataPath, JSON.stringify(sampleCurriculum, null, 2));
  console.log('   ✓ Created sample curriculum data');
}

// 4. Create gitignore additions
const gitignorePath = path.join(projectRoot, '.gitignore');
const gitignoreAdditions = `
# AI Lesson Planner specific
.env.local
.env.production
data/exports/*.json
data/exports/*.csv
logs/*.log
*.stackdump

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db
`;

if (fs.existsSync(gitignorePath)) {
  const currentGitignore = fs.readFileSync(gitignorePath, 'utf8');
  if (!currentGitignore.includes('# AI Lesson Planner specific')) {
    fs.appendFileSync(gitignorePath, gitignoreAdditions);
    console.log('\n📝 Updated .gitignore with project-specific entries');
  }
}

console.log('\n✅ Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('   1. Your OpenRouter API key is already configured!');
console.log('   2. Run: npm install');
console.log('   3. Run: npm run dev');
console.log('\n🔧 Available automation commands:');
console.log('   npm run generate:batch    - Generate multiple lesson plans');
console.log('   npm run export:data       - Export generated data');
console.log('   npm run import:curriculum - Import curriculum data');
console.log('   npm run lint:fix          - Fix code formatting');
console.log('   npm run test              - Run automated tests');

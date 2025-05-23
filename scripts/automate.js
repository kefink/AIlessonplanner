#!/usr/bin/env node

/**
 * Master Automation Script for AI Lesson Planner
 * This script provides a unified interface for all automation tasks
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, 'cyan');
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: projectRoot,
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(path.join(projectRoot, filePath))) {
    log(`✅ ${description} exists`, 'green');
    return true;
  } else {
    log(`❌ ${description} missing`, 'red');
    return false;
  }
}

// Automation workflows
const workflows = {
  setup: {
    name: 'Project Setup',
    description: 'Initialize project with all necessary configurations',
    steps: [
      () => runCommand('node scripts/setup.js', 'Running project setup'),
      () => runCommand('npm install', 'Installing dependencies'),
      () => checkFileExists('.env.local', 'Environment configuration'),
      () => log('⚠️  Remember to add your GEMINI_API_KEY to .env.local', 'yellow')
    ]
  },

  quality: {
    name: 'Code Quality Check',
    description: 'Run all code quality checks and fixes',
    steps: [
      () => runCommand('npm run type-check', 'Type checking'),
      () => runCommand('npm run lint:fix', 'Linting and fixing code'),
      () => runCommand('npm run format', 'Formatting code'),
      () => runCommand('npm run test', 'Running tests')
    ]
  },

  build: {
    name: 'Build and Test',
    description: 'Complete build and test cycle',
    steps: [
      () => runCommand('npm run clean', 'Cleaning build artifacts'),
      () => runCommand('npm run type-check', 'Type checking'),
      () => runCommand('npm run lint', 'Linting code'),
      () => runCommand('npm run test:coverage', 'Running tests with coverage'),
      () => runCommand('npm run build', 'Building application')
    ]
  },

  data: {
    name: 'Data Management',
    description: 'Import curriculum data and generate lesson plans',
    steps: [
      () => runCommand('node scripts/importCurriculum.js', 'Importing curriculum data'),
      () => runCommand('node scripts/batchGenerate.js', 'Generating lesson plans'),
      () => runCommand('node scripts/exportData.js', 'Exporting generated data')
    ]
  },

  deploy: {
    name: 'Deployment',
    description: 'Deploy application to production',
    steps: [
      () => runCommand('npm run build', 'Building for production'),
      () => runCommand('npm run deploy', 'Deploying to Vercel'),
      () => log('🚀 Deployment completed! Check your Vercel dashboard.', 'green')
    ]
  },

  dev: {
    name: 'Development Environment',
    description: 'Start development environment with all tools',
    steps: [
      () => runCommand('npm run setup', 'Setting up project'),
      () => log('🔧 Starting development server...', 'cyan'),
      () => runCommand('npm run dev', 'Starting development server')
    ]
  },

  ci: {
    name: 'Continuous Integration',
    description: 'Run full CI pipeline locally',
    steps: [
      () => runCommand('npm ci', 'Installing dependencies (CI mode)'),
      () => runCommand('npm run type-check', 'Type checking'),
      () => runCommand('npm run lint', 'Linting'),
      () => runCommand('npm run format:check', 'Checking code format'),
      () => runCommand('npm run test:coverage', 'Running tests with coverage'),
      () => runCommand('npm run build', 'Building application'),
      () => log('✅ CI pipeline completed successfully!', 'green')
    ]
  },

  maintenance: {
    name: 'Maintenance Tasks',
    description: 'Run maintenance and cleanup tasks',
    steps: [
      () => runCommand('npm audit', 'Checking for security vulnerabilities'),
      () => runCommand('npm outdated', 'Checking for outdated packages'),
      () => runCommand('npm run clean', 'Cleaning build artifacts'),
      () => runCommand('npm run reinstall', 'Reinstalling dependencies'),
      () => log('🧹 Maintenance tasks completed', 'green')
    ]
  }
};

function showHelp() {
  log('\n🤖 AI Lesson Planner - Automation Script', 'bright');
  log('=========================================', 'bright');
  log('\nAvailable workflows:', 'cyan');
  
  Object.entries(workflows).forEach(([key, workflow]) => {
    log(`\n  ${key.padEnd(12)} - ${workflow.description}`, 'yellow');
  });

  log('\nUsage:', 'cyan');
  log('  npm run automate <workflow>     # Run specific workflow');
  log('  npm run automate --help         # Show this help');
  log('  npm run automate --list         # List all workflows');
  
  log('\nExamples:', 'cyan');
  log('  npm run automate setup          # Initialize project');
  log('  npm run automate quality        # Run code quality checks');
  log('  npm run automate ci             # Run full CI pipeline');
  log('  npm run automate data           # Process curriculum data');
  
  log('\nIndividual scripts:', 'cyan');
  log('  npm run setup                   # Project setup');
  log('  npm run generate:batch          # Generate lesson plans');
  log('  npm run export:data             # Export data');
  log('  npm run import:curriculum       # Import curriculum');
}

function listWorkflows() {
  log('\n📋 Available Automation Workflows:', 'bright');
  log('==================================', 'bright');
  
  Object.entries(workflows).forEach(([key, workflow]) => {
    log(`\n🔧 ${workflow.name}`, 'cyan');
    log(`   Command: npm run automate ${key}`, 'yellow');
    log(`   Description: ${workflow.description}`, 'reset');
    log(`   Steps: ${workflow.steps.length} automated tasks`, 'magenta');
  });
}

async function runWorkflow(workflowName) {
  const workflow = workflows[workflowName];
  
  if (!workflow) {
    log(`❌ Unknown workflow: ${workflowName}`, 'red');
    log('Run "npm run automate --help" to see available workflows', 'yellow');
    process.exit(1);
  }

  log(`\n🚀 Starting workflow: ${workflow.name}`, 'bright');
  log(`📝 ${workflow.description}`, 'cyan');
  log(`⏱️  ${workflow.steps.length} steps to complete\n`, 'magenta');

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];
    log(`\n📍 Step ${i + 1}/${workflow.steps.length}`, 'blue');
    
    try {
      const success = await step();
      if (success !== false) {
        successCount++;
      } else {
        failureCount++;
      }
    } catch (error) {
      log(`❌ Step failed: ${error.message}`, 'red');
      failureCount++;
    }
  }

  log(`\n📊 Workflow Summary:`, 'bright');
  log(`   ✅ Successful steps: ${successCount}`, 'green');
  log(`   ❌ Failed steps: ${failureCount}`, failureCount > 0 ? 'red' : 'green');
  
  if (failureCount === 0) {
    log(`\n🎉 Workflow "${workflow.name}" completed successfully!`, 'green');
  } else {
    log(`\n⚠️  Workflow "${workflow.name}" completed with ${failureCount} failures`, 'yellow');
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }
  
  if (args.includes('--list')) {
    listWorkflows();
    return;
  }
  
  const workflowName = args[0];
  await runWorkflow(workflowName);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`💥 Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

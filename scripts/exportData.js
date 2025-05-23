#!/usr/bin/env node

/**
 * Data Export Script for AI Lesson Planner
 * Automates the export of generated lesson plans and schemes of work
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('📤 Starting data export...\n');

const exportConfig = {
  inputDir: path.join(projectRoot, 'data/exports'),
  outputDir: path.join(projectRoot, 'data/exports'),
  formats: ['json', 'csv', 'txt']
};

// Utility functions
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function convertToCSV(data) {
  if (!data || !Array.isArray(data.results)) {
    return 'No data available';
  }

  const headers = [
    'ID', 'Grade', 'Subject', 'Term', 'Week', 'Lesson', 'Status',
    'Strand', 'Sub-Strand', 'Learning Outcomes', 'Inquiry Questions',
    'Learning Experiences', 'Resources', 'Assessment Methods',
    'School', 'Duration', 'Generated Date'
  ];

  const rows = data.results.map(result => {
    if (result.status === 'failed') {
      return [
        result.id,
        result.parameters?.grade || '',
        result.parameters?.subject || '',
        result.parameters?.term || '',
        result.parameters?.week || '',
        result.parameters?.lesson || '',
        'FAILED',
        '', '', '', '', '', '', '', '', '', result.timestamp
      ];
    }

    const scheme = result.schemeOfWork || {};
    const plan = result.lessonPlan || {};

    return [
      result.id,
      result.parameters?.grade || '',
      result.parameters?.subject || '',
      result.parameters?.term || '',
      result.parameters?.week || '',
      result.parameters?.lesson || '',
      'SUCCESS',
      scheme.strand || '',
      scheme.subStrand || '',
      scheme.specificLearningOutcomes || '',
      scheme.keyInquiryQuestions || '',
      scheme.learningExperiences || '',
      scheme.learningResources || '',
      scheme.assessmentMethods || '',
      plan.school || '',
      plan.time || '',
      result.timestamp
    ];
  });

  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function convertToText(data) {
  if (!data || !Array.isArray(data.results)) {
    return 'No data available';
  }

  let output = `AI LESSON PLANNER - EXPORT REPORT\n`;
  output += `Generated: ${new Date().toISOString()}\n`;
  output += `Total Records: ${data.results.length}\n`;
  output += `Successful: ${data.metadata?.successful || 0}\n`;
  output += `Failed: ${data.metadata?.failed || 0}\n`;
  output += `\n${'='.repeat(80)}\n\n`;

  data.results.forEach((result, index) => {
    output += `RECORD ${index + 1}: ${result.id}\n`;
    output += `Status: ${result.status}\n`;
    output += `Generated: ${result.timestamp}\n`;

    if (result.status === 'success') {
      const scheme = result.schemeOfWork || {};
      const plan = result.lessonPlan || {};

      output += `\nSCHEME OF WORK:\n`;
      output += `  Week: ${scheme.wk}, Lesson: ${scheme.lsn}\n`;
      output += `  Strand: ${scheme.strand}\n`;
      output += `  Sub-Strand: ${scheme.subStrand}\n`;
      output += `  Learning Outcomes: ${scheme.specificLearningOutcomes}\n`;

      output += `\nLESSON PLAN:\n`;
      output += `  School: ${plan.school}\n`;
      output += `  Level: ${plan.level}\n`;
      output += `  Subject: ${plan.learningArea}\n`;
      output += `  Duration: ${plan.time}\n`;
      
      if (plan.organisationOfLearning) {
        output += `  Introduction: ${plan.organisationOfLearning.introduction}\n`;
        output += `  Development: ${plan.organisationOfLearning.lessonDevelopment}\n`;
        output += `  Conclusion: ${plan.organisationOfLearning.conclusion}\n`;
      }
    } else {
      output += `Error: ${result.error}\n`;
    }

    output += `\n${'-'.repeat(60)}\n\n`;
  });

  return output;
}

function findLatestExportFile() {
  if (!fs.existsSync(exportConfig.inputDir)) {
    throw new Error('No export directory found. Run batch generation first.');
  }

  const files = fs.readdirSync(exportConfig.inputDir)
    .filter(file => file.startsWith('batch-generation-') && file.endsWith('.json'))
    .map(file => ({
      name: file,
      path: path.join(exportConfig.inputDir, file),
      stats: fs.statSync(path.join(exportConfig.inputDir, file))
    }))
    .sort((a, b) => b.stats.mtime - a.stats.mtime);

  if (files.length === 0) {
    throw new Error('No batch generation files found. Run npm run generate:batch first.');
  }

  return files[0];
}

async function exportData() {
  try {
    ensureDirectoryExists(exportConfig.outputDir);

    // Find the latest batch generation file
    const latestFile = findLatestExportFile();
    console.log(`📁 Using latest file: ${latestFile.name}`);

    // Read the data
    const rawData = fs.readFileSync(latestFile.path, 'utf8');
    const data = JSON.parse(rawData);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `lesson-plans-export-${timestamp}`;

    const exports = [];

    // Export in different formats
    for (const format of exportConfig.formats) {
      let content;
      let filename;

      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          filename = `${baseFilename}.json`;
          break;

        case 'csv':
          content = convertToCSV(data);
          filename = `${baseFilename}.csv`;
          break;

        case 'txt':
          content = convertToText(data);
          filename = `${baseFilename}.txt`;
          break;

        default:
          continue;
      }

      const filepath = path.join(exportConfig.outputDir, filename);
      fs.writeFileSync(filepath, content);
      exports.push({ format, filename, size: content.length });

      console.log(`   ✅ Exported ${format.toUpperCase()}: ${filename}`);
    }

    // Create summary
    console.log('\n📊 Export Summary:');
    console.log(`   📁 Source: ${latestFile.name}`);
    console.log(`   📈 Records: ${data.results?.length || 0}`);
    console.log(`   ✅ Successful: ${data.metadata?.successful || 0}`);
    console.log(`   ❌ Failed: ${data.metadata?.failed || 0}`);
    console.log(`   📤 Formats: ${exports.map(e => e.format).join(', ')}`);

    return exports;

  } catch (error) {
    console.error(`❌ Export failed: ${error.message}`);
    process.exit(1);
  }
}

// Command line argument handling
const args = process.argv.slice(2);
const helpText = `
AI Lesson Planner - Data Export Tool

Usage:
  npm run export:data [options]

Options:
  --format <format>    Export specific format only (json, csv, txt)
  --file <filename>    Export specific file instead of latest
  --help              Show this help message

Examples:
  npm run export:data
  npm run export:data -- --format csv
  npm run export:data -- --file batch-generation-2024-01-01.json
`;

if (args.includes('--help')) {
  console.log(helpText);
  process.exit(0);
}

// Handle format filter
const formatIndex = args.indexOf('--format');
if (formatIndex !== -1 && args[formatIndex + 1]) {
  const requestedFormat = args[formatIndex + 1];
  if (exportConfig.formats.includes(requestedFormat)) {
    exportConfig.formats = [requestedFormat];
  } else {
    console.error(`❌ Invalid format: ${requestedFormat}`);
    console.error(`Available formats: ${exportConfig.formats.join(', ')}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportData();
}

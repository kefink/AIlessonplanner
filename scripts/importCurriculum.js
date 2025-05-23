#!/usr/bin/env node

/**
 * Curriculum Import Script for AI Lesson Planner
 * Automates the import and validation of curriculum data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('📥 Starting curriculum data import...\n');

const importConfig = {
  inputDir: path.join(projectRoot, 'data/curriculum'),
  outputFile: path.join(projectRoot, 'data/curriculum/processed-curriculum.json'),
  validationRules: {
    required: ['grade', 'subject', 'strand', 'subStrand', 'specificLearningOutcomes'],
    gradePattern: /^Grade \d+$/,
    termPattern: /^Term [1-3]$/,
    weekPattern: /^\d+$/,
    lessonPattern: /^\d+$/
  }
};

// Validation functions
function validateCurriculumEntry(entry, index) {
  const errors = [];
  const warnings = [];

  // Check required fields
  importConfig.validationRules.required.forEach(field => {
    if (!entry[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate grade format
  if (entry.grade && !importConfig.validationRules.gradePattern.test(entry.grade)) {
    warnings.push(`Grade format should be "Grade X": ${entry.grade}`);
  }

  // Validate term format
  if (entry.term && !importConfig.validationRules.termPattern.test(entry.term)) {
    warnings.push(`Term format should be "Term X": ${entry.term}`);
  }

  // Validate week format
  if (entry.week && !importConfig.validationRules.weekPattern.test(entry.week)) {
    warnings.push(`Week should be a number: ${entry.week}`);
  }

  // Validate lesson format
  if (entry.lesson && !importConfig.validationRules.lessonPattern.test(entry.lesson)) {
    warnings.push(`Lesson should be a number: ${entry.lesson}`);
  }

  // Check array fields
  const arrayFields = ['specificLearningOutcomes', 'keyInquiryQuestions', 'learningExperiences', 'learningResources', 'assessmentMethods'];
  arrayFields.forEach(field => {
    if (entry[field] && !Array.isArray(entry[field])) {
      errors.push(`${field} should be an array`);
    }
  });

  return { errors, warnings };
}

function generateId(entry) {
  const grade = entry.grade?.toLowerCase().replace(/\s+/g, '') || 'unknown';
  const subject = entry.subject?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
  const term = entry.term?.toLowerCase().replace(/\s+/g, '') || 'term1';
  const week = entry.week || '1';
  const lesson = entry.lesson || '1';
  
  return `${grade}-${subject}-${term}-week${week}-lesson${lesson}`;
}

function normalizeCurriculumEntry(entry) {
  // Generate ID if not present
  if (!entry.id) {
    entry.id = generateId(entry);
  }

  // Ensure array fields are arrays
  const arrayFields = ['specificLearningOutcomes', 'keyInquiryQuestions', 'learningExperiences', 'learningResources', 'assessmentMethods'];
  arrayFields.forEach(field => {
    if (entry[field] && typeof entry[field] === 'string') {
      // Split string by common delimiters
      entry[field] = entry[field].split(/[;,\n]/).map(item => item.trim()).filter(item => item);
    } else if (!entry[field]) {
      entry[field] = [];
    }
  });

  // Add metadata
  entry.metadata = {
    imported: new Date().toISOString(),
    version: '1.0'
  };

  return entry;
}

async function importFromJSON(filePath) {
  console.log(`📄 Processing JSON file: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    let entries = [];
    
    if (Array.isArray(data)) {
      entries = data;
    } else if (data.curriculum && Array.isArray(data.curriculum)) {
      entries = data.curriculum;
    } else if (typeof data === 'object') {
      entries = [data];
    } else {
      throw new Error('Invalid JSON structure');
    }
    
    return entries;
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
}

async function importFromCSV(filePath) {
  console.log(`📊 Processing CSV file: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const entries = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const entry = {};
      
      headers.forEach((header, index) => {
        if (values[index]) {
          entry[header] = values[index];
        }
      });
      
      entries.push(entry);
    }
    
    return entries;
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
}

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.json':
      return await importFromJSON(filePath);
    case '.csv':
      return await importFromCSV(filePath);
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
}

async function importCurriculum() {
  try {
    // Ensure directories exist
    if (!fs.existsSync(importConfig.inputDir)) {
      fs.mkdirSync(importConfig.inputDir, { recursive: true });
      console.log(`📁 Created curriculum directory: ${importConfig.inputDir}`);
      console.log('   Place your curriculum files (.json or .csv) in this directory');
      return;
    }

    // Find curriculum files
    const files = fs.readdirSync(importConfig.inputDir)
      .filter(file => ['.json', '.csv'].includes(path.extname(file).toLowerCase()))
      .map(file => path.join(importConfig.inputDir, file));

    if (files.length === 0) {
      console.log('📁 No curriculum files found in data/curriculum/');
      console.log('   Supported formats: .json, .csv');
      console.log('   Place your files there and run this script again');
      return;
    }

    console.log(`📚 Found ${files.length} curriculum file(s)`);

    let allEntries = [];
    let totalErrors = 0;
    let totalWarnings = 0;

    // Process each file
    for (const filePath of files) {
      try {
        const entries = await processFile(filePath);
        console.log(`   ✅ Loaded ${entries.length} entries from ${path.basename(filePath)}`);

        // Validate and normalize entries
        const processedEntries = entries.map((entry, index) => {
          const validation = validateCurriculumEntry(entry, index);
          
          if (validation.errors.length > 0) {
            console.log(`   ❌ Entry ${index + 1} errors:`, validation.errors);
            totalErrors += validation.errors.length;
          }
          
          if (validation.warnings.length > 0) {
            console.log(`   ⚠️  Entry ${index + 1} warnings:`, validation.warnings);
            totalWarnings += validation.warnings.length;
          }

          return normalizeCurriculumEntry(entry);
        });

        allEntries.push(...processedEntries);

      } catch (error) {
        console.error(`   ❌ Failed to process ${path.basename(filePath)}: ${error.message}`);
        totalErrors++;
      }
    }

    // Create output structure
    const output = {
      metadata: {
        version: '1.0',
        imported: new Date().toISOString(),
        totalEntries: allEntries.length,
        sourceFiles: files.map(f => path.basename(f)),
        validation: {
          errors: totalErrors,
          warnings: totalWarnings
        }
      },
      curriculum: allEntries
    };

    // Save processed curriculum
    const outputDir = path.dirname(importConfig.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(importConfig.outputFile, JSON.stringify(output, null, 2));

    // Summary
    console.log('\n📊 Import Summary:');
    console.log(`   📁 Files processed: ${files.length}`);
    console.log(`   📚 Total entries: ${allEntries.length}`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    console.log(`   ⚠️  Warnings: ${totalWarnings}`);
    console.log(`   💾 Output: ${path.basename(importConfig.outputFile)}`);

    if (totalErrors > 0) {
      console.log('\n⚠️  Some entries had errors. Please review and fix them.');
    }

    return output;

  } catch (error) {
    console.error(`❌ Import failed: ${error.message}`);
    process.exit(1);
  }
}

// Command line help
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`
AI Lesson Planner - Curriculum Import Tool

Usage:
  npm run import:curriculum [options]

Supported file formats:
  - JSON (.json)
  - CSV (.csv)

Place your curriculum files in: data/curriculum/

JSON format example:
{
  "curriculum": [
    {
      "grade": "Grade 9",
      "subject": "Pre-Technical Studies",
      "strand": "FOUNDATIONS OF PRE-TECHNICAL STUDIES",
      "subStrand": "Safety on Raised Platforms",
      "specificLearningOutcomes": ["Outcome 1", "Outcome 2"],
      "keyInquiryQuestions": ["Question 1"],
      "learningExperiences": ["Experience 1"],
      "learningResources": ["Resource 1"],
      "assessmentMethods": ["Method 1"]
    }
  ]
}

CSV format should have columns:
grade,subject,strand,subStrand,specificLearningOutcomes,keyInquiryQuestions,learningExperiences,learningResources,assessmentMethods
`);
  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importCurriculum();
}

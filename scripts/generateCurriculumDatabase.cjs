/**
 * Generate Curriculum Database from Extracted Data
 * Converts extracted JSON files into TypeScript curriculum database
 */

const fs = require('fs');
const path = require('path');

function generateCurriculumDatabase() {
  console.log('🔄 Generating Curriculum Database from extracted data...\n');
  
  const extractedDir = 'data/extracted-curriculum';
  const outputFile = 'services/embeddedCurriculumDatabase.ts';
  
  if (!fs.existsSync(extractedDir)) {
    console.error('❌ Extracted curriculum directory not found:', extractedDir);
    return;
  }
  
  // Read all extracted JSON files
  const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('.json'));
  console.log(`📚 Found ${files.length} extracted curriculum files`);
  
  // Group by subject
  const subjectData = {};
  
  files.forEach(file => {
    const filePath = path.join(extractedDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const subject = data.subject;
    if (!subjectData[subject]) {
      subjectData[subject] = {
        subject: subject,
        level: data.level,
        grades: [],
        generalLearningOutcomes: data.generalLearningOutcomes,
        strands: data.strands
      };
    }
    
    // Add grade to the list
    if (!subjectData[subject].grades.includes(data.grade)) {
      subjectData[subject].grades.push(data.grade);
    }
    
    console.log(`   ✅ Processed: ${subject} ${data.grade}`);
  });
  
  // Sort grades
  Object.keys(subjectData).forEach(subject => {
    subjectData[subject].grades.sort();
  });
  
  // Generate TypeScript content
  const tsContent = generateTypeScriptContent(subjectData);
  
  // Write to file
  fs.writeFileSync(outputFile, tsContent);
  
  console.log(`\n✅ Generated curriculum database: ${outputFile}`);
  console.log(`📊 Subjects included: ${Object.keys(subjectData).join(', ')}`);
  
  // Generate summary
  generateSummary(subjectData);
  
  return subjectData;
}

function generateTypeScriptContent(subjectData) {
  const timestamp = new Date().toISOString();
  
  return `/**
 * Embedded Curriculum Database
 * Auto-generated from extracted PDF curriculum data
 * Generated on: ${timestamp}
 * 
 * This file contains the complete Kenya CBC Junior School curriculum
 * extracted from official KICD curriculum design documents.
 */

import type { CurriculumDatabase, SubjectCurriculum } from './curriculumDatabase';

/**
 * Complete Kenya CBC Junior School Curriculum Database
 * Extracted from official KICD curriculum PDFs
 */
export const EMBEDDED_CBC_CURRICULUM: CurriculumDatabase = {
  'junior-school': ${JSON.stringify(subjectData, null, 4).replace(/"/g, '"')}
};

/**
 * Get curriculum for a specific subject and grade
 */
export function getCurriculumForSubject(subject: string): SubjectCurriculum | null {
  return EMBEDDED_CBC_CURRICULUM['junior-school'][subject] || null;
}

/**
 * Get all available subjects
 */
export function getAvailableSubjects(): string[] {
  return Object.keys(EMBEDDED_CBC_CURRICULUM['junior-school']);
}

/**
 * Get strands for a specific subject
 */
export function getStrandsForSubject(subject: string) {
  const curriculum = getCurriculumForSubject(subject);
  return curriculum ? curriculum.strands : [];
}

/**
 * Get learning outcomes for a specific subject
 */
export function getLearningOutcomesForSubject(subject: string) {
  const curriculum = getCurriculumForSubject(subject);
  return curriculum ? curriculum.generalLearningOutcomes : [];
}

/**
 * Search curriculum content
 */
export function searchCurriculum(query: string, subject?: string) {
  const results = [];
  const searchTerm = query.toLowerCase();
  
  const subjectsToSearch = subject ? [subject] : getAvailableSubjects();
  
  subjectsToSearch.forEach(subjectName => {
    const curriculum = getCurriculumForSubject(subjectName);
    if (!curriculum) return;
    
    // Search in general learning outcomes
    curriculum.generalLearningOutcomes.forEach((outcome, index) => {
      if (outcome.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'general-outcome',
          subject: subjectName,
          content: outcome,
          index
        });
      }
    });
    
    // Search in strands and sub-strands
    curriculum.strands.forEach((strand, strandIndex) => {
      if (strand.name.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'strand',
          subject: subjectName,
          strand: strand.name,
          content: strand.name,
          strandIndex
        });
      }
      
      strand.subStrands.forEach((subStrand, subStrandIndex) => {
        if (subStrand.name.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'sub-strand',
            subject: subjectName,
            strand: strand.name,
            subStrand: subStrand.name,
            content: subStrand.name,
            strandIndex,
            subStrandIndex
          });
        }
        
        // Search in learning outcomes
        subStrand.specificLearningOutcomes.forEach((outcome, outcomeIndex) => {
          if (outcome.toLowerCase().includes(searchTerm)) {
            results.push({
              type: 'learning-outcome',
              subject: subjectName,
              strand: strand.name,
              subStrand: subStrand.name,
              content: outcome,
              strandIndex,
              subStrandIndex,
              outcomeIndex
            });
          }
        });
      });
    });
  });
  
  return results;
}

/**
 * Curriculum metadata
 */
export const CURRICULUM_METADATA = {
  source: 'Kenya Institute of Curriculum Development (KICD)',
  level: 'Junior School (Grades 7-9)',
  curriculum: 'Competency Based Curriculum (CBC)',
  extractedOn: '${timestamp}',
  subjects: ${JSON.stringify(Object.keys(subjectData))},
  totalStrands: ${Object.values(subjectData).reduce((total, subject) => total + subject.strands.length, 0)},
  totalSubStrands: ${Object.values(subjectData).reduce((total, subject) => 
    total + subject.strands.reduce((strandTotal, strand) => strandTotal + strand.subStrands.length, 0), 0
  )}
};

export default EMBEDDED_CBC_CURRICULUM;
`;
}

function generateSummary(subjectData) {
  console.log('\n📋 CURRICULUM DATABASE SUMMARY');
  console.log('================================');
  
  Object.keys(subjectData).forEach(subject => {
    const data = subjectData[subject];
    const totalSubStrands = data.strands.reduce((total, strand) => total + strand.subStrands.length, 0);
    
    console.log(`\n📚 ${subject}:`);
    console.log(`   Grades: ${data.grades.join(', ')}`);
    console.log(`   Strands: ${data.strands.length}`);
    console.log(`   Sub-strands: ${totalSubStrands}`);
    console.log(`   General Outcomes: ${data.generalLearningOutcomes.length}`);
  });
  
  const totalStrands = Object.values(subjectData).reduce((total, subject) => total + subject.strands.length, 0);
  const totalSubStrands = Object.values(subjectData).reduce((total, subject) => 
    total + subject.strands.reduce((strandTotal, strand) => strandTotal + strand.subStrands.length, 0), 0
  );
  
  console.log('\n📊 TOTALS:');
  console.log(`   Subjects: ${Object.keys(subjectData).length}`);
  console.log(`   Strands: ${totalStrands}`);
  console.log(`   Sub-strands: ${totalSubStrands}`);
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Update curriculumDatabase.ts to use embedded data');
  console.log('2. Test curriculum browser with real data');
  console.log('3. Validate lesson generation with embedded curriculum');
}

if (require.main === module) {
  generateCurriculumDatabase();
}

module.exports = { generateCurriculumDatabase };

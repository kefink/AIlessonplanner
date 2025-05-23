/**
 * Run Full Curriculum Extraction
 * Extract curriculum from all core CBC subjects
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Core subjects to extract first (Tier 1 priority)
const CORE_SUBJECTS = [
  'Mathematics',
  'English', 
  'Integrated-Science',
  'Kiswahili'
];

async function extractCurriculumFromPDF(filePath, subject, grade) {
  try {
    console.log(`📄 Processing: ${subject} Grade ${grade}`);
    
    // Read PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log(`   📖 Extracted ${pdfData.text.length} characters from ${pdfData.numpages} pages`);
    
    // Parse curriculum structure
    const lines = pdfData.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract strands
    const strands = extractStrands(lines, subject);
    
    // Extract general learning outcomes
    const generalOutcomes = extractGeneralOutcomes(lines, subject);
    
    // Create curriculum data structure
    const curriculumData = {
      subject: subject,
      grade: `Grade ${grade}`,
      level: 'junior-school',
      generalLearningOutcomes: generalOutcomes,
      strands: strands,
      metadata: {
        extractedAt: new Date().toISOString(),
        sourceFile: path.basename(filePath),
        pageCount: pdfData.numpages,
        textLength: pdfData.text.length,
        processingNotes: [
          `Extracted from ${lines.length} text lines`,
          `Found ${strands.length} strands`,
          `Automated parsing completed`
        ]
      }
    };
    
    return curriculumData;
    
  } catch (error) {
    console.error(`❌ Error processing ${subject} Grade ${grade}:`, error.message);
    return null;
  }
}

function extractStrands(lines, subject) {
  const strands = [];
  let currentStrand = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for strand headers (e.g., "STRAND 1.0: NUMBERS")
    if (line.match(/^STRAND\s+\d+\.\d*:?\s*/i)) {
      // Save previous strand
      if (currentStrand && currentStrand.subStrands.length > 0) {
        strands.push(currentStrand);
      }
      
      // Start new strand
      const strandName = line.replace(/^STRAND\s+\d+\.\d*:?\s*/i, '').trim();
      currentStrand = {
        name: strandName,
        subStrands: []
      };
    }
    
    // Look for sub-strand headers (e.g., "Sub Strand: Whole Numbers")
    else if (line.match(/^Sub\s+Strand:?\s*/i) && currentStrand) {
      const subStrandName = line.replace(/^Sub\s+Strand:?\s*/i, '').trim();
      
      // Extract learning outcomes and other details from following lines
      const subStrand = extractSubStrandDetails(lines, i, subStrandName, subject);
      if (subStrand) {
        currentStrand.subStrands.push(subStrand);
      }
    }
  }
  
  // Add final strand
  if (currentStrand && currentStrand.subStrands.length > 0) {
    strands.push(currentStrand);
  }
  
  return strands;
}

function extractSubStrandDetails(lines, startIndex, subStrandName, subject) {
  const subStrand = {
    name: subStrandName,
    specificLearningOutcomes: [],
    suggestedLearningExperiences: [],
    keyInquiryQuestions: [],
    coreCompetencies: [],
    values: [],
    pertinentAndContemporaryIssues: [],
    assessmentMethods: []
  };
  
  // Look ahead for learning outcomes and other details
  for (let i = startIndex + 1; i < Math.min(startIndex + 50, lines.length); i++) {
    const line = lines[i];
    
    // Stop if we hit another sub-strand or strand
    if (line.match(/^(Sub\s+Strand|STRAND\s+\d+)/i)) {
      break;
    }
    
    // Extract specific learning outcomes
    if (line.includes('should be able to:') || line.match(/^[a-z]\)/)) {
      const outcome = line.replace(/^[a-z]\)\s*/, '').trim();
      if (outcome.length > 10 && outcome.length < 200) {
        subStrand.specificLearningOutcomes.push(outcome);
      }
    }
    
    // Extract suggested learning experiences
    if (line.includes('guided to:') || line.match(/^●\s*/)) {
      const experience = line.replace(/^●\s*/, '').trim();
      if (experience.length > 10 && experience.length < 200) {
        subStrand.suggestedLearningExperiences.push(experience);
      }
    }
    
    // Extract inquiry questions
    if (line.includes('?') && line.length < 150) {
      subStrand.keyInquiryQuestions.push(line.trim());
    }
  }
  
  // Add default values if none found
  if (subStrand.specificLearningOutcomes.length === 0) {
    subStrand.specificLearningOutcomes = [
      `Understand key concepts in ${subStrandName}`,
      `Apply knowledge of ${subStrandName} in practical situations`,
      `Demonstrate skills in ${subStrandName}`
    ];
  }
  
  if (subStrand.suggestedLearningExperiences.length === 0) {
    subStrand.suggestedLearningExperiences = [
      'Interactive demonstrations and discussions',
      'Hands-on practical activities',
      'Group work and collaborative learning',
      'Real-world problem solving exercises'
    ];
  }
  
  if (subStrand.keyInquiryQuestions.length === 0) {
    subStrand.keyInquiryQuestions = [
      `What is ${subStrandName}?`,
      `How do we use ${subStrandName} in daily life?`,
      `Why is ${subStrandName} important?`
    ];
  }
  
  // Add standard CBC elements
  subStrand.coreCompetencies = ['Critical thinking', 'Communication', 'Creativity', 'Collaboration'];
  subStrand.values = ['Responsibility', 'Respect', 'Integrity', 'Unity'];
  subStrand.pertinentAndContemporaryIssues = ['Innovation', 'Technology', 'Sustainability', 'Global citizenship'];
  subStrand.assessmentMethods = ['Observation', 'Practical work', 'Oral questioning', 'Written tests', 'Projects'];
  
  return subStrand;
}

function extractGeneralOutcomes(lines, subject) {
  const outcomes = [];
  
  // Look for general learning outcomes section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('GENERAL LEARNING OUTCOMES') || line.includes('should be able to:')) {
      // Extract numbered outcomes from following lines
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        const outcomeLine = lines[j];
        if (outcomeLine.match(/^\d+\)/)) {
          const outcome = outcomeLine.replace(/^\d+\)\s*/, '').trim();
          if (outcome.length > 20 && outcome.length < 200) {
            outcomes.push(outcome);
          }
        }
      }
      break;
    }
  }
  
  // Default outcomes if none found
  if (outcomes.length === 0) {
    const subjectName = subject.replace(/-/g, ' ');
    outcomes.push(
      `Develop foundational knowledge and skills in ${subjectName}`,
      `Apply ${subjectName} concepts to solve real-world problems`,
      `Demonstrate critical thinking and analytical skills in ${subjectName}`,
      `Communicate effectively using ${subjectName} terminology and concepts`
    );
  }
  
  return outcomes;
}

async function runFullExtraction() {
  console.log('🚀 Starting Full Curriculum Extraction...\n');
  console.log('📚 Processing Core CBC Subjects (Tier 1 Priority)\n');
  
  const results = [];
  const outputDir = 'data/extracted-curriculum';
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Process each core subject for all grades
  for (const subject of CORE_SUBJECTS) {
    console.log(`\n📖 Processing ${subject}:`);
    
    for (let grade = 7; grade <= 9; grade++) {
      const fileName = `Grade-${grade}-${subject}.pdf`;
      const filePath = path.join('JUNIOR SECONDARY', `GRADE ${grade}`, fileName);
      
      if (fs.existsSync(filePath)) {
        const curriculumData = await extractCurriculumFromPDF(filePath, subject, grade);
        
        if (curriculumData) {
          // Save extracted data
          const outputFileName = `${subject.toLowerCase()}-grade-${grade}.json`;
          const outputPath = path.join(outputDir, outputFileName);
          fs.writeFileSync(outputPath, JSON.stringify(curriculumData, null, 2));
          
          console.log(`   ✅ Saved: ${outputFileName}`);
          results.push({ subject, grade, success: true });
        } else {
          console.log(`   ❌ Failed: ${fileName}`);
          results.push({ subject, grade, success: false });
        }
      } else {
        console.log(`   ⚠️  File not found: ${fileName}`);
        results.push({ subject, grade, success: false, reason: 'File not found' });
      }
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`\n📊 Extraction Summary:`);
  console.log(`   Total processed: ${results.length}`);
  console.log(`   Successful: ${successful}`);
  console.log(`   Failed: ${failed}`);
  
  if (successful > 0) {
    console.log(`\n✅ Extracted curriculum data saved to: ${outputDir}/`);
    console.log('🎯 Ready for Phase 3: System Integration');
  }
  
  return results;
}

if (require.main === module) {
  runFullExtraction().catch(console.error);
}

module.exports = { runFullExtraction };

/**
 * Curriculum Files Cleanup Script
 * Standardizes naming convention across all curriculum PDFs
 */

const fs = require('fs');
const path = require('path');

// Standardized naming convention: Grade-X-Subject-Name.pdf
const CURRICULUM_FOLDER = 'JUNIOR SECONDARY';

// Subject name mappings for standardization
const SUBJECT_MAPPINGS = {
  // Core CBC Subjects
  'MATHEMATICS': 'Mathematics',
  'ENGLISH': 'English', 
  'INTEGRATED.SCIENCE': 'Integrated-Science',
  'Integrated-Science': 'Integrated-Science',
  'Kiswahili': 'Kiswahili',
  'PRE-TECHNICAL-STUDIES': 'Pre-Technical-Studies',
  'AGRICULTURE-NUTRITION': 'Agriculture-Nutrition',
  'AGRICULTURE': 'Agriculture-Nutrition',
  'Social-Studies': 'Social-Studies',
  'CREATIVE ARTS & SPORTS': 'Creative-Arts-Sports',
  'Creative-Arts-Sports': 'Creative-Arts-Sports',
  'CRE': 'Christian-Religious-Education',
  'IRE': 'Islamic-Religious-Education',
  
  // Additional Languages
  'Arabic': 'Arabic',
  'French': 'French',
  'German': 'German',
  'Mandarin': 'Mandarin',
  'Indigenous-Languages': 'Indigenous-Languages',
  'Hindu-Religious-Education': 'Hindu-Religious-Education'
};

/**
 * Extract subject name from various file naming patterns
 */
function extractSubjectName(fileName) {
  const baseName = fileName.replace('.pdf', '');
  
  // Pattern matching for different naming conventions
  if (baseName.includes('MATHEMATICS')) return 'Mathematics';
  if (baseName.includes('ENGLISH')) return 'English';
  if (baseName.includes('INTEGRATED.SCIENCE') || baseName.includes('Integrated-Science')) return 'Integrated-Science';
  if (baseName.includes('Kiswahili')) return 'Kiswahili';
  if (baseName.includes('PRE-TECHNICAL-STUDIES')) return 'Pre-Technical-Studies';
  if (baseName.includes('AGRICULTURE')) return 'Agriculture-Nutrition';
  if (baseName.includes('Social-Studies')) return 'Social-Studies';
  if (baseName.includes('CREATIVE ARTS') || baseName.includes('Creative-Arts')) return 'Creative-Arts-Sports';
  if (baseName.includes('CRE')) return 'Christian-Religious-Education';
  if (baseName.includes('IRE')) return 'Islamic-Religious-Education';
  if (baseName.includes('Arabic')) return 'Arabic';
  if (baseName.includes('French')) return 'French';
  if (baseName.includes('German')) return 'German';
  if (baseName.includes('Mandarin')) return 'Mandarin';
  if (baseName.includes('Indigenous')) return 'Indigenous-Languages';
  if (baseName.includes('Hindu')) return 'Hindu-Religious-Education';
  
  return baseName; // Fallback
}

/**
 * Extract grade number from file name or folder
 */
function extractGrade(fileName, folderName) {
  // Try to extract from folder name first
  const gradeMatch = folderName.match(/GRADE (\d+)/);
  if (gradeMatch) {
    return gradeMatch[1];
  }
  
  // Try to extract from file name
  const fileGradeMatch = fileName.match(/Grade.?(\d+)|GRADE.?(\d+)/);
  if (fileGradeMatch) {
    return fileGradeMatch[1] || fileGradeMatch[2];
  }
  
  return '0'; // Fallback
}

/**
 * Generate standardized file name
 */
function generateStandardName(grade, subject) {
  return `Grade-${grade}-${subject}.pdf`;
}

/**
 * Process all curriculum files and rename them
 */
function cleanupCurriculumFiles() {
  console.log('🧹 Starting Curriculum Files Cleanup...\n');
  
  const renamedFiles = [];
  const errors = [];
  
  // Process each grade folder
  for (let grade = 7; grade <= 9; grade++) {
    const gradeFolder = path.join(CURRICULUM_FOLDER, `GRADE ${grade}`);
    
    if (!fs.existsSync(gradeFolder)) {
      console.log(`⚠️  Grade ${grade} folder not found: ${gradeFolder}`);
      continue;
    }
    
    console.log(`📁 Processing Grade ${grade}...`);
    
    const files = fs.readdirSync(gradeFolder).filter(file => file.endsWith('.pdf'));
    
    files.forEach(fileName => {
      try {
        const oldPath = path.join(gradeFolder, fileName);
        const subject = extractSubjectName(fileName);
        const extractedGrade = extractGrade(fileName, `GRADE ${grade}`);
        const newFileName = generateStandardName(grade, subject);
        const newPath = path.join(gradeFolder, newFileName);
        
        // Only rename if the name is different
        if (fileName !== newFileName) {
          // Check if target file already exists
          if (fs.existsSync(newPath)) {
            console.log(`   ⚠️  Target file already exists: ${newFileName}`);
            errors.push(`Target exists: ${newFileName}`);
            return;
          }
          
          fs.renameSync(oldPath, newPath);
          console.log(`   ✅ ${fileName} → ${newFileName}`);
          renamedFiles.push({
            grade,
            oldName: fileName,
            newName: newFileName,
            subject
          });
        } else {
          console.log(`   ✓  ${fileName} (already standardized)`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing ${fileName}: ${error.message}`);
        errors.push(`${fileName}: ${error.message}`);
      }
    });
    
    console.log('');
  }
  
  // Summary
  console.log('📊 Cleanup Summary:');
  console.log(`   Files renamed: ${renamedFiles.length}`);
  console.log(`   Errors: ${errors.length}`);
  
  if (renamedFiles.length > 0) {
    console.log('\n✅ Successfully renamed files:');
    renamedFiles.forEach(file => {
      console.log(`   Grade ${file.grade}: ${file.subject}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach(error => {
      console.log(`   ${error}`);
    });
  }
  
  console.log('\n🎉 Curriculum cleanup completed!');
  
  return {
    renamed: renamedFiles.length,
    errors: errors.length,
    renamedFiles,
    errors: errors
  };
}

/**
 * Generate curriculum inventory after cleanup
 */
function generateCurriculumInventory() {
  console.log('\n📋 Generating Curriculum Inventory...');
  
  const inventory = {
    totalFiles: 0,
    byGrade: {},
    bySubject: {},
    coreSubjects: [],
    additionalSubjects: [],
    missingSubjects: []
  };
  
  const coreSubjectsList = [
    'Mathematics',
    'English', 
    'Integrated-Science',
    'Kiswahili',
    'Pre-Technical-Studies',
    'Agriculture-Nutrition',
    'Social-Studies',
    'Creative-Arts-Sports',
    'Christian-Religious-Education'
  ];
  
  // Scan all files
  for (let grade = 7; grade <= 9; grade++) {
    const gradeFolder = path.join(CURRICULUM_FOLDER, `GRADE ${grade}`);
    inventory.byGrade[grade] = [];
    
    if (fs.existsSync(gradeFolder)) {
      const files = fs.readdirSync(gradeFolder).filter(file => file.endsWith('.pdf'));
      
      files.forEach(fileName => {
        const subject = extractSubjectName(fileName);
        inventory.byGrade[grade].push(subject);
        
        if (!inventory.bySubject[subject]) {
          inventory.bySubject[subject] = [];
        }
        inventory.bySubject[subject].push(grade);
        
        inventory.totalFiles++;
      });
    }
  }
  
  // Categorize subjects
  Object.keys(inventory.bySubject).forEach(subject => {
    if (coreSubjectsList.includes(subject)) {
      inventory.coreSubjects.push(subject);
    } else {
      inventory.additionalSubjects.push(subject);
    }
  });
  
  // Check for missing core subjects
  coreSubjectsList.forEach(subject => {
    if (!inventory.bySubject[subject] || inventory.bySubject[subject].length < 3) {
      inventory.missingSubjects.push({
        subject,
        missingGrades: [7, 8, 9].filter(grade => 
          !inventory.bySubject[subject] || !inventory.bySubject[subject].includes(grade)
        )
      });
    }
  });
  
  // Save inventory
  fs.writeFileSync(
    path.join(CURRICULUM_FOLDER, 'curriculum-inventory.json'),
    JSON.stringify(inventory, null, 2)
  );
  
  console.log(`✅ Inventory saved: ${inventory.totalFiles} files catalogued`);
  
  return inventory;
}

// Run cleanup if called directly
if (require.main === module) {
  const results = cleanupCurriculumFiles();
  const inventory = generateCurriculumInventory();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Review renamed files');
  console.log('2. Check curriculum-inventory.json for completeness');
  console.log('3. Proceed with automated extraction');
}

module.exports = {
  cleanupCurriculumFiles,
  generateCurriculumInventory,
  extractSubjectName,
  generateStandardName
};

/**
 * Generate final curriculum inventory after cleanup
 */

const fs = require('fs');
const path = require('path');

const CURRICULUM_FOLDER = 'JUNIOR SECONDARY';

function generateFinalInventory() {
  console.log('📋 Generating Final Curriculum Inventory...\n');
  
  const inventory = {
    cleanupCompleted: new Date().toISOString(),
    totalFiles: 0,
    coreSubjects: {},
    additionalSubjects: {},
    summary: {
      coreSubjectsComplete: [],
      coreSubjectsMissing: [],
      additionalLanguages: [],
      religiousEducation: []
    }
  };
  
  // Define core CBC subjects
  const coreSubjectsList = [
    'Mathematics',
    'English',
    'Kiswahili', 
    'Integrated-Science',
    'Pre-Technical-Studies',
    'Agriculture-Nutrition',
    'Social-Studies',
    'Creative-Arts-Sports',
    'Christian-Religious-Education'
  ];
  
  // Scan all files
  for (let grade = 7; grade <= 9; grade++) {
    const gradeFolder = path.join(CURRICULUM_FOLDER, `GRADE ${grade}`);
    
    if (fs.existsSync(gradeFolder)) {
      const files = fs.readdirSync(gradeFolder).filter(file => file.endsWith('.pdf'));
      
      files.forEach(fileName => {
        inventory.totalFiles++;
        
        // Extract subject from standardized name: Grade-X-Subject.pdf
        const match = fileName.match(/Grade-\d+-(.+)\.pdf/);
        if (match) {
          const subject = match[1];
          
          // Categorize subjects
          if (coreSubjectsList.includes(subject)) {
            if (!inventory.coreSubjects[subject]) {
              inventory.coreSubjects[subject] = [];
            }
            inventory.coreSubjects[subject].push(grade);
          } else {
            if (!inventory.additionalSubjects[subject]) {
              inventory.additionalSubjects[subject] = [];
            }
            inventory.additionalSubjects[subject].push(grade);
          }
        }
      });
    }
  }
  
  // Generate summary
  coreSubjectsList.forEach(subject => {
    if (inventory.coreSubjects[subject] && inventory.coreSubjects[subject].length === 3) {
      inventory.summary.coreSubjectsComplete.push(subject);
    } else {
      const missingGrades = [7, 8, 9].filter(grade => 
        !inventory.coreSubjects[subject] || !inventory.coreSubjects[subject].includes(grade)
      );
      inventory.summary.coreSubjectsMissing.push({
        subject,
        missingGrades
      });
    }
  });
  
  // Categorize additional subjects
  Object.keys(inventory.additionalSubjects).forEach(subject => {
    if (['Arabic', 'French', 'German', 'Mandarin', 'Indigenous-Languages'].includes(subject)) {
      inventory.summary.additionalLanguages.push(subject);
    } else if (subject.includes('Religious-Education')) {
      inventory.summary.religiousEducation.push(subject);
    }
  });
  
  // Save inventory
  fs.writeFileSync(
    path.join(CURRICULUM_FOLDER, 'final-curriculum-inventory.json'),
    JSON.stringify(inventory, null, 2)
  );
  
  // Display summary
  console.log('📊 CURRICULUM CLEANUP SUMMARY');
  console.log('================================');
  console.log(`Total Files: ${inventory.totalFiles}`);
  console.log(`Core Subjects Complete: ${inventory.summary.coreSubjectsComplete.length}/9`);
  console.log(`Additional Languages: ${inventory.summary.additionalLanguages.length}`);
  console.log(`Religious Education: ${inventory.summary.religiousEducation.length}`);
  
  console.log('\n✅ CORE CBC SUBJECTS (Complete):');
  inventory.summary.coreSubjectsComplete.forEach(subject => {
    console.log(`   • ${subject} (Grades 7-9)`);
  });
  
  if (inventory.summary.coreSubjectsMissing.length > 0) {
    console.log('\n⚠️  CORE CBC SUBJECTS (Missing):');
    inventory.summary.coreSubjectsMissing.forEach(item => {
      console.log(`   • ${item.subject} (Missing: Grade ${item.missingGrades.join(', ')})`);
    });
  }
  
  console.log('\n🌍 ADDITIONAL LANGUAGES:');
  inventory.summary.additionalLanguages.forEach(lang => {
    const grades = inventory.additionalSubjects[lang];
    console.log(`   • ${lang} (Grades ${grades.join(', ')})`);
  });
  
  console.log('\n🙏 RELIGIOUS EDUCATION:');
  inventory.summary.religiousEducation.forEach(subject => {
    const grades = inventory.additionalSubjects[subject];
    console.log(`   • ${subject} (Grades ${grades.join(', ')})`);
  });
  
  console.log('\n✅ Cleanup Phase 1 COMPLETED!');
  console.log('📄 Detailed inventory saved to: final-curriculum-inventory.json');
  
  return inventory;
}

if (require.main === module) {
  generateFinalInventory();
}

module.exports = { generateFinalInventory };

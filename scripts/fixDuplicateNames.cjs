/**
 * Fix duplicate prefixes in curriculum file names
 */

const fs = require('fs');
const path = require('path');

const CURRICULUM_FOLDER = 'JUNIOR SECONDARY';

function fixDuplicateNames() {
  console.log('🔧 Fixing duplicate prefixes in file names...\n');
  
  let fixedCount = 0;
  
  for (let grade = 7; grade <= 9; grade++) {
    const gradeFolder = path.join(CURRICULUM_FOLDER, `GRADE ${grade}`);
    
    if (!fs.existsSync(gradeFolder)) continue;
    
    console.log(`📁 Processing Grade ${grade}...`);
    
    const files = fs.readdirSync(gradeFolder).filter(file => file.endsWith('.pdf'));
    
    files.forEach(fileName => {
      // Check for duplicate Grade-X-Grade-X pattern
      const duplicatePattern = new RegExp(`Grade-${grade}-Grade-${grade}-(.+)`);
      const match = fileName.match(duplicatePattern);
      
      if (match) {
        const correctName = `Grade-${grade}-${match[1]}`;
        const oldPath = path.join(gradeFolder, fileName);
        const newPath = path.join(gradeFolder, correctName);
        
        try {
          fs.renameSync(oldPath, newPath);
          console.log(`   ✅ ${fileName} → ${correctName}`);
          fixedCount++;
        } catch (error) {
          console.log(`   ❌ Error fixing ${fileName}: ${error.message}`);
        }
      }
    });
  }
  
  console.log(`\n✅ Fixed ${fixedCount} duplicate prefixes`);
  return fixedCount;
}

if (require.main === module) {
  fixDuplicateNames();
}

module.exports = { fixDuplicateNames };

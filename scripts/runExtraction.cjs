/**
 * Run Curriculum Extraction
 * Simple script to execute the PDF extraction process
 */

const { spawn } = require('child_process');
const path = require('path');

async function runExtraction() {
  console.log('🚀 Starting Phase 2: Automated Curriculum Extraction...\n');
  
  try {
    // Run the TypeScript extraction service
    const tsNode = spawn('npx', ['ts-node', 'services/curriculumExtractor.ts'], {
      stdio: 'inherit',
      shell: true
    });
    
    tsNode.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Extraction completed successfully!');
      } else {
        console.log(`\n❌ Extraction failed with code ${code}`);
      }
    });
    
    tsNode.on('error', (error) => {
      console.error('❌ Failed to start extraction:', error);
    });
    
  } catch (error) {
    console.error('❌ Extraction error:', error);
  }
}

if (require.main === module) {
  runExtraction();
}

module.exports = { runExtraction };

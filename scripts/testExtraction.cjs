/**
 * Test PDF Extraction
 * Test the extraction on a single file first
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function testSinglePDF() {
  console.log('🧪 Testing PDF Extraction on a single file...\n');
  
  try {
    // Test with Grade 7 Mathematics (should be a core subject)
    const testFile = path.join('JUNIOR SECONDARY', 'GRADE 7', 'Grade-7-Mathematics.pdf');
    
    if (!fs.existsSync(testFile)) {
      console.log('❌ Test file not found:', testFile);
      return;
    }
    
    console.log('📄 Testing file:', testFile);
    
    // Read PDF
    const pdfBuffer = fs.readFileSync(testFile);
    console.log('✅ PDF file read successfully');
    
    // Extract text
    console.log('🔄 Extracting text from PDF...');
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log(`📊 Extraction Results:`);
    console.log(`   Pages: ${pdfData.numpages}`);
    console.log(`   Characters: ${pdfData.text.length}`);
    console.log(`   First 200 characters: "${pdfData.text.substring(0, 200)}..."`);
    
    // Save sample text for inspection
    const sampleFile = 'sample-extracted-text.txt';
    fs.writeFileSync(sampleFile, pdfData.text);
    console.log(`✅ Sample text saved to: ${sampleFile}`);
    
    // Basic parsing test
    const lines = pdfData.text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log(`📝 Text lines: ${lines.length}`);
    
    // Look for curriculum keywords
    const keywords = ['strand', 'learning outcome', 'competenc', 'assessment'];
    const foundKeywords = keywords.filter(keyword => 
      pdfData.text.toLowerCase().includes(keyword)
    );
    
    console.log(`🔍 Found curriculum keywords: ${foundKeywords.join(', ')}`);
    
    console.log('\n✅ PDF extraction test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testSinglePDF();
}

module.exports = { testSinglePDF };

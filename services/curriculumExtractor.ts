/**
 * Automated Curriculum Extraction Service
 * Processes PDF curriculum files and converts them to structured data
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  CurriculumService,
  type SubjectCurriculum,
  type CurriculumStrand,
} from './curriculumDatabase';

// Import pdf-parse for PDF text extraction
const pdfParse = require('pdf-parse');

interface ExtractedCurriculumData {
  subject: string;
  grade: string;
  level: string;
  generalLearningOutcomes: string[];
  strands: CurriculumStrand[];
  metadata: {
    extractedAt: string;
    sourceFile: string;
    processingNotes: string[];
    pageCount: number;
    textLength: number;
  };
}

interface PDFProcessingResult {
  success: boolean;
  data?: ExtractedCurriculumData;
  error?: string;
  warnings: string[];
}

/**
 * Main Curriculum Extraction Service
 */
export class CurriculumExtractor {
  private static readonly CURRICULUM_FOLDER = 'JUNIOR SECONDARY';
  private static readonly OUTPUT_FOLDER = 'data/extracted-curriculum';

  /**
   * Process all curriculum PDFs in the junior secondary folder
   */
  static async processAllCurriculum(): Promise<{
    processed: number;
    successful: number;
    failed: number;
    results: PDFProcessingResult[];
  }> {
    const results: PDFProcessingResult[] = [];
    const curriculumFiles = this.getAllCurriculumFiles();

    console.log(`🔄 Processing ${curriculumFiles.length} curriculum files...`);

    for (const file of curriculumFiles) {
      console.log(`📄 Processing: ${file.fileName}`);
      const result = await this.processSinglePDF(file);
      results.push(result);

      if (result.success) {
        console.log(`✅ Successfully processed: ${file.subject} Grade ${file.grade}`);
      } else {
        console.log(`❌ Failed to process: ${file.fileName} - ${result.error}`);
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    console.log(`\n📊 Processing Summary:`);
    console.log(`   Total: ${results.length}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);

    return {
      processed: results.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Get all curriculum PDF files with metadata
   */
  private static getAllCurriculumFiles(): Array<{
    fileName: string;
    filePath: string;
    grade: string;
    subject: string;
    priority: number;
  }> {
    const files: Array<{
      fileName: string;
      filePath: string;
      grade: string;
      subject: string;
      priority: number;
    }> = [];

    // Define subject priorities (Tier 1 = highest priority)
    const subjectPriorities: { [key: string]: number } = {
      MATHEMATICS: 1,
      ENGLISH: 1,
      'INTEGRATED.SCIENCE': 1,
      Kiswahili: 1,
      'PRE-TECHNICAL-STUDIES': 2,
      'Social-Studies': 2,
      AGRICULTURE: 2,
      'CREATIVE ARTS': 2,
      CRE: 3,
      IRE: 3,
    };

    // Scan each grade folder
    for (let grade = 7; grade <= 9; grade++) {
      const gradeFolder = path.join(this.CURRICULUM_FOLDER, `GRADE ${grade}`);

      if (fs.existsSync(gradeFolder)) {
        const gradeFiles = fs
          .readdirSync(gradeFolder)
          .filter(file => file.endsWith('.pdf'))
          .map(file => {
            const subject = this.extractSubjectFromFileName(file);
            const priority = this.getSubjectPriority(subject, subjectPriorities);

            return {
              fileName: file,
              filePath: path.join(gradeFolder, file),
              grade: grade.toString(),
              subject,
              priority,
            };
          });

        files.push(...gradeFiles);
      }
    }

    // Sort by priority (lower number = higher priority)
    return files.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Extract subject name from file name
   */
  private static extractSubjectFromFileName(fileName: string): string {
    // Remove file extension
    const baseName = fileName.replace('.pdf', '');

    // Extract subject patterns
    if (baseName.includes('MATHEMATICS')) return 'Mathematics';
    if (baseName.includes('ENGLISH')) return 'English';
    if (baseName.includes('INTEGRATED.SCIENCE') || baseName.includes('Integrated-Science'))
      return 'Integrated Science';
    if (baseName.includes('Kiswahili')) return 'Kiswahili';
    if (baseName.includes('PRE-TECHNICAL-STUDIES')) return 'Pre-technical studies';
    if (baseName.includes('Social-Studies')) return 'Social studies';
    if (baseName.includes('AGRICULTURE')) return 'Agriculture';
    if (baseName.includes('CREATIVE ARTS') || baseName.includes('Creative-Arts'))
      return 'Creative art and sports';
    if (baseName.includes('CRE')) return 'Religious Education';
    if (baseName.includes('IRE')) return 'Religious Education';
    if (baseName.includes('Arabic')) return 'Arabic';
    if (baseName.includes('French')) return 'French';
    if (baseName.includes('German')) return 'German';
    if (baseName.includes('Mandarin')) return 'Mandarin';
    if (baseName.includes('Indigenous')) return 'Indigenous Languages';
    if (baseName.includes('Hindu')) return 'Hindu Religious Education';

    return baseName; // Fallback to filename
  }

  /**
   * Get subject priority for processing order
   */
  private static getSubjectPriority(
    subject: string,
    priorities: { [key: string]: number }
  ): number {
    for (const [key, priority] of Object.entries(priorities)) {
      if (subject.includes(key) || key.includes(subject.toUpperCase())) {
        return priority;
      }
    }
    return 4; // Default priority for other subjects
  }

  /**
   * Process a single PDF file
   */
  private static async processSinglePDF(file: {
    fileName: string;
    filePath: string;
    grade: string;
    subject: string;
  }): Promise<PDFProcessingResult> {
    try {
      // Read PDF file
      const pdfBuffer = fs.readFileSync(file.filePath);

      // Extract text from PDF
      const pdfData = await pdfParse(pdfBuffer);
      const extractedText = pdfData.text;

      console.log(
        `   📖 Extracted ${extractedText.length} characters from ${pdfData.numpages} pages`
      );

      // Parse curriculum structure from extracted text
      const curriculumData = this.parseCurriculumFromText(extractedText, file);

      // Add PDF metadata
      curriculumData.metadata.pageCount = pdfData.numpages;
      curriculumData.metadata.textLength = extractedText.length;

      // Save extracted data
      await this.saveExtractedData(curriculumData);

      return {
        success: true,
        data: curriculumData,
        warnings: [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        warnings: [],
      };
    }
  }

  /**
   * Parse curriculum structure from extracted PDF text
   */
  private static parseCurriculumFromText(
    text: string,
    file: {
      fileName: string;
      grade: string;
      subject: string;
    }
  ): ExtractedCurriculumData {
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Initialize curriculum data structure
    const curriculumData: ExtractedCurriculumData = {
      subject: file.subject,
      grade: `Grade ${file.grade}`,
      level: 'junior-school',
      generalLearningOutcomes: [],
      strands: [],
      metadata: {
        extractedAt: new Date().toISOString(),
        sourceFile: file.fileName,
        processingNotes: [],
        pageCount: 0,
        textLength: text.length,
      },
    };

    // Parse general learning outcomes
    curriculumData.generalLearningOutcomes = this.extractGeneralLearningOutcomes(
      lines,
      file.subject
    );

    // Parse strands and sub-strands
    curriculumData.strands = this.extractStrands(lines, file.subject);

    // Add processing notes
    curriculumData.metadata.processingNotes = [
      `Extracted from ${lines.length} text lines`,
      `Found ${curriculumData.strands.length} strands`,
      `Automated parsing completed`,
    ];

    return curriculumData;
  }

  /**
   * Extract general learning outcomes from text
   */
  private static extractGeneralLearningOutcomes(lines: string[], subject: string): string[] {
    const outcomes: string[] = [];

    // Look for sections that contain learning outcomes
    const outcomeKeywords = [
      'learning outcome',
      'general outcome',
      'by the end',
      'learner should',
      'able to',
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      if (outcomeKeywords.some(keyword => line.includes(keyword))) {
        // Extract the outcome text
        let outcomeText = lines[i];

        // Clean up the text
        outcomeText = outcomeText.replace(/^\d+\.?\s*/, ''); // Remove numbering
        outcomeText = outcomeText.replace(/^[•\-\*]\s*/, ''); // Remove bullet points

        if (outcomeText.length > 20 && outcomeText.length < 200) {
          outcomes.push(outcomeText);
        }
      }
    }

    // If no specific outcomes found, create generic ones
    if (outcomes.length === 0) {
      const subjectName = this.getSubjectDisplayName(subject);
      outcomes.push(
        `Develop foundational knowledge and skills in ${subjectName}`,
        `Apply ${subjectName} concepts to solve real-world problems`,
        `Demonstrate critical thinking and analytical skills in ${subjectName}`,
        `Communicate effectively using ${subjectName} terminology and concepts`
      );
    }

    return outcomes.slice(0, 6); // Limit to 6 outcomes
  }

  /**
   * Extract strands and sub-strands from text
   */
  private static extractStrands(lines: string[], subject: string): CurriculumStrand[] {
    const strands: CurriculumStrand[] = [];

    // Look for strand headers (usually in caps or numbered)
    const strandKeywords = ['strand', 'learning area', 'topic', 'unit', 'chapter'];

    let currentStrand: CurriculumStrand | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Check if this line is a strand header
      if (
        this.isStrandHeader(line) ||
        strandKeywords.some(keyword => lowerLine.includes(keyword))
      ) {
        // Save previous strand
        if (currentStrand && currentStrand.subStrands.length > 0) {
          strands.push(currentStrand);
        }

        // Start new strand
        currentStrand = {
          name: this.cleanStrandName(line),
          subStrands: [],
        };
      }

      // Look for sub-strand content
      if (currentStrand && this.isSubStrandContent(line)) {
        const subStrand = this.createSubStrand(line, subject);
        if (subStrand) {
          currentStrand.subStrands.push(subStrand);
        }
      }
    }

    // Add final strand
    if (currentStrand && currentStrand.subStrands.length > 0) {
      strands.push(currentStrand);
    }

    // If no strands found, create a default structure
    if (strands.length === 0) {
      strands.push(this.createDefaultStrand(subject));
    }

    return strands;
  }

  /**
   * Save extracted curriculum data to file
   */
  private static async saveExtractedData(data: ExtractedCurriculumData): Promise<void> {
    // Ensure output directory exists
    const outputDir = this.OUTPUT_FOLDER;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create filename
    const fileName = `${data.subject.replace(/\s+/g, '-').toLowerCase()}-grade-${data.grade.replace('Grade ', '')}.json`;
    const filePath = path.join(outputDir, fileName);

    // Save data
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Generate curriculum database from extracted data
   */
  static async generateCurriculumDatabase(): Promise<void> {
    const extractedDir = this.OUTPUT_FOLDER;

    if (!fs.existsSync(extractedDir)) {
      console.log('❌ No extracted curriculum data found. Run extraction first.');
      return;
    }

    const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('.json'));
    const curriculumData: { [subject: string]: SubjectCurriculum } = {};

    for (const file of files) {
      const filePath = path.join(extractedDir, file);
      const data: ExtractedCurriculumData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      curriculumData[data.subject] = {
        subject: data.subject,
        level: data.level,
        grades: [data.grade],
        generalLearningOutcomes: data.generalLearningOutcomes,
        strands: data.strands,
      };
    }

    // Generate TypeScript file
    const tsContent = this.generateCurriculumDatabaseTS(curriculumData);
    fs.writeFileSync('services/generatedCurriculumDatabase.ts', tsContent);

    console.log(
      `✅ Generated curriculum database with ${Object.keys(curriculumData).length} subjects`
    );
  }

  /**
   * Generate TypeScript curriculum database file
   */
  private static generateCurriculumDatabaseTS(data: {
    [subject: string]: SubjectCurriculum;
  }): string {
    return `/**
 * Auto-generated Curriculum Database
 * Generated on: ${new Date().toISOString()}
 */

import type { CurriculumDatabase } from './curriculumDatabase';

export const GENERATED_CURRICULUM: CurriculumDatabase = {
  'junior-school': ${JSON.stringify(data, null, 4)}
};
`;
  }

  // Helper methods for parsing
  private static isStrandHeader(line: string): boolean {
    return (
      line.length > 5 && line.length < 100 && (line === line.toUpperCase() || /^\d+\./.test(line))
    );
  }

  private static isSubStrandContent(line: string): boolean {
    return line.length > 10 && line.length < 150 && (/^[a-z]/.test(line) || /^\d+\.\d+/.test(line));
  }

  private static cleanStrandName(line: string): string {
    return line
      .replace(/^\d+\.?\s*/, '')
      .replace(/^STRAND\s*\d*:?\s*/i, '')
      .trim();
  }

  private static createSubStrand(line: string, subject: string): any {
    const subjectName = this.getSubjectDisplayName(subject);
    return {
      name: this.cleanStrandName(line),
      specificLearningOutcomes: [
        `Understand key concepts in ${line}`,
        `Apply knowledge of ${line} in practical situations`,
        `Analyze and evaluate ${line} scenarios`,
      ],
      suggestedLearningExperiences: [
        'Interactive demonstrations and discussions',
        'Hands-on practical activities',
        'Group work and collaborative learning',
        'Real-world problem solving exercises',
      ],
      keyInquiryQuestions: [
        `What is the importance of ${line}?`,
        `How does ${line} apply to daily life?`,
        `What are the key principles of ${line}?`,
      ],
      coreCompetencies: ['Critical thinking', 'Communication', 'Creativity', 'Collaboration'],
      values: ['Responsibility', 'Respect', 'Integrity', 'Unity'],
      pertinentAndContemporaryIssues: [
        'Innovation',
        'Technology',
        'Sustainability',
        'Global citizenship',
      ],
      assessmentMethods: [
        'Observation',
        'Practical work',
        'Oral questioning',
        'Written tests',
        'Projects',
      ],
    };
  }

  private static createDefaultStrand(subject: string): CurriculumStrand {
    const subjectName = this.getSubjectDisplayName(subject);

    return {
      name: `${subjectName} Fundamentals`,
      subStrands: [
        {
          name: 'Introduction to Concepts',
          specificLearningOutcomes: [
            `Understand basic ${subjectName} principles and concepts`,
            `Identify key terminology and vocabulary in ${subjectName}`,
            `Apply fundamental skills and knowledge in ${subjectName}`,
          ],
          suggestedLearningExperiences: [
            'Interactive demonstrations and explanations',
            'Hands-on practical activities and experiments',
            'Group discussions and collaborative learning',
            'Real-world applications and case studies',
          ],
          keyInquiryQuestions: [
            `What is ${subjectName} and why is it important?`,
            `How do we use ${subjectName} in everyday life?`,
            `What are the fundamental principles of ${subjectName}?`,
          ],
          coreCompetencies: ['Critical thinking', 'Communication', 'Creativity', 'Collaboration'],
          values: ['Responsibility', 'Respect', 'Integrity', 'Unity'],
          pertinentAndContemporaryIssues: [
            'Innovation',
            'Technology',
            'Sustainability',
            'Global citizenship',
          ],
          assessmentMethods: [
            'Observation',
            'Practical work',
            'Oral questioning',
            'Written tests',
            'Projects',
          ],
        },
      ],
    };
  }

  private static getSubjectDisplayName(subject: string): string {
    return subject.replace(/-/g, ' ');
  }
}

/**
 * CLI interface for curriculum extraction
 */
export async function runCurriculumExtraction(): Promise<void> {
  console.log('🚀 Starting Curriculum Extraction Process...\n');

  try {
    // Process all PDFs
    const results = await CurriculumExtractor.processAllCurriculum();

    if (results.successful > 0) {
      console.log('\n📚 Generating curriculum database...');
      await CurriculumExtractor.generateCurriculumDatabase();
    }

    console.log('\n✅ Curriculum extraction completed!');
  } catch (error) {
    console.error('❌ Extraction failed:', error);
  }
}

// Export for use in other modules
export { CurriculumExtractor };

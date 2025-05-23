/**
 * Download Service for AI Lesson Planner
 * Handles PDF and Word document generation and downloads
 */

import type { SchemeOfWorkEntry, LessonPlan } from '../types';

// Import libraries directly
import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';

export class DownloadService {
  /**
   * Generate and download PDF of lesson plan
   */
  static async downloadPDF(
    schemeOfWork: SchemeOfWorkEntry | null,
    lessonPlan: LessonPlan | null
  ): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (
        text: string,
        fontSize: number = 10,
        isBold: boolean = false,
        isTitle: boolean = false
      ) => {
        if (isTitle) {
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFontSize(fontSize);
          pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        }

        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);

        // Check if we need a new page
        if (yPosition + lines.length * fontSize * 0.5 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });

        yPosition += 5; // Add some spacing
      };

      // Title
      addText('AI LESSON PLANNER - GENERATED CONTENT', 16, true, true);
      yPosition += 10;

      // Scheme of Work
      if (schemeOfWork) {
        addText('SCHEME OF WORK ENTRY', 14, true);
        addText(`Week: ${schemeOfWork.wk} | Lesson: ${schemeOfWork.lsn}`);
        addText(`Strand: ${schemeOfWork.strand}`);
        addText(`Sub-Strand: ${schemeOfWork.subStrand}`);
        addText(`Learning Outcomes: ${schemeOfWork.specificLearningOutcomes}`);
        addText(`Key Inquiry Questions: ${schemeOfWork.keyInquiryQuestions}`);
        addText(`Learning Experiences: ${schemeOfWork.learningExperiences}`);
        addText(`Learning Resources: ${schemeOfWork.learningResources}`);
        addText(`Assessment Methods: ${schemeOfWork.assessmentMethods}`);
        if (schemeOfWork.refl) {
          addText(`Reflection: ${schemeOfWork.refl}`);
        }
        yPosition += 10;
      }

      // Lesson Plan
      if (lessonPlan) {
        addText('LESSON PLAN', 14, true);
        addText(`School: ${lessonPlan.school}`);
        addText(`Level: ${lessonPlan.level} | Learning Area: ${lessonPlan.learningArea}`);
        addText(`Date: ${lessonPlan.date} | Time: ${lessonPlan.time} | Roll: ${lessonPlan.roll}`);
        addText(`Strand: ${lessonPlan.strand}`);
        addText(`Sub-Strand: ${lessonPlan.subStrand}`);

        yPosition += 5;
        addText('Specific Learning Outcomes:', 11, true);
        if (Array.isArray(lessonPlan.specificLearningOutcomes)) {
          lessonPlan.specificLearningOutcomes.forEach(outcome => addText(`• ${outcome}`));
        } else {
          addText(`• ${lessonPlan.specificLearningOutcomes}`);
        }

        addText('Key Inquiry Questions:', 11, true);
        if (Array.isArray(lessonPlan.keyInquiryQuestions)) {
          lessonPlan.keyInquiryQuestions.forEach(question => addText(`• ${question}`));
        } else {
          addText(`• ${lessonPlan.keyInquiryQuestions}`);
        }

        addText('Learning Resources:', 11, true);
        if (Array.isArray(lessonPlan.learningResources)) {
          lessonPlan.learningResources.forEach(resource => addText(`• ${resource}`));
        } else {
          addText(`• ${lessonPlan.learningResources}`);
        }

        yPosition += 5;
        addText('ORGANISATION OF LEARNING', 12, true);
        addText('Introduction (5 minutes):', 11, true);
        addText(lessonPlan.organisationOfLearning.introduction);

        addText('Lesson Development (30 minutes):', 11, true);
        addText(lessonPlan.organisationOfLearning.lessonDevelopment);

        addText('Conclusion (5 minutes):', 11, true);
        addText(lessonPlan.organisationOfLearning.conclusion);

        if (lessonPlan.extendedActivities && lessonPlan.extendedActivities.length > 0) {
          addText('Extended Activities:', 11, true);
          lessonPlan.extendedActivities.forEach(activity => addText(`• ${activity}`));
        }

        addText('Teacher Self-Evaluation:', 11, true);
        addText(lessonPlan.teacherSelfEvaluation);
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `lesson-plan-${timestamp}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Generate and download Word document of lesson plan
   */
  static async downloadWord(
    schemeOfWork: SchemeOfWorkEntry | null,
    lessonPlan: LessonPlan | null
  ): Promise<void> {
    try {
      console.log('🔄 Starting Word document generation...');
      console.log('SchemeOfWork:', !!schemeOfWork);
      console.log('LessonPlan:', !!lessonPlan);

      // Test if docx library is available
      console.log('📚 Testing docx library availability...');
      console.log('Document:', typeof Document);
      console.log('Packer:', typeof Packer);
      console.log('saveAs:', typeof saveAs);

      // Create a simple document first to test
      console.log('📝 Creating simple test document...');
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Simple title
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'AI LESSON PLANNER - GENERATED CONTENT',
                    bold: true,
                    size: 32,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),

              new Paragraph({ text: '' }), // Empty line

              // Simple content
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'This is a test document to verify Word generation is working.',
                    size: 24,
                  }),
                ],
              }),

              new Paragraph({ text: '' }), // Empty line

              // Add basic lesson plan info if available
              ...(lessonPlan
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'School: ', bold: true }),
                        new TextRun({ text: lessonPlan.school || 'Not specified' }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'Subject: ', bold: true }),
                        new TextRun({ text: lessonPlan.learningArea || 'Not specified' }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'Level: ', bold: true }),
                        new TextRun({ text: lessonPlan.level || 'Not specified' }),
                      ],
                    }),
                  ]
                : [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'No lesson plan data available for this test.' }),
                      ],
                    }),
                  ]),
            ],
          },
        ],
      });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `lesson-plan-${timestamp}.docx`;

      console.log('📄 Generating Word document buffer...');

      // Generate and save the document
      const buffer = await Packer.toBuffer(doc);
      console.log('✅ Buffer generated successfully, size:', buffer.byteLength);

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      console.log('📦 Blob created, starting download...');

      saveAs(blob, filename);
      console.log('🎉 Word document download initiated:', filename);
    } catch (error) {
      console.error('❌ Error generating Word document:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // More specific error message
      if (error instanceof Error) {
        if (error.message.includes('Packer')) {
          throw new Error(
            'Word document generation failed: Document packer error. Please try again.'
          );
        } else if (error.message.includes('saveAs')) {
          throw new Error(
            'Word document generation failed: Download error. Please check your browser settings.'
          );
        } else {
          throw new Error(`Word document generation failed: ${error.message}`);
        }
      } else {
        throw new Error('Failed to generate Word document. Please try again.');
      }
    }
  }
}

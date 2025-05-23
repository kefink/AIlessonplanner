/**
 * Curriculum Service for AI Lesson Planner
 * Handles dynamic loading and management of curriculum data
 */

import type { CurriculumSnippet, GenerationParams } from '../types';

interface CurriculumDatabase {
  metadata: {
    version: string;
    lastUpdated: string;
    totalEntries: number;
  };
  curriculum: CurriculumSnippet[];
}

class CurriculumService {
  private curriculumData: CurriculumDatabase | null = null;
  private initialized = false;

  /**
   * Initialize the curriculum service with data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try to load processed curriculum data
      const response = await fetch('/data/curriculum/processed-curriculum.json');
      if (response.ok) {
        this.curriculumData = await response.json();
        console.log(`Loaded ${this.curriculumData?.curriculum.length || 0} curriculum entries`);
      } else {
        // Fallback to sample data
        await this.loadSampleData();
      }
    } catch (error) {
      console.warn('Failed to load curriculum data, using sample data:', error);
      await this.loadSampleData();
    }

    this.initialized = true;
  }

  /**
   * Load sample curriculum data as fallback
   */
  private async loadSampleData(): Promise<void> {
    this.curriculumData = {
      metadata: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        totalEntries: 1
      },
      curriculum: [
        {
          grade: "Grade 9",
          subject: "Pre-Technical Studies",
          strand: "FOUNDATIONS OF PRE-TECHNICAL STUDIES",
          subStrand: "Safety on Raised Platforms - types of raised platforms (ladders & trestles)",
          specificLearningOutcomes: [
            "Identify types of raised platforms used in performing tasks.",
            "Explore the use of ladders and trestles.",
            "Appreciate working with raised platforms."
          ],
          keyInquiryQuestions: [
            "What is the importance of observing safety when working on raised platforms?"
          ],
          learningExperiences: [
            "The learner is guided to walk around the school to explore types of raised platforms (ladders, trestles).",
            "The learner is guided to brainstorm on the types of raised platforms used in day-to-day life."
          ],
          learningResources: [
            "Raised platforms (actual or pictures)",
            "Video clips and visual aids demonstrating use of ladders and trestles",
            "Personal protective equipment (PPEs) relevant to working on raised platforms",
            "Distinction Pretech. Studies Grade 9 P.B. Pg.1-4"
          ],
          assessmentMethods: [
            "Oral questioning on types and uses of ladders/trestles.",
            "Observation of learner participation in discussions and activities.",
            "Checklist for identifying safety aspects.",
            "Short written quiz on platform types and safety.",
            "Rubrics for practical demonstration (if applicable).",
            "Practical work involving safe setup/use (simulated if needed)."
          ]
        }
      ]
    };
  }

  /**
   * Find curriculum data matching the given parameters
   */
  async findCurriculum(params: GenerationParams): Promise<CurriculumSnippet | null> {
    await this.initialize();

    if (!this.curriculumData?.curriculum) {
      return null;
    }

    // Try exact match first
    let match = this.curriculumData.curriculum.find(entry => 
      entry.grade === params.grade &&
      entry.subject === params.subject &&
      (entry as any).term === params.term &&
      (entry as any).week === params.week &&
      (entry as any).lesson === params.lesson
    );

    if (match) {
      return match;
    }

    // Try partial match (grade and subject)
    match = this.curriculumData.curriculum.find(entry => 
      entry.grade === params.grade &&
      entry.subject === params.subject
    );

    if (match) {
      console.warn(`Using partial match for ${params.grade} ${params.subject}`);
      return match;
    }

    // Try subject only
    match = this.curriculumData.curriculum.find(entry => 
      entry.subject === params.subject
    );

    if (match) {
      console.warn(`Using subject-only match for ${params.subject}`);
      return match;
    }

    return null;
  }

  /**
   * Get all available grades
   */
  async getAvailableGrades(): Promise<string[]> {
    await this.initialize();
    
    if (!this.curriculumData?.curriculum) {
      return ['Grade 9'];
    }

    const grades = [...new Set(this.curriculumData.curriculum.map(entry => entry.grade))];
    return grades.sort();
  }

  /**
   * Get all available subjects for a grade
   */
  async getAvailableSubjects(grade: string): Promise<string[]> {
    await this.initialize();
    
    if (!this.curriculumData?.curriculum) {
      return ['Pre-Technical Studies'];
    }

    const subjects = [...new Set(
      this.curriculumData.curriculum
        .filter(entry => entry.grade === grade)
        .map(entry => entry.subject)
    )];
    
    return subjects.sort();
  }

  /**
   * Get curriculum statistics
   */
  async getStatistics(): Promise<{
    totalEntries: number;
    grades: number;
    subjects: number;
    lastUpdated: string;
  }> {
    await this.initialize();
    
    if (!this.curriculumData?.curriculum) {
      return {
        totalEntries: 0,
        grades: 0,
        subjects: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const grades = new Set(this.curriculumData.curriculum.map(entry => entry.grade));
    const subjects = new Set(this.curriculumData.curriculum.map(entry => entry.subject));

    return {
      totalEntries: this.curriculumData.curriculum.length,
      grades: grades.size,
      subjects: subjects.size,
      lastUpdated: this.curriculumData.metadata.lastUpdated
    };
  }

  /**
   * Add new curriculum entry
   */
  async addCurriculumEntry(entry: CurriculumSnippet): Promise<void> {
    await this.initialize();
    
    if (!this.curriculumData) {
      await this.loadSampleData();
    }

    this.curriculumData!.curriculum.push(entry);
    this.curriculumData!.metadata.totalEntries = this.curriculumData!.curriculum.length;
    this.curriculumData!.metadata.lastUpdated = new Date().toISOString();
  }

  /**
   * Export curriculum data
   */
  async exportData(): Promise<CurriculumDatabase | null> {
    await this.initialize();
    return this.curriculumData;
  }

  /**
   * Reload curriculum data
   */
  async reload(): Promise<void> {
    this.initialized = false;
    this.curriculumData = null;
    await this.initialize();
  }
}

// Export singleton instance
export const curriculumService = new CurriculumService();

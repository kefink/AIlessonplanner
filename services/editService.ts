/**
 * Edit Service for AI Lesson Planner
 * Handles editing functionality for generated lesson plans
 */

import type { SchemeOfWorkEntry, LessonPlan } from '../types';

export interface EditableData {
  schemeOfWork: SchemeOfWorkEntry | null;
  lessonPlan: LessonPlan | null;
}

export class EditService {
  /**
   * Create an editable copy of the lesson plan data
   */
  static createEditableCopy(data: EditableData): EditableData {
    return {
      schemeOfWork: data.schemeOfWork ? { ...data.schemeOfWork } : null,
      lessonPlan: data.lessonPlan ? { 
        ...data.lessonPlan,
        organisationOfLearning: { ...data.lessonPlan.organisationOfLearning },
        specificLearningOutcomes: Array.isArray(data.lessonPlan.specificLearningOutcomes) 
          ? [...data.lessonPlan.specificLearningOutcomes]
          : data.lessonPlan.specificLearningOutcomes,
        keyInquiryQuestions: Array.isArray(data.lessonPlan.keyInquiryQuestions)
          ? [...data.lessonPlan.keyInquiryQuestions]
          : data.lessonPlan.keyInquiryQuestions,
        learningResources: Array.isArray(data.lessonPlan.learningResources)
          ? [...data.lessonPlan.learningResources]
          : data.lessonPlan.learningResources,
        extendedActivities: Array.isArray(data.lessonPlan.extendedActivities)
          ? [...data.lessonPlan.extendedActivities]
          : data.lessonPlan.extendedActivities
      } : null
    };
  }

  /**
   * Validate edited data
   */
  static validateEditedData(data: EditableData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate Scheme of Work
    if (data.schemeOfWork) {
      if (!data.schemeOfWork.wk?.trim()) {
        errors.push('Week is required in Scheme of Work');
      }
      if (!data.schemeOfWork.lsn?.trim()) {
        errors.push('Lesson number is required in Scheme of Work');
      }
      if (!data.schemeOfWork.strand?.trim()) {
        errors.push('Strand is required in Scheme of Work');
      }
      if (!data.schemeOfWork.subStrand?.trim()) {
        errors.push('Sub-strand is required in Scheme of Work');
      }
    }

    // Validate Lesson Plan
    if (data.lessonPlan) {
      if (!data.lessonPlan.school?.trim()) {
        errors.push('School name is required in Lesson Plan');
      }
      if (!data.lessonPlan.level?.trim()) {
        errors.push('Level is required in Lesson Plan');
      }
      if (!data.lessonPlan.learningArea?.trim()) {
        errors.push('Learning Area is required in Lesson Plan');
      }
      if (!data.lessonPlan.time?.trim()) {
        errors.push('Time duration is required in Lesson Plan');
      }
      if (!data.lessonPlan.organisationOfLearning?.introduction?.trim()) {
        errors.push('Introduction is required in Organisation of Learning');
      }
      if (!data.lessonPlan.organisationOfLearning?.lessonDevelopment?.trim()) {
        errors.push('Lesson Development is required in Organisation of Learning');
      }
      if (!data.lessonPlan.organisationOfLearning?.conclusion?.trim()) {
        errors.push('Conclusion is required in Organisation of Learning');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert array fields to strings for editing
   */
  static arrayToString(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value.join('\n• ');
    }
    return value || '';
  }

  /**
   * Convert string fields back to arrays
   */
  static stringToArray(value: string): string[] {
    if (!value.trim()) return [];
    
    // Split by bullet points or newlines
    return value
      .split(/\n•|\n-|\n\*|\n/)
      .map(item => item.replace(/^[•\-\*]\s*/, '').trim())
      .filter(item => item.length > 0);
  }

  /**
   * Format text for better readability
   */
  static formatText(text: string): string {
    if (!text) return '';
    
    // Clean up extra whitespace and normalize line breaks
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Auto-save functionality (localStorage)
   */
  static saveToLocalStorage(data: EditableData, key: string = 'lessonPlanEdit'): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  static loadFromLocalStorage(key: string = 'lessonPlanEdit'): EditableData | null {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear localStorage
   */
  static clearLocalStorage(key: string = 'lessonPlanEdit'): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * Generate a summary of changes
   */
  static generateChangesSummary(original: EditableData, edited: EditableData): string[] {
    const changes: string[] = [];

    // Compare Scheme of Work
    if (original.schemeOfWork && edited.schemeOfWork) {
      const sow = original.schemeOfWork;
      const editedSow = edited.schemeOfWork;

      if (sow.wk !== editedSow.wk) changes.push(`Week changed from "${sow.wk}" to "${editedSow.wk}"`);
      if (sow.lsn !== editedSow.lsn) changes.push(`Lesson changed from "${sow.lsn}" to "${editedSow.lsn}"`);
      if (sow.strand !== editedSow.strand) changes.push('Strand was modified');
      if (sow.subStrand !== editedSow.subStrand) changes.push('Sub-strand was modified');
      if (sow.specificLearningOutcomes !== editedSow.specificLearningOutcomes) changes.push('Learning outcomes were modified');
      if (sow.keyInquiryQuestions !== editedSow.keyInquiryQuestions) changes.push('Inquiry questions were modified');
      if (sow.learningExperiences !== editedSow.learningExperiences) changes.push('Learning experiences were modified');
      if (sow.learningResources !== editedSow.learningResources) changes.push('Learning resources were modified');
      if (sow.assessmentMethods !== editedSow.assessmentMethods) changes.push('Assessment methods were modified');
    }

    // Compare Lesson Plan
    if (original.lessonPlan && edited.lessonPlan) {
      const lp = original.lessonPlan;
      const editedLp = edited.lessonPlan;

      if (lp.school !== editedLp.school) changes.push(`School changed from "${lp.school}" to "${editedLp.school}"`);
      if (lp.level !== editedLp.level) changes.push(`Level changed from "${lp.level}" to "${editedLp.level}"`);
      if (lp.learningArea !== editedLp.learningArea) changes.push(`Learning area changed from "${lp.learningArea}" to "${editedLp.learningArea}"`);
      if (lp.date !== editedLp.date) changes.push(`Date changed from "${lp.date}" to "${editedLp.date}"`);
      if (lp.time !== editedLp.time) changes.push(`Time changed from "${lp.time}" to "${editedLp.time}"`);
      if (lp.roll !== editedLp.roll) changes.push(`Roll changed from "${lp.roll}" to "${editedLp.roll}"`);
      
      if (lp.organisationOfLearning.introduction !== editedLp.organisationOfLearning.introduction) {
        changes.push('Introduction was modified');
      }
      if (lp.organisationOfLearning.lessonDevelopment !== editedLp.organisationOfLearning.lessonDevelopment) {
        changes.push('Lesson development was modified');
      }
      if (lp.organisationOfLearning.conclusion !== editedLp.organisationOfLearning.conclusion) {
        changes.push('Conclusion was modified');
      }
      
      if (JSON.stringify(lp.specificLearningOutcomes) !== JSON.stringify(editedLp.specificLearningOutcomes)) {
        changes.push('Specific learning outcomes were modified');
      }
      if (JSON.stringify(lp.keyInquiryQuestions) !== JSON.stringify(editedLp.keyInquiryQuestions)) {
        changes.push('Key inquiry questions were modified');
      }
      if (JSON.stringify(lp.learningResources) !== JSON.stringify(editedLp.learningResources)) {
        changes.push('Learning resources were modified');
      }
      if (JSON.stringify(lp.extendedActivities) !== JSON.stringify(editedLp.extendedActivities)) {
        changes.push('Extended activities were modified');
      }
      
      if (lp.teacherSelfEvaluation !== editedLp.teacherSelfEvaluation) {
        changes.push('Teacher self-evaluation was modified');
      }
    }

    return changes;
  }
}

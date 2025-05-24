/**
 * Teacher Profile Service
 * Manages teacher profiles, class schedules, and auto-population
 */

import type { 
  TeacherProfile, 
  ClassInfo, 
  AutoGenerationParams,
  TeacherReflection,
  WeeklyPlanningData,
  LessonMetadata
} from '../types/teacher';

export class TeacherProfileService {
  private static readonly STORAGE_KEY = 'teacherProfile';
  private static readonly CLASSES_KEY = 'teacherClasses';
  private static readonly REFLECTIONS_KEY = 'teacherReflections';

  /**
   * Create or update teacher profile
   */
  static saveTeacherProfile(profile: TeacherProfile): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
      console.log('✅ Teacher profile saved successfully');
    } catch (error) {
      console.error('❌ Failed to save teacher profile:', error);
      throw new Error('Failed to save teacher profile');
    }
  }

  /**
   * Get current teacher profile
   */
  static getTeacherProfile(): TeacherProfile | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const profile = JSON.parse(stored);
      // Convert date strings back to Date objects
      profile.schedule.termDates.start = new Date(profile.schedule.termDates.start);
      profile.schedule.termDates.end = new Date(profile.schedule.termDates.end);
      profile.createdAt = new Date(profile.createdAt);
      profile.updatedAt = new Date(profile.updatedAt);
      
      return profile;
    } catch (error) {
      console.error('❌ Failed to load teacher profile:', error);
      return null;
    }
  }

  /**
   * Save teacher's class schedule
   */
  static saveTeacherClasses(classes: ClassInfo[]): void {
    try {
      localStorage.setItem(this.CLASSES_KEY, JSON.stringify(classes));
      console.log('✅ Teacher classes saved successfully');
    } catch (error) {
      console.error('❌ Failed to save teacher classes:', error);
      throw new Error('Failed to save teacher classes');
    }
  }

  /**
   * Get teacher's classes
   */
  static getTeacherClasses(): ClassInfo[] {
    try {
      const stored = localStorage.getItem(this.CLASSES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to load teacher classes:', error);
      return [];
    }
  }

  /**
   * Calculate current week number based on term dates
   */
  static getCurrentWeek(termStart: Date, termEnd: Date): number {
    const now = new Date();
    const startOfTerm = new Date(termStart);
    const endOfTerm = new Date(termEnd);
    
    if (now < startOfTerm) return 1; // Term hasn't started
    if (now > endOfTerm) return 14; // Term has ended (assume 14 weeks max)
    
    const diffTime = now.getTime() - startOfTerm.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.ceil(diffDays / 7);
    
    return Math.min(weekNumber, 14); // Cap at 14 weeks
  }

  /**
   * Get current lesson number for a class based on curriculum progression
   */
  static getCurrentLessonNumber(classId: string, week: number): number {
    // For now, assume 2-3 lessons per week per subject
    // This would be enhanced with actual curriculum tracking
    const lessonsPerWeek = 3;
    return Math.min((week - 1) * lessonsPerWeek + 1, 42); // Cap at 42 lessons per term
  }

  /**
   * Auto-generate lesson parameters from teacher profile and class info
   */
  static generateAutoParams(classId: string): AutoGenerationParams | null {
    const profile = this.getTeacherProfile();
    const classes = this.getTeacherClasses();
    
    if (!profile || !classes.length) {
      console.warn('⚠️ Teacher profile or classes not found');
      return null;
    }

    const classInfo = classes.find(c => c.id === classId);
    if (!classInfo) {
      console.warn('⚠️ Class not found:', classId);
      return null;
    }

    // Calculate current week
    const currentWeek = this.getCurrentWeek(
      profile.schedule.termDates.start,
      profile.schedule.termDates.end
    );

    // Get current lesson number
    const currentLesson = this.getCurrentLessonNumber(classId, currentWeek);

    // Get today's date and time for this class
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find today's schedule for this class
    const todaySchedule = profile.schedule.dailySchedule.find(
      schedule => schedule.dayOfWeek === dayName && 
                 schedule.grade === classInfo.grade && 
                 schedule.subject === classInfo.subject
    );

    const params: AutoGenerationParams = {
      // Teacher info (auto-populated)
      teacher: profile.personalInfo.name,
      teacherId: profile.id,
      school: profile.school.name,
      
      // Class info (auto-populated)
      grade: classInfo.grade,
      subject: classInfo.subject,
      className: classInfo.className,
      rollNumber: classInfo.rollNumber,
      studentCount: classInfo.studentCount,
      
      // Schedule info (auto-populated)
      date: today.toLocaleDateString('en-GB'), // DD/MM/YYYY format
      time: todaySchedule ? `${todaySchedule.timeSlot.start} - ${todaySchedule.timeSlot.end}` : '08:00 - 08:40',
      duration: profile.preferences.lessonDuration,
      
      // Curriculum tracking (auto-populated)
      week: currentWeek,
      lesson: currentLesson,
      strand: classInfo.curriculum.strand,
      subStrand: classInfo.curriculum.subStrand
    };

    console.log('🎯 Auto-generated parameters:', params);
    return params;
  }

  /**
   * Get teacher's weekly planning data
   */
  static getWeeklyPlanningData(): WeeklyPlanningData | null {
    const profile = this.getTeacherProfile();
    const classes = this.getTeacherClasses();
    
    if (!profile || !classes.length) return null;

    const currentWeek = this.getCurrentWeek(
      profile.schedule.termDates.start,
      profile.schedule.termDates.end
    );

    const plannedLessons = classes.map(classInfo => ({
      classId: classInfo.id,
      lessonNumber: this.getCurrentLessonNumber(classInfo.id, currentWeek),
      topic: classInfo.curriculum.topics[0] || 'Topic to be determined',
      status: 'planned' as const,
      scheduledDate: new Date() // This would be calculated based on class schedule
    }));

    return {
      teacherId: profile.id,
      week: currentWeek,
      classes,
      plannedLessons,
      completionRate: 0, // Would be calculated based on delivered lessons
      upcomingDeadlines: [
        {
          type: 'planning',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
          description: 'Weekly lesson planning due'
        }
      ]
    };
  }

  /**
   * Save teacher reflection
   */
  static saveReflection(reflection: TeacherReflection): void {
    try {
      const reflections = this.getReflections();
      reflections.push(reflection);
      localStorage.setItem(this.REFLECTIONS_KEY, JSON.stringify(reflections));
      console.log('✅ Teacher reflection saved successfully');
    } catch (error) {
      console.error('❌ Failed to save reflection:', error);
      throw new Error('Failed to save reflection');
    }
  }

  /**
   * Get all teacher reflections
   */
  static getReflections(): TeacherReflection[] {
    try {
      const stored = localStorage.getItem(this.REFLECTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to load reflections:', error);
      return [];
    }
  }

  /**
   * Check if teacher profile is complete
   */
  static isProfileComplete(): boolean {
    const profile = this.getTeacherProfile();
    const classes = this.getTeacherClasses();
    
    return !!(
      profile &&
      profile.personalInfo.name &&
      profile.personalInfo.subjects.length > 0 &&
      profile.school.name &&
      classes.length > 0
    );
  }

  /**
   * Get profile completion status
   */
  static getProfileCompletionStatus(): {
    isComplete: boolean;
    missingFields: string[];
    completionPercentage: number;
  } {
    const profile = this.getTeacherProfile();
    const classes = this.getTeacherClasses();
    const missingFields: string[] = [];

    if (!profile) {
      return {
        isComplete: false,
        missingFields: ['Complete teacher profile'],
        completionPercentage: 0
      };
    }

    if (!profile.personalInfo.name) missingFields.push('Teacher name');
    if (!profile.personalInfo.subjects.length) missingFields.push('Teaching subjects');
    if (!profile.school.name) missingFields.push('School information');
    if (!classes.length) missingFields.push('Class schedule');

    const totalFields = 4;
    const completedFields = totalFields - missingFields.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      completionPercentage
    };
  }

  /**
   * Clear all teacher data (for testing or reset)
   */
  static clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CLASSES_KEY);
    localStorage.removeItem(this.REFLECTIONS_KEY);
    console.log('🗑️ All teacher data cleared');
  }
}

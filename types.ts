
export interface SchemeOfWorkEntry {
  wk: string;
  lsn: string;
  strand: string;
  subStrand: string;
  specificLearningOutcomes: string;
  keyInquiryQuestions: string;
  learningExperiences: string;
  learningResources: string;
  assessmentMethods: string;
  refl?: string;
}

export interface LessonPlan {
  school: string;
  level: string;
  learningArea: string;
  date: string;
  time: string;
  roll: string;
  strand: string;
  subStrand: string;
  specificLearningOutcomes: string[];
  keyInquiryQuestions: string[];
  learningResources: string[];
  organisationOfLearning: {
    introduction: string;
    lessonDevelopment: string; // Could be more structured, e.g., string[] for steps
    conclusion: string;
  };
  extendedActivities: string[];
  teacherSelfEvaluation: string; // e.g., "To be completed by the teacher after lesson delivery."
}

export interface GenerationParams {
  grade: string;
  subject: string;
  term: string;
  week: string;
  lesson: string;
}

// Represents the structured data extracted from a curriculum design for a specific lesson
export interface CurriculumSnippet {
  grade: string;
  subject: string;
  strand: string;
  subStrand: string;
  specificLearningOutcomes: string[];
  keyInquiryQuestions: string[];
  learningExperiences: string[]; // Activities, tasks
  learningResources: string[]; // Materials, textbooks, digital tools
  assessmentMethods: string[]; // How learning will be checked
  // Optional: links to specific curriculum document pages, competency codes etc.
}
    
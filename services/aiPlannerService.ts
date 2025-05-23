import type { SchemeOfWorkEntry, LessonPlan, CurriculumSnippet, GenerationParams } from '../types';
import { curriculumService } from './curriculumService';
import { qwenAiService } from './qwenAiService';
import { CurriculumService } from './curriculumDatabase';

// Ensure API_KEY is handled as per guidelines (from process.env)
const API_KEY = process.env.QWEN_API_KEY || process.env.API_KEY;
if (!API_KEY) {
  console.warn('QWEN_API_KEY is not set in environment variables. AI features will not work.');
}

// Example curriculum data (simulating extraction for Grade 9, Pre-Tech, Term 1, Week 1, Lesson 1)
const exampleCurriculumSnippet: CurriculumSnippet = {
  grade: 'Grade 9',
  subject: 'Pre-Technical Studies',
  strand: 'FOUNDATIONS OF PRE-TECHNICAL STUDIES',
  subStrand: 'Safety on Raised Platforms - types of raised platforms (ladders & trestles)',
  specificLearningOutcomes: [
    'Identify types of raised platforms used in performing tasks.',
    'Explore the use of ladders and trestles.',
    'Appreciate working with raised platforms.',
  ],
  keyInquiryQuestions: [
    'What is the importance of observing safety when working on raised platforms?',
  ],
  learningExperiences: [
    'The learner is guided to walk around the school to explore types of raised platforms (ladders, trestles).',
    'The learner is guided to brainstorm on the types of raised platforms used in day-to-day life.',
  ],
  learningResources: [
    'Raised platforms (actual or pictures)',
    'Video clips and visual aids demonstrating use of ladders and trestles',
    'Personal protective equipment (PPEs) relevant to working on raised platforms',
    'Distinction Pretech. Studies Grade 9 P.B. Pg.1-4',
  ],
  assessmentMethods: [
    'Oral questioning on types and uses of ladders/trestles.',
    'Observation of learner participation in discussions and activities.',
    'Checklist for identifying safety aspects.',
    'Short written quiz on platform types and safety.',
    'Rubrics for practical demonstration (if applicable).',
    'Practical work involving safe setup/use (simulated if needed).',
  ],
};

/**
 * Helper function to determine education level from grade
 */
function getEducationLevelFromGrade(grade: string): string {
  if (grade === 'PP1' || grade === 'PP2') return 'pre-primary';
  if (grade === 'Grade 1' || grade === 'Grade 2' || grade === 'Grade 3') return 'lower-primary';
  if (grade === 'Grade 4' || grade === 'Grade 5' || grade === 'Grade 6') return 'upper-primary';
  if (grade === 'Grade 7' || grade === 'Grade 8' || grade === 'Grade 9') return 'junior-school';
  return 'junior-school'; // default
}

/**
 * Convert embedded curriculum format to CurriculumSnippet format
 */
function convertEmbeddedToCurriculumSnippet(
  curriculum: any,
  params: GenerationParams
): CurriculumSnippet {
  // Get the first strand and sub-strand as default
  const firstStrand = curriculum.strands[0];
  const firstSubStrand = firstStrand?.subStrands[0];

  return {
    grade: params.grade,
    subject: curriculum.subject,
    strand: firstStrand?.name || 'General Studies',
    subStrand: firstSubStrand?.name || 'Introduction',
    specificLearningOutcomes:
      firstSubStrand?.specificLearningOutcomes || curriculum.generalLearningOutcomes || [],
    keyInquiryQuestions: firstSubStrand?.keyInquiryQuestions || ['What will we learn today?'],
    learningExperiences: firstSubStrand?.suggestedLearningExperiences || [
      'Interactive learning activities',
    ],
    learningResources: ['Textbooks', 'Visual aids', 'Practical materials'],
    assessmentMethods: firstSubStrand?.assessmentMethods || [
      'Observation',
      'Questioning',
      'Practical work',
    ],
  };
}

async function generateSchemeOfWorkEntry(
  curriculum: CurriculumSnippet,
  params: GenerationParams
): Promise<SchemeOfWorkEntry> {
  if (!API_KEY) throw new Error('API Key not configured.');

  const prompt = `
    You are an expert curriculum planner tasked with creating a scheme of work entry.
    Based on the following curriculum details for ${curriculum.subject}, ${curriculum.grade}, Term ${params.term}, Week ${params.week}, Lesson ${params.lesson}:
    - Strand: ${curriculum.strand}
    - Sub-Strand: ${curriculum.subStrand}
    - Specific Learning Outcomes: ${curriculum.specificLearningOutcomes.join('; ')}
    - Key Inquiry Question(s): ${curriculum.keyInquiryQuestions.join('; ')}
    - Learning Experiences: ${curriculum.learningExperiences.join('; ')}
    - Learning Resources: ${curriculum.learningResources.join('; ')}
    - Assessment Methods: ${curriculum.assessmentMethods.join('; ')}

    Generate a JSON object for a single scheme of work entry with the following fields:
    "wk": "${params.week}",
    "lsn": "${params.lesson}",
    "strand": (string, from curriculum.strand),
    "subStrand": (string, from curriculum.subStrand),
    "specificLearningOutcomes": (string, a concise summary or direct list of SLOs from curriculum.specificLearningOutcomes),
    "keyInquiryQuestions": (string, from curriculum.keyInquiryQuestions),
    "learningExperiences": (string, detailing learner activities based on curriculum.learningExperiences),
    "learningResources": (string, listing all resources from curriculum.learningResources),
    "assessmentMethods": (string, listing all methods from curriculum.assessmentMethods),
    "refl": "(string, placeholder like 'Teacher to reflect on lesson effectiveness')"

    Ensure the output is a single, valid JSON object only.
  `;

  try {
    return await qwenAiService.generateJsonContent<SchemeOfWorkEntry>(prompt, {
      maxTokens: 1000,
      temperature: 0.5,
      retries: 3,
    });
  } catch (error) {
    console.error('Error generating scheme of work:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

async function generateLessonPlan(
  curriculum: CurriculumSnippet,
  schemeEntry: SchemeOfWorkEntry,
  params: GenerationParams
): Promise<LessonPlan> {
  if (!API_KEY) throw new Error('API Key not configured.');

  const prompt = `
    You are an AI assistant helping a teacher create a detailed lesson plan.
    Curriculum Context:
    - Subject: ${curriculum.subject}
    - Grade: ${curriculum.grade}
    - Term: ${params.term}, Week: ${params.week}, Lesson: ${params.lesson}
    - Strand: ${curriculum.strand}
    - Sub-Strand: ${curriculum.subStrand}
    - Specific Learning Outcomes from Curriculum: ${curriculum.specificLearningOutcomes.join('; ')}
    - Key Inquiry Questions from Curriculum: ${curriculum.keyInquiryQuestions.join('; ')}
    - Learning Resources from Curriculum: ${curriculum.learningResources.join('; ')}
    - Learning Experiences from Curriculum: ${curriculum.learningExperiences.join('; ')}

    Scheme of Work Reference:
    - SLOs in Scheme: ${schemeEntry.specificLearningOutcomes}
    - Key Questions in Scheme: ${schemeEntry.keyInquiryQuestions}

    Using this information, generate a JSON object for a lesson plan. The lesson duration is 40 minutes.
    The JSON object should have the following structure and content guidelines:
    {
      "school": "Sunshine Secondary School",
      "level": "${curriculum.grade}",
      "learningArea": "${curriculum.subject}",
      "date": "To be set by teacher",
      "time": "40 minutes",
      "roll": "To be set by teacher",
      "strand": "${curriculum.strand}",
      "subStrand": "${curriculum.subStrand}",
      "specificLearningOutcomes": [/* Array of strings based on curriculum.specificLearningOutcomes */],
      "keyInquiryQuestions": [/* Array of strings based on curriculum.keyInquiryQuestions */],
      "learningResources": [/* Array of strings based on curriculum.learningResources, ensure variety */],
      "organisationOfLearning": {
        "introduction": "(string, ~5 mins) Briefly introduce the topic (ladders & trestles), state SLOs, and link to prior knowledge or real-life. Pose a key inquiry question.",
        "lessonDevelopment": "(string, ~30 mins) Detail teacher and learner activities. Example steps for 'ladders & trestles': \n1. Teacher presents types of ladders and trestles using visual aids/realia. \n2. Learners discuss uses and safety precautions for each type. \n3. Group activity: Learners identify parts of a ladder/trestle and their functions. \n4. Teacher demonstrates (or uses video for) safe setup and use of a ladder/trestle, emphasizing PPEs. \n5. Learners discuss scenarios of misuse and consequences. Make this section detailed and actionable.",
        "conclusion": "(string, ~5 mins) Summarize key points, revisit SLOs and key questions. Quick Q&A. Assign any relevant follow-up or extended activity."
      },
      "extendedActivities": [/* Array of strings, e.g., "Research common accidents involving ladders and how to prevent them.", "Sketch a ladder, labeling its parts and safety features." */],
      "teacherSelfEvaluation": "To be completed by the teacher after lesson delivery, reflecting on objectives achieved, learner engagement, and areas for improvement."
    }
    Ensure the output is a single, valid JSON object only.
  `;

  try {
    return await qwenAiService.generateJsonContent<LessonPlan>(prompt, {
      maxTokens: 1500,
      temperature: 0.5,
      retries: 3,
    });
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

export async function generateSchemeAndPlan(
  params: GenerationParams
): Promise<{ schemeOfWork: SchemeOfWorkEntry; lessonPlan: LessonPlan }> {
  try {
    // First, try to use embedded curriculum database
    const educationLevel = getEducationLevelFromGrade(params.grade);
    const embeddedCurriculum = CurriculumService.getCurriculum(educationLevel, params.subject);

    if (embeddedCurriculum) {
      console.log(`Using embedded curriculum for ${params.grade} ${params.subject}`);

      // Convert embedded curriculum to CurriculumSnippet format
      const curriculumSnippet = convertEmbeddedToCurriculumSnippet(embeddedCurriculum, params);
      const scheme = await generateSchemeOfWorkEntry(curriculumSnippet, params);
      const plan = await generateLessonPlan(curriculumSnippet, scheme, params);
      return { schemeOfWork: scheme, lessonPlan: plan };
    }

    // Fallback to external curriculum service
    const curriculumData = await curriculumService.findCurriculum(params);

    if (curriculumData) {
      console.log(`Found external curriculum data for ${params.grade} ${params.subject}`);
      const scheme = await generateSchemeOfWorkEntry(curriculumData, params);
      const plan = await generateLessonPlan(curriculumData, scheme, params);
      return { schemeOfWork: scheme, lessonPlan: plan };
    } else {
      // Final fallback to example data
      console.warn(
        `No curriculum data found for ${params.subject}, ${params.grade}. Using fallback data.`
      );

      // Use the hardcoded example as fallback
      const scheme = await generateSchemeOfWorkEntry(exampleCurriculumSnippet, params);
      const plan = await generateLessonPlan(exampleCurriculumSnippet, scheme, params);
      return { schemeOfWork: scheme, lessonPlan: plan };
    }
  } catch (error) {
    console.error('Error in generateSchemeAndPlan:', error);

    // If JSON parsing failed, try to create a basic fallback
    if (error instanceof Error && error.message.includes('JSON')) {
      console.log('JSON parsing failed, attempting to create fallback lesson plan...');
      try {
        return await createFallbackLessonPlan(params);
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError);
      }
    }

    throw new Error(
      `Failed to generate lesson plan: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create a basic fallback lesson plan when AI generation fails
 */
async function createFallbackLessonPlan(
  params: GenerationParams
): Promise<{ schemeOfWork: SchemeOfWorkEntry; lessonPlan: LessonPlan }> {
  console.log('Creating fallback lesson plan...');

  const fallbackScheme: SchemeOfWorkEntry = {
    wk: params.week,
    lsn: params.lesson,
    strand: `${params.subject} - Core Concepts`,
    subStrand: `Week ${params.week} Learning Focus`,
    specificLearningOutcomes: `By the end of this lesson, learners should be able to understand key concepts in ${params.subject} for ${params.grade}.`,
    keyInquiryQuestions: `What are the main concepts we need to learn in ${params.subject} this week?`,
    learningExperiences: `Interactive discussions, practical activities, and guided practice related to ${params.subject}.`,
    learningResources: `Textbooks, visual aids, practical materials, and digital resources for ${params.subject}.`,
    assessmentMethods: `Observation, questioning, practical demonstrations, and formative assessment.`,
    refl: 'Teacher to reflect on lesson effectiveness and learner engagement.',
  };

  const fallbackPlan: LessonPlan = {
    school: 'Your School Name',
    level: params.grade,
    learningArea: params.subject,
    date: 'To be set by teacher',
    time: '40 minutes',
    roll: 'To be set by teacher',
    strand: fallbackScheme.strand,
    subStrand: fallbackScheme.subStrand,
    specificLearningOutcomes: [
      `Understand key concepts in ${params.subject}`,
      `Apply learning to practical situations`,
      `Demonstrate understanding through activities`,
    ],
    keyInquiryQuestions: [
      `What do we already know about ${params.subject}?`,
      `How can we apply this knowledge?`,
      `What questions do we still have?`,
    ],
    learningResources: [
      'Course textbook',
      'Visual aids and charts',
      'Practical materials',
      'Digital resources',
    ],
    organisationOfLearning: {
      introduction: `Welcome learners and introduce today's topic in ${params.subject}. Review previous learning and set clear objectives for the lesson. Engage learners with a thought-provoking question or activity.`,
      lessonDevelopment: `1. Present key concepts using visual aids and examples\n2. Facilitate group discussions and activities\n3. Guide learners through practical exercises\n4. Encourage questions and provide clarification\n5. Monitor understanding through formative assessment\n6. Provide additional support where needed`,
      conclusion: `Summarize key learning points from today's lesson. Review objectives and check understanding. Assign any follow-up activities and preview next lesson's content.`,
    },
    extendedActivities: [
      `Research additional information about today's topic`,
      `Complete practice exercises from the textbook`,
      `Prepare questions for next lesson`,
    ],
    teacherSelfEvaluation:
      'To be completed after lesson delivery, reflecting on objectives achieved, learner engagement, and areas for improvement.',
  };

  return { schemeOfWork: fallbackScheme, lessonPlan: fallbackPlan };
}

/**
 * Get available curriculum options
 */
export async function getAvailableOptions(): Promise<{
  grades: string[];
  subjects: Record<string, string[]>;
  statistics: any;
}> {
  try {
    const grades = await curriculumService.getAvailableGrades();
    const subjects: Record<string, string[]> = {};

    for (const grade of grades) {
      subjects[grade] = await curriculumService.getAvailableSubjects(grade);
    }

    const statistics = await curriculumService.getStatistics();

    return { grades, subjects, statistics };
  } catch (error) {
    console.error('Error getting available options:', error);
    return {
      grades: ['Grade 9'],
      subjects: { 'Grade 9': ['Pre-Technical Studies'] },
      statistics: {
        totalEntries: 1,
        grades: 1,
        subjects: 1,
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}

/**
 * Test Qwen AI connection
 */
export async function testAiConnection(): Promise<{
  connected: boolean;
  model: string;
  error?: string;
}> {
  try {
    const connected = await qwenAiService.testConnection();
    const modelInfo = qwenAiService.getModelInfo();

    return {
      connected,
      model: modelInfo.model,
      error: connected ? undefined : 'Connection test failed',
    };
  } catch (error) {
    return {
      connected: false,
      model: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

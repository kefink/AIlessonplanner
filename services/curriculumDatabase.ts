/**
 * Embedded Curriculum Database for AI Lesson Planner
 * Contains complete Kenya CBC curriculum data for all levels and subjects
 */

import { EMBEDDED_CBC_CURRICULUM } from './embeddedCurriculumDatabase';

export interface CurriculumStrand {
  name: string;
  subStrands: {
    name: string;
    specificLearningOutcomes: string[];
    suggestedLearningExperiences: string[];
    keyInquiryQuestions: string[];
    coreCompetencies: string[];
    values: string[];
    pertinentAndContemporaryIssues: string[];
    assessmentMethods: string[];
  }[];
}

export interface SubjectCurriculum {
  subject: string;
  level: string;
  grades: string[];
  generalLearningOutcomes: string[];
  strands: CurriculumStrand[];
}

export interface CurriculumDatabase {
  [level: string]: {
    [subject: string]: SubjectCurriculum;
  };
}

/**
 * Complete Kenya CBC Curriculum Database
 * This contains the full curriculum for all levels and subjects
 * Junior School data is loaded from extracted PDF curriculum
 */
export const KENYA_CBC_CURRICULUM: CurriculumDatabase = {
  'pre-primary': {
    Mathematics: {
      subject: 'Mathematics',
      level: 'pre-primary',
      grades: ['PP1', 'PP2'],
      generalLearningOutcomes: [
        'Develop number sense and counting skills',
        'Recognize and work with basic shapes',
        'Understand simple patterns and relationships',
        'Develop spatial awareness and measurement concepts',
      ],
      strands: [
        {
          name: 'Numbers',
          subStrands: [
            {
              name: 'Counting',
              specificLearningOutcomes: [
                'Count objects up to 10 (PP1) / 20 (PP2)',
                'Recognize and write numerals 1-10 (PP1) / 1-20 (PP2)',
                'Understand one-to-one correspondence',
              ],
              suggestedLearningExperiences: [
                'Counting songs and rhymes',
                'Manipulative activities with objects',
                'Number games and activities',
                'Real-life counting experiences',
              ],
              keyInquiryQuestions: [
                'How many objects are there?',
                'What comes after this number?',
                'Can you count these items?',
              ],
              coreCompetencies: ['Communication', 'Critical thinking', 'Creativity'],
              values: ['Responsibility', 'Respect'],
              pertinentAndContemporaryIssues: ['Life skills'],
              assessmentMethods: ['Observation', 'Oral questioning', 'Practical activities'],
            },
          ],
        },
        {
          name: 'Geometry',
          subStrands: [
            {
              name: 'Shapes',
              specificLearningOutcomes: [
                'Identify basic 2D shapes (circle, square, triangle)',
                'Describe properties of shapes',
                'Sort objects by shape',
              ],
              suggestedLearningExperiences: [
                'Shape sorting activities',
                'Shape hunts in environment',
                'Art and craft with shapes',
                'Building with blocks',
              ],
              keyInquiryQuestions: [
                'What shape is this?',
                'How are these shapes different?',
                'Where do we see this shape?',
              ],
              coreCompetencies: ['Critical thinking', 'Creativity'],
              values: ['Respect', 'Responsibility'],
              pertinentAndContemporaryIssues: ['Environmental awareness'],
              assessmentMethods: ['Practical demonstration', 'Portfolio', 'Observation'],
            },
          ],
        },
      ],
    },
    English: {
      subject: 'English',
      level: 'pre-primary',
      grades: ['PP1', 'PP2'],
      generalLearningOutcomes: [
        'Develop listening and speaking skills',
        'Begin to recognize letters and sounds',
        'Express ideas through drawing and early writing',
        'Enjoy stories and rhymes',
      ],
      strands: [
        {
          name: 'Listening and Speaking',
          subStrands: [
            {
              name: 'Oral Communication',
              specificLearningOutcomes: [
                'Listen to and follow simple instructions',
                'Express needs and feelings verbally',
                'Participate in conversations',
                'Recite simple rhymes and songs',
              ],
              suggestedLearningExperiences: [
                'Story telling sessions',
                'Show and tell activities',
                'Songs and rhymes',
                'Role play and drama',
              ],
              keyInquiryQuestions: [
                'What did you hear?',
                'Can you tell me about...?',
                'What happens next in the story?',
              ],
              coreCompetencies: ['Communication', 'Self-efficacy'],
              values: ['Respect', 'Responsibility'],
              pertinentAndContemporaryIssues: ['Life skills', 'Social cohesion'],
              assessmentMethods: ['Observation', 'Oral assessment', 'Participation'],
            },
          ],
        },
      ],
    },
  },
  'lower-primary': {
    Mathematics: {
      subject: 'Mathematics',
      level: 'lower-primary',
      grades: ['Grade 1', 'Grade 2', 'Grade 3'],
      generalLearningOutcomes: [
        'Develop number sense and place value understanding',
        'Perform basic arithmetic operations',
        'Understand measurement concepts',
        'Recognize and work with geometric shapes',
      ],
      strands: [
        {
          name: 'Numbers',
          subStrands: [
            {
              name: 'Whole Numbers',
              specificLearningOutcomes: [
                'Count, read and write numbers up to 999',
                'Understand place value (ones, tens, hundreds)',
                'Compare and order numbers',
                'Add and subtract within appropriate ranges',
              ],
              suggestedLearningExperiences: [
                'Use of manipulatives for counting',
                'Number line activities',
                'Real-life problem solving',
                'Games involving numbers',
              ],
              keyInquiryQuestions: [
                'How many altogether?',
                'Which number is greater?',
                'What is the value of this digit?',
              ],
              coreCompetencies: ['Critical thinking', 'Problem solving'],
              values: ['Responsibility', 'Integrity'],
              pertinentAndContemporaryIssues: ['Financial literacy'],
              assessmentMethods: ['Written tests', 'Oral questioning', 'Practical activities'],
            },
          ],
        },
      ],
    },
  },
  'upper-primary': {
    'Science and Technology': {
      subject: 'Science and Technology',
      level: 'upper-primary',
      grades: ['Grade 4', 'Grade 5', 'Grade 6'],
      generalLearningOutcomes: [
        'Understand basic scientific concepts and processes',
        'Develop scientific inquiry skills',
        'Apply technology in solving problems',
        'Appreciate the role of science in daily life',
      ],
      strands: [
        {
          name: 'Living Things and Their Environment',
          subStrands: [
            {
              name: 'Plants',
              specificLearningOutcomes: [
                'Classify plants based on observable characteristics',
                'Identify parts of plants and their functions',
                'Describe how plants make their food',
                'Explain the importance of plants to humans and environment',
              ],
              suggestedLearningExperiences: [
                'Nature walks and plant observation',
                'Growing plants in school garden',
                'Experiments on plant growth',
                'Creating plant collections',
              ],
              keyInquiryQuestions: [
                'How do plants differ from each other?',
                'What do plants need to grow?',
                'How do plants help us?',
              ],
              coreCompetencies: ['Critical thinking', 'Creativity', 'Communication'],
              values: ['Responsibility', 'Respect'],
              pertinentAndContemporaryIssues: ['Environmental conservation', 'Climate change'],
              assessmentMethods: ['Practical work', 'Projects', 'Observation', 'Written tests'],
            },
          ],
        },
      ],
    },
  },
  'junior-school': {
    'Pre-technical studies': {
      subject: 'Pre-technical studies',
      level: 'junior-school',
      grades: ['Grade 7', 'Grade 8', 'Grade 9'],
      generalLearningOutcomes: [
        'Develop practical skills in technology and engineering',
        'Understand basic principles of design and construction',
        'Apply problem-solving skills in technical contexts',
        'Appreciate the role of technology in society',
      ],
      strands: [
        {
          name: 'Technology and Engineering',
          subStrands: [
            {
              name: 'Tools, Equipment and Processes',
              specificLearningOutcomes: [
                'Identify and use basic tools safely',
                'Understand the functions of different tools',
                'Apply appropriate processes in making simple products',
                'Maintain tools and equipment properly',
              ],
              suggestedLearningExperiences: [
                'Hands-on tool identification and use',
                'Safety demonstrations and practice',
                'Simple construction projects',
                'Tool maintenance activities',
              ],
              keyInquiryQuestions: [
                'Which tool is best for this job?',
                'How do we use this tool safely?',
                'What process should we follow?',
              ],
              coreCompetencies: ['Critical thinking', 'Creativity', 'Communication'],
              values: ['Responsibility', 'Integrity', 'Respect'],
              pertinentAndContemporaryIssues: ['Safety', 'Innovation', 'Entrepreneurship'],
              assessmentMethods: [
                'Practical demonstration',
                'Projects',
                'Observation',
                'Portfolio',
              ],
            },
            {
              name: 'Materials and Structures',
              specificLearningOutcomes: [
                'Identify properties of different materials',
                'Select appropriate materials for specific purposes',
                'Understand basic structural principles',
                'Create simple structures using various materials',
              ],
              suggestedLearningExperiences: [
                'Material testing and comparison',
                'Building models and structures',
                'Investigating local building materials',
                'Design and make challenges',
              ],
              keyInquiryQuestions: [
                'What makes this material suitable?',
                'How can we make this structure stronger?',
                'What materials are available locally?',
              ],
              coreCompetencies: ['Critical thinking', 'Creativity', 'Problem solving'],
              values: ['Innovation', 'Responsibility'],
              pertinentAndContemporaryIssues: ['Sustainable development', 'Local resources'],
              assessmentMethods: ['Practical projects', 'Design portfolios', 'Peer assessment'],
            },
          ],
        },
        {
          name: 'Information and Communication Technology',
          subStrands: [
            {
              name: 'Digital Literacy',
              specificLearningOutcomes: [
                'Operate basic computer systems',
                'Use common software applications',
                'Understand internet safety principles',
                'Create simple digital content',
              ],
              suggestedLearningExperiences: [
                'Computer operation practice',
                'Software exploration activities',
                'Digital safety discussions',
                'Creating presentations and documents',
              ],
              keyInquiryQuestions: [
                'How do we use technology safely?',
                'What can we create with this software?',
                'How does technology help us learn?',
              ],
              coreCompetencies: ['Digital literacy', 'Communication', 'Critical thinking'],
              values: ['Integrity', 'Responsibility'],
              pertinentAndContemporaryIssues: ['Digital citizenship', 'Cyber security'],
              assessmentMethods: ['Practical tasks', 'Digital portfolios', 'Peer review'],
            },
          ],
        },
      ],
    },
    'Integrated Science': {
      subject: 'Integrated Science',
      level: 'junior-school',
      grades: ['Grade 7', 'Grade 8', 'Grade 9'],
      generalLearningOutcomes: [
        'Understand fundamental scientific concepts across disciplines',
        'Develop scientific inquiry and investigation skills',
        'Apply scientific knowledge to solve real-world problems',
        'Appreciate the interconnectedness of scientific disciplines',
      ],
      strands: [
        {
          name: 'Living Things and Their Environment',
          subStrands: [
            {
              name: 'Classification of Living Things',
              specificLearningOutcomes: [
                'Classify living things into major groups',
                'Use classification keys to identify organisms',
                'Understand the importance of classification',
                'Relate classification to evolutionary relationships',
              ],
              suggestedLearningExperiences: [
                'Field studies and specimen collection',
                'Using classification keys',
                'Creating classification charts',
                'Microscope work with microorganisms',
              ],
              keyInquiryQuestions: [
                'How do we group living things?',
                'What characteristics do organisms share?',
                'Why is classification important?',
              ],
              coreCompetencies: ['Critical thinking', 'Communication', 'Collaboration'],
              values: ['Respect', 'Responsibility'],
              pertinentAndContemporaryIssues: [
                'Biodiversity conservation',
                'Environmental protection',
              ],
              assessmentMethods: ['Practical identification', 'Projects', 'Field reports', 'Tests'],
            },
          ],
        },
      ],
    },
  },
};

/**
 * Curriculum Service for accessing embedded curriculum data
 */
export class CurriculumService {
  /**
   * Get curriculum for specific level and subject
   * Now includes extracted PDF curriculum data for junior school
   */
  static getCurriculum(level: string, subject: string): SubjectCurriculum | null {
    // For junior school, use extracted curriculum data
    if (level === 'junior-school' && EMBEDDED_CBC_CURRICULUM['junior-school']?.[subject]) {
      return EMBEDDED_CBC_CURRICULUM['junior-school'][subject];
    }

    // For other levels, use hardcoded data
    return KENYA_CBC_CURRICULUM[level]?.[subject] || null;
  }

  /**
   * Get all subjects for a specific level
   */
  static getSubjectsForLevel(level: string): string[] {
    // For junior school, use extracted curriculum data
    if (level === 'junior-school' && EMBEDDED_CBC_CURRICULUM['junior-school']) {
      return Object.keys(EMBEDDED_CBC_CURRICULUM['junior-school']);
    }

    // For other levels, use hardcoded data
    return Object.keys(KENYA_CBC_CURRICULUM[level] || {});
  }

  /**
   * Get all available levels
   */
  static getAllLevels(): string[] {
    return Object.keys(KENYA_CBC_CURRICULUM);
  }

  /**
   * Search curriculum content
   */
  static searchCurriculum(query: string, level?: string, subject?: string): any[] {
    const results: any[] = [];
    const searchLevels = level ? [level] : this.getAllLevels();

    searchLevels.forEach(lvl => {
      const levelData = KENYA_CBC_CURRICULUM[lvl];
      const searchSubjects = subject ? [subject] : Object.keys(levelData);

      searchSubjects.forEach(subj => {
        const curriculum = levelData[subj];
        if (curriculum) {
          // Search in strands and sub-strands
          curriculum.strands.forEach(strand => {
            strand.subStrands.forEach(subStrand => {
              const content = JSON.stringify(subStrand).toLowerCase();
              if (content.includes(query.toLowerCase())) {
                results.push({
                  level: lvl,
                  subject: subj,
                  strand: strand.name,
                  subStrand: subStrand.name,
                  content: subStrand,
                });
              }
            });
          });
        }
      });
    });

    return results;
  }

  /**
   * Get curriculum for lesson planning
   */
  static getCurriculumForLessonPlanning(
    level: string,
    subject: string,
    strand?: string,
    subStrand?: string
  ) {
    const curriculum = this.getCurriculum(level, subject);
    if (!curriculum) return null;

    if (strand && subStrand) {
      const targetStrand = curriculum.strands.find(s => s.name === strand);
      const targetSubStrand = targetStrand?.subStrands.find(ss => ss.name === subStrand);
      return targetSubStrand;
    }

    return curriculum;
  }
}

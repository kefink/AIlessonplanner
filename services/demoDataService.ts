/**
 * Demo Data Service for AI Lesson Planner
 * Provides sample school configurations for testing and demonstration
 */

interface SchoolConfig {
  schoolName: string;
  schoolType: 'primary' | 'secondary' | 'mixed';
  curriculum: 'CBC' | 'IGCSE' | 'IB' | 'American' | 'British';
  country: string;
  region: string;
  subjects: string[];
  levels: string[];
  termStructure: {
    terms: number;
    weeksPerTerm: number;
  };
  hodAccess: {
    name: string;
    email: string;
    subject: string;
    permissions: string[];
  }[];
}

export class DemoDataService {
  /**
   * Get sample school configurations for different scenarios
   */
  static getSampleSchools(): SchoolConfig[] {
    return [
      {
        schoolName: 'Nairobi International Academy',
        schoolType: 'mixed',
        curriculum: 'CBC',
        country: 'Kenya',
        region: 'Nairobi',
        subjects: [
          // Lower Primary (Grades 1-3)
          'Kiswahili',
          'Mathematics',
          'English',
          'Religious Education',
          'Environmental activities',
          'Creative activities',
          // Upper Primary (Grades 4-6)
          'Agriculture and Nutrition',
          'Social studies',
          'Science and Technology',
          'Creative Arts',
          // Junior School (Grades 7-9)
          'Agriculture',
          'Integrated Science',
          'Pre-technical studies',
          'Creative art and sports',
        ],
        levels: [
          // Lower Primary (PP1, PP2, Grade 1-3)
          'PP1',
          'PP2',
          'Grade 1',
          'Grade 2',
          'Grade 3',
          // Upper Primary (Grade 4-6)
          'Grade 4',
          'Grade 5',
          'Grade 6',
          // Junior School (Grade 7-9)
          'Grade 7',
          'Grade 8',
          'Grade 9',
        ],
        termStructure: {
          terms: 3,
          weeksPerTerm: 13,
        },
        hodAccess: [
          {
            name: 'Dr. Sarah Mwangi',
            email: 's.mwangi@nia.ac.ke',
            subject: 'Mathematics',
            permissions: ['generate', 'edit', 'download', 'approve'],
          },
          {
            name: 'Mr. James Ochieng',
            email: 'j.ochieng@nia.ac.ke',
            subject: 'Science and Technology',
            permissions: ['generate', 'edit', 'download', 'approve'],
          },
          {
            name: 'Ms. Grace Wanjiku',
            email: 'g.wanjiku@nia.ac.ke',
            subject: 'English',
            permissions: ['generate', 'edit', 'download', 'approve'],
          },
          {
            name: 'Mr. David Kimani',
            email: 'd.kimani@nia.ac.ke',
            subject: 'Social studies',
            permissions: ['generate', 'edit', 'download'],
          },
          {
            name: 'Mrs. Mary Njeri',
            email: 'm.njeri@nia.ac.ke',
            subject: 'Kiswahili',
            permissions: ['generate', 'edit', 'download', 'approve'],
          },
          {
            name: 'Mr. Peter Mutua',
            email: 'p.mutua@nia.ac.ke',
            subject: 'Pre-technical studies',
            permissions: ['generate', 'edit', 'download', 'approve'],
          },
          {
            name: 'Ms. Agnes Wambui',
            email: 'a.wambui@nia.ac.ke',
            subject: 'Integrated Science',
            permissions: ['generate', 'edit', 'download'],
          },
          {
            name: 'Mr. John Kariuki',
            email: 'j.kariuki@nia.ac.ke',
            subject: 'Agriculture',
            permissions: ['generate', 'edit', 'download'],
          },
        ],
      },
      {
        schoolName: 'Lagos British International School',
        schoolType: 'secondary',
        curriculum: 'IGCSE',
        country: 'Nigeria',
        region: 'Lagos',
        subjects: [
          'Mathematics',
          'English Language',
          'Physics',
          'Chemistry',
          'Biology',
          'Geography',
          'History',
          'Economics',
          'Computer Science',
          'Art & Design',
        ],
        levels: ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11'],
        termStructure: {
          terms: 3,
          weeksPerTerm: 12,
        },
        hodAccess: [
          {
            name: 'Dr. Adebayo Ogundimu',
            email: 'a.ogundimu@lbis.ng',
            subject: 'Mathematics',
            permissions: ['generate', 'edit', 'download', 'approve', 'analytics'],
          },
          {
            name: 'Mrs. Fatima Al-Hassan',
            email: 'f.alhassan@lbis.ng',
            subject: 'Physics',
            permissions: ['generate', 'edit', 'download', 'approve'],
          },
          {
            name: 'Mr. Chukwuma Okafor',
            email: 'c.okafor@lbis.ng',
            subject: 'English Language',
            permissions: ['generate', 'edit', 'download', 'approve'],
          },
        ],
      },
      {
        schoolName: 'Cape Town International Baccalaureate School',
        schoolType: 'secondary',
        curriculum: 'IB',
        country: 'South Africa',
        region: 'Western Cape',
        subjects: [
          'Mathematics',
          'Physics',
          'Chemistry',
          'Biology',
          'English Literature',
          'History',
          'Geography',
          'Economics',
          'Visual Arts',
          'French',
        ],
        levels: ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
        termStructure: {
          terms: 4,
          weeksPerTerm: 10,
        },
        hodAccess: [
          {
            name: 'Dr. Thandiwe Mbeki',
            email: 't.mbeki@ctibs.za',
            subject: 'Mathematics',
            permissions: ['generate', 'edit', 'download', 'approve', 'analytics'],
          },
          {
            name: 'Mr. Johan van der Merwe',
            email: 'j.vandermerwe@ctibs.za',
            subject: 'Physics',
            permissions: ['generate', 'edit', 'download', 'approve'],
          },
          {
            name: 'Ms. Amara Osei',
            email: 'a.osei@ctibs.za',
            subject: 'English Literature',
            permissions: ['generate', 'edit', 'download', 'approve'],
          },
        ],
      },
    ];
  }

  /**
   * Get a specific demo school by index
   */
  static getDemoSchool(index: number): SchoolConfig | null {
    const schools = this.getSampleSchools();
    return schools[index] || null;
  }

  /**
   * Setup demo data for quick testing
   */
  static setupDemoData(): void {
    const demoSchool = this.getDemoSchool(0); // Nairobi International Academy
    if (demoSchool) {
      localStorage.setItem('schoolConfig', JSON.stringify(demoSchool));
      localStorage.setItem('appMode', 'hod');

      // Set first HOD as current user
      localStorage.setItem('currentHOD', JSON.stringify(demoSchool.hodAccess[0]));
    }
  }

  /**
   * Clear all demo data
   */
  static clearDemoData(): void {
    localStorage.removeItem('schoolConfig');
    localStorage.removeItem('appMode');
    localStorage.removeItem('currentHOD');

    // Clear any lesson libraries
    const schools = this.getSampleSchools();
    schools.forEach(school => {
      school.hodAccess.forEach(hod => {
        localStorage.removeItem(`lessonLibrary_${hod.email}`);
      });
    });
  }

  /**
   * Generate sample lesson plans for demo purposes
   */
  static generateSampleLessonPlans(hodEmail: string): void {
    const samplePlans = [
      {
        id: `demo_${Date.now()}_1`,
        term: '1',
        week: '3',
        lesson: '2',
        grade: 'Grade 8',
        subject: 'Pre-technical studies',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'approved' as const,
        schemeOfWork: {
          wk: '3',
          lsn: '2',
          strand: 'Technology and Engineering',
          subStrand: 'Basic Tools and Materials',
          specificLearningOutcomes: 'Students will identify and use basic tools safely',
          keyInquiryQuestions: 'What tools do we use for different tasks?',
          learningExperiences: 'Hands-on tool identification and safety practice',
          learningResources: 'Basic tools, safety equipment, worksheets',
          assessmentMethods: 'Practical demonstration and safety assessment',
          refl: 'Students showed good understanding of basic concepts',
        },
        lessonPlan: {
          school: 'Demo School',
          level: 'Grade 8',
          learningArea: 'Pre-technical studies',
          date: '2024-01-15',
          time: '40 minutes',
          roll: '28',
          strand: 'Technology and Engineering',
          subStrand: 'Basic Tools and Materials',
          specificLearningOutcomes: ['Identify basic tools', 'Demonstrate safe tool use'],
          keyInquiryQuestions: ['What tools do we use daily?', 'How do we use tools safely?'],
          learningResources: ['Basic tools', 'Safety equipment', 'Demonstration materials'],
          organisationOfLearning: {
            introduction: 'Review safety rules and introduce basic tools',
            lessonDevelopment: 'Demonstrate proper tool use and safety procedures',
            conclusion: 'Practice tool identification and safety assessment',
          },
          extendedActivities: ['Tool safety poster', 'Home tool inventory'],
          teacherSelfEvaluation: 'Lesson objectives were met successfully',
        },
      },
      {
        id: `demo_${Date.now()}_2`,
        term: '1',
        week: '5',
        lesson: '1',
        grade: 'Grade 7',
        subject: 'Integrated Science',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'draft' as const,
        schemeOfWork: {
          wk: '5',
          lsn: '1',
          strand: 'Living Things and Their Environment',
          subStrand: 'Classification of Living Things',
          specificLearningOutcomes: 'Classify living things into groups based on characteristics',
          keyInquiryQuestions: 'How do we group living things?',
          learningExperiences: 'Observation and classification of local plants and animals',
          learningResources:
            'Plant and animal specimens, classification charts, magnifying glasses',
          assessmentMethods: 'Practical classification exercise and observation records',
          refl: 'Need to provide more visual examples',
        },
        lessonPlan: {
          school: 'Demo School',
          level: 'Grade 7',
          learningArea: 'Integrated Science',
          date: '2024-01-22',
          time: '40 minutes',
          roll: '25',
          strand: 'Living Things and Their Environment',
          subStrand: 'Classification of Living Things',
          specificLearningOutcomes: [
            'Classify living things',
            'Identify characteristics of groups',
          ],
          keyInquiryQuestions: [
            'How do we group living things?',
            'What makes animals different from plants?',
          ],
          learningResources: ['Specimens', 'Classification charts', 'Magnifying glasses'],
          organisationOfLearning: {
            introduction: 'Review what we know about living and non-living things',
            lessonDevelopment: 'Observe specimens and group them based on characteristics',
            conclusion: 'Create a classification chart for observed specimens',
          },
          extendedActivities: [
            'Nature walk classification',
            'Create animal and plant groups poster',
          ],
          teacherSelfEvaluation: 'Students need more practice with observation skills',
        },
      },
    ];

    localStorage.setItem(`lessonLibrary_${hodEmail}`, JSON.stringify(samplePlans));
  }

  /**
   * Get subjects for specific education level
   */
  static getSubjectsForEducationLevel(level: string): string[] {
    const levelSubjects = {
      'pre-primary': [
        'Kiswahili',
        'Mathematics',
        'English',
        'Religious Education',
        'Environmental activities',
        'Creative activities',
      ],
      'lower-primary': [
        'Kiswahili',
        'Mathematics',
        'English',
        'Religious Education',
        'Environmental activities',
        'Creative activities',
      ],
      'upper-primary': [
        'Kiswahili',
        'Mathematics',
        'English',
        'Religious Education',
        'Agriculture and Nutrition',
        'Social studies',
        'Science and Technology',
        'Creative Arts',
      ],
      'junior-school': [
        'Mathematics',
        'English',
        'Kiswahili',
        'Agriculture',
        'Integrated Science',
        'Pre-technical studies',
        'Social studies',
        'Creative art and sports',
        'Religious Education',
      ],
    };

    return levelSubjects[level as keyof typeof levelSubjects] || levelSubjects['junior-school'];
  }

  /**
   * Get curriculum-specific subjects
   */
  static getSubjectsForCurriculum(curriculum: string, schoolType: string): string[] {
    const curriculumSubjects = {
      CBC: {
        primary: [
          // Lower Primary (Grades 1-3)
          'Kiswahili',
          'Mathematics',
          'English',
          'Religious Education',
          'Environmental activities',
          'Creative activities',
          // Upper Primary (Grades 4-6)
          'Agriculture and Nutrition',
          'Social studies',
          'Science and Technology',
          'Creative Arts',
        ],
        secondary: [
          // Junior School (Grades 7-9)
          'Mathematics',
          'English',
          'Kiswahili',
          'Agriculture',
          'Integrated Science',
          'Pre-technical studies',
          'Social studies',
          'Creative art and sports',
          'Religious Education',
        ],
        mixed: [
          // Lower Primary (Grades 1-3)
          'Kiswahili',
          'Mathematics',
          'English',
          'Religious Education',
          'Environmental activities',
          'Creative activities',
          // Upper Primary (Grades 4-6)
          'Agriculture and Nutrition',
          'Social studies',
          'Science and Technology',
          'Creative Arts',
          // Junior School (Grades 7-9)
          'Agriculture',
          'Integrated Science',
          'Pre-technical studies',
          'Creative art and sports',
        ],
      },
      IGCSE: [
        'Mathematics',
        'English Language',
        'Physics',
        'Chemistry',
        'Biology',
        'Geography',
        'History',
        'Economics',
        'Computer Science',
        'Art & Design',
      ],
      IB: [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English Literature',
        'History',
        'Geography',
        'Economics',
        'Visual Arts',
        'French',
      ],
      American: [
        'Mathematics',
        'English Language Arts',
        'Science',
        'Social Studies',
        'World Languages',
        'Arts',
        'Physical Education',
      ],
      British: [
        'Mathematics',
        'English',
        'Science',
        'History',
        'Geography',
        'Modern Languages',
        'Arts',
        'Physical Education',
      ],
    };

    return (
      curriculumSubjects[curriculum as keyof typeof curriculumSubjects] ||
      (curriculumSubjects[curriculum as keyof typeof curriculumSubjects] as any)?.[schoolType] || [
        'Mathematics',
        'English',
        'Science',
      ]
    );
  }

  /**
   * Get levels for school type
   */
  static getLevelsForSchoolType(schoolType: string): string[] {
    const levels = {
      primary: [
        // Pre-Primary
        'PP1',
        'PP2',
        // Lower Primary (Grades 1-3)
        'Grade 1',
        'Grade 2',
        'Grade 3',
        // Upper Primary (Grades 4-6)
        'Grade 4',
        'Grade 5',
        'Grade 6',
      ],
      secondary: [
        // Junior School (Grades 7-9)
        'Grade 7',
        'Grade 8',
        'Grade 9',
      ],
      mixed: [
        // Pre-Primary
        'PP1',
        'PP2',
        // Lower Primary (Grades 1-3)
        'Grade 1',
        'Grade 2',
        'Grade 3',
        // Upper Primary (Grades 4-6)
        'Grade 4',
        'Grade 5',
        'Grade 6',
        // Junior School (Grades 7-9)
        'Grade 7',
        'Grade 8',
        'Grade 9',
      ],
    };

    return levels[schoolType as keyof typeof levels] || levels.mixed;
  }
}

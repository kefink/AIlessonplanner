import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.API_KEY = 'test-api-key';
process.env.QWEN_API_KEY = 'test-qwen-api-key';
process.env.QWEN_MODEL = 'qwen-turbo';
process.env.QWEN_API_BASE_URL = 'https://test-api.example.com';

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  mockGenerationParams: {
    grade: 'Grade 9',
    subject: 'Pre-Technical Studies',
    term: 'Term 1',
    week: '1',
    lesson: '1'
  },

  mockSchemeOfWork: {
    wk: '1',
    lsn: '1',
    strand: 'FOUNDATIONS OF PRE-TECHNICAL STUDIES',
    subStrand: 'Safety on Raised Platforms',
    specificLearningOutcomes: 'Test learning outcomes',
    keyInquiryQuestions: 'Test inquiry questions',
    learningExperiences: 'Test learning experiences',
    learningResources: 'Test resources',
    assessmentMethods: 'Test assessment methods',
    refl: 'Test reflection'
  },

  mockLessonPlan: {
    school: 'Test School',
    level: 'Grade 9',
    learningArea: 'Pre-Technical Studies',
    date: 'Test Date',
    time: '40 minutes',
    roll: 'Test Roll',
    strand: 'FOUNDATIONS OF PRE-TECHNICAL STUDIES',
    subStrand: 'Safety on Raised Platforms',
    specificLearningOutcomes: ['Test outcome 1', 'Test outcome 2'],
    keyInquiryQuestions: ['Test question 1'],
    learningResources: ['Test resource 1', 'Test resource 2'],
    organisationOfLearning: {
      introduction: 'Test introduction',
      lessonDevelopment: 'Test lesson development',
      conclusion: 'Test conclusion'
    },
    extendedActivities: ['Test activity 1'],
    teacherSelfEvaluation: 'Test evaluation'
  }
};

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock Qwen AI Service
vi.mock('../services/qwenAiService', () => ({
  qwenAiService: {
    generateJsonContent: vi.fn().mockResolvedValue({
      wk: '1',
      lsn: '1',
      strand: 'Test Strand',
      subStrand: 'Test Sub-Strand'
    }),
    generateContent: vi.fn().mockResolvedValue('Test response'),
    testConnection: vi.fn().mockResolvedValue(true),
    getModelInfo: vi.fn().mockReturnValue({
      model: 'qwen-turbo',
      baseUrl: 'https://test-api.example.com',
      hasApiKey: true
    })
  }
}));

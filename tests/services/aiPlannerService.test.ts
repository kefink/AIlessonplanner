import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSchemeAndPlan, testAiConnection } from '../../services/aiPlannerService';
import type { GenerationParams } from '../../types';

// Mock the Qwen AI service
vi.mock('../../services/qwenAiService', () => ({
  qwenAiService: {
    generateJsonContent: vi.fn(),
    testConnection: vi.fn(),
    getModelInfo: vi.fn()
  }
}));

describe('aiPlannerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables
    process.env.API_KEY = 'test-api-key';
    process.env.QWEN_API_KEY = 'test-qwen-api-key';
  });

  describe('generateSchemeAndPlan', () => {
    it('should generate scheme and plan for valid Grade 9 Pre-Tech parameters', async () => {
      const params: GenerationParams = {
        grade: 'Grade 9',
        subject: 'Pre-Technical Studies',
        term: 'Term 1',
        week: '1',
        lesson: '1'
      };

      // Mock the AI response
      const mockSchemeResponse = {
        text: JSON.stringify({
          wk: '1',
          lsn: '1',
          strand: 'FOUNDATIONS OF PRE-TECHNICAL STUDIES',
          subStrand: 'Safety on Raised Platforms',
          specificLearningOutcomes: 'Test outcomes',
          keyInquiryQuestions: 'Test questions',
          learningExperiences: 'Test experiences',
          learningResources: 'Test resources',
          assessmentMethods: 'Test methods',
          refl: 'Test reflection'
        })
      };

      const mockPlanResponse = {
        text: JSON.stringify({
          school: 'Sunshine Secondary School',
          level: 'Grade 9',
          learningArea: 'Pre-Technical Studies',
          date: 'To be set by teacher',
          time: '40 minutes',
          roll: 'To be set by teacher',
          strand: 'FOUNDATIONS OF PRE-TECHNICAL STUDIES',
          subStrand: 'Safety on Raised Platforms',
          specificLearningOutcomes: ['Test outcome 1'],
          keyInquiryQuestions: ['Test question 1'],
          learningResources: ['Test resource 1'],
          organisationOfLearning: {
            introduction: 'Test introduction',
            lessonDevelopment: 'Test development',
            conclusion: 'Test conclusion'
          },
          extendedActivities: ['Test activity'],
          teacherSelfEvaluation: 'Test evaluation'
        })
      };

      // Mock the Qwen AI service calls
      const { qwenAiService } = await import('../../services/qwenAiService');

      vi.mocked(qwenAiService.generateJsonContent)
        .mockResolvedValueOnce(JSON.parse(mockSchemeResponse.text))
        .mockResolvedValueOnce(JSON.parse(mockPlanResponse.text));

      const result = await generateSchemeAndPlan(params);

      expect(result).toBeDefined();
      expect(result.schemeOfWork).toBeDefined();
      expect(result.lessonPlan).toBeDefined();
      expect(result.schemeOfWork.wk).toBe('1');
      expect(result.schemeOfWork.lsn).toBe('1');
      expect(result.lessonPlan.level).toBe('Grade 9');
    });

    it('should throw error for unsupported parameters', async () => {
      const params: GenerationParams = {
        grade: 'Grade 10',
        subject: 'Mathematics',
        term: 'Term 1',
        week: '1',
        lesson: '1'
      };

      await expect(generateSchemeAndPlan(params)).rejects.toThrow(
        'This PoC is currently optimized for Grade 9 Pre-Technical Studies'
      );
    });

    it('should handle API errors gracefully', async () => {
      const params: GenerationParams = {
        grade: 'Grade 9',
        subject: 'Pre-Technical Studies',
        term: 'Term 1',
        week: '1',
        lesson: '1'
      };

      // Mock API error
      const { qwenAiService } = await import('../../services/qwenAiService');

      vi.mocked(qwenAiService.generateJsonContent)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(generateSchemeAndPlan(params)).rejects.toThrow('API Error');
    });

    it('should handle missing API key', async () => {
      // Remove API keys
      delete process.env.API_KEY;
      delete process.env.QWEN_API_KEY;

      const params: GenerationParams = {
        grade: 'Grade 9',
        subject: 'Pre-Technical Studies',
        term: 'Term 1',
        week: '1',
        lesson: '1'
      };

      await expect(generateSchemeAndPlan(params)).rejects.toThrow('API Key not configured');
    });
  });

  describe('testAiConnection', () => {
    it('should test Qwen AI connection successfully', async () => {
      const { qwenAiService } = await import('../../services/qwenAiService');

      vi.mocked(qwenAiService.testConnection).mockResolvedValue(true);
      vi.mocked(qwenAiService.getModelInfo).mockReturnValue({
        model: 'qwen-turbo',
        baseUrl: 'https://test-api.example.com',
        hasApiKey: true
      });

      const result = await testAiConnection();

      expect(result.connected).toBe(true);
      expect(result.model).toBe('qwen-turbo');
      expect(result.error).toBeUndefined();
    });

    it('should handle connection test failure', async () => {
      const { qwenAiService } = await import('../../services/qwenAiService');

      vi.mocked(qwenAiService.testConnection).mockRejectedValue(new Error('Connection failed'));

      const result = await testAiConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });
});

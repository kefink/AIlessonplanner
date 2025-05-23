/**
 * Qwen AI Service for AI Lesson Planner
 * Handles communication with Qwen AI via OpenRouter API for lesson plan generation
 */

import axios, { AxiosResponse } from 'axios';

// OpenRouter API configuration for Qwen
// Function to get environment variables with fallbacks
function getEnvVar(key: string, fallback?: string): string | undefined {
  // Try multiple sources for environment variables
  if (typeof window !== 'undefined') {
    // Browser environment - check window object for injected variables
    const windowEnv = (window as any).__ENV__;
    if (windowEnv && windowEnv[key]) {
      return windowEnv[key];
    }
  }

  // Try import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteEnv = import.meta.env[key];
    if (viteEnv) return viteEnv;
  }

  // Try process.env (Node.js/build time)
  if (typeof process !== 'undefined' && process.env) {
    const nodeEnv = process.env[key];
    if (nodeEnv) return nodeEnv;
  }

  return fallback;
}

// Production configuration - using direct values since environment variables aren't loading properly
const QWEN_API_BASE_URL = 'https://openrouter.ai/api/v1';
const QWEN_API_KEY = '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';
const QWEN_MODEL = 'qwen/qwen3-235b-a22b:free';

// Fallback models for when the main model times out
const FALLBACK_MODELS = [
  'qwen/qwen-2.5-72b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

// Debug logging for environment variables
console.log('🔧 Qwen AI Service Configuration:');
console.log('  API Base URL:', QWEN_API_BASE_URL);
console.log('  Model:', QWEN_MODEL);
console.log('  API Key present:', !!QWEN_API_KEY);
console.log('  API Key length:', QWEN_API_KEY ? QWEN_API_KEY.length : 0);
console.log(
  '  API Key starts with:',
  QWEN_API_KEY ? QWEN_API_KEY.substring(0, 10) + '...' : 'none'
);

if (!QWEN_API_KEY) {
  console.warn('❌ QWEN_API_KEY is not set in environment variables. AI features will not work.');
} else {
  console.log('✅ QWEN_API_KEY is configured and ready');
}

// OpenAI-compatible API interfaces for OpenRouter
interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface QwenRequest {
  model: string;
  messages: QwenMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

interface QwenResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class QwenAiService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = QWEN_API_KEY!;
    this.baseUrl = QWEN_API_BASE_URL;
    this.model = QWEN_MODEL;
  }

  /**
   * Generate content using Qwen AI with retry logic
   */
  async generateContent(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      format?: 'json' | 'text';
      retries?: number;
    } = {}
  ): Promise<string> {
    const maxRetries = options.retries || 3;
    let lastError: Error;

    // Try main model first
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Qwen AI attempt ${attempt}/${maxRetries} with ${this.model}...`);
        return await this.generateContentSingle(prompt, options, this.model);
      } catch (error) {
        lastError = error as Error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Attempt ${attempt} failed:`, errorMessage);

        // If it's a timeout error, try fallback models
        if (errorMessage.includes('timeout') && attempt === maxRetries) {
          console.log('Main model timed out, trying fallback models...');

          for (const fallbackModel of FALLBACK_MODELS) {
            try {
              console.log(`Trying fallback model: ${fallbackModel}...`);
              return await this.generateContentSingle(
                prompt,
                {
                  ...options,
                  maxTokens: Math.min(options.maxTokens || 1500, 1000), // Reduce tokens for fallback
                },
                fallbackModel
              );
            } catch (fallbackError) {
              console.warn(
                `Fallback model ${fallbackModel} failed:`,
                fallbackError instanceof Error ? fallbackError.message : fallbackError
              );
              continue;
            }
          }
        }

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`All attempts failed. Last error: ${lastError!.message}`);
  }

  /**
   * Single attempt to generate content
   */
  private async generateContentSingle(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      format?: 'json' | 'text';
    } = {},
    modelToUse?: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Qwen API Key not configured.');
    }

    const systemPrompt =
      options.format === 'json'
        ? 'You are a helpful assistant that responds only with valid JSON. Do not include any explanations or additional text outside the JSON object.'
        : 'You are a helpful assistant for educational content creation.';

    const request: QwenRequest = {
      model: modelToUse || this.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      top_p: 0.8,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    };

    try {
      const response: AxiosResponse<QwenResponse> = await axios.post(
        `${this.baseUrl}/chat/completions`,
        request,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-lesson-planner.local', // Optional for OpenRouter rankings
            'X-Title': 'AI Lesson Planner', // Optional for OpenRouter rankings
          },
          timeout: 120000, // 120 second timeout for large model
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('No content generated by Qwen AI');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error?.message || error.response?.data?.message || error.message;
        console.error('Qwen AI API Error:', {
          status: error.response?.status,
          message: errorMessage,
          data: error.response?.data,
        });
        throw new Error(`Qwen AI API Error: ${errorMessage}`);
      } else {
        console.error('Unexpected error calling Qwen AI:', error);
        throw new Error(
          `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Generate JSON content with automatic parsing and retry logic
   */
  async generateJsonContent<T>(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const maxAttempts = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`JSON generation attempt ${attempt}/${maxAttempts}...`);

        const jsonPrompt = `${prompt}

CRITICAL INSTRUCTIONS:
1. Respond with ONLY a valid, complete JSON object
2. Do NOT include any explanations, comments, or text outside the JSON
3. Do NOT use markdown formatting or code blocks
4. Ensure all strings are properly quoted
5. Ensure all objects and arrays are properly closed
6. The response must start with { and end with }

Example format:
{
  "field1": "value1",
  "field2": ["item1", "item2"],
  "field3": {
    "nested": "value"
  }
}

Your JSON response:`;

        const response = await this.generateContent(jsonPrompt, {
          ...options,
          format: 'json',
          maxTokens: Math.min(options.maxTokens || 1500, attempt === 1 ? 1500 : 1000), // Reduce tokens on retry
          temperature: Math.max((options.temperature || 0.5) - (attempt - 1) * 0.1, 0.1), // Lower temperature on retry
        });

        return this.parseJsonResponse<T>(response);
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `JSON generation attempt ${attempt} failed:`,
          error instanceof Error ? error.message : error
        );

        if (attempt < maxAttempts) {
          console.log(`Retrying JSON generation with more restrictive settings...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Progressive delay
        }
      }
    }

    throw new Error(
      `Failed to generate valid JSON after ${maxAttempts} attempts. Last error: ${lastError!.message}`
    );
  }

  /**
   * Parse JSON response with enhanced error handling
   */
  private parseJsonResponse<T>(responseText: string): T {
    let jsonStr = responseText.trim();

    console.log(
      'Raw AI response:',
      responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
    );

    // Remove markdown code blocks if present
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    // Remove any leading/trailing non-JSON text
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
    }

    // Try to fix common JSON issues
    jsonStr = this.fixCommonJsonIssues(jsonStr);

    try {
      const parsed = JSON.parse(jsonStr) as T;
      console.log('Successfully parsed JSON:', Object.keys(parsed as any));
      return parsed;
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      console.error('Cleaned JSON string:', jsonStr);
      console.error('Original response:', responseText);

      // Try to provide a more helpful error message
      if (jsonStr.length === 0) {
        throw new Error('AI returned empty response. Please try again.');
      } else if (!jsonStr.includes('{')) {
        throw new Error('AI did not return JSON format. Please try again.');
      } else if (jsonStr.length < 50) {
        throw new Error(
          'AI response was too short. The model may have been interrupted. Please try again.'
        );
      } else {
        throw new Error(
          `AI returned malformed JSON. This may be due to model overload. Please try again. Error: ${(e as Error).message}`
        );
      }
    }
  }

  /**
   * Fix common JSON formatting issues
   */
  private fixCommonJsonIssues(jsonStr: string): string {
    // Remove trailing commas
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    // Fix unescaped quotes in strings
    jsonStr = jsonStr.replace(/"([^"]*)"([^"]*)"([^"]*)":/g, '"$1\\"$2\\"$3":');

    // Ensure proper string quoting for common unquoted values
    jsonStr = jsonStr.replace(/:\s*([^",\[\]{}]+)(?=\s*[,}])/g, (match, value) => {
      const trimmed = value.trim();
      // Don't quote numbers, booleans, or null
      if (/^(true|false|null|\d+\.?\d*)$/.test(trimmed)) {
        return `: ${trimmed}`;
      }
      // Quote everything else
      return `: "${trimmed}"`;
    });

    // Try to close unclosed objects/arrays
    let openBraces = (jsonStr.match(/{/g) || []).length;
    let closeBraces = (jsonStr.match(/}/g) || []).length;
    let openBrackets = (jsonStr.match(/\[/g) || []).length;
    let closeBrackets = (jsonStr.match(/\]/g) || []).length;

    // Add missing closing braces
    while (closeBraces < openBraces) {
      jsonStr += '}';
      closeBraces++;
    }

    // Add missing closing brackets
    while (closeBrackets < openBrackets) {
      jsonStr += ']';
      closeBrackets++;
    }

    return jsonStr;
  }

  /**
   * Test the connection to Qwen AI
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Testing Qwen AI connection...');
      console.log('  API Key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'missing');
      console.log('  Base URL:', this.baseUrl);
      console.log('  Model:', this.model);

      if (!this.apiKey) {
        throw new Error('API Key not configured');
      }

      // Simple test request to verify API connectivity
      const response = await this.generateContent("Hello, please respond with just 'OK'", {
        maxTokens: 10,
        temperature: 0.1,
        retries: 1,
      });

      const success =
        response.toLowerCase().includes('connection successful') ||
        response.toLowerCase().includes('hello') ||
        response.length > 0;

      console.log('✅ Connection test successful:', response);
      return { success };
    } catch (error) {
      console.error('❌ Qwen AI connection test failed:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown connection error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get model information
   */
  getModelInfo(): {
    model: string;
    baseUrl: string;
    hasApiKey: boolean;
  } {
    return {
      model: this.model,
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
    };
  }
}

// Export singleton instance
export const qwenAiService = new QwenAiService();

// Export types for use in other modules
export type { QwenMessage, QwenRequest, QwenResponse };

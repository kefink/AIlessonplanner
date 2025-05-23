import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Debug environment variables
  console.log('🔧 Vite Build Environment Variables:');
  console.log('  Mode:', mode);
  console.log('  REACT_APP_QWEN_API_KEY:', env.REACT_APP_QWEN_API_KEY ? 'present' : 'missing');
  console.log('  QWEN_API_KEY:', env.QWEN_API_KEY ? 'present' : 'missing');

  return {
    define: {
      // Define environment variables for runtime access
      'process.env.REACT_APP_QWEN_API_KEY': JSON.stringify(
        env.REACT_APP_QWEN_API_KEY ||
          env.QWEN_API_KEY ||
          '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'
      ),
      'process.env.REACT_APP_QWEN_MODEL': JSON.stringify(
        env.REACT_APP_QWEN_MODEL || env.QWEN_MODEL || 'qwen/qwen3-235b-a22b:free'
      ),
      'process.env.REACT_APP_QWEN_API_BASE_URL': JSON.stringify(
        env.REACT_APP_QWEN_API_BASE_URL || env.QWEN_API_BASE_URL || 'https://openrouter.ai/api/v1'
      ),
      // Legacy support
      'process.env.API_KEY': JSON.stringify(env.REACT_APP_QWEN_API_KEY || env.QWEN_API_KEY),
      'process.env.QWEN_API_KEY': JSON.stringify(env.REACT_APP_QWEN_API_KEY || env.QWEN_API_KEY),
      'process.env.QWEN_MODEL': JSON.stringify(env.REACT_APP_QWEN_MODEL || env.QWEN_MODEL),
      'process.env.QWEN_API_BASE_URL': JSON.stringify(
        env.REACT_APP_QWEN_API_BASE_URL || env.QWEN_API_BASE_URL
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});

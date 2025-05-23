/**
 * Diagnostic Panel Component
 * Shows environment variable and API configuration status
 */

import React, { useState, useEffect } from 'react';
import { qwenAiService } from '../services/qwenAiService';

interface DiagnosticInfo {
  environmentVars: {
    [key: string]: string | undefined;
  };
  qwenConfig: {
    model: string;
    baseUrl: string;
    hasApiKey: boolean;
  };
  connectionTest?: {
    success: boolean;
    error?: string;
  };
}

export const DiagnosticPanel: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = () => {
    // Get environment variables
    const environmentVars = {
      'REACT_APP_QWEN_API_KEY': getEnvVar('REACT_APP_QWEN_API_KEY'),
      'QWEN_API_KEY': getEnvVar('QWEN_API_KEY'),
      'REACT_APP_QWEN_MODEL': getEnvVar('REACT_APP_QWEN_MODEL'),
      'REACT_APP_QWEN_API_BASE_URL': getEnvVar('REACT_APP_QWEN_API_BASE_URL'),
      'NODE_ENV': getEnvVar('NODE_ENV'),
    };

    // Get Qwen service configuration
    const qwenConfig = qwenAiService.getModelInfo();

    setDiagnostics({
      environmentVars,
      qwenConfig,
    });
  };

  const getEnvVar = (key: string): string | undefined => {
    // Try multiple sources
    if (typeof window !== 'undefined') {
      const windowEnv = (window as any).__ENV__;
      if (windowEnv && windowEnv[key]) {
        return windowEnv[key];
      }
    }
    
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const viteEnv = import.meta.env[key];
      if (viteEnv) return viteEnv;
    }
    
    if (typeof process !== 'undefined' && process.env) {
      const nodeEnv = process.env[key];
      if (nodeEnv) return nodeEnv;
    }
    
    return undefined;
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const success = await qwenAiService.testConnection();
      setDiagnostics(prev => prev ? {
        ...prev,
        connectionTest: { success }
      } : null);
    } catch (error) {
      setDiagnostics(prev => prev ? {
        ...prev,
        connectionTest: { 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        }
      } : null);
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Show API Diagnostics"
      >
        🔧 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">🔧 API Diagnostics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {diagnostics && (
        <div className="space-y-4 text-sm">
          {/* Environment Variables */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Environment Variables:</h4>
            <div className="space-y-1">
              {Object.entries(diagnostics.environmentVars).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className={value ? 'text-green-600' : 'text-red-600'}>
                    {value ? (key.includes('KEY') ? `${value.substring(0, 10)}...` : value) : 'missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Qwen Configuration */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Qwen Configuration:</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="text-blue-600">{diagnostics.qwenConfig.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base URL:</span>
                <span className="text-blue-600 truncate">{diagnostics.qwenConfig.baseUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Key:</span>
                <span className={diagnostics.qwenConfig.hasApiKey ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.qwenConfig.hasApiKey ? '✅ Present' : '❌ Missing'}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Test */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-700">Connection Test:</h4>
              <button
                onClick={testConnection}
                disabled={isTestingConnection}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
              >
                {isTestingConnection ? 'Testing...' : 'Test'}
              </button>
            </div>
            {diagnostics.connectionTest && (
              <div className={`p-2 rounded ${diagnostics.connectionTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {diagnostics.connectionTest.success ? (
                  '✅ Connection successful'
                ) : (
                  `❌ Connection failed: ${diagnostics.connectionTest.error}`
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t">
            <button
              onClick={loadDiagnostics}
              className="w-full bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
            >
              🔄 Refresh Diagnostics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticPanel;

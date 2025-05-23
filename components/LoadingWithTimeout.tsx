/**
 * Loading Component with Timeout Warning for AI Lesson Planner
 * Shows progress and helpful messages during AI generation
 */

import React, { useState, useEffect } from 'react';

interface LoadingWithTimeoutProps {
  isLoading: boolean;
  message?: string;
  onCancel?: () => void;
}

export function LoadingWithTimeout({
  isLoading,
  message = 'Generating lesson plan...',
  onCancel,
}: LoadingWithTimeoutProps): React.ReactNode {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    if (!isLoading) {
      setTimeElapsed(0);
      setCurrentMessage(message);
      return;
    }

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, message]);

  useEffect(() => {
    if (!isLoading) return;

    // Update message based on time elapsed
    if (timeElapsed < 10) {
      setCurrentMessage('🤖 AI is thinking...');
    } else if (timeElapsed < 30) {
      setCurrentMessage('🧠 Generating comprehensive lesson plan...');
    } else if (timeElapsed < 60) {
      setCurrentMessage('⏳ Large AI model is working hard...');
    } else if (timeElapsed < 90) {
      setCurrentMessage('🔄 Trying alternative approach...');
    } else if (timeElapsed < 120) {
      setCurrentMessage('⚡ Using faster fallback model...');
    } else {
      setCurrentMessage('🛠️ Creating backup lesson plan...');
    }
  }, [timeElapsed, isLoading]);

  if (!isLoading) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const getProgressColor = (): string => {
    if (timeElapsed < 30) return 'text-sky-400';
    if (timeElapsed < 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getProgressWidth = (): string => {
    // Progress bar that fills over 2 minutes
    const progress = Math.min((timeElapsed / 120) * 100, 100);
    return `${progress}%`;
  };

  return (
    <div className='bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xl font-semibold text-sky-400'>🤖 AI Lesson Planner</h3>
        <div className={`text-sm font-mono ${getProgressColor()}`}>{formatTime(timeElapsed)}</div>
      </div>

      {/* Progress Bar */}
      <div className='w-full bg-slate-700 rounded-full h-2 mb-4'>
        <div
          className='bg-gradient-to-r from-sky-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out'
          style={{ width: getProgressWidth() }}
        />
      </div>

      {/* Current Message */}
      <div className='flex items-center justify-center mb-4'>
        <div className='flex items-center space-x-3'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-sky-400'></div>
          <span className='text-slate-300 text-lg'>{currentMessage}</span>
        </div>
      </div>

      {/* Status Messages */}
      <div className='space-y-2 text-sm text-slate-400'>
        {timeElapsed >= 10 && (
          <div className='flex items-center space-x-2'>
            <svg className='w-4 h-4 text-green-400' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
            <span>Connected to Qwen AI</span>
          </div>
        )}

        {timeElapsed >= 30 && (
          <div className='flex items-center space-x-2'>
            <svg className='w-4 h-4 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
            <span>Large model processing (this may take a moment)</span>
          </div>
        )}

        {timeElapsed >= 60 && (
          <div className='flex items-center space-x-2'>
            <svg className='w-4 h-4 text-orange-400' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z'
                clipRule='evenodd'
              />
            </svg>
            <span>Retrying with optimized settings</span>
          </div>
        )}

        {timeElapsed >= 90 && (
          <div className='flex items-center space-x-2'>
            <svg className='w-4 h-4 text-blue-400' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z'
                clipRule='evenodd'
              />
            </svg>
            <span>Switching to faster fallback model</span>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className='mt-6 p-4 bg-slate-700 rounded-lg'>
        <h4 className='text-sm font-medium text-slate-300 mb-2'>💡 Tips while you wait:</h4>
        <ul className='text-xs text-slate-400 space-y-1'>
          <li>• Large AI models provide higher quality but take longer</li>
          <li>• The system will automatically try faster models if needed</li>
          <li>• Generated content will be comprehensive and detailed</li>
          {timeElapsed >= 60 && <li>• Consider using a simpler prompt for faster results</li>}
        </ul>
      </div>

      {/* Cancel Button */}
      {onCancel && timeElapsed >= 30 && (
        <div className='mt-4 flex justify-center'>
          <button
            onClick={onCancel}
            className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors'
          >
            Cancel Generation
          </button>
        </div>
      )}
    </div>
  );
}

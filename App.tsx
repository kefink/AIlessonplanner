import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Controls } from './components/Controls';
import { GeneratedPlan } from './components/GeneratedPlan';
import { FeasibilityNotes } from './components/FeasibilityNotes';
import { LoadingWithTimeout } from './components/LoadingWithTimeout';
import { SchoolSetup } from './components/SchoolSetup';
import { HODDashboard } from './components/HODDashboard';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import type { SchemeOfWorkEntry, LessonPlan, GenerationParams } from './types';
import { generateSchemeAndPlan } from './services/aiPlannerService';
import { type EditableData } from './services/editService';
import { DemoDataService } from './services/demoDataService';

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

type AppMode = 'setup' | 'hod' | 'demo';

function App(): React.ReactNode {
  const [schemeOfWork, setSchemeOfWork] = useState<SchemeOfWorkEntry | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeasibility, setShowFeasibility] = useState<boolean>(false);
  const [appMode, setAppMode] = useState<AppMode>('demo');
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);
  const [currentHOD, setCurrentHOD] = useState<SchoolConfig['hodAccess'][0] | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load school configuration from localStorage on app start
  useEffect(() => {
    const savedConfig = localStorage.getItem('schoolConfig');
    const savedMode = localStorage.getItem('appMode') as AppMode;
    const savedHOD = localStorage.getItem('currentHOD');

    if (savedConfig) {
      try {
        setSchoolConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to load school config:', error);
      }
    }

    if (savedMode) {
      setAppMode(savedMode);
    }

    if (savedHOD) {
      try {
        setCurrentHOD(JSON.parse(savedHOD));
      } catch (error) {
        console.error('Failed to load current HOD:', error);
      }
    }
  }, []);

  const handleSchoolSetupComplete = useCallback((config: SchoolConfig) => {
    setSchoolConfig(config);
    localStorage.setItem('schoolConfig', JSON.stringify(config));
    localStorage.setItem('appMode', 'hod');
    setAppMode('hod');
  }, []);

  const handleHODLogin = useCallback((hod: SchoolConfig['hodAccess'][0]) => {
    setCurrentHOD(hod);
    localStorage.setItem('currentHOD', JSON.stringify(hod));
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentHOD(null);
    setAppMode('demo');
    localStorage.removeItem('currentHOD');
    localStorage.setItem('appMode', 'demo');
  }, []);

  const resetToSetup = useCallback(() => {
    setSchoolConfig(null);
    setCurrentHOD(null);
    setAppMode('setup');
    localStorage.removeItem('schoolConfig');
    localStorage.removeItem('currentHOD');
    localStorage.setItem('appMode', 'setup');
  }, []);

  const setupDemoData = useCallback(() => {
    DemoDataService.setupDemoData();
    // Reload the page to apply demo data
    window.location.reload();
  }, []);

  const clearAllData = useCallback(() => {
    DemoDataService.clearDemoData();
    setSchoolConfig(null);
    setCurrentHOD(null);
    setAppMode('demo');
    setSchemeOfWork(null);
    setLessonPlan(null);
    setError(null);
  }, []);

  const handleGeneratePlan = useCallback(async (params: GenerationParams) => {
    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setSchemeOfWork(null);
    setLessonPlan(null);

    try {
      const result = await generateSchemeAndPlan(params);

      // Check if generation was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setSchemeOfWork(result.schemeOfWork);
      setLessonPlan(result.lessonPlan);
    } catch (err) {
      // Check if error was due to cancellation
      if (abortControllerRef.current?.signal.aborted) {
        setError('Generation was cancelled.');
        return;
      }

      console.error('Generation failed:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred during plan generation.';

      // Provide more helpful error messages
      if (errorMessage.includes('timeout')) {
        setError(
          'Generation timed out. The AI model is experiencing high load. Please try again or use a simpler prompt.'
        );
      } else if (errorMessage.includes('rate limit')) {
        setError('Rate limit exceeded. Please wait a moment and try again.');
      } else if (errorMessage.includes('API Key')) {
        setError('API configuration issue. Please check your Qwen API key.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const handleCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setError('Generation cancelled by user.');
    }
  }, []);

  const handleDataUpdate = useCallback((data: EditableData) => {
    setSchemeOfWork(data.schemeOfWork);
    setLessonPlan(data.lessonPlan);
  }, []);

  // Render School Setup if no configuration exists or setup mode is active
  if (appMode === 'setup' || !schoolConfig) {
    return (
      <SchoolSetup
        onSetupComplete={handleSchoolSetupComplete}
        existingConfig={schoolConfig || undefined}
      />
    );
  }

  // Render HOD Dashboard if school is configured and HOD is logged in
  if (appMode === 'hod' && schoolConfig && currentHOD) {
    return (
      <HODDashboard
        hodInfo={currentHOD}
        schoolConfig={{
          schoolName: schoolConfig.schoolName,
          curriculum: schoolConfig.curriculum,
          subjects: schoolConfig.subjects,
          levels: schoolConfig.levels,
        }}
        onLogout={handleLogout}
      />
    );
  }

  // Render HOD Login if school is configured but no HOD is logged in
  if (appMode === 'hod' && schoolConfig && !currentHOD) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-4 md:p-8'>
        <div className='max-w-md mx-auto mt-20'>
          <div className='bg-slate-800 p-8 rounded-xl shadow-2xl'>
            <div className='text-center mb-6'>
              <h1 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300'>
                {schoolConfig.schoolName}
              </h1>
              <p className='text-slate-300 mt-2'>HOD Login</p>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-slate-300'>Select Your Department:</h3>
              {schoolConfig.hodAccess.map((hod, index) => (
                <button
                  key={index}
                  onClick={() => handleHODLogin(hod)}
                  className='w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors'
                >
                  <div className='font-medium text-white'>{hod.name}</div>
                  <div className='text-sm text-slate-400'>Head of {hod.subject}</div>
                </button>
              ))}
            </div>

            <div className='mt-6 pt-6 border-t border-slate-600'>
              <button
                onClick={() => setAppMode('demo')}
                className='w-full px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors'
              >
                Continue as Demo User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Demo Mode (Original Interface)
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-4 md:p-8'>
      <header className='text-center mb-8'>
        <h1 className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300'>
          AI Lesson Planner Assistant
        </h1>
        <p className='text-slate-300 mt-2 text-lg'>
          Generate Schemes of Work & Lesson Plans from Curriculum Data
        </p>

        <div className='flex flex-wrap justify-center gap-4 mt-4'>
          <button
            onClick={() => setShowFeasibility(true)}
            className='px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-md transition-colors duration-150'
          >
            About This Project
          </button>

          <button
            onClick={() => setAppMode('setup')}
            className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors duration-150'
          >
            🏫 Setup for School
          </button>

          {schoolConfig && (
            <button
              onClick={() => setAppMode('hod')}
              className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-colors duration-150'
            >
              👨‍🏫 HOD Dashboard
            </button>
          )}

          <button
            onClick={setupDemoData}
            className='px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-md transition-colors duration-150'
          >
            🚀 Quick Demo Setup
          </button>

          {(schoolConfig || schemeOfWork || lessonPlan) && (
            <button
              onClick={clearAllData}
              className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-colors duration-150'
            >
              🗑️ Clear All Data
            </button>
          )}
        </div>
      </header>

      <main className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-1 bg-slate-800 p-6 rounded-xl shadow-2xl'>
          <Controls onGenerate={handleGeneratePlan} isLoading={isLoading} />
        </div>

        <div className='md:col-span-2 space-y-6'>
          {isLoading && (
            <LoadingWithTimeout
              isLoading={isLoading}
              message='Generating comprehensive lesson plan...'
              onCancel={handleCancelGeneration}
            />
          )}
          {error && (
            <div className='bg-red-700 p-4 rounded-lg shadow-lg text-white'>
              <h3 className='font-semibold text-lg'>Generation Error:</h3>
              <p>{error}</p>
            </div>
          )}
          {(schemeOfWork || lessonPlan) && !isLoading && !error && (
            <GeneratedPlan
              schemeOfWork={schemeOfWork}
              lessonPlan={lessonPlan}
              onDataUpdate={handleDataUpdate}
            />
          )}
          {!isLoading && !error && !schemeOfWork && !lessonPlan && (
            <div className='bg-slate-800 p-6 rounded-xl shadow-2xl text-center'>
              <p className='text-slate-400 text-lg'>Generated plans will appear here.</p>
              <p className='text-slate-500 mt-2'>
                Select parameters and click "Generate Plan" to start.
              </p>
            </div>
          )}
        </div>
      </main>

      {showFeasibility && <FeasibilityNotes onClose={() => setShowFeasibility(false)} />}

      {/* Diagnostic Panel for debugging API issues */}
      <DiagnosticPanel />

      <footer className='text-center mt-12 text-slate-400 text-sm'>
        <p>&copy; {new Date().getFullYear()} AI Lesson Planner PoC. For demonstration purposes.</p>
      </footer>
    </div>
  );
}

export default App;

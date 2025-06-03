import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Controls } from './components/Controls';
import { GeneratedPlan } from './components/GeneratedPlan';
import { FeasibilityNotes } from './components/FeasibilityNotes';
import { LoadingWithTimeout } from './components/LoadingWithTimeout';
import { SchoolSetup } from './components/SchoolSetup';
import { HODDashboard } from './components/HODDashboard';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { TeacherProfileSetup } from './components/TeacherProfileSetup';
import { ScheduleConfig } from './components/ScheduleConfig';
import type { SchemeOfWorkEntry, LessonPlan, GenerationParams } from './types';
import type { TeacherProfile } from './types/teacher';
import { generateSchemeAndPlan } from './services/aiPlannerService';
import { type EditableData } from './services/editService';
import { DemoDataService } from './services/demoDataService';
import { TeacherProfileService } from './services/teacherProfileService';
import { SubjectManager } from './components/SubjectManager';
import { ResourceManager } from './components/ResourceManager';
import { TeacherManager } from './components/TeacherManager';
import { ClassManager } from './components/ClassManager';
import { ScheduleExporter } from './components/ScheduleExporter';

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

type AppMode = 'setup' | 'hod' | 'teacher' | 'teacher-setup' | 'demo' | 'schedule' | 'resources' | 'teachers' | 'classes' | 'export';

function App(): React.ReactNode {
  const [schemeOfWork, setSchemeOfWork] = useState<SchemeOfWorkEntry | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeasibility, setShowFeasibility] = useState<boolean>(false);
  const [appMode, setAppMode] = useState<AppMode>('demo');
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);
  const [currentHOD, setCurrentHOD] = useState<SchoolConfig['hodAccess'][0] | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [scheduleConfig, setScheduleConfig] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load school configuration and teacher profile from localStorage on app start
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

    // Load teacher profile
    const profile = TeacherProfileService.getTeacherProfile();
    if (profile) {
      setTeacherProfile(profile);
      // If teacher profile exists but mode is demo, switch to teacher mode
      if (savedMode === 'demo' || !savedMode) {
        setAppMode('teacher');
        localStorage.setItem('appMode', 'teacher');
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

  const handleTeacherProfileComplete = useCallback((profile: TeacherProfile) => {
    setTeacherProfile(profile);
    setAppMode('teacher');
    localStorage.setItem('appMode', 'teacher');
  }, []);

  const handleTeacherLogout = useCallback(() => {
    setTeacherProfile(null);
    setAppMode('demo');
    TeacherProfileService.clearAllData();
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

  const handleScheduleConfigComplete = useCallback((config: any) => {
    setScheduleConfig(config);
    localStorage.setItem('scheduleConfig', JSON.stringify(config));
    setAppMode('demo');
  }, []);

  const handleResourceUpdate = useCallback((updatedResources: any[]) => {
    setResources(updatedResources);
    localStorage.setItem('resources', JSON.stringify(updatedResources));
  }, []);

  const handleTeacherUpdate = useCallback((updatedTeachers: any[]) => {
    setTeachers(updatedTeachers);
    localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
  }, []);

  const handleClassUpdate = useCallback((updatedClasses: any[]) => {
    setClasses(updatedClasses);
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
  }, []);

  const handleScheduleImport = useCallback((data: any) => {
    setClasses(data.classes);
    setTeachers(data.teachers);
    setResources(data.resources);
    setSubjects(data.subjects);
    setScheduleConfig(data.scheduleConfig);
    
    // Update localStorage
    localStorage.setItem('classes', JSON.stringify(data.classes));
    localStorage.setItem('teachers', JSON.stringify(data.teachers));
    localStorage.setItem('resources', JSON.stringify(data.resources));
    localStorage.setItem('subjects', JSON.stringify(data.subjects));
    localStorage.setItem('scheduleConfig', JSON.stringify(data.scheduleConfig));
  }, []);

  // Load resources, teachers, and classes from localStorage
  useEffect(() => {
    const savedResources = localStorage.getItem('resources');
    const savedTeachers = localStorage.getItem('teachers');
    const savedClasses = localStorage.getItem('classes');

    if (savedResources) {
      try {
        setResources(JSON.parse(savedResources));
      } catch (error) {
        console.error('Failed to load resources:', error);
      }
    }

    if (savedTeachers) {
      try {
        setTeachers(JSON.parse(savedTeachers));
      } catch (error) {
        console.error('Failed to load teachers:', error);
      }
    }

    if (savedClasses) {
      try {
        setClasses(JSON.parse(savedClasses));
      } catch (error) {
        console.error('Failed to load classes:', error);
      }
    }
  }, []);

  // Render Teacher Profile Setup if teacher-setup mode is active
  if (appMode === 'teacher-setup') {
    return (
      <TeacherProfileSetup
        onComplete={handleTeacherProfileComplete}
        onSkip={() => setAppMode('demo')}
      />
    );
  }

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

  // Render Teacher Dashboard if teacher profile exists and teacher mode is active
  if (appMode === 'teacher' && teacherProfile) {
    const profileStatus = TeacherProfileService.getProfileCompletionStatus();

    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-4 md:p-8'>
        <header className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300'>
            👨‍🏫 Teacher Dashboard
          </h1>
          <p className='text-slate-300 mt-2 text-lg'>
            Welcome back, {teacherProfile.personalInfo.name}!
          </p>

          {/* Profile Status */}
          <div className='mt-4 flex justify-center'>
            <div className='bg-slate-800 rounded-lg px-6 py-3'>
              <div className='flex items-center space-x-4'>
                <div className='text-sm'>
                  <span className='text-slate-400'>Profile: </span>
                  <span className={profileStatus.isComplete ? 'text-green-400' : 'text-yellow-400'}>
                    {profileStatus.completionPercentage}% Complete
                  </span>
                </div>
                <div className='text-sm'>
                  <span className='text-slate-400'>School: </span>
                  <span className='text-slate-200'>{teacherProfile.school.name}</span>
                </div>
                <button
                  onClick={handleTeacherLogout}
                  className='text-sm text-red-400 hover:text-red-300 underline'
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className='max-w-6xl mx-auto'>
          {!profileStatus.isComplete && (
            <div className='bg-yellow-600 p-4 rounded-lg mb-6'>
              <h3 className='font-semibold text-lg'>Complete Your Profile</h3>
              <p>Missing: {profileStatus.missingFields.join(', ')}</p>
              <button
                onClick={() => setAppMode('teacher-setup')}
                className='mt-2 px-4 py-2 bg-yellow-700 hover:bg-yellow-800 rounded-lg'
              >
                Complete Setup
              </button>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='md:col-span-1 bg-slate-800 p-6 rounded-xl shadow-2xl'>
              <h2 className='text-xl font-semibold text-cyan-400 mb-4'>Quick Generate</h2>
              <p className='text-slate-400 text-sm mb-4'>
                Generate lesson plans with auto-populated teacher and class details
              </p>
              <Controls onGenerate={handleGeneratePlan} isLoading={isLoading} />
            </div>

            <div className='md:col-span-2 space-y-6'>
              {isLoading && (
                <LoadingWithTimeout
                  isLoading={isLoading}
                  message='Generating your personalized lesson plan...'
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
                  <div className='text-6xl mb-4'>📚</div>
                  <h3 className='text-xl font-semibold text-slate-300 mb-2'>
                    Ready to Generate Lesson Plans
                  </h3>
                  <p className='text-slate-400 text-lg mb-4'>
                    Your profile is set up for automated lesson planning
                  </p>
                  <p className='text-slate-500'>
                    Select a class and topic, then click "Generate Plan" to create a fully automated
                    lesson plan with your details pre-filled.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Diagnostic Panel for debugging API issues */}
        <DiagnosticPanel />
      </div>
    );
  }

  // Render Schedule Configuration
  if (appMode === 'schedule') {
    return (
      <ScheduleConfig
        onConfigComplete={handleScheduleConfigComplete}
        existingConfig={scheduleConfig}
      />
    );
  }

  // Render Resource Management
  if (appMode === 'resources') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-4 md:p-8'>
        <header className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300'>
            Resource Management
          </h1>
          <div className='flex justify-center gap-4 mt-4'>
            <button
              onClick={() => setAppMode('demo')}
              className='px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg shadow-md transition-colors duration-150'
            >
              ← Back to Main
            </button>
          </div>
        </header>

        <main className='max-w-6xl mx-auto'>
          <ResourceManager
            onResourceUpdate={handleResourceUpdate}
            existingResources={resources}
          />
        </main>
      </div>
    );
  }

  // Render Teacher Management
  if (appMode === 'teachers') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-4 md:p-8'>
        <header className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300'>
            Teacher Management
          </h1>
          <div className='flex justify-center gap-4 mt-4'>
            <button
              onClick={() => setAppMode('demo')}
              className='px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg shadow-md transition-colors duration-150'
            >
              ← Back to Main
            </button>
          </div>
        </header>

        <main className='max-w-6xl mx-auto'>
          <TeacherManager
            onTeacherUpdate={handleTeacherUpdate}
            existingTeachers={teachers}
          />
        </main>
      </div>
    );
  }

  // Render Class Management
  if (appMode === 'classes') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-4 md:p-8'>
        <header className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300'>
            Class Management
          </h1>
          <div className='flex justify-center gap-4 mt-4'>
            <button
              onClick={() => setAppMode('demo')}
              className='px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg shadow-md transition-colors duration-150'
            >
              ← Back to Main
            </button>
          </div>
        </header>

        <main className='max-w-6xl mx-auto'>
          <ClassManager
            onClassUpdate={handleClassUpdate}
            existingClasses={classes}
            teachers={teachers}
            resources={resources}
            subjects={subjects}
          />
        </main>
      </div>
    );
  }

  // Render Schedule Export/Import
  if (appMode === 'export') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-4 md:p-8'>
        <header className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300'>
            Schedule Export/Import
          </h1>
          <div className='flex justify-center gap-4 mt-4'>
            <button
              onClick={() => setAppMode('demo')}
              className='px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg shadow-md transition-colors duration-150'
            >
              ← Back to Main
            </button>
          </div>
        </header>

        <main className='max-w-6xl mx-auto'>
          <ScheduleExporter
            scheduleData={{
              classes,
              teachers,
              resources,
              subjects,
              scheduleConfig
            }}
            onImport={handleScheduleImport}
          />
        </main>
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
            onClick={() => setAppMode('schedule')}
            className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-colors duration-150'
          >
            ⏰ Configure Schedule
          </button>

          <button
            onClick={() => setAppMode('resources')}
            className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-colors duration-150'
          >
            🏫 Manage Resources
          </button>

          <button
            onClick={() => setAppMode('teachers')}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors duration-150'
          >
            👨‍🏫 Manage Teachers
          </button>

          <button
            onClick={() => setAppMode('teacher-setup')}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors duration-150'
          >
            👨‍🏫 Teacher Setup
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

          {teacherProfile && (
            <button
              onClick={() => setAppMode('teacher')}
              className='px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md transition-colors duration-150'
            >
              📚 Teacher Dashboard
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

          <button
            onClick={() => setAppMode('classes')}
            className='px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-colors duration-150'
          >
            👥 Manage Classes
          </button>

          <button
            onClick={() => setAppMode('export')}
            className='px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-md transition-colors duration-150'
          >
            📤 Export/Import Schedule
          </button>
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

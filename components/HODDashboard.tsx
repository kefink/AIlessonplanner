/**
 * Head of Department Dashboard
 * Specialized interface for Subject HODs to manage lesson plans
 */

import React, { useState, useEffect } from 'react';
import { Controls } from './Controls';
import { GeneratedPlan } from './GeneratedPlan';
import { LoadingWithTimeout } from './LoadingWithTimeout';
import { CurriculumBrowser } from './CurriculumBrowser';
import type { SchemeOfWorkEntry, LessonPlan, GenerationParams } from '../types';
import { generateSchemeAndPlan } from '../services/aiPlannerService';
import { type EditableData } from '../services/editService';

interface HODDashboardProps {
  hodInfo: {
    name: string;
    email: string;
    subject: string;
    permissions: string[];
  };
  schoolConfig: {
    schoolName: string;
    curriculum: string;
    subjects: string[];
    levels: string[];
  };
  onLogout?: () => void;
}

interface LessonPlanRecord {
  id: string;
  term: string;
  week: string;
  lesson: string;
  grade: string;
  subject: string;
  createdAt: Date;
  lastModified: Date;
  schemeOfWork: SchemeOfWorkEntry;
  lessonPlan: LessonPlan;
  status: 'draft' | 'approved' | 'published';
}

export function HODDashboard({
  hodInfo,
  schoolConfig,
  onLogout,
}: HODDashboardProps): React.ReactNode {
  const [activeTab, setActiveTab] = useState<'generate' | 'library' | 'analytics'>('generate');
  const [schemeOfWork, setSchemeOfWork] = useState<SchemeOfWorkEntry | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonLibrary, setLessonLibrary] = useState<LessonPlanRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<LessonPlanRecord | null>(null);
  const [showCurriculumBrowser, setShowCurriculumBrowser] = useState<boolean>(false);

  // Load saved lesson plans from localStorage (in production, this would be from a database)
  useEffect(() => {
    const saved = localStorage.getItem(`lessonLibrary_${hodInfo.email}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLessonLibrary(
          parsed.map((record: any) => ({
            ...record,
            createdAt: new Date(record.createdAt),
            lastModified: new Date(record.lastModified),
          }))
        );
      } catch (error) {
        console.error('Failed to load lesson library:', error);
      }
    }
  }, [hodInfo.email]);

  const saveLessonPlan = (
    scheme: SchemeOfWorkEntry,
    plan: LessonPlan,
    params: GenerationParams
  ) => {
    const record: LessonPlanRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      term: params.term,
      week: params.week,
      lesson: params.lesson,
      grade: params.grade,
      subject: params.subject,
      createdAt: new Date(),
      lastModified: new Date(),
      schemeOfWork: scheme,
      lessonPlan: plan,
      status: 'draft',
    };

    const updatedLibrary = [...lessonLibrary, record];
    setLessonLibrary(updatedLibrary);
    localStorage.setItem(`lessonLibrary_${hodInfo.email}`, JSON.stringify(updatedLibrary));
  };

  const handleGeneratePlan = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);
    setSchemeOfWork(null);
    setLessonPlan(null);

    try {
      const result = await generateSchemeAndPlan(params);
      setSchemeOfWork(result.schemeOfWork);
      setLessonPlan(result.lessonPlan);

      // Auto-save to library
      saveLessonPlan(result.schemeOfWork, result.lessonPlan, params);
    } catch (err) {
      console.error('Generation failed:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred during plan generation.';

      if (errorMessage.includes('timeout')) {
        setError('Generation timed out. The AI model is experiencing high load. Please try again.');
      } else if (errorMessage.includes('rate limit')) {
        setError('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataUpdate = (data: EditableData) => {
    setSchemeOfWork(data.schemeOfWork);
    setLessonPlan(data.lessonPlan);

    // Update in library if this is an existing record
    if (selectedRecord) {
      const updatedRecord = {
        ...selectedRecord,
        schemeOfWork: data.schemeOfWork!,
        lessonPlan: data.lessonPlan!,
        lastModified: new Date(),
      };

      const updatedLibrary = lessonLibrary.map(record =>
        record.id === selectedRecord.id ? updatedRecord : record
      );
      setLessonLibrary(updatedLibrary);
      localStorage.setItem(`lessonLibrary_${hodInfo.email}`, JSON.stringify(updatedLibrary));
      setSelectedRecord(updatedRecord);
    }
  };

  const loadFromLibrary = (record: LessonPlanRecord) => {
    setSchemeOfWork(record.schemeOfWork);
    setLessonPlan(record.lessonPlan);
    setSelectedRecord(record);
    setActiveTab('generate');
  };

  const deleteFromLibrary = (recordId: string) => {
    const updatedLibrary = lessonLibrary.filter(record => record.id !== recordId);
    setLessonLibrary(updatedLibrary);
    localStorage.setItem(`lessonLibrary_${hodInfo.email}`, JSON.stringify(updatedLibrary));

    if (selectedRecord?.id === recordId) {
      setSelectedRecord(null);
      setSchemeOfWork(null);
      setLessonPlan(null);
    }
  };

  const getAnalytics = () => {
    const totalPlans = lessonLibrary.length;
    const subjectPlans = lessonLibrary.filter(record => record.subject === hodInfo.subject).length;
    const thisWeekPlans = lessonLibrary.filter(record => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return record.createdAt > weekAgo;
    }).length;

    return { totalPlans, subjectPlans, thisWeekPlans };
  };

  const analytics = getAnalytics();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100'>
      {/* Header */}
      <header className='bg-slate-800 shadow-xl p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300'>
                {schoolConfig.schoolName} - AI Lesson Planner
              </h1>
              <p className='text-slate-300 mt-1'>
                Welcome, {hodInfo.name} • Head of {hodInfo.subject} Department
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-right'>
                <div className='text-sm text-slate-400'>Curriculum: {schoolConfig.curriculum}</div>
                <div className='text-sm text-slate-400'>Subject: {hodInfo.subject}</div>
              </div>
              <button
                onClick={() => setShowCurriculumBrowser(true)}
                className='px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors'
              >
                📚 Browse Curriculum
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors'
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className='bg-slate-700 border-b border-slate-600'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='flex space-x-8'>
            {[
              { id: 'generate', label: '📝 Generate Plans', icon: '🤖' },
              { id: 'library', label: '📚 Lesson Library', icon: '📖' },
              { id: 'analytics', label: '📊 Analytics', icon: '📈' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto p-6'>
        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-1'>
              <div className='bg-slate-800 p-6 rounded-xl shadow-2xl'>
                <h2 className='text-xl font-semibold text-sky-400 mb-4'>
                  Generate New Lesson Plan
                </h2>
                <Controls
                  onGenerate={handleGeneratePlan}
                  isLoading={isLoading}
                  restrictToSubject={hodInfo.subject}
                  schoolConfig={schoolConfig}
                />
              </div>
            </div>

            <div className='lg:col-span-2 space-y-6'>
              {isLoading && (
                <LoadingWithTimeout
                  isLoading={isLoading}
                  message='Generating lesson plan for your department...'
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
                <div className='bg-slate-800 p-8 rounded-xl shadow-2xl text-center'>
                  <div className='text-6xl mb-4'>🎯</div>
                  <h3 className='text-xl font-semibold text-slate-300 mb-2'>Ready to Create</h3>
                  <p className='text-slate-400'>
                    Generate comprehensive lesson plans for {hodInfo.subject} using AI assistance.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-semibold text-sky-400'>📚 Lesson Plan Library</h2>
              <div className='text-sm text-slate-400'>
                {lessonLibrary.length} lesson plans saved
              </div>
            </div>

            {lessonLibrary.length === 0 ? (
              <div className='bg-slate-800 p-8 rounded-xl text-center'>
                <div className='text-6xl mb-4'>📚</div>
                <h3 className='text-xl font-semibold text-slate-300 mb-2'>No Lesson Plans Yet</h3>
                <p className='text-slate-400 mb-4'>
                  Start generating lesson plans to build your library.
                </p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className='px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors'
                >
                  Generate First Plan
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {lessonLibrary.map(record => (
                  <div key={record.id} className='bg-slate-800 p-4 rounded-lg shadow-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='font-semibold text-white'>
                        {record.subject} - {record.grade}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          record.status === 'published'
                            ? 'bg-green-600 text-green-100'
                            : record.status === 'approved'
                              ? 'bg-blue-600 text-blue-100'
                              : 'bg-yellow-600 text-yellow-100'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>

                    <div className='text-sm text-slate-400 mb-3'>
                      <div>
                        Term {record.term}, Week {record.week}, Lesson {record.lesson}
                      </div>
                      <div>Created: {record.createdAt.toLocaleDateString()}</div>
                    </div>

                    <div className='flex space-x-2'>
                      <button
                        onClick={() => loadFromLibrary(record)}
                        className='flex-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-sm font-medium transition-colors'
                      >
                        Open
                      </button>
                      <button
                        onClick={() => deleteFromLibrary(record.id)}
                        className='px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold text-sky-400'>📊 Department Analytics</h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='bg-slate-800 p-6 rounded-xl'>
                <div className='text-3xl font-bold text-sky-400'>{analytics.totalPlans}</div>
                <div className='text-slate-300'>Total Lesson Plans</div>
              </div>

              <div className='bg-slate-800 p-6 rounded-xl'>
                <div className='text-3xl font-bold text-green-400'>{analytics.subjectPlans}</div>
                <div className='text-slate-300'>{hodInfo.subject} Plans</div>
              </div>

              <div className='bg-slate-800 p-6 rounded-xl'>
                <div className='text-3xl font-bold text-purple-400'>{analytics.thisWeekPlans}</div>
                <div className='text-slate-300'>Created This Week</div>
              </div>
            </div>

            <div className='bg-slate-800 p-6 rounded-xl'>
              <h3 className='text-lg font-semibold text-slate-300 mb-4'>Recent Activity</h3>
              <div className='space-y-3'>
                {lessonLibrary
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .slice(0, 5)
                  .map(record => (
                    <div
                      key={record.id}
                      className='flex items-center justify-between py-2 border-b border-slate-700'
                    >
                      <div>
                        <div className='font-medium text-white'>
                          {record.subject} - {record.grade} (Term {record.term}, Week {record.week})
                        </div>
                        <div className='text-sm text-slate-400'>
                          {record.createdAt.toLocaleDateString()} at{' '}
                          {record.createdAt.toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        onClick={() => loadFromLibrary(record)}
                        className='px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-sm font-medium transition-colors'
                      >
                        View
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Curriculum Browser Modal */}
      {showCurriculumBrowser && (
        <CurriculumBrowser
          onClose={() => setShowCurriculumBrowser(false)}
          onSelectCurriculum={curriculum => {
            console.log('Selected curriculum:', curriculum);
            setShowCurriculumBrowser(false);
            // Could potentially pre-fill lesson generation with this curriculum data
          }}
        />
      )}
    </div>
  );
}

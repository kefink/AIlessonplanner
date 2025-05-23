/**
 * School Setup Component for B2B School Configuration
 * Allows schools to customize the system for their specific needs
 */

import React, { useState, useEffect } from 'react';
import { CurriculumService } from '../services/curriculumDatabase';

interface SchoolConfig {
  schoolName: string;
  schoolType: 'primary' | 'secondary' | 'mixed';
  curriculum: 'CBC' | 'IGCSE' | 'IB' | 'American' | 'British';
  country: string;
  region: string;
  logo?: string;
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

interface SchoolSetupProps {
  onSetupComplete: (config: SchoolConfig) => void;
  existingConfig?: SchoolConfig;
}

export function SchoolSetup({
  onSetupComplete,
  existingConfig,
}: SchoolSetupProps): React.ReactNode {
  const [config, setConfig] = useState<SchoolConfig>(
    existingConfig || {
      schoolName: '',
      schoolType: 'mixed',
      curriculum: 'CBC',
      country: 'Kenya',
      region: '',
      subjects: [],
      levels: [],
      termStructure: { terms: 3, weeksPerTerm: 13 },
      hodAccess: [],
    }
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [newHod, setNewHod] = useState({
    name: '',
    email: '',
    subject: '',
    permissions: ['generate', 'edit', 'download'],
  });
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

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
    },
    IGCSE: ['Mathematics', 'English', 'Sciences', 'Humanities', 'Languages', 'Arts', 'Technology'],
    IB: [
      'Mathematics',
      'Sciences',
      'Individuals & Societies',
      'Language & Literature',
      'Arts',
      'Language Acquisition',
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

  // Get dynamic subjects based on curriculum and school type
  const getDynamicSubjects = (curriculum: string, schoolType: string): string[] => {
    if (curriculum === 'CBC') {
      // Use embedded curriculum database for CBC
      const allSubjects = new Set<string>();

      if (schoolType === 'primary' || schoolType === 'mixed') {
        // Add Pre-Primary subjects
        CurriculumService.getSubjectsForLevel('pre-primary').forEach(subject =>
          allSubjects.add(subject)
        );
        // Add Lower Primary subjects
        CurriculumService.getSubjectsForLevel('lower-primary').forEach(subject =>
          allSubjects.add(subject)
        );
        // Add Upper Primary subjects
        CurriculumService.getSubjectsForLevel('upper-primary').forEach(subject =>
          allSubjects.add(subject)
        );
      }

      if (schoolType === 'secondary' || schoolType === 'mixed') {
        // Add Junior School subjects
        CurriculumService.getSubjectsForLevel('junior-school').forEach(subject =>
          allSubjects.add(subject)
        );
      }

      return Array.from(allSubjects).sort();
    }

    // Fallback to hardcoded subjects for other curricula
    const fallbackSubjects = curriculumSubjects[curriculum as keyof typeof curriculumSubjects];
    if (Array.isArray(fallbackSubjects)) {
      return fallbackSubjects;
    } else if (typeof fallbackSubjects === 'object') {
      const schoolTypeKey = schoolType === 'mixed' ? 'secondary' : schoolType;
      return fallbackSubjects[schoolTypeKey as keyof typeof fallbackSubjects] || [];
    }

    return [];
  };

  // Update available subjects when curriculum or school type changes
  useEffect(() => {
    const subjects = getDynamicSubjects(config.curriculum, config.schoolType);
    setAvailableSubjects(subjects);

    // Clear selected subjects that are no longer available
    const validSubjects = config.subjects.filter(subject => subjects.includes(subject));
    if (validSubjects.length !== config.subjects.length) {
      updateConfig('subjects', validSubjects);
    }
  }, [config.curriculum, config.schoolType]);

  const updateConfig = (field: keyof SchoolConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addHod = () => {
    if (newHod.name && newHod.email && newHod.subject) {
      setConfig(prev => ({
        ...prev,
        hodAccess: [...prev.hodAccess, { ...newHod }],
      }));
      setNewHod({
        name: '',
        email: '',
        subject: '',
        permissions: ['generate', 'edit', 'download'],
      });
    }
  };

  const removeHod = (index: number) => {
    setConfig(prev => ({
      ...prev,
      hodAccess: prev.hodAccess.filter((_, i) => i !== index),
    }));
  };

  const handleComplete = () => {
    onSetupComplete(config);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-slate-800 rounded-xl shadow-2xl p-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300'>
              🏫 School Configuration
            </h1>
            <p className='text-slate-300 mt-2'>Customize AI Lesson Planner for your school</p>
          </div>

          {/* Progress Steps */}
          <div className='flex justify-center mb-8'>
            <div className='flex space-x-4'>
              {[1, 2, 3, 4].map(step => (
                <div
                  key={step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step ? 'bg-sky-600 text-white' : 'bg-slate-600 text-slate-400'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Basic School Info */}
          {currentStep === 1 && (
            <div className='space-y-6'>
              <h2 className='text-xl font-semibold text-sky-400 mb-4'>Basic School Information</h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    School Name
                  </label>
                  <input
                    type='text'
                    value={config.schoolName}
                    onChange={e => updateConfig('schoolName', e.target.value)}
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500'
                    placeholder='Enter your school name'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    School Type
                  </label>
                  <select
                    value={config.schoolType}
                    onChange={e => updateConfig('schoolType', e.target.value)}
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500'
                  >
                    <option value='primary'>Primary School</option>
                    <option value='secondary'>Secondary School</option>
                    <option value='mixed'>Mixed (Primary & Secondary)</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    Curriculum
                  </label>
                  <select
                    value={config.curriculum}
                    onChange={e => updateConfig('curriculum', e.target.value)}
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500'
                  >
                    <option value='CBC'>Kenya CBC</option>
                    <option value='IGCSE'>Cambridge IGCSE</option>
                    <option value='IB'>International Baccalaureate</option>
                    <option value='American'>American Curriculum</option>
                    <option value='British'>British Curriculum</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>Country</label>
                  <input
                    type='text'
                    value={config.country}
                    onChange={e => updateConfig('country', e.target.value)}
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500'
                    placeholder='Country'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    Region/State
                  </label>
                  <input
                    type='text'
                    value={config.region}
                    onChange={e => updateConfig('region', e.target.value)}
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500'
                    placeholder='Region or State'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Academic Structure */}
          {currentStep === 2 && (
            <div className='space-y-6'>
              <h2 className='text-xl font-semibold text-sky-400 mb-4'>Academic Structure</h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    Number of Terms
                  </label>
                  <select
                    value={config.termStructure.terms}
                    onChange={e =>
                      updateConfig('termStructure', {
                        ...config.termStructure,
                        terms: parseInt(e.target.value),
                      })
                    }
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500'
                  >
                    <option value={2}>2 Terms (Semesters)</option>
                    <option value={3}>3 Terms</option>
                    <option value={4}>4 Terms (Quarters)</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-300 mb-2'>
                    Weeks per Term
                  </label>
                  <input
                    type='number'
                    value={config.termStructure.weeksPerTerm}
                    onChange={e =>
                      updateConfig('termStructure', {
                        ...config.termStructure,
                        weeksPerTerm: parseInt(e.target.value),
                      })
                    }
                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500'
                    min='8'
                    max='20'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  Subjects Offered
                  <span className='text-xs text-slate-400 ml-2'>
                    ({availableSubjects.length} subjects available for {config.curriculum}{' '}
                    {config.schoolType} school)
                  </span>
                </label>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-4 bg-slate-700 rounded-lg'>
                  {availableSubjects.length > 0 ? (
                    availableSubjects.map(subject => (
                      <label key={subject} className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={config.subjects.includes(subject)}
                          onChange={e => {
                            if (e.target.checked) {
                              updateConfig('subjects', [...config.subjects, subject]);
                            } else {
                              updateConfig(
                                'subjects',
                                config.subjects.filter(s => s !== subject)
                              );
                            }
                          }}
                          className='rounded text-sky-600 focus:ring-sky-500'
                        />
                        <span className='text-sm text-slate-300'>{subject}</span>
                      </label>
                    ))
                  ) : (
                    <div className='col-span-full text-center text-slate-400 py-4'>
                      <div className='text-4xl mb-2'>📚</div>
                      <p>Loading subjects for {config.curriculum} curriculum...</p>
                    </div>
                  )}
                </div>

                {/* Quick selection buttons */}
                <div className='flex flex-wrap gap-2 mt-3'>
                  <button
                    type='button'
                    onClick={() => updateConfig('subjects', availableSubjects)}
                    className='px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-sm font-medium transition-colors'
                  >
                    Select All
                  </button>
                  <button
                    type='button'
                    onClick={() => updateConfig('subjects', [])}
                    className='px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm font-medium transition-colors'
                  >
                    Clear All
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      // Select core subjects (Math, English, Kiswahili for CBC)
                      const coreSubjects = availableSubjects.filter(subject =>
                        ['Mathematics', 'English', 'Kiswahili'].includes(subject)
                      );
                      updateConfig('subjects', coreSubjects);
                    }}
                    className='px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors'
                  >
                    Core Subjects Only
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: HOD Access Management */}
          {currentStep === 3 && (
            <div className='space-y-6'>
              <h2 className='text-xl font-semibold text-sky-400 mb-4'>
                Subject Heads of Department
              </h2>

              <div className='bg-slate-700 p-4 rounded-lg'>
                <h3 className='text-lg font-medium text-slate-300 mb-4'>Add New HOD</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <input
                    type='text'
                    placeholder='HOD Name'
                    value={newHod.name}
                    onChange={e => setNewHod(prev => ({ ...prev, name: e.target.value }))}
                    className='px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500'
                  />
                  <input
                    type='email'
                    placeholder='Email Address'
                    value={newHod.email}
                    onChange={e => setNewHod(prev => ({ ...prev, email: e.target.value }))}
                    className='px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500'
                  />
                  <select
                    value={newHod.subject}
                    onChange={e => setNewHod(prev => ({ ...prev, subject: e.target.value }))}
                    className='px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500'
                  >
                    <option value=''>Select Subject</option>
                    {config.subjects.map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addHod}
                    className='px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors'
                  >
                    Add HOD
                  </button>
                </div>
              </div>

              <div className='space-y-3'>
                <h3 className='text-lg font-medium text-slate-300'>Current HODs</h3>
                {config.hodAccess.map((hod, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between bg-slate-700 p-3 rounded-lg'
                  >
                    <div>
                      <div className='font-medium text-white'>{hod.name}</div>
                      <div className='text-sm text-slate-400'>
                        {hod.email} • {hod.subject}
                      </div>
                    </div>
                    <button
                      onClick={() => removeHod(index)}
                      className='text-red-400 hover:text-red-300 transition-colors'
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Review & Complete */}
          {currentStep === 4 && (
            <div className='space-y-6'>
              <h2 className='text-xl font-semibold text-sky-400 mb-4'>Review Configuration</h2>

              <div className='bg-slate-700 p-6 rounded-lg space-y-4'>
                <div>
                  <strong>School:</strong> {config.schoolName}
                </div>
                <div>
                  <strong>Type:</strong> {config.schoolType}
                </div>
                <div>
                  <strong>Curriculum:</strong> {config.curriculum}
                </div>
                <div>
                  <strong>Location:</strong> {config.region}, {config.country}
                </div>
                <div>
                  <strong>Subjects:</strong> {config.subjects.join(', ')}
                </div>
                <div>
                  <strong>HODs:</strong> {config.hodAccess.length} configured
                </div>
              </div>

              <div className='bg-green-900 border border-green-700 p-4 rounded-lg'>
                <h3 className='text-green-400 font-medium mb-2'>🎉 Ready to Launch!</h3>
                <p className='text-green-300 text-sm'>
                  Your school's AI Lesson Planner is configured and ready for use by your Subject
                  Heads of Department.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className='flex justify-between mt-8'>
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className='px-6 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors'
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className='px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors'
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors'
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

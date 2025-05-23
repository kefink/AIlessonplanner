import React, { useState } from 'react';
import type { GenerationParams } from '../types';

interface ControlsProps {
  onGenerate: (params: GenerationParams) => void;
  isLoading: boolean;
  restrictToSubject?: string;
  schoolConfig?: {
    schoolName: string;
    curriculum: string;
    subjects: string[];
    levels: string[];
  };
}

export function Controls({
  onGenerate,
  isLoading,
  restrictToSubject,
  schoolConfig,
}: ControlsProps): React.ReactNode {
  const [educationLevel, setEducationLevel] = useState<string>('junior-school');
  const [grade, setGrade] = useState<string>('Grade 8');
  const [subject, setSubject] = useState<string>(restrictToSubject || 'Pre-technical studies');
  const [term, setTerm] = useState<string>('Term 1');
  const [week, setWeek] = useState<string>('1');
  const [lesson, setLesson] = useState<string>('1');

  // Educational levels and their corresponding grades
  const educationLevels = {
    'pre-primary': {
      label: 'Pre-Primary',
      grades: ['PP1', 'PP2'],
      subjects: [
        'Kiswahili',
        'Mathematics',
        'English',
        'Religious Education',
        'Environmental activities',
        'Creative activities',
      ],
    },
    'lower-primary': {
      label: 'Lower Primary',
      grades: ['Grade 1', 'Grade 2', 'Grade 3'],
      subjects: [
        'Kiswahili',
        'Mathematics',
        'English',
        'Religious Education',
        'Environmental activities',
        'Creative activities',
      ],
    },
    'upper-primary': {
      label: 'Upper Primary',
      grades: ['Grade 4', 'Grade 5', 'Grade 6'],
      subjects: [
        'Kiswahili',
        'Mathematics',
        'English',
        'Religious Education',
        'Agriculture and Nutrition',
        'Social studies',
        'Science and Technology',
        'Creative Arts',
      ],
    },
    'junior-school': {
      label: 'Junior School',
      grades: ['Grade 7', 'Grade 8', 'Grade 9'],
      subjects: [
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
  };

  // Get current level data
  const currentLevel = educationLevels[educationLevel as keyof typeof educationLevels];

  // Update grade when education level changes
  const handleEducationLevelChange = (newLevel: string) => {
    setEducationLevel(newLevel);
    const levelData = educationLevels[newLevel as keyof typeof educationLevels];
    if (levelData) {
      setGrade(levelData.grades[0]); // Set to first grade of the level
      if (!restrictToSubject) {
        setSubject(levelData.subjects[0]); // Set to first subject of the level
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ grade, subject, term, week, lesson });
  };

  const inputClass =
    'w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors placeholder-slate-400 text-slate-100';
  const labelClass = 'block text-sm font-medium text-slate-300 mb-1';

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <h2 className='text-2xl font-semibold text-sky-400 mb-6'>Lesson Parameters</h2>

      <div>
        <label htmlFor='educationLevel' className={labelClass}>
          Education Level
        </label>
        <select
          id='educationLevel'
          value={educationLevel}
          onChange={e => handleEducationLevelChange(e.target.value)}
          className={inputClass}
          disabled={isLoading}
        >
          {Object.entries(educationLevels).map(([key, level]) => (
            <option key={key} value={key}>
              {level.label} ({level.grades[0]} - {level.grades[level.grades.length - 1]})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor='grade' className={labelClass}>
          Grade Level
        </label>
        <select
          id='grade'
          value={grade}
          onChange={e => setGrade(e.target.value)}
          className={inputClass}
          disabled={isLoading}
        >
          {currentLevel?.grades.map(gradeOption => (
            <option key={gradeOption} value={gradeOption}>
              {gradeOption}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor='subject' className={labelClass}>
          Subject
        </label>
        <select
          id='subject'
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className={inputClass}
          disabled={isLoading || !!restrictToSubject}
        >
          {restrictToSubject ? (
            <option value={restrictToSubject}>{restrictToSubject}</option>
          ) : (
            currentLevel?.subjects.map(subj => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <label htmlFor='term' className={labelClass}>
          Term
        </label>
        <select
          id='term'
          value={term}
          onChange={e => setTerm(e.target.value)}
          className={inputClass}
          disabled={isLoading}
        >
          <option value='Term 1'>Term 1</option>
          <option value='Term 2'>Term 2</option>
          <option value='Term 3'>Term 3</option>
        </select>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label htmlFor='week' className={labelClass}>
            Week
          </label>
          <input
            type='number'
            id='week'
            value={week}
            onChange={e => setWeek(e.target.value)}
            min='1'
            className={inputClass}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor='lesson' className={labelClass}>
            Lesson
          </label>
          <input
            type='number'
            id='lesson'
            value={lesson}
            onChange={e => setLesson(e.target.value)}
            min='1'
            className={inputClass}
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        type='submit'
        className='w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Plan'}
      </button>
      {isLoading && (
        <p className='text-xs text-slate-400 text-center mt-2'>
          AI is thinking... this may take a moment.
        </p>
      )}
      <p className='text-xs text-slate-500 text-center mt-2'>
        System supports Kenya CBC curriculum with all levels (PP1-Grade 9) and subjects including
        Pre-technical studies, Integrated Science, Agriculture, and more.
      </p>
    </form>
  );
}

/**
 * Teacher Profile Setup Component
 * One-time setup for teacher profile and class schedule
 */

import React, { useState, useEffect } from 'react';
import type { TeacherProfile, ClassInfo } from '../types/teacher';
import { TeacherProfileService } from '../services/teacherProfileService';

interface TeacherProfileSetupProps {
  onComplete: (profile: TeacherProfile) => void;
  onSkip?: () => void;
}

export function TeacherProfileSetup({ onComplete, onSkip }: TeacherProfileSetupProps): React.ReactNode {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<TeacherProfile>>({
    personalInfo: {
      name: '',
      employeeId: '',
      email: '',
      subjects: [],
      grades: [],
      department: ''
    },
    school: {
      name: '',
      code: '',
      county: '',
      level: 'secondary'
    },
    schedule: {
      termDates: {
        start: new Date(),
        end: new Date(),
        currentWeek: 1,
        totalWeeks: 14
      },
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      dailySchedule: []
    },
    preferences: {
      lessonDuration: 40,
      teachingStyle: 'mixed',
      assessmentPreferences: [],
      reflectionReminders: true
    }
  });

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [currentClass, setCurrentClass] = useState({
    grade: '',
    subject: '',
    className: '',
    rollNumber: 0,
    studentCount: 0,
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    room: ''
  });

  const kenyanSubjects = [
    'Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Agriculture',
    'Pre-technical Studies', 'Social Studies', 'Creative Arts and Sports',
    'Religious Education', 'Life Skills Education', 'Business Studies',
    'Computer Science', 'Home Science', 'Art and Design', 'Music', 'Physical Education'
  ];

  const grades = [
    'Grade 7', 'Grade 8', 'Grade 9', 'Form 1', 'Form 2', 'Form 3', 'Form 4'
  ];

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSchoolInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClass: ClassInfo = {
      id: `class_${Date.now()}`,
      grade: currentClass.grade,
      subject: currentClass.subject,
      className: currentClass.className,
      rollNumber: currentClass.rollNumber,
      students: [], // Would be populated later
      schedule: {
        id: `schedule_${Date.now()}`,
        grade: currentClass.grade,
        subject: currentClass.subject,
        className: currentClass.className,
        rollNumber: currentClass.rollNumber,
        dayOfWeek: currentClass.dayOfWeek,
        timeSlot: {
          start: currentClass.startTime,
          end: currentClass.endTime
        },
        room: currentClass.room,
        studentCount: currentClass.studentCount
      },
      currentWeek: 1,
      currentLesson: 1,
      curriculum: {
        strand: 'To be determined',
        subStrand: 'To be determined',
        topics: []
      }
    };

    setClasses([...classes, newClass]);
    
    // Reset form
    setCurrentClass({
      grade: '',
      subject: '',
      className: '',
      rollNumber: 0,
      studentCount: 0,
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      room: ''
    });
  };

  const handleCompleteSetup = () => {
    const completeProfile: TeacherProfile = {
      id: `teacher_${Date.now()}`,
      ...profile as TeacherProfile,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    // Update daily schedule from classes
    completeProfile.schedule.dailySchedule = classes.map(cls => cls.schedule);

    // Save to localStorage
    TeacherProfileService.saveTeacherProfile(completeProfile);
    TeacherProfileService.saveTeacherClasses(classes);

    onComplete(completeProfile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-2">
            👨‍🏫 Teacher Profile Setup
          </h1>
          <p className="text-slate-400">
            Set up your profile once for fully automated lesson planning
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum 
                      ? 'bg-sky-600 text-white' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-12 h-1 ${
                      step > stepNum ? 'bg-sky-600' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-2 text-sm text-slate-500">
            Step {step} of 4: {
              step === 1 ? 'Personal Information' :
              step === 2 ? 'School Information' :
              step === 3 ? 'Term Schedule' :
              'Class Schedule'
            }
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-800 rounded-xl shadow-2xl p-8">
          {step === 1 && (
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-sky-400 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.personalInfo?.name || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo!, name: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={profile.personalInfo?.employeeId || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo!, employeeId: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Your employee ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.personalInfo?.email || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo!, email: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="your.email@school.ac.ke"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={profile.personalInfo?.department || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo!, department: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., Mathematics Department"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subjects You Teach *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {kenyanSubjects.map(subject => (
                    <label key={subject} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={profile.personalInfo?.subjects.includes(subject) || false}
                        onChange={(e) => {
                          const subjects = profile.personalInfo?.subjects || [];
                          if (e.target.checked) {
                            setProfile(prev => ({
                              ...prev,
                              personalInfo: { 
                                ...prev.personalInfo!, 
                                subjects: [...subjects, subject] 
                              }
                            }));
                          } else {
                            setProfile(prev => ({
                              ...prev,
                              personalInfo: { 
                                ...prev.personalInfo!, 
                                subjects: subjects.filter(s => s !== subject) 
                              }
                            }));
                          }
                        }}
                        className="rounded border-slate-600 bg-slate-700 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-slate-300">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
                >
                  Next: School Information →
                </button>
              </div>
            </form>
          )}

          {/* Additional steps would be implemented here */}
          {step > 1 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                Step {step} Implementation
              </h3>
              <p className="text-slate-400 mb-6">
                This step is being implemented. For now, let's complete the basic setup.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleCompleteSetup}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Complete Setup ✓
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip Option */}
        {onSkip && (
          <div className="text-center mt-6">
            <button
              onClick={onSkip}
              className="text-slate-400 hover:text-slate-300 text-sm underline"
            >
              Skip setup for now (use demo mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

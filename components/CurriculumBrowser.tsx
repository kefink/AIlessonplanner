/**
 * Curriculum Browser Component
 * Allows users to explore the embedded curriculum database
 */

import React, { useState, useEffect } from 'react';
import { CurriculumService, type SubjectCurriculum } from '../services/curriculumDatabase';

interface CurriculumBrowserProps {
  onClose: () => void;
  onSelectCurriculum?: (curriculum: any) => void;
}

export function CurriculumBrowser({ onClose, onSelectCurriculum }: CurriculumBrowserProps): React.ReactNode {
  const [selectedLevel, setSelectedLevel] = useState<string>('junior-school');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [curriculum, setCurriculum] = useState<SubjectCurriculum | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const levels = CurriculumService.getAllLevels();

  useEffect(() => {
    const subjects = CurriculumService.getSubjectsForLevel(selectedLevel);
    if (subjects.length > 0 && !subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects[0]);
    }
  }, [selectedLevel, selectedSubject]);

  useEffect(() => {
    if (selectedLevel && selectedSubject) {
      const curr = CurriculumService.getCurriculum(selectedLevel, selectedSubject);
      setCurriculum(curr);
    }
  }, [selectedLevel, selectedSubject]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = CurriculumService.searchCurriculum(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const levelLabels: { [key: string]: string } = {
    'pre-primary': 'Pre-Primary (PP1-PP2)',
    'lower-primary': 'Lower Primary (Grade 1-3)',
    'upper-primary': 'Upper Primary (Grade 4-6)',
    'junior-school': 'Junior School (Grade 7-9)'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-sky-400">📚 Kenya CBC Curriculum Browser</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[80vh]">
          {/* Sidebar */}
          <div className="w-1/3 bg-slate-700 p-4 overflow-y-auto">
            {/* Search */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-300 mb-3">🔍 Search Curriculum</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics, outcomes..."
                  className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Level Selection */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-300 mb-3">📚 Education Level</h3>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {levelLabels[level] || level}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-300 mb-3">📖 Subject</h3>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {CurriculumService.getSubjectsForLevel(selectedLevel).map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-slate-300 mb-3">🔍 Search Results</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-2 bg-slate-600 rounded cursor-pointer hover:bg-slate-500 transition-colors"
                      onClick={() => {
                        setSelectedLevel(result.level);
                        setSelectedSubject(result.subject);
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                    >
                      <div className="text-sm font-medium text-white">
                        {levelLabels[result.level]} - {result.subject}
                      </div>
                      <div className="text-xs text-slate-300">
                        {result.strand} → {result.subStrand}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-slate-600 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-slate-300 mb-2">📊 Curriculum Stats</h4>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Levels: {levels.length}</div>
                <div>Subjects: {CurriculumService.getSubjectsForLevel(selectedLevel).length}</div>
                <div>Current: {levelLabels[selectedLevel]}</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {curriculum ? (
              <div className="space-y-6">
                {/* Subject Header */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h2 className="text-2xl font-bold text-sky-400 mb-2">
                    {curriculum.subject}
                  </h2>
                  <p className="text-slate-300 mb-3">
                    {levelLabels[curriculum.level]} • Grades: {curriculum.grades.join(', ')}
                  </p>
                  
                  <div>
                    <h3 className="text-lg font-medium text-slate-300 mb-2">🎯 General Learning Outcomes</h3>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                      {curriculum.generalLearningOutcomes.map((outcome, index) => (
                        <li key={index} className="text-sm">{outcome}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Strands */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-sky-400">📚 Curriculum Strands</h3>
                  {curriculum.strands.map((strand, strandIndex) => (
                    <div key={strandIndex} className="bg-slate-700 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-green-400 mb-3">
                        {strand.name}
                      </h4>
                      
                      {strand.subStrands.map((subStrand, subIndex) => (
                        <div key={subIndex} className="mb-4 p-3 bg-slate-600 rounded">
                          <h5 className="font-medium text-yellow-400 mb-2">
                            {subStrand.name}
                          </h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h6 className="font-medium text-slate-300 mb-1">🎯 Learning Outcomes:</h6>
                              <ul className="list-disc list-inside text-slate-400 space-y-1">
                                {subStrand.specificLearningOutcomes.map((outcome, i) => (
                                  <li key={i}>{outcome}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h6 className="font-medium text-slate-300 mb-1">🔍 Key Questions:</h6>
                              <ul className="list-disc list-inside text-slate-400 space-y-1">
                                {subStrand.keyInquiryQuestions.map((question, i) => (
                                  <li key={i}>{question}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h6 className="font-medium text-slate-300 mb-1">🎓 Learning Experiences:</h6>
                              <ul className="list-disc list-inside text-slate-400 space-y-1">
                                {subStrand.suggestedLearningExperiences.map((exp, i) => (
                                  <li key={i}>{exp}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h6 className="font-medium text-slate-300 mb-1">📊 Assessment:</h6>
                              <ul className="list-disc list-inside text-slate-400 space-y-1">
                                {subStrand.assessmentMethods.map((method, i) => (
                                  <li key={i}>{method}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {onSelectCurriculum && (
                            <button
                              onClick={() => onSelectCurriculum({
                                level: curriculum.level,
                                subject: curriculum.subject,
                                strand: strand.name,
                                subStrand: subStrand.name,
                                content: subStrand
                              })}
                              className="mt-3 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-sm transition-colors"
                            >
                              Use for Lesson Planning
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">Select a Subject</h3>
                  <p className="text-slate-400">
                    Choose an education level and subject to explore the curriculum
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-700 px-6 py-3 border-t border-slate-600">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              Kenya CBC Curriculum Database • Complete and Up-to-date
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

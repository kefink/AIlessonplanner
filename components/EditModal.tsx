/**
 * Edit Modal Component for AI Lesson Planner
 * Provides editing functionality for generated lesson plans
 */

import React, { useState, useEffect } from 'react';
import { EditService, type EditableData } from '../services/editService';
import type { SchemeOfWorkEntry, LessonPlan } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditableData) => void;
  initialData: EditableData;
}

export function EditModal({ isOpen, onClose, onSave, initialData }: EditModalProps): React.ReactNode {
  const [editData, setEditData] = useState<EditableData>(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'scheme' | 'lesson'>('scheme');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditData(EditService.createEditableCopy(initialData));
      setErrors([]);
      setHasChanges(false);
      // Auto-save on open
      EditService.saveToLocalStorage(initialData);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    // Check for changes
    const originalJson = JSON.stringify(initialData);
    const currentJson = JSON.stringify(editData);
    setHasChanges(originalJson !== currentJson);
    
    // Auto-save changes
    if (hasChanges) {
      EditService.saveToLocalStorage(editData);
    }
  }, [editData, initialData, hasChanges]);

  const handleSave = () => {
    const validation = EditService.validateEditedData(editData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onSave(editData);
    EditService.clearLocalStorage();
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmDiscard = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmDiscard) return;
    }
    
    EditService.clearLocalStorage();
    onClose();
  };

  const updateSchemeOfWork = (field: keyof SchemeOfWorkEntry, value: string) => {
    if (!editData.schemeOfWork) return;
    
    setEditData(prev => ({
      ...prev,
      schemeOfWork: {
        ...prev.schemeOfWork!,
        [field]: value
      }
    }));
  };

  const updateLessonPlan = (field: keyof LessonPlan, value: any) => {
    if (!editData.lessonPlan) return;
    
    setEditData(prev => ({
      ...prev,
      lessonPlan: {
        ...prev.lessonPlan!,
        [field]: value
      }
    }));
  };

  const updateOrganisationOfLearning = (field: string, value: string) => {
    if (!editData.lessonPlan) return;
    
    setEditData(prev => ({
      ...prev,
      lessonPlan: {
        ...prev.lessonPlan!,
        organisationOfLearning: {
          ...prev.lessonPlan!.organisationOfLearning,
          [field]: value
        }
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-sky-400">✏️ Edit Lesson Plan</h2>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <span className="text-yellow-400 text-sm">● Unsaved changes</span>
              )}
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('scheme')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'scheme'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Scheme of Work
            </button>
            <button
              onClick={() => setActiveTab('lesson')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'lesson'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Lesson Plan
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-900 border border-red-700 px-6 py-3">
            <h3 className="text-red-400 font-medium mb-2">Please fix the following errors:</h3>
            <ul className="text-red-300 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'scheme' && editData.schemeOfWork && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Week</label>
                  <input
                    type="text"
                    value={editData.schemeOfWork.wk}
                    onChange={(e) => updateSchemeOfWork('wk', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Lesson</label>
                  <input
                    type="text"
                    value={editData.schemeOfWork.lsn}
                    onChange={(e) => updateSchemeOfWork('lsn', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Strand</label>
                <input
                  type="text"
                  value={editData.schemeOfWork.strand}
                  onChange={(e) => updateSchemeOfWork('strand', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sub-Strand</label>
                <textarea
                  value={editData.schemeOfWork.subStrand}
                  onChange={(e) => updateSchemeOfWork('subStrand', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Specific Learning Outcomes</label>
                <textarea
                  value={editData.schemeOfWork.specificLearningOutcomes}
                  onChange={(e) => updateSchemeOfWork('specificLearningOutcomes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Key Inquiry Questions</label>
                <textarea
                  value={editData.schemeOfWork.keyInquiryQuestions}
                  onChange={(e) => updateSchemeOfWork('keyInquiryQuestions', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Learning Experiences</label>
                <textarea
                  value={editData.schemeOfWork.learningExperiences}
                  onChange={(e) => updateSchemeOfWork('learningExperiences', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Learning Resources</label>
                <textarea
                  value={editData.schemeOfWork.learningResources}
                  onChange={(e) => updateSchemeOfWork('learningResources', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Assessment Methods</label>
                <textarea
                  value={editData.schemeOfWork.assessmentMethods}
                  onChange={(e) => updateSchemeOfWork('assessmentMethods', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {editData.schemeOfWork.refl && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Reflection</label>
                  <textarea
                    value={editData.schemeOfWork.refl}
                    onChange={(e) => updateSchemeOfWork('refl', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'lesson' && editData.lessonPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">School</label>
                  <input
                    type="text"
                    value={editData.lessonPlan.school}
                    onChange={(e) => updateLessonPlan('school', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                  <input
                    type="text"
                    value={editData.lessonPlan.level}
                    onChange={(e) => updateLessonPlan('level', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                  <input
                    type="text"
                    value={editData.lessonPlan.date}
                    onChange={(e) => updateLessonPlan('date', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                  <input
                    type="text"
                    value={editData.lessonPlan.time}
                    onChange={(e) => updateLessonPlan('time', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Roll</label>
                  <input
                    type="text"
                    value={editData.lessonPlan.roll}
                    onChange={(e) => updateLessonPlan('roll', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Learning Area</label>
                <input
                  type="text"
                  value={editData.lessonPlan.learningArea}
                  onChange={(e) => updateLessonPlan('learningArea', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Introduction (5 minutes)</label>
                <textarea
                  value={editData.lessonPlan.organisationOfLearning.introduction}
                  onChange={(e) => updateOrganisationOfLearning('introduction', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Lesson Development (30 minutes)</label>
                <textarea
                  value={editData.lessonPlan.organisationOfLearning.lessonDevelopment}
                  onChange={(e) => updateOrganisationOfLearning('lessonDevelopment', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Conclusion (5 minutes)</label>
                <textarea
                  value={editData.lessonPlan.organisationOfLearning.conclusion}
                  onChange={(e) => updateOrganisationOfLearning('conclusion', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Teacher Self-Evaluation</label>
                <textarea
                  value={editData.lessonPlan.teacherSelfEvaluation}
                  onChange={(e) => updateLessonPlan('teacherSelfEvaluation', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-700 px-6 py-4 border-t border-slate-600 flex justify-between items-center">
          <div className="text-sm text-slate-400">
            {hasChanges ? 'Changes will be auto-saved' : 'No changes made'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                hasChanges
                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

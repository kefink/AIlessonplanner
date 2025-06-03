import React, { useState } from 'react';

interface Subject {
  id: string;
  name: string;
  totalLessons: number;
  doubleLessons: number;
  singleLessons: number;
  gradeLevel: string;
  department: string;
  teacher: string;
  resources: string[];
  notes: string;
}

interface SubjectManagerProps {
  onSubjectUpdate: (subjects: Subject[]) => void;
  existingSubjects?: Subject[];
}

export function SubjectManager({ onSubjectUpdate, existingSubjects = [] }: SubjectManagerProps) {
  const [subjects, setSubjects] = useState<Subject[]>(existingSubjects);
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    name: '',
    totalLessons: 0,
    doubleLessons: 0,
    singleLessons: 0,
    gradeLevel: '',
    department: '',
    teacher: '',
    resources: [],
    notes: ''
  });

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.totalLessons) return;

    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      totalLessons: newSubject.totalLessons || 0,
      doubleLessons: newSubject.doubleLessons || 0,
      singleLessons: newSubject.singleLessons || 0,
      gradeLevel: newSubject.gradeLevel || '',
      department: newSubject.department || '',
      teacher: newSubject.teacher || '',
      resources: newSubject.resources || [],
      notes: newSubject.notes || ''
    };

    const updatedSubjects = [...subjects, subject];
    setSubjects(updatedSubjects);
    onSubjectUpdate(updatedSubjects);

    // Reset form
    setNewSubject({
      name: '',
      totalLessons: 0,
      doubleLessons: 0,
      singleLessons: 0,
      gradeLevel: '',
      department: '',
      teacher: '',
      resources: [],
      notes: ''
    });
  };

  const handleDeleteSubject = (id: string) => {
    const updatedSubjects = subjects.filter(subject => subject.id !== id);
    setSubjects(updatedSubjects);
    onSubjectUpdate(updatedSubjects);
  };

  const handleEditSubject = (id: string, updates: Partial<Subject>) => {
    const updatedSubjects = subjects.map(subject => 
      subject.id === id ? { ...subject, ...updates } : subject
    );
    setSubjects(updatedSubjects);
    onSubjectUpdate(updatedSubjects);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-6">
        Subject Management
      </h2>

      {/* Add New Subject Form */}
      <div className="bg-slate-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-sky-400 mb-4">Add New Subject</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Subject Name</label>
            <input
              type="text"
              value={newSubject.name}
              onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="e.g., Pretechnical Studies"
            />
          </div>
          
          <div>
            <label className="block text-slate-300 mb-2">Grade Level</label>
            <input
              type="text"
              value={newSubject.gradeLevel}
              onChange={(e) => setNewSubject(prev => ({ ...prev, gradeLevel: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="e.g., Grade 8"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Department</label>
            <input
              type="text"
              value={newSubject.department}
              onChange={(e) => setNewSubject(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="e.g., Technical Department"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Teacher</label>
            <input
              type="text"
              value={newSubject.teacher}
              onChange={(e) => setNewSubject(prev => ({ ...prev, teacher: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="e.g., John Doe"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Total Lessons per Week</label>
            <input
              type="number"
              value={newSubject.totalLessons || ''}
              onChange={(e) => setNewSubject(prev => ({ ...prev, totalLessons: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              min="0"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Double Lessons</label>
            <input
              type="number"
              value={newSubject.doubleLessons || ''}
              onChange={(e) => setNewSubject(prev => ({ ...prev, doubleLessons: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              min="0"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Single Lessons</label>
            <input
              type="number"
              value={newSubject.singleLessons || ''}
              onChange={(e) => setNewSubject(prev => ({ ...prev, singleLessons: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              min="0"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Notes</label>
            <textarea
              value={newSubject.notes}
              onChange={(e) => setNewSubject(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="Additional notes about the subject"
              rows={3}
            />
          </div>
        </div>

        <button
          onClick={handleAddSubject}
          className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Add Subject
        </button>
      </div>

      {/* Subjects List */}
      {subjects.length > 0 && (
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-sky-400 mb-4">Current Subjects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="bg-slate-600 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium text-slate-200">{subject.name}</h4>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>Grade Level: {subject.gradeLevel}</p>
                  <p>Department: {subject.department}</p>
                  <p>Teacher: {subject.teacher}</p>
                  <p>Total Lessons: {subject.totalLessons}</p>
                  <p>Double Lessons: {subject.doubleLessons}</p>
                  <p>Single Lessons: {subject.singleLessons}</p>
                  {subject.notes && <p className="mt-2 italic">{subject.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
import React, { useState } from 'react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  qualifications: string[];
  availability: {
    day: string;
    timeSlots: { start: string; end: string }[];
  }[];
  maxHoursPerWeek: number;
  preferredGradeLevels: string[];
  notes: string;
}

interface TeacherManagerProps {
  onTeacherUpdate: (teachers: Teacher[]) => void;
  existingTeachers?: Teacher[];
}

export function TeacherManager({ onTeacherUpdate, existingTeachers = [] }: TeacherManagerProps) {
  const [teachers, setTeachers] = useState<Teacher[]>(existingTeachers);
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
    name: '',
    email: '',
    phone: '',
    subjects: [],
    qualifications: [],
    availability: [],
    maxHoursPerWeek: 40,
    preferredGradeLevels: [],
    notes: ''
  });
  const [newSubject, setNewSubject] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('');

  const handleAddTeacher = () => {
    if (!newTeacher.name || !newTeacher.email) return;

    const teacher: Teacher = {
      id: Date.now().toString(),
      name: newTeacher.name,
      email: newTeacher.email,
      phone: newTeacher.phone || '',
      subjects: newTeacher.subjects || [],
      qualifications: newTeacher.qualifications || [],
      availability: newTeacher.availability || [],
      maxHoursPerWeek: newTeacher.maxHoursPerWeek || 40,
      preferredGradeLevels: newTeacher.preferredGradeLevels || [],
      notes: newTeacher.notes || ''
    };

    const updatedTeachers = [...teachers, teacher];
    setTeachers(updatedTeachers);
    onTeacherUpdate(updatedTeachers);

    // Reset form
    setNewTeacher({
      name: '',
      email: '',
      phone: '',
      subjects: [],
      qualifications: [],
      availability: [],
      maxHoursPerWeek: 40,
      preferredGradeLevels: [],
      notes: ''
    });
  };

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    setNewTeacher(prev => ({
      ...prev,
      subjects: [...(prev.subjects || []), newSubject.trim()]
    }));
    setNewSubject('');
  };

  const handleRemoveSubject = (subject: string) => {
    setNewTeacher(prev => ({
      ...prev,
      subjects: (prev.subjects || []).filter(s => s !== subject)
    }));
  };

  const handleAddQualification = () => {
    if (!newQualification.trim()) return;
    setNewTeacher(prev => ({
      ...prev,
      qualifications: [...(prev.qualifications || []), newQualification.trim()]
    }));
    setNewQualification('');
  };

  const handleRemoveQualification = (qualification: string) => {
    setNewTeacher(prev => ({
      ...prev,
      qualifications: (prev.qualifications || []).filter(q => q !== qualification)
    }));
  };

  const handleAddGradeLevel = () => {
    if (!newGradeLevel.trim()) return;
    setNewTeacher(prev => ({
      ...prev,
      preferredGradeLevels: [...(prev.preferredGradeLevels || []), newGradeLevel.trim()]
    }));
    setNewGradeLevel('');
  };

  const handleRemoveGradeLevel = (gradeLevel: string) => {
    setNewTeacher(prev => ({
      ...prev,
      preferredGradeLevels: (prev.preferredGradeLevels || []).filter(g => g !== gradeLevel)
    }));
  };

  const handleDeleteTeacher = (id: string) => {
    const updatedTeachers = teachers.filter(teacher => teacher.id !== id);
    setTeachers(updatedTeachers);
    onTeacherUpdate(updatedTeachers);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-6">
        Teacher Management
      </h2>

      {/* Add New Teacher Form */}
      <div className="bg-slate-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-sky-400 mb-4">Add New Teacher</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="email@school.com"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Phone</label>
            <input
              type="tel"
              value={newTeacher.phone}
              onChange={(e) => setNewTeacher(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="Phone Number"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Max Hours per Week</label>
            <input
              type="number"
              value={newTeacher.maxHoursPerWeek || ''}
              onChange={(e) => setNewTeacher(prev => ({ ...prev, maxHoursPerWeek: parseInt(e.target.value) || 40 }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              min="0"
              max="60"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 mb-2">Subjects</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                placeholder="Add a subject"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
              />
              <button
                onClick={handleAddSubject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {newTeacher.subjects?.map((subject, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-600 rounded-full text-sm flex items-center gap-2"
                >
                  {subject}
                  <button
                    onClick={() => handleRemoveSubject(subject)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 mb-2">Qualifications</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                placeholder="Add a qualification"
                onKeyPress={(e) => e.key === 'Enter' && handleAddQualification()}
              />
              <button
                onClick={handleAddQualification}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {newTeacher.qualifications?.map((qualification, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-600 rounded-full text-sm flex items-center gap-2"
                >
                  {qualification}
                  <button
                    onClick={() => handleRemoveQualification(qualification)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 mb-2">Preferred Grade Levels</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGradeLevel}
                onChange={(e) => setNewGradeLevel(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                placeholder="Add a grade level"
                onKeyPress={(e) => e.key === 'Enter' && handleAddGradeLevel()}
              />
              <button
                onClick={handleAddGradeLevel}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {newTeacher.preferredGradeLevels?.map((gradeLevel, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-600 rounded-full text-sm flex items-center gap-2"
                >
                  {gradeLevel}
                  <button
                    onClick={() => handleRemoveGradeLevel(gradeLevel)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 mb-2">Notes</label>
            <textarea
              value={newTeacher.notes}
              onChange={(e) => setNewTeacher(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="Additional notes about the teacher"
              rows={3}
            />
          </div>
        </div>

        <button
          onClick={handleAddTeacher}
          className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Add Teacher
        </button>
      </div>

      {/* Teachers List */}
      {teachers.length > 0 && (
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-sky-400 mb-4">Current Teachers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-slate-600 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-medium text-slate-200">{teacher.name}</h4>
                    <p className="text-sm text-slate-400">{teacher.email}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTeacher(teacher.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>Phone: {teacher.phone}</p>
                  <p>Max Hours/Week: {teacher.maxHoursPerWeek}</p>
                  {teacher.subjects.length > 0 && (
                    <div>
                      <p className="font-medium">Subjects:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {teacher.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700 rounded-full text-xs"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {teacher.qualifications.length > 0 && (
                    <div>
                      <p className="font-medium">Qualifications:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {teacher.qualifications.map((qualification, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700 rounded-full text-xs"
                          >
                            {qualification}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {teacher.preferredGradeLevels.length > 0 && (
                    <div>
                      <p className="font-medium">Preferred Grade Levels:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {teacher.preferredGradeLevels.map((gradeLevel, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700 rounded-full text-xs"
                          >
                            {gradeLevel}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {teacher.notes && <p className="mt-2 italic">{teacher.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
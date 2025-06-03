import React, { useState } from 'react';

interface ClassGroup {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  capacity: number;
  subjects: {
    subjectId: string;
    subjectName: string;
    lessonsPerWeek: number;
    teacherId?: string;
    resourceId?: string;
  }[];
  schedule: {
    day: string;
    timeSlots: {
      start: string;
      end: string;
      subjectId?: string;
      teacherId?: string;
      resourceId?: string;
    }[];
  }[];
  notes: string;
}

interface ClassManagerProps {
  onClassUpdate: (classes: ClassGroup[]) => void;
  existingClasses?: ClassGroup[];
  teachers: any[];
  resources: any[];
  subjects: any[];
}

export function ClassManager({ 
  onClassUpdate, 
  existingClasses = [], 
  teachers = [], 
  resources = [],
  subjects = []
}: ClassManagerProps) {
  const [classes, setClasses] = useState<ClassGroup[]>(existingClasses);
  const [newClass, setNewClass] = useState<Partial<ClassGroup>>({
    name: '',
    gradeLevel: '',
    section: '',
    capacity: 0,
    subjects: [],
    schedule: [],
    notes: ''
  });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [lessonsPerWeek, setLessonsPerWeek] = useState(0);

  const handleAddClass = () => {
    if (!newClass.name || !newClass.gradeLevel) return;

    const classGroup: ClassGroup = {
      id: Date.now().toString(),
      name: newClass.name,
      gradeLevel: newClass.gradeLevel,
      section: newClass.section || '',
      capacity: newClass.capacity || 0,
      subjects: newClass.subjects || [],
      schedule: newClass.schedule || [],
      notes: newClass.notes || ''
    };

    const updatedClasses = [...classes, classGroup];
    setClasses(updatedClasses);
    onClassUpdate(updatedClasses);

    // Reset form
    setNewClass({
      name: '',
      gradeLevel: '',
      section: '',
      capacity: 0,
      subjects: [],
      schedule: [],
      notes: ''
    });
  };

  const handleAddSubject = () => {
    if (!selectedSubject || !lessonsPerWeek) return;

    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject) return;

    setNewClass(prev => ({
      ...prev,
      subjects: [
        ...(prev.subjects || []),
        {
          subjectId: selectedSubject,
          subjectName: subject.name,
          lessonsPerWeek,
          teacherId: selectedTeacher || undefined,
          resourceId: selectedResource || undefined
        }
      ]
    }));

    // Reset subject form
    setSelectedSubject('');
    setSelectedTeacher('');
    setSelectedResource('');
    setLessonsPerWeek(0);
  };

  const handleRemoveSubject = (subjectId: string) => {
    setNewClass(prev => ({
      ...prev,
      subjects: (prev.subjects || []).filter(s => s.subjectId !== subjectId)
    }));
  };

  const handleDeleteClass = (id: string) => {
    const updatedClasses = classes.filter(classGroup => classGroup.id !== id);
    setClasses(updatedClasses);
    onClassUpdate(updatedClasses);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-6">
        Class Management
      </h2>

      {/* Add New Class Form */}
      <div className="bg-slate-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-sky-400 mb-4">Add New Class</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Class Name</label>
            <input
              type="text"
              value={newClass.name}
              onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="e.g., Grade 8A"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Grade Level</label>
            <input
              type="text"
              value={newClass.gradeLevel}
              onChange={(e) => setNewClass(prev => ({ ...prev, gradeLevel: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="e.g., Grade 8"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Section</label>
            <input
              type="text"
              value={newClass.section}
              onChange={(e) => setNewClass(prev => ({ ...prev, section: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="e.g., A"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Capacity</label>
            <input
              type="number"
              value={newClass.capacity || ''}
              onChange={(e) => setNewClass(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              min="0"
            />
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold text-sky-400 mb-4">Add Subjects</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Lessons per Week</label>
                <input
                  type="number"
                  value={lessonsPerWeek || ''}
                  onChange={(e) => setLessonsPerWeek(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Resource</label>
                <select
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                >
                  <option value="">Select a resource</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAddSubject}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Add Subject
            </button>

            <div className="mt-4">
              <h5 className="text-slate-300 mb-2">Added Subjects:</h5>
              <div className="space-y-2">
                {newClass.subjects?.map((subject) => (
                  <div
                    key={subject.subjectId}
                    className="flex items-center justify-between bg-slate-600 p-3 rounded-lg"
                  >
                    <div>
                      <p className="text-slate-200">{subject.subjectName}</p>
                      <p className="text-sm text-slate-400">
                        {subject.lessonsPerWeek} lessons/week
                        {subject.teacherId && ` • Teacher: ${teachers.find(t => t.id === subject.teacherId)?.name}`}
                        {subject.resourceId && ` • Resource: ${resources.find(r => r.id === subject.resourceId)?.name}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveSubject(subject.subjectId)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 mb-2">Notes</label>
            <textarea
              value={newClass.notes}
              onChange={(e) => setNewClass(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              placeholder="Additional notes about the class"
              rows={3}
            />
          </div>
        </div>

        <button
          onClick={handleAddClass}
          className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Add Class
        </button>
      </div>

      {/* Classes List */}
      {classes.length > 0 && (
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-sky-400 mb-4">Current Classes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((classGroup) => (
              <div key={classGroup.id} className="bg-slate-600 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-medium text-slate-200">{classGroup.name}</h4>
                    <p className="text-sm text-slate-400">
                      {classGroup.gradeLevel} {classGroup.section}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteClass(classGroup.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
                <div className="text-sm text-slate-300 space-y-2">
                  <p>Capacity: {classGroup.capacity}</p>
                  {classGroup.subjects.length > 0 && (
                    <div>
                      <p className="font-medium">Subjects:</p>
                      <div className="space-y-2 mt-1">
                        {classGroup.subjects.map((subject) => (
                          <div key={subject.subjectId} className="bg-slate-700 p-2 rounded">
                            <p className="text-slate-200">{subject.subjectName}</p>
                            <p className="text-xs text-slate-400">
                              {subject.lessonsPerWeek} lessons/week
                              {subject.teacherId && ` • Teacher: ${teachers.find(t => t.id === subject.teacherId)?.name}`}
                              {subject.resourceId && ` • Resource: ${resources.find(r => r.id === subject.resourceId)?.name}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {classGroup.notes && <p className="mt-2 italic">{classGroup.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
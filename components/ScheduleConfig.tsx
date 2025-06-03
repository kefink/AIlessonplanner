import React, { useState, useEffect } from 'react';
import { format, addMinutes, parse, isSameDay, addDays } from 'date-fns';

interface TimeSlot {
  startTime: string;
  endTime: string;
  type: 'lesson' | 'short-break' | 'snack-break' | 'lunch-break';
  duration: number; // in minutes
  isDoubleLesson?: boolean;
  subject?: string;
  lessonNumber?: number;
}

interface SubjectConfig {
  name: string;
  totalLessons: number;
  doubleLessons: number;
  singleLessons: number;
  assignedSlots: number[]; // indices of time slots where this subject is assigned
}

interface ScheduleConfig {
  schoolStartTime: string;
  schoolEndTime: string;
  lessonDuration: number;
  shortBreakDuration: number;
  snackBreakDuration: number;
  lunchBreakDuration: number;
  timeSlots: TimeSlot[];
  selectedDates: Date[];
  doubleLessons: {
    [key: string]: boolean; // key is time slot index
  };
  subjects: SubjectConfig[];
}

interface ScheduleConfigProps {
  onConfigComplete: (config: ScheduleConfig) => void;
  existingConfig?: ScheduleConfig;
}

export function ScheduleConfig({ onConfigComplete, existingConfig }: ScheduleConfigProps): React.ReactNode {
  const [config, setConfig] = useState<ScheduleConfig>(() => {
    if (existingConfig) return existingConfig;
    
    return {
      schoolStartTime: '08:00',
      schoolEndTime: '16:00',
      lessonDuration: 40,
      shortBreakDuration: 10,
      snackBreakDuration: 20,
      lunchBreakDuration: 40,
      timeSlots: [],
      selectedDates: [],
      doubleLessons: {},
      subjects: []
    };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [newSubject, setNewSubject] = useState<Partial<SubjectConfig>>({
    name: '',
    totalLessons: 0,
    doubleLessons: 0,
    singleLessons: 0
  });

  // Generate time slots whenever relevant config changes
  useEffect(() => {
    const slots = generateTimeSlots();
    setTimeSlots(slots);
  }, [config.schoolStartTime, config.schoolEndTime, config.lessonDuration, 
      config.shortBreakDuration, config.snackBreakDuration, config.lunchBreakDuration]);

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    let currentTime = parse(config.schoolStartTime, 'HH:mm', new Date());
    const endTime = parse(config.schoolEndTime, 'HH:mm', new Date());
    
    let lessonCount = 0;
    
    while (currentTime < endTime) {
      // Check if this is a double lesson
      const isDouble = config.doubleLessons[lessonCount.toString()];
      const duration = isDouble ? config.lessonDuration * 2 : config.lessonDuration;
      
      // Add lesson
      const lessonEnd = addMinutes(currentTime, duration);
      slots.push({
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(lessonEnd, 'HH:mm'),
        type: 'lesson',
        duration: duration,
        isDoubleLesson: isDouble
      });
      
      currentTime = lessonEnd;
      lessonCount++;
      
      // Add breaks after every 2 lessons (or after double lessons)
      if (lessonCount % 2 === 0 || isDouble) {
        let breakDuration = config.shortBreakDuration;
        let breakType: TimeSlot['type'] = 'short-break';
        
        // Add longer breaks at specific times
        const currentHour = currentTime.getHours();
        if (currentHour >= 10 && currentHour < 11) {
          breakDuration = config.snackBreakDuration;
          breakType = 'snack-break';
        } else if (currentHour >= 12 && currentHour < 14) {
          breakDuration = config.lunchBreakDuration;
          breakType = 'lunch-break';
        }
        
        const breakEnd = addMinutes(currentTime, breakDuration);
        slots.push({
          startTime: format(currentTime, 'HH:mm'),
          endTime: format(breakEnd, 'HH:mm'),
          type: breakType,
          duration: breakDuration
        });
        
        currentTime = breakEnd;
      }
    }
    
    return slots;
  };

  const handleDateRangeSelect = (start: Date, end: Date) => {
    const dates: Date[] = [];
    let currentDate = start;
    
    while (currentDate <= end) {
      // Only add weekdays (Monday to Friday)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        dates.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, 1);
    }
    
    setSelectedDates(dates);
  };

  const handleExportSchedule = () => {
    const scheduleData = {
      config,
      timeSlots,
      selectedDates: selectedDates.map(date => date.toISOString())
    };
    
    const blob = new Blob([JSON.stringify(scheduleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'school-schedule.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSchedule = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setConfig(data.config);
          setTimeSlots(data.timeSlots);
          setSelectedDates(data.selectedDates.map((date: string) => new Date(date)));
        } catch (error) {
          console.error('Failed to import schedule:', error);
          alert('Failed to import schedule. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    onConfigComplete({
      ...config,
      timeSlots,
      selectedDates
    });
  };

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.totalLessons) return;

    const subject: SubjectConfig = {
      name: newSubject.name,
      totalLessons: newSubject.totalLessons,
      doubleLessons: newSubject.doubleLessons || 0,
      singleLessons: newSubject.singleLessons || 0,
      assignedSlots: []
    };

    setConfig(prev => ({
      ...prev,
      subjects: [...prev.subjects, subject]
    }));

    setNewSubject({
      name: '',
      totalLessons: 0,
      doubleLessons: 0,
      singleLessons: 0
    });
  };

  const handleAssignSubject = (subjectName: string, slotIndex: number) => {
    setConfig(prev => {
      const updatedSubjects = prev.subjects.map(subject => {
        if (subject.name === subjectName) {
          // Remove this slot from any other subject
          const otherSubjects = prev.subjects.filter(s => s.name !== subjectName);
          otherSubjects.forEach(s => {
            s.assignedSlots = s.assignedSlots.filter(slot => slot !== slotIndex);
          });

          // Add this slot to the current subject if not already assigned
          if (!subject.assignedSlots.includes(slotIndex)) {
            return {
              ...subject,
              assignedSlots: [...subject.assignedSlots, slotIndex]
            };
          }
        }
        return subject;
      });

      // Update the time slot with the subject
      const updatedTimeSlots = [...prev.timeSlots];
      updatedTimeSlots[slotIndex] = {
        ...updatedTimeSlots[slotIndex],
        subject: subjectName
      };

      return {
        ...prev,
        subjects: updatedSubjects,
        timeSlots: updatedTimeSlots
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-6">
            School Schedule Configuration
          </h2>

          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-sky-400">Basic Schedule Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 mb-2">School Start Time</label>
                  <input
                    type="time"
                    value={config.schoolStartTime}
                    onChange={(e) => setConfig({ ...config, schoolStartTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 mb-2">School End Time</label>
                  <input
                    type="time"
                    value={config.schoolEndTime}
                    onChange={(e) => setConfig({ ...config, schoolEndTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 mb-2">Lesson Duration (minutes)</label>
                  <select
                    value={config.lessonDuration}
                    onChange={(e) => setConfig({ ...config, lessonDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="30">30 minutes</option>
                    <option value="40">40 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-slate-300 mb-2">Short Break Duration (minutes)</label>
                  <select
                    value={config.shortBreakDuration}
                    onChange={(e) => setConfig({ ...config, shortBreakDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 mb-2">Snack Break Duration (minutes)</label>
                  <select
                    value={config.snackBreakDuration}
                    onChange={(e) => setConfig({ ...config, snackBreakDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="20">20 minutes</option>
                    <option value="25">25 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-slate-300 mb-2">Lunch Break Duration (minutes)</label>
                  <select
                    value={config.lunchBreakDuration}
                    onChange={(e) => setConfig({ ...config, lunchBreakDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="40">40 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>

              {/* Visual Timetable Preview */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-sky-400 mb-4">Timetable Preview</h4>
                
                {/* Subject Configuration */}
                <div className="mb-6 bg-slate-700 p-4 rounded-lg">
                  <h5 className="text-lg font-medium text-slate-300 mb-4">Subject Configuration</h5>
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
                  </div>
                  <button
                    onClick={handleAddSubject}
                    className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Add Subject
                  </button>
                </div>

                {/* Subject List */}
                {config.subjects.length > 0 && (
                  <div className="mb-6 bg-slate-700 p-4 rounded-lg">
                    <h5 className="text-lg font-medium text-slate-300 mb-4">Subjects</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {config.subjects.map((subject, index) => (
                        <div key={index} className="bg-slate-600 p-3 rounded-lg">
                          <h6 className="font-medium text-slate-200">{subject.name}</h6>
                          <p className="text-sm text-slate-300">
                            Total: {subject.totalLessons} | Double: {subject.doubleLessons} | Single: {subject.singleLessons}
                          </p>
                          <p className="text-sm text-slate-300">
                            Assigned Slots: {subject.assignedSlots.length}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-700 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Duration</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Subject</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((slot, index) => (
                        <tr key={index} className="border-t border-slate-600">
                          <td className="p-2">{slot.startTime} - {slot.endTime}</td>
                          <td className="p-2">{slot.duration} min</td>
                          <td className="p-2">
                            {slot.type === 'lesson' ? (
                              <span className={`px-2 py-1 rounded ${
                                slot.isDoubleLesson ? 'bg-purple-600' : 'bg-blue-600'
                              }`}>
                                {slot.isDoubleLesson ? 'Double Lesson' : 'Lesson'}
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded bg-green-600">
                                {slot.type.split('-').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            {slot.type === 'lesson' && (
                              <select
                                value={slot.subject || ''}
                                onChange={(e) => handleAssignSubject(e.target.value, index)}
                                className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white"
                              >
                                <option value="">Select Subject</option>
                                {config.subjects.map((subject, idx) => (
                                  <option key={idx} value={subject.name}>
                                    {subject.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="p-2">
                            {slot.type === 'lesson' && (
                              <button
                                onClick={() => {
                                  setConfig(prev => ({
                                    ...prev,
                                    doubleLessons: {
                                      ...prev.doubleLessons,
                                      [index]: !prev.doubleLessons[index]
                                    }
                                  }));
                                }}
                                className={`px-3 py-1 rounded ${
                                  slot.isDoubleLesson 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                              >
                                {slot.isDoubleLesson ? 'Make Single' : 'Make Double'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
                >
                  Next: Select Dates
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-sky-400">Select Lesson Dates</h3>
              
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Range Selection */}
                  <div>
                    <h4 className="text-lg font-medium text-slate-300 mb-4">Select Date Range</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 mb-2">Start Date</label>
                        <input
                          type="date"
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            setSelectedDateRange(prev => ({ ...prev, start: date }));
                            if (prev.end) handleDateRangeSelect(date, prev.end);
                          }}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-2">End Date</label>
                        <input
                          type="date"
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            setSelectedDateRange(prev => ({ ...prev, end: date }));
                            if (prev.start) handleDateRangeSelect(prev.start, date);
                          }}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Import/Export */}
                  <div>
                    <h4 className="text-lg font-medium text-slate-300 mb-4">Import/Export Schedule</h4>
                    <div className="space-y-4">
                      <button
                        onClick={handleExportSchedule}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      >
                        Export Schedule
                      </button>
                      <div>
                        <label className="block text-slate-300 mb-2">Import Schedule</label>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportSchedule}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Dates Display */}
                {selectedDates.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-slate-300 mb-4">Selected Dates</h4>
                    <div className="bg-slate-600 p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedDates.map((date, index) => (
                          <div
                            key={index}
                            className="bg-slate-700 px-3 py-2 rounded-lg flex items-center justify-between"
                          >
                            <span>{format(date, 'EEE, MMM d, yyyy')}</span>
                            <button
                              onClick={() => {
                                setSelectedDates(selectedDates.filter((_, i) => i !== index));
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
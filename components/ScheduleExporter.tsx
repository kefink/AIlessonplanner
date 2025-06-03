import React, { useState } from 'react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

interface ScheduleData {
  classes: any[];
  teachers: any[];
  resources: any[];
  subjects: any[];
  scheduleConfig: any;
}

interface ScheduleExporterProps {
  scheduleData: ScheduleData;
  onImport: (data: ScheduleData) => void;
}

export function ScheduleExporter({ scheduleData, onImport }: ScheduleExporterProps) {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(scheduleData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `schedule_export_${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportPDF = () => {
    try {
      // Create a temporary container for the schedule
      const container = document.createElement('div');
      container.innerHTML = `
        <h1>School Schedule</h1>
        <h2>Generated on ${format(new Date(), 'PPP')}</h2>
        <div>
          <h3>Classes</h3>
          ${scheduleData.classes.map(cls => `
            <div>
              <h4>${cls.name} (${cls.gradeLevel} ${cls.section})</h4>
              <p>Capacity: ${cls.capacity}</p>
              <h5>Subjects:</h5>
              <ul>
                ${cls.subjects.map(subj => `
                  <li>${subj.subjectName} - ${subj.lessonsPerWeek} lessons/week</li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        <div>
          <h3>Teachers</h3>
          ${scheduleData.teachers.map(teacher => `
            <div>
              <h4>${teacher.name}</h4>
              <p>Email: ${teacher.email}</p>
              <p>Subjects: ${teacher.subjects.join(', ')}</p>
            </div>
          `).join('')}
        </div>
        <div>
          <h3>Resources</h3>
          ${scheduleData.resources.map(resource => `
            <div>
              <h4>${resource.name}</h4>
              <p>Type: ${resource.type}</p>
              <p>Capacity: ${resource.capacity}</p>
            </div>
          `).join('')}
        </div>
      `;

      const opt = {
        margin: 1,
        filename: `schedule_export_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(container).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleExportExcel = () => {
    try {
      // Create worksheets for each data type
      const classSheet = XLSX.utils.json_to_sheet(scheduleData.classes.map(cls => ({
        'Class Name': cls.name,
        'Grade Level': cls.gradeLevel,
        'Section': cls.section,
        'Capacity': cls.capacity,
        'Subjects': cls.subjects.map(s => s.subjectName).join(', ')
      })));

      const teacherSheet = XLSX.utils.json_to_sheet(scheduleData.teachers.map(teacher => ({
        'Name': teacher.name,
        'Email': teacher.email,
        'Phone': teacher.phone,
        'Subjects': teacher.subjects.join(', '),
        'Max Hours/Week': teacher.maxHoursPerWeek
      })));

      const resourceSheet = XLSX.utils.json_to_sheet(scheduleData.resources.map(resource => ({
        'Name': resource.name,
        'Type': resource.type,
        'Capacity': resource.capacity,
        'Location': resource.location,
        'Status': resource.status
      })));

      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, classSheet, 'Classes');
      XLSX.utils.book_append_sheet(wb, teacherSheet, 'Teachers');
      XLSX.utils.book_append_sheet(wb, resourceSheet, 'Resources');

      // Generate and download Excel file
      XLSX.writeFile(wb, `schedule_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error generating Excel file. Please try again.');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate imported data structure
        if (!data.classes || !data.teachers || !data.resources || !data.subjects || !data.scheduleConfig) {
          throw new Error('Invalid schedule data format');
        }

        onImport(data);
        setImportSuccess('Schedule imported successfully!');
        setImportError(null);
      } catch (error) {
        console.error('Error importing schedule:', error);
        setImportError('Error importing schedule. Please check the file format.');
        setImportSuccess(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-6">
        Schedule Export/Import
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-sky-400 mb-4">Export Schedule</h3>
          <div className="space-y-4">
            <button
              onClick={handleExportJSON}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <span>📄</span> Export as JSON
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <span>📑</span> Export as PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <span>📊</span> Export as Excel
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-sky-400 mb-4">Import Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg cursor-pointer flex items-center justify-center gap-2">
                <span>📥</span> Choose JSON File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
            {importError && (
              <div className="p-3 bg-red-600 text-white rounded-lg">
                {importError}
              </div>
            )}
            {importSuccess && (
              <div className="p-3 bg-green-600 text-white rounded-lg">
                {importSuccess}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Preview */}
      <div className="mt-6 bg-slate-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-sky-400 mb-4">Export Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-600 p-3 rounded-lg">
            <h4 className="text-slate-200 font-medium mb-2">Classes</h4>
            <p className="text-slate-400">{scheduleData.classes.length} classes</p>
          </div>
          <div className="bg-slate-600 p-3 rounded-lg">
            <h4 className="text-slate-200 font-medium mb-2">Teachers</h4>
            <p className="text-slate-400">{scheduleData.teachers.length} teachers</p>
          </div>
          <div className="bg-slate-600 p-3 rounded-lg">
            <h4 className="text-slate-200 font-medium mb-2">Resources</h4>
            <p className="text-slate-400">{scheduleData.resources.length} resources</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
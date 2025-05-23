/**
 * Download Buttons Component for AI Lesson Planner
 * Provides PDF, Word, and Print functionality
 */

import React, { useState } from 'react';
import { DownloadService } from '../services/downloadService';
import { EditModal } from './EditModal';
import { EditService, type EditableData } from '../services/editService';
import type { SchemeOfWorkEntry, LessonPlan } from '../types';

interface DownloadButtonsProps {
  schemeOfWork: SchemeOfWorkEntry | null;
  lessonPlan: LessonPlan | null;
  onDataUpdate?: (data: EditableData) => void;
}

export function DownloadButtons({
  schemeOfWork,
  lessonPlan,
  onDataUpdate,
}: DownloadButtonsProps): React.ReactNode {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDownloadPDF = async () => {
    if (!schemeOfWork && !lessonPlan) return;

    setIsDownloading('pdf');
    try {
      await DownloadService.downloadPDF(schemeOfWork, lessonPlan);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadWord = async () => {
    if (!schemeOfWork && !lessonPlan) return;

    setIsDownloading('word');
    try {
      await DownloadService.downloadWord(schemeOfWork, lessonPlan);
    } catch (error) {
      console.error('Word download failed:', error);
      alert('Failed to download Word document. Please try again.');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (editedData: EditableData) => {
    if (onDataUpdate) {
      onDataUpdate(editedData);
    }
    setIsEditModalOpen(false);
  };

  if (!schemeOfWork && !lessonPlan) {
    return null;
  }

  return (
    <div className='bg-slate-800 p-6 rounded-xl shadow-2xl'>
      <h3 className='text-xl font-semibold text-sky-400 mb-4 border-b-2 border-sky-500 pb-2'>
        📥 Download & Print Options
      </h3>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* PDF Download Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading === 'pdf'}
          className={`
            flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200
            ${
              isDownloading === 'pdf'
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }
          `}
        >
          {isDownloading === 'pdf' ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
              Download PDF
            </>
          )}
        </button>

        {/* Word Download Button */}
        <button
          onClick={handleDownloadWord}
          disabled={isDownloading === 'word'}
          className={`
            flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200
            ${
              isDownloading === 'word'
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }
          `}
        >
          {isDownloading === 'word' ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
              Download Word
            </>
          )}
        </button>

        {/* Edit Button */}
        <button
          onClick={handleEdit}
          className='flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
        >
          <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
          </svg>
          Edit
        </button>
      </div>

      <div className='mt-4 text-sm text-slate-400'>
        <p className='flex items-center'>
          <svg className='w-4 h-4 mr-1 text-sky-400' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
              clipRule='evenodd'
            />
          </svg>
          <strong>PDF:</strong> Portable format, great for sharing
        </p>
        <p className='flex items-center mt-1'>
          <svg className='w-4 h-4 mr-1 text-sky-400' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
              clipRule='evenodd'
            />
          </svg>
          <strong>Word:</strong> Editable format, perfect for customization
        </p>

        <p className='flex items-center mt-1'>
          <svg className='w-4 h-4 mr-1 text-sky-400' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
              clipRule='evenodd'
            />
          </svg>
          <strong>Edit:</strong> Modify and customize the lesson plan content
        </p>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={{ schemeOfWork, lessonPlan }}
      />
    </div>
  );
}

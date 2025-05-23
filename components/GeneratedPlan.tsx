import React from 'react';
import type { SchemeOfWorkEntry, LessonPlan } from '../types';
import { DownloadButtons } from './DownloadButtons';
import { type EditableData } from '../services/editService';

interface GeneratedPlanProps {
  schemeOfWork: SchemeOfWorkEntry | null;
  lessonPlan: LessonPlan | null;
  onDataUpdate?: (data: EditableData) => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className='text-xl font-semibold text-sky-400 mb-3 border-b-2 border-sky-500 pb-2'>
    {children}
  </h3>
);

const DetailItem: React.FC<{ label: string; children: React.ReactNode; isList?: boolean }> = ({
  label,
  children,
  isList,
}) => (
  <div className='mb-3'>
    <strong className='text-slate-300'>{label}:</strong>
    {isList && Array.isArray(children) ? (
      <ul className='list-disc list-inside ml-4 text-slate-200'>
        {children.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : (
      <span className='ml-2 text-slate-200'>{children}</span>
    )}
  </div>
);

export function GeneratedPlan({
  schemeOfWork,
  lessonPlan,
  onDataUpdate,
}: GeneratedPlanProps): React.ReactNode {
  if (!schemeOfWork && !lessonPlan) {
    return null;
  }

  return (
    <div className='space-y-8'>
      {/* Download and Print Buttons */}
      <DownloadButtons
        schemeOfWork={schemeOfWork}
        lessonPlan={lessonPlan}
        onDataUpdate={onDataUpdate}
      />

      {schemeOfWork && (
        <div className='bg-slate-800 p-6 rounded-xl shadow-2xl'>
          <h2 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-4'>
            Scheme of Work Entry
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <DetailItem label='Week'>{schemeOfWork.wk}</DetailItem>
            <DetailItem label='Lesson No.'>{schemeOfWork.lsn}</DetailItem>
            <DetailItem label='Strand'>{schemeOfWork.strand}</DetailItem>
            <DetailItem label='Sub-Strand'>{schemeOfWork.subStrand}</DetailItem>
          </div>
          <div className='mt-4 space-y-3 text-sm'>
            <DetailItem label='Specific Learning Outcomes'>
              {schemeOfWork.specificLearningOutcomes}
            </DetailItem>
            <DetailItem label='Key Inquiry Question(s)'>
              {schemeOfWork.keyInquiryQuestions}
            </DetailItem>
            <DetailItem label='Learning Experiences'>{schemeOfWork.learningExperiences}</DetailItem>
            <DetailItem label='Learning Resources'>{schemeOfWork.learningResources}</DetailItem>
            <DetailItem label='Assessment Methods'>{schemeOfWork.assessmentMethods}</DetailItem>
            {schemeOfWork.refl && <DetailItem label='Reflection'>{schemeOfWork.refl}</DetailItem>}
          </div>
        </div>
      )}

      {lessonPlan && (
        <div className='bg-slate-800 p-6 rounded-xl shadow-2xl'>
          <h2 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-6'>
            Lesson Plan
          </h2>

          <table className='w-full mb-6 text-sm border-collapse'>
            <tbody>
              <tr className='border-b border-slate-700'>
                <td className='py-2 pr-3'>
                  <strong className='text-slate-300'>School:</strong>
                </td>
                <td className='py-2 px-3 text-slate-200 col-span-2'>{lessonPlan.school}</td>
                <td className='py-2 px-3'>
                  <strong className='text-slate-300'>Level:</strong>
                </td>
                <td className='py-2 px-3 text-slate-200'>{lessonPlan.level}</td>
                <td className='py-2 pl-3'>
                  <strong className='text-slate-300'>Learning Area:</strong>
                </td>
                <td className='py-2 pl-3 text-slate-200 col-span-2'>{lessonPlan.learningArea}</td>
              </tr>
              <tr>
                <td className='py-2 pr-3'>
                  <strong className='text-slate-300'>Date:</strong>
                </td>
                <td className='py-2 px-3 text-slate-200 col-span-2'>{lessonPlan.date}</td>
                <td className='py-2 px-3'>
                  <strong className='text-slate-300'>Time:</strong>
                </td>
                <td className='py-2 px-3 text-slate-200'>{lessonPlan.time}</td>
                <td className='py-2 pl-3'>
                  <strong className='text-slate-300'>Roll:</strong>
                </td>
                <td className='py-2 pl-3 text-slate-200 col-span-2'>{lessonPlan.roll}</td>
              </tr>
            </tbody>
          </table>

          {/* Strand and Sub-Strand can remain as DetailItems or be added to the table if preferred */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mb-6 text-sm'>
            <DetailItem label='Strand'>{lessonPlan.strand}</DetailItem>
            <DetailItem label='Sub-Strand'>{lessonPlan.subStrand}</DetailItem>
          </div>

          <SectionTitle>Core Elements</SectionTitle>
          <div className='mb-6 space-y-3 text-sm'>
            <DetailItem label='Specific Learning Outcomes' isList>
              {lessonPlan.specificLearningOutcomes}
            </DetailItem>
            <DetailItem label='Key Inquiry Questions' isList>
              {lessonPlan.keyInquiryQuestions}
            </DetailItem>
            <DetailItem label='Learning Resources' isList>
              {lessonPlan.learningResources}
            </DetailItem>
          </div>

          <SectionTitle>Organisation of Learning</SectionTitle>
          <div className='space-y-4 text-sm'>
            <div>
              <h4 className='font-semibold text-slate-300 mb-1'>
                Introduction (approx. 5 minutes)
              </h4>
              <p className='text-slate-200 pl-4 border-l-2 border-slate-600'>
                {lessonPlan.organisationOfLearning.introduction}
              </p>
            </div>
            <div>
              <h4 className='font-semibold text-slate-300 mb-1'>
                Lesson Development (approx. 30 minutes)
              </h4>
              <div className='text-slate-200 pl-4 border-l-2 border-slate-600 whitespace-pre-line'>
                {lessonPlan.organisationOfLearning.lessonDevelopment}
              </div>
            </div>
            <div>
              <h4 className='font-semibold text-slate-300 mb-1'>Conclusion (approx. 5 minutes)</h4>
              <p className='text-slate-200 pl-4 border-l-2 border-slate-600'>
                {lessonPlan.organisationOfLearning.conclusion}
              </p>
            </div>
          </div>

          {lessonPlan.extendedActivities && lessonPlan.extendedActivities.length > 0 && (
            <div className='mt-6'>
              <SectionTitle>Extended Activities</SectionTitle>
              <ul className='list-disc list-inside text-slate-200 ml-4 text-sm'>
                {lessonPlan.extendedActivities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>
          )}

          <div className='mt-6'>
            <SectionTitle>Teacher Self-Evaluation</SectionTitle>
            <p className='text-slate-400 italic text-sm'>{lessonPlan.teacherSelfEvaluation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

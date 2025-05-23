
import React from 'react';

interface FeasibilityNotesProps {
  onClose: () => void;
}

export function FeasibilityNotes({ onClose }: FeasibilityNotesProps): React.ReactNode {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-sky-400">Project Feasibility & Overview</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-sky-400 text-2xl font-bold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4 text-sm md:text-base">
          <p>
            This application is a Proof of Concept (PoC) demonstrating how AI, specifically Large Language Models (LLMs) like Google's Gemini, can assist educators in generating schemes of work and lesson plans from existing curriculum designs.
          </p>

          <h3 className="text-lg font-semibold text-sky-500 mt-4">Is the Idea Feasible?</h3>
          <p>
            <strong className="text-green-400">Yes, highly feasible.</strong> The core concept of using LLMs to process curriculum documents and output structured planning materials is well within current AI capabilities.
          </p>

          <h4 className="text-md font-semibold text-slate-300 mt-3">Strengths & Advantages:</h4>
          <ul className="list-disc list-inside ml-4 space-y-1 text-slate-300">
            <li><strong className="text-sky-300">Time Savings:</strong> Significantly reduces manual effort for teachers.</li>
            <li><strong className="text-sky-300">Consistency:</strong> Helps ensure planning documents adhere to required formats and curriculum guidelines.</li>
            <li><strong className="text-sky-300">Content Extraction:</strong> LLMs can efficiently pull relevant information (learning outcomes, activities, resources) from source documents.</li>
            <li><strong className="text-sky-300">Customization:</strong> Can be adapted to specific grades, subjects, and school requirements with proper prompting and data inputs.</li>
            <li><strong className="text-sky-300">Accessibility:</strong> Could make curriculum interpretation and planning more accessible.</li>
          </ul>

          <h4 className="text-md font-semibold text-slate-300 mt-3">Challenges & Considerations:</h4>
          <ul className="list-disc list-inside ml-4 space-y-1 text-slate-300">
            <li><strong className="text-amber-300">Input Quality:</strong> Accuracy of AI output depends heavily on clear, well-structured curriculum input (digital text is best; OCR from PDFs can be error-prone).</li>
            <li><strong className="text-amber-300">Prompt Engineering:</strong> Crafting effective prompts to guide the AI is crucial and requires iteration.</li>
            <li><strong className="text-amber-300">Pedagogical Nuance:</strong> While AI can structure content, ensuring deep pedagogical value, differentiation, and addressing specific learner needs will still require teacher expertise and review. AI is an assistant, not a replacement.</li>
            <li><strong className="text-amber-300">Context Management:</strong> For extensive planning (e.g., a full year), managing context across multiple AI calls is a technical challenge.</li>
            <li><strong className="text-amber-300">Variability:</strong> Different curriculum frameworks may require different processing logic or prompt adjustments.</li>
            <li><strong className="text-amber-300">Ethical Use & Review:</strong> Teachers must review and take ownership of AI-generated content.</li>
             <li><strong className="text-amber-300">API Costs:</strong> Scaled deployment would involve costs for LLM API usage.</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-sky-500 mt-4">This PoC:</h3>
           <ul className="list-disc list-inside ml-4 space-y-1 text-slate-300">
            <li>Focuses on generating a single Scheme of Work entry and a corresponding Lesson Plan for a predefined curriculum snippet (Grade 9 Pre-Technical Studies, T1 W1 L1).</li>
            <li>Uses Google's Gemini API via the <code className="bg-slate-700 px-1 rounded text-xs">@google/genai</code> SDK.</li>
            <li>Demonstrates UI/UX principles for such a tool using React and Tailwind CSS.</li>
            <li>Highlights how JSON mode can be used with Gemini for structured output.</li>
          </ul>

          <p className="mt-6 text-slate-400">
            Further development would involve robust curriculum parsing, dynamic data handling for various selections, advanced prompt engineering, and features for teachers to edit and customize generated plans.
          </p>
        </div>

        <button
            onClick={onClose}
            className="mt-8 w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-colors duration-150"
          >
            Close
          </button>
      </div>
    </div>
  );
}
    
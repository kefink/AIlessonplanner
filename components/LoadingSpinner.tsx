
import React from 'react';

export function LoadingSpinner(): React.ReactNode {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-slate-800 rounded-xl shadow-2xl">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
      <p className="mt-4 text-lg text-slate-300">Generating Plan...</p>
      <p className="text-sm text-slate-400">Please wait, the AI is working its magic!</p>
    </div>
  );
}
    
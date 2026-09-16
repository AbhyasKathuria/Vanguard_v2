import React from 'react';
import { AlertOctagon } from 'lucide-react';

export default function EmergencyButton({ onClick, label }) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button
        onClick={onClick}
        type="button"
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-danger hover:bg-red-700 text-white font-extrabold flex flex-col items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl cursor-pointer animate-pulse-ring focus:outline-none transition active:scale-95 z-10"
      >
        <AlertOctagon className="w-10 h-10 mb-1 animate-bounce" />
        <span className="text-xs uppercase tracking-widest font-black">
          {label || 'ALERT'}
        </span>
      </button>
      <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mt-4">
        Tap to Trigger Alert
      </span>
    </div>
  );
}

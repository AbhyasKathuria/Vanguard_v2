import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

export default function LoadingShield({ loadingText }) {
  const defaultMessages = [
    "Analyzing image...",
    "Detecting hazard type...",
    "Calculating risk score...",
    "Determining authority..."
  ];

  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Message cycling
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % defaultMessages.length);
    }, 1500);

    // Progress bar incrementing
    const progInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 5;
      });
    }, 200);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  const displayMessage = loadingText || defaultMessages[messageIndex];

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
      {/* Animated VANGUARD Shield with scan ring */}
      <div className="relative w-28 h-28 flex items-center justify-center bg-accent-soft dark:bg-slate-700 rounded-3xl border border-border dark:border-slate-600 shadow-md">
        
        {/* Pulsing Backlight */}
        <div className="absolute inset-0 bg-accent rounded-3xl opacity-10 animate-pulse-ring" />

        {/* SVG Shield Icon */}
        <Shield size={64} className="text-accent dark:text-blue-400 z-10" style={{ width: '64px', height: '64px', minWidth: '64px', minHeight: '64px' }} />

        {/* CSS Scanning line overlay */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent dark:via-blue-400 to-transparent animate-scan-line z-20 shadow-[0_0_10px_#1B6FD8]" />
      </div>

      {/* Message & Progress Bar */}
      <div className="space-y-3 w-full max-w-[280px]">
        <p className="text-sm font-bold text-text dark:text-white tracking-wide animate-pulse">
          {displayMessage}
        </p>

        {/* Progress Bar Container */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-border dark:border-slate-600">
          <div 
            className="h-full bg-accent dark:bg-blue-400 transition-all duration-200 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

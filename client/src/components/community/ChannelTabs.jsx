import React from 'react';
import { Home, AlertOctagon, Users, BellRing, Sprout } from 'lucide-react';

export default function ChannelTabs({ activeChannel, onChange }) {
  const channels = [
    { id: 'General', label: '🏘 General', icon: Home },
    { id: 'Emergency', label: '🚨 Emergency', icon: AlertOctagon },
    { id: 'Workers', label: '👷 Workers', icon: Users },
    { id: 'Announcements', label: '📢 Announcements', icon: BellRing },
    { id: 'Agriculture', label: '🌾 Agriculture', icon: Sprout }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1 border-b border-border dark:border-slate-700">
      {channels.map((chan) => {
        const isSelected = activeChannel === chan.id;
        return (
          <button
            key={chan.id}
            onClick={() => onChange(chan.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer min-h-[44px] ${
              isSelected
                ? 'bg-accent text-white shadow-sm'
                : 'bg-surface dark:bg-slate-800 text-text hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-border dark:border-slate-700'
            }`}
          >
            <span>{chan.label}</span>
          </button>
        );
      })}
    </div>
  );
}

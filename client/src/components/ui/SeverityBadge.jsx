import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function SeverityBadge({ severity }) {
  const getBadgeStyle = () => {
    switch (severity?.toLowerCase()) {
      case 'red':
        return {
          bg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',
          label: 'Dangerous',
          icon: ShieldAlert
        };
      case 'orange':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900',
          label: 'Urgent',
          icon: AlertCircle
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
          label: 'Attention',
          icon: AlertTriangle
        };
      case 'green':
      default:
        return {
          bg: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900',
          label: 'Minor',
          icon: CheckCircle
        };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.bg}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{style.label}</span>
    </span>
  );
}

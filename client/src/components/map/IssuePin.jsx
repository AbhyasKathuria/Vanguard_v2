import React from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import SeverityBadge from '../ui/SeverityBadge';
import { ArrowRight } from 'lucide-react';

export default function IssuePin({ issue }) {
  const navigate = useNavigate();

  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'red': return '#DC2626';
      case 'orange': return '#EA580C';
      case 'yellow': return '#EAB308';
      case 'green':
      default: return '#16A34A';
    }
  };

  const lat = Number(issue.lat) || 12.7244;
  const lng = Number(issue.lng) || 77.2911;
  const color = getSeverityColor(issue.severity);
  const shortDesc = issue.description ? (issue.description.substring(0, 60) + (issue.description.length > 60 ? '...' : '')) : 'No description';

  return (
    <CircleMarker
      center={[lat, lng]}
      radius={10}
      fillColor={color}
      color={color}
      weight={2}
      fillOpacity={0.8}
    >
      <Popup>
        <div className="text-slate-800 dark:text-slate-200 p-1 space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between gap-2 border-b pb-1 border-slate-100">
            <span className="text-[10px] font-black uppercase text-accent">
              {issue.categoryLabel || issue.category?.replace('_', ' ')}
            </span>
            <SeverityBadge severity={issue.severity} />
          </div>
          <p className="text-xs font-semibold leading-relaxed">
            {shortDesc}
          </p>
          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-bold">
            <button
              onClick={() => navigate(`/issues/${issue.id}`)}
              className="text-accent font-black hover:underline flex items-center gap-0.5"
            >
              View Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

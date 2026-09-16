import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export default function IssueCard({ issue }) {
  const navigate = useNavigate();

  // Format date helper
  const formatTimeAgo = (dateStr) => {
    try {
      const diff = new Date() - new Date(dateStr);
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch (e) {
      return 'Some time ago';
    }
  };

  const getCategoryLabel = (category) => {
    return category ? category.replace('_', ' ').toUpperCase() : 'OTHER';
  };
  const timeAgo = formatTimeAgo;

  return (
    <div 
      onClick={() => navigate(`/issues/${issue.id}`)}
      className="card flex gap-4 p-4 hover:border-[var(--accent)] cursor-pointer group"
    >
      {/* Photo Thumbnail */}
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0 border border-[var(--border)]">
        <img 
          src={issue.photoUrl || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=300&q=80'} 
          alt="Issue Thumbnail" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>

      {/* Info details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <SeverityBadge severity={issue.severity} />
          </div>

          <div style={{fontWeight: 700, fontSize: '15px', color: 'var(--text)'}}>{issue.categoryLabel || issue.title}</div>
          <div style={{fontSize: 12, color: 'var(--text-muted)'}}>
            {issue.village}, Ward {issue.ward} · {timeAgo(issue.createdAt)}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
            {issue.description || 'No additional description provided.'}
          </p>
        </div>

        {/* Card Footer details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-[var(--text-muted)] font-medium">
          <div className="flex items-center gap-1 text-[var(--accent)] font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>{issue.confirmations?.length || 0} confirmed</span>
          </div>
        </div>
      </div>

      {/* Right Chevron arrow */}
      <div className="flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors pl-2">
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}

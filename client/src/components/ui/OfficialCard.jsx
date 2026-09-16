import React from 'react';
import { Phone, Mail, Award, Landmark, Zap, Droplet, Shield, Heart } from 'lucide-react';
import Card from './Card';

export default function OfficialCard({ official }) {
  
  // Resolve department icon helper
  const getDeptIcon = (dept) => {
    const iconClass = "w-6 h-6 text-white";
    switch (dept?.toLowerCase()) {
      case 'electricity':
      case 'electricity board':
      case 'power':
        return {
          bg: 'bg-amber-500',
          icon: <Zap className={iconClass} />
        };
      case 'water':
      case 'water supply':
      case 'sewage':
        return {
          bg: 'bg-blue-500',
          icon: <Droplet className={iconClass} />
        };
      case 'police':
      case 'security':
      case 'law':
        return {
          bg: 'bg-slate-700',
          icon: <Shield className={iconClass} />
        };
      case 'health':
      case 'hospital':
      case 'medical':
        return {
          bg: 'bg-red-500',
          icon: <Heart className={iconClass} />
        };
      case 'municipality':
      case 'ward':
      case 'district':
      default:
        return {
          bg: 'bg-emerald-600',
          icon: <Landmark className={iconClass} />
        };
    }
  };

  const deptInfo = getDeptIcon(official.department);

  return (
    <Card padding="20px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
      <div className="flex gap-4 items-center min-w-0">
        {/* Department Colored Circle */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${deptInfo.bg}`}>
          {deptInfo.icon}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <h4 className="text-base font-bold text-[var(--text)] truncate">
            {official.name}
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate flex items-center gap-1 font-medium">
            <Award className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
            <span>{official.role}</span>
          </p>
          <span className="inline-block bg-[var(--surface-2)] text-[var(--text)] text-[10px] font-bold px-2 py-0.5 rounded-md mt-1.5 uppercase tracking-wider">
            {official.department}
          </span>
        </div>
      </div>

      {/* Action Buttons Call & Email */}
      <div className="flex gap-2">
        <a 
          href={`tel:${official.phone}`}
          className="btn-icon text-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] focus:outline-none transition active:scale-95"
          title="Call Official"
        >
          <Phone className="w-5 h-5" />
        </a>
        <a 
          href={`mailto:${official.email}`}
          className="btn-icon text-[var(--text-muted)] hover:bg-[var(--surface-2)] focus:outline-none transition active:scale-95"
          title="Email Official"
        >
          <Mail className="w-5 h-5" />
        </a>
      </div>
    </Card>
  );
}

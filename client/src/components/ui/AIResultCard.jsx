import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Mail, 
  Zap, 
  Download, 
  Share2, 
  Save,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import SeverityBadge from './SeverityBadge';

function getScoreColor(score) {
  if (score >= 81) return '#DC2626' // red
  if (score >= 61) return '#EA580C' // orange  
  if (score >= 31) return '#D97706' // yellow
  return '#16A34A' // green
}

export default function AIResultCard({ 
  result, 
  onDownloadPdf, 
  onShareCommunity, 
  onSubmit, 
  submitting = false 
}) {
  // Ensure uppercase section labels use color: 'var(--text-muted)' for dark mode compatibility
  
  const getSeverityTheme = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'red':
        return {
          bar: 'bg-red-500 text-white',
          text: 'text-red-600 dark:text-red-400',
          bgLight: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900',
          title: '⚠️ CRITICAL SAFETY HAZARD'
        };
      case 'orange':
        return {
          bar: 'bg-orange-500 text-white',
          text: 'text-orange-600 dark:text-orange-400',
          bgLight: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900',
          title: '🔶 URGENT REPAIR NEEDED'
        };
      case 'yellow':
        return {
          bar: 'bg-yellow-500 text-slate-900',
          text: 'text-yellow-600 dark:text-yellow-400',
          bgLight: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900',
          title: '⚠️ REGULAR MAINTENANCE REQUIRED'
        };
      case 'green':
      default:
        return {
          bar: 'bg-green-500 text-white',
          text: 'text-green-600 dark:text-green-400',
          bgLight: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900',
          title: '✅ MINOR COMMUNITY ISSUE'
        };
    }
  };

  if (!result) return null;

  const theme = getSeverityTheme(result.severity);
  const score = result.impactScore ?? 0;

  // Circular progress ring calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 16,
      padding: 24,
      border: '1px solid var(--border)',
      overflow: 'visible',
    }} className="space-y-6">
      {/* 1. Header Banner */}
      <div className={`rounded-xl overflow-hidden border ${theme.bgLight}`}>
        <div className={`px-4 py-3 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 ${theme.bar}`}>
          <ShieldAlert className="w-5 h-5" />
          <span>{theme.title}</span>
        </div>
        <div className="p-4 space-y-2">
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 20,
            marginBottom: 16,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', 
                             textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Civic Category
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
                {result.categoryLabel || result.category?.replace('_', ' ')}
              </div>
            </div>

            <div style={{
              flexShrink: 0,
              width: 64, height: 64,
              borderRadius: '50%',
              border: `4px solid ${getScoreColor(score)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              color: getScoreColor(score),
            }}>
              {score}
            </div>
          </div>
          <p className="text-sm font-semibold text-text dark:text-slate-200">
            {result.severityReason || 'Identified as community hazard by AI inspection.'}
          </p>
        </div>
      </div>

      {/* 2. Impact Score & Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Impact Progress Circle */}
        <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 p-5 rounded-2xl flex items-center gap-4">
          <div className="relative flex-shrink-0 w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-700"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-accent dark:stroke-blue-400 transition-all duration-500"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-text dark:text-white leading-none">
                {score}
              </span>
              <span className="text-[10px] text-text-muted font-bold mt-0.5 uppercase tracking-wider">
                Impact
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-text dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-accent" />
              AI Impact Assessment
            </h4>
            <p className="text-xs text-text-muted mt-1 leading-normal">
              Score calculated based on hazard severity, nearby facilities, and exposure risk.
            </p>
          </div>
        </div>

        {/* Impact Factors List */}
        <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-text dark:text-white mb-2 uppercase tracking-wide">
            Contributing Factors
          </h4>
          <div className="flex flex-wrap gap-2">
            {(result.impactFactors || ['General risk', 'Pending local verification']).map((factor) => (
              <span 
                key={factor}
                className="bg-slate-50 dark:bg-slate-700/50 text-text-muted dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border dark:border-slate-700"
              >
                • {factor}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Risk Prediction & Action */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-border dark:border-slate-700/60 space-y-3">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text dark:text-white">Predicted Civic Hazard</h4>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              {result.riskPrediction || 'Potential hazard if left unaddressed. Immediate review advised.'}
            </p>
          </div>
        </div>

        <div className="h-px bg-border dark:border-slate-700"></div>

        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/50 text-green-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text dark:text-white">Immediate Recommended Action</h4>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              {result.suggestedAction || 'Alert residents and report to the local municipal ward officer.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Recommended Authority */}
      <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent-soft text-accent rounded-2xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Assigned Authority
            </span>
            <h4 className="text-base font-bold text-text dark:text-white leading-tight">
              {result.recommendedAuthority || 'Municipal Department'}
            </h4>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            type="button" 
            className="flex-1 sm:flex-none h-11 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-text dark:text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition"
            onClick={() => alert(`Calling ${result.recommendedAuthority || 'Authority'} Helpline`)}
          >
            <Phone className="w-3.5 h-3.5" /> Call Board
          </button>
          <button 
            type="button"
            className="flex-1 sm:flex-none h-11 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-text dark:text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition"
            onClick={() => alert(`Emailing report to ${result.recommendedAuthority || 'Authority'}`)}
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </button>
        </div>
      </div>

      {/* 5. AI Generated Draft Box */}
      <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-3 text-text-muted font-bold text-xs uppercase tracking-wide">
          <FileText className="w-4 h-4 text-accent" />
          <span>AI Official Complaint Draft</span>
        </div>
        <blockquote className="border-l-4 border-accent bg-slate-50 dark:bg-slate-900/50 p-4 rounded-r-xl text-sm italic font-medium leading-relaxed text-text dark:text-slate-300">
          "{result.reportText || 'Drafting issue details paragraph...'}"
        </blockquote>
      </div>

      {/* 6. Action Triggers */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onDownloadPdf}
          className="flex-1 min-h-[56px] border-2 border-accent text-accent hover:bg-accent-soft rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition"
        >
          <Download className="w-5 h-5" />
          Download PDF Report
        </button>

        <button
          type="button"
          onClick={onShareCommunity}
          className="flex-1 min-h-[56px] border-2 border-accent text-accent hover:bg-accent-soft rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition"
        >
          <Share2 className="w-5 h-5" />
          Share with Community
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 min-h-[56px] bg-accent hover:bg-opacity-95 text-white rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition shadow-md active:scale-98 disabled:opacity-50"
        >
          {submitting ? (
            <span>Submitting...</span>
          ) : (
            <>
              Submit Issue <Save className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

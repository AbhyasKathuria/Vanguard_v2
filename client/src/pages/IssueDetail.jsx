import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Clock, Users, Building, FileText, Download } from 'lucide-react';
import useIssues from '../hooks/useIssues';
import SeverityBadge from '../components/ui/SeverityBadge';
import { downloadPdfReport } from '../lib/pdfGenerator';

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getIssueDetail, confirmIssue } = useIssues();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const unsubscribe = getIssueDetail(id, (fetchedIssue) => {
      setIssue(fetchedIssue);
      setLoading(false);
    });
    return () => unsubscribe && unsubscribe();
  }, [id]);

  const handleConfirm = async () => {
    if (confirming || !issue) return;
    setConfirming(true);
    try {
      await confirmIssue(issue.id);
      alert("Thank you for confirming this community issue!");
    } catch (e) {
      console.error(e);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="text-text-muted font-bold animate-pulse">Loading issue details...</span>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="card-vanguard text-center p-8 space-y-4">
        <h3 className="text-lg font-bold text-text">Issue Not Found</h3>
        <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-text dark:text-white leading-tight">
            Issue Details
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Status: <span className="font-bold text-accent">{issue.status}</span>
          </p>
        </div>
      </div>

      <div className="card-vanguard space-y-6">
        {/* Thumbnail Preview */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-border dark:border-slate-600">
          <img 
            src={issue.photoUrl || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80'} 
            alt={issue.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Category & Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="bg-slate-100 dark:bg-slate-700 text-text dark:text-slate-200 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
            {issue.categoryLabel || issue.category}
          </span>
          <SeverityBadge severity={issue.severity} />
        </div>

        {/* Content Description */}
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-text dark:text-white leading-snug">
            {issue.title || 'Civic safety issue'}
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            {issue.description || 'No detailed description was provided.'}
          </p>
        </div>

        {/* Location & Time Info */}
        <div className="grid grid-cols-2 gap-4 border-t border-b border-border dark:border-slate-700 py-4 text-xs font-semibold text-text-muted">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="truncate">{issue.village || 'Ramanagara'}{issue.ward ? `, ${issue.ward}` : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{new Date(issue.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* AI Analysis Draft Paragraph */}
        {issue.aiReportText && (
          <div className="bg-slate-50 dark:bg-slate-700/20 p-5 rounded-2xl border border-border dark:border-slate-700">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4 text-accent" />
              <span>AI Official Complaint Summary</span>
            </h4>
            <p className="text-sm font-medium italic text-text dark:text-slate-300 leading-relaxed">
              "{issue.aiReportText}"
            </p>
          </div>
        )}

        {/* Assigned Authority */}
        <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-accent" />
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">Assigned Authority</span>
              <span className="text-sm font-bold text-text dark:text-white">{issue.recommendedAuthority || 'Local Board'}</span>
            </div>
          </div>
          <span className="text-xs font-bold text-text dark:text-white uppercase tracking-wider">
            {issue.escalationLevel}
          </span>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => downloadPdfReport(issue)}
            className="flex-1 min-h-[56px] border-2 border-accent text-accent font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-5 h-5" /> Download Report
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 min-h-[56px] bg-accent hover:bg-opacity-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
          >
            <Users className="w-5 h-5" /> Confirm ( {issue.confirmations?.length || 0} residents )
          </button>
        </div>
      </div>
    </div>
  );
}

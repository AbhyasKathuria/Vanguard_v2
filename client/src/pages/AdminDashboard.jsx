import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle, 
  HelpCircle,
  FileCheck,
  Building,
  Filter,
  Eye,
  Edit2,
  X,
  Loader2,
  Clock
} from 'lucide-react';
import useIssues from '../hooks/useIssues';
import SeverityBadge from '../components/ui/SeverityBadge';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import PageHeader from '../components/ui/PageHeader';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { issues } = useIssues();

  // Filter conditions
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Open' | 'In Progress' | 'Resolved'
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'red' | 'orange' | 'yellow' | 'green'
  
  // Stats
  const [criticalCount, setCriticalCount] = useState(0);
  const [totalOpenCount, setTotalOpenCount] = useState(0);
  const [resolvedTodayCount, setResolvedTodayCount] = useState(2); // simulated baseline

  // Modal active state
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('In Progress');
  const [officialNote, setOfficialNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (issues) {
      const criticals = issues.filter(issue => issue.severity === 'red' && issue.status !== 'Resolved');
      setCriticalCount(criticals.length);

      const openCount = issues.filter(issue => issue.status !== 'Resolved').length;
      setTotalOpenCount(openCount);
    }
  }, [issues]);

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    setUpdating(true);
    try {
      const issueRef = doc(db, 'issues', selectedIssue.id);
      
      // Update values in Firestore or local mock
      const updateData = {
        status: statusUpdate,
        officialNote: officialNote,
        updatedAt: new Date().toISOString()
      };

      if (db.isMock) {
        await db.updateDoc(issueRef, updateData);
      } else {
        await updateDoc(issueRef, updateData);
      }

      // If statusUpdate is 'Resolved', simulate notification alert
      if (statusUpdate === 'Resolved') {
        loggerNotificationMock(selectedIssue);
      }

      alert("Issue status successfully updated!");
      setSelectedIssue(null);
      setOfficialNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const loggerNotificationMock = (issue) => {
    console.log(`[FCM Notification] Dispatched status update: "Your report regarding ${issue.category} has been marked as RESOLVED by Ward Officials."`);
  };

  // Filter issues based on select tabs
  const getFilteredIssuesList = () => {
    return issues.filter((issue) => {
      const matchStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchSeverity = severityFilter === 'all' || issue.severity === severityFilter;
      return matchStatus && matchSeverity;
    });
  };

  const filtered = getFilteredIssuesList();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Admin Control Center" 
        subtitle="Review incoming complaints, dispatch local workers, and track safety logs" 
      />

      {/* 2. Count Panels Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface dark:bg-slate-800 border-l-4 border-l-danger border border-border dark:border-slate-700 p-4 rounded-r-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Critical Open</span>
            <span className="text-2xl font-black text-danger mt-1 block">{criticalCount}</span>
          </div>
          <AlertOctagon className="w-6 h-6 text-danger opacity-45" />
        </div>

        <div className="bg-surface dark:bg-slate-800 border-l-4 border-l-accent border border-border dark:border-slate-700 p-4 rounded-r-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Total Pending</span>
            <span className="text-2xl font-black text-accent mt-1 block">{totalOpenCount}</span>
          </div>
          <Clock className="w-6 h-6 text-accent opacity-45" />
        </div>

        <div className="bg-surface dark:bg-slate-800 border-l-4 border-l-success border border-border dark:border-slate-700 p-4 rounded-r-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Resolved Today</span>
            <span className="text-2xl font-black text-success mt-1 block">{resolvedTodayCount}</span>
          </div>
          <CheckCircle className="w-6 h-6 text-success opacity-45" />
        </div>
      </div>

      {/* 3. Filter Controls Options */}
      <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
          <Filter className="w-4 h-4 text-accent" />
          <span>Filters:</span>
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {/* Status filter */}
          <div className="flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full min-h-[38px] px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-lg text-xs font-bold text-text dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Severity filter */}
          <div className="flex-1 sm:flex-none">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full min-h-[38px] px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-lg text-xs font-bold text-text dark:text-white"
            >
              <option value="all">All Severities</option>
              <option value="red">Dangerous (Red)</option>
              <option value="orange">Urgent (Orange)</option>
              <option value="yellow">Attention (Yellow)</option>
              <option value="green">Minor (Green)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Table / List Grid of reported issues */}
      <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/40 text-[10px] font-black uppercase text-text-muted tracking-wider border-b border-border dark:border-slate-700">
                <th className="p-4">Photo</th>
                <th className="p-4">Category</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-700 text-xs font-medium text-text dark:text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-text-muted italic">
                    No active community safety issues found matching filter settings.
                  </td>
                </tr>
              ) : (
                filtered.map((issue) => (
                  <tr 
                    key={issue.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition cursor-pointer"
                    onClick={() => navigate(`/issues/${issue.id}`)}
                  >
                    {/* Photo thumbnail */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="w-11 h-11 rounded-lg overflow-hidden border border-border dark:border-slate-700 bg-slate-100 flex-shrink-0">
                        <img 
                          src={issue.photoUrl || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=150&q=80'} 
                          alt="Thumbnail"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 font-bold max-w-[120px] truncate">
                      {issue.categoryLabel || issue.category?.replace('_', ' ')}
                    </td>

                    {/* Severity */}
                    <td className="p-4">
                      <SeverityBadge severity={issue.severity} />
                    </td>

                    {/* Location */}
                    <td className="p-4 max-w-[120px] truncate">
                      {issue.village || 'Ramanagara'}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                        issue.status === 'Resolved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' 
                          : issue.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {issue.status || 'Open'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/issues/${issue.id}`)}
                          className="w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center text-text-muted hover:text-accent"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedIssue(issue); setStatusUpdate(issue.status || 'In Progress'); }}
                          className="w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center text-text-muted hover:text-accent"
                          title="Edit Status"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. UPDATE STATUS DIALOG OVERLAY */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-surface dark:bg-slate-850 border border-border dark:border-slate-700 p-6 rounded-3xl max-w-sm w-full relative space-y-4 shadow-2xl">
            <button 
              onClick={() => setSelectedIssue(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 rounded-xl flex items-center justify-center text-text-muted cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1 pb-1">
              <h3 className="text-base font-black text-text dark:text-white">Update Issue Status</h3>
              <p className="text-[10px] text-text-muted font-bold">Lodge updates for {selectedIssue.categoryLabel || selectedIssue.category}</p>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase">Select Status</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs font-bold text-text dark:text-white outline-none focus:border-accent"
                >
                  <option value="Open">Open (Pending Review)</option>
                  <option value="In Progress">In Progress (Dispatching)</option>
                  <option value="Resolved">Resolved (Cleared)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase">Official Resolution Notes</label>
                <textarea
                  rows="3"
                  value={officialNote}
                  onChange={(e) => setOfficialNote(e.target.value)}
                  placeholder="Describe resolution details or notes..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-text dark:text-white outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full min-h-[48px] bg-accent hover:bg-opacity-95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
              >
                {updating ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : 'Confirm Status Update'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

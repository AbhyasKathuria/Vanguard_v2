import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  MessageSquare, 
  Briefcase, 
  Shield, 
  Map, 
  Bot,
  User,
  Plus,
  TrendingUp,
  FileText,
  MapPin,
  ArrowRight,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Search,
  Eye,
  Award
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, limit, onSnapshot, getDocs, doc, setDoc, addDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import PageHeader from '../components/ui/PageHeader';
import Grid from '../components/ui/Grid';
import Card from '../components/ui/Card';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dbUser, userProfile } = useAuth();
  const role = (dbUser?.role || userProfile?.role || 'citizen').toLowerCase();

  const theme = {
    bg: 'var(--bg)',
    surface: 'var(--surface)',
    surface2: 'var(--surface-2)',
    text: 'var(--text)',
    muted: 'var(--text-muted)',
    border: 'var(--border)',
    accent: 'var(--accent)',
    accentSoft: 'var(--accent-soft)',
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('greeting_morning', 'Good morning');
    if (hour >= 12 && hour < 17) return t('greeting_afternoon', 'Good afternoon');
    if (hour >= 17 && hour < 21) return t('greeting_evening', 'Good evening');
    return t('greeting_night', 'Good night');
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'red': return { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' };
      case 'orange': return { background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA' };
      case 'yellow': return { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' };
      default: return { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' };
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // CITIZEN DASHBOARD
  // ─────────────────────────────────────────────────────────────────
  if (role === 'citizen') {
    const [openIssuesCount, setOpenIssuesCount] = useState(0);
    const [myReportsCount, setMyReportsCount] = useState(0);
    const [communityCount, setCommunityCount] = useState(124); // mock default
    const [recentIssues, setRecentIssues] = useState([]);

    useEffect(() => {
      if (!dbUser) return;

      const openQ = query(
        collection(db, 'issues'),
        where('ward', '==', dbUser.ward || '6'),
        where('status', '==', 'open')
      );
      const unsubOpen = onSnapshot(openQ, (snap) => {
        setOpenIssuesCount(snap.size);
      });

      const myQ = query(
        collection(db, 'issues'),
        where('reporterId', '==', dbUser.uid)
      );
      const unsubMy = onSnapshot(myQ, (snap) => {
        setMyReportsCount(snap.size);
      });

      const usersQ = query(
        collection(db, 'users'),
        where('district', '==', dbUser.district || 'Ramanagara')
      );
      getDocs(usersQ).then((snap) => {
        if (snap.size > 0) setCommunityCount(snap.size);
      });

      const recentQ = query(
        collection(db, 'issues'),
        where('village', '==', dbUser.village || 'Ramanagara'),
        limit(5)
      );
      const unsubRecent = onSnapshot(recentQ, (snap) => {
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentIssues(docs);
      });

      return () => {
        unsubOpen();
        unsubMy();
        unsubRecent();
      };
    }, [dbUser]);

    return (
      <div className="space-y-6">
        <PageHeader 
          title={`${getGreeting()}, ${dbUser?.name || 'Citizen'}`} 
          subtitle={dbUser?.village ? `${dbUser.village}, Ward ${dbUser.ward || '6'}` : 'Protect your community'} 
        />

        {/* Stats Row */}
        <Grid desktopCols={3} mobileCols={2}>
          <Card padding="16px" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--danger)', display: 'block' }}>{openIssuesCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Open Issues</span>
          </Card>
          <Card padding="16px" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)', display: 'block' }}>{myReportsCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>My Reports</span>
          </Card>
          <Card padding="16px" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', display: 'block' }}>{communityCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Members</span>
          </Card>
        </Grid>

        {/* Quick Actions Grid */}
        <Grid desktopCols={3} mobileCols={2}>
          {[
            { path: '/report', icon: AlertTriangle, color: '#DC2626', label: 'Report Issue' },
            { path: '/community', icon: MessageSquare, color: '#1B6FD8', label: 'Community Chat' },
            { path: '/map', icon: Map, color: '#1B6FD8', label: 'Live Map' },
            { path: '/emergency', icon: Shield, color: '#DC2626', label: 'Emergency Alert' },
            { path: '/ai', icon: Bot, color: '#7C3AED', label: 'AI Assistant' },
            { path: '/officials', icon: Briefcase, color: '#D97706', label: 'Officials' },
          ].map(action => (
            <Card 
              key={action.path} 
              onClick={() => navigate(action.path)} 
              padding="24px 16px" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                minHeight: 110,
              }}
            >
              <action.icon size={26} color={action.color} />
              <span style={{fontSize: 13, fontWeight: 600, color: 'var(--text)', textAlign:'center'}}>
                {action.label}
              </span>
            </Card>
          ))}
        </Grid>

        {/* Recent Issues Feed */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', marginBottom: '16px', tracking: 'wide' }}>
            Recent Ward Issues
          </h3>
          {recentIssues.length === 0 ? (
            <p style={{ fontSize: '12px', color: theme.muted }}>No issues reported in this ward yet.</p>
          ) : (
            <div className="space-y-3">
              {recentIssues.map(issue => (
                <div key={issue.id} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '12px', borderRadius: '12px', background: theme.surface2, border: '1px solid ' + theme.border }} onClick={() => navigate(`/issues/${issue.id}`)} className="cursor-pointer hover:opacity-90">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ borderLeft: '4px solid ' + (issue.severity === 'red' ? '#DC2626' : issue.severity === 'orange' ? '#EA580C' : '#D97706'), paddingLeft: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text, display: 'block' }}>{issue.title}</span>
                      <span style={{ fontSize: '10px', color: theme.muted }}>{issue.categoryLabel || issue.category}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ ...getSeverityStyle(issue.severity), fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {issue.severity}
                    </span>
                    <span style={{ fontSize: '10px', color: theme.muted }}>{issue.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // WORKER DASHBOARD
  // ─────────────────────────────────────────────────────────────────
  if (role === 'worker') {
    const [isAvailable, setIsAvailable] = useState(dbUser?.isAvailable !== false);
    const [appliedCount, setAppliedCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [avgRating, setAvgRating] = useState(dbUser?.rating || 5.0);
    const [availableJobs, setAvailableJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    
    const [selectedJob, setSelectedJob] = useState(null);
    const [proposedRate, setProposedRate] = useState(dbUser?.dailyRate || 400);
    const [coverMessage, setCoverMessage] = useState('');
    const [submittingApp, setSubmittingApp] = useState(false);

    useEffect(() => {
      if (!dbUser) return;

      setIsAvailable(dbUser.isAvailable !== false);
      setAvgRating(dbUser.rating || 5.0);

      const jobsQ = query(
        collection(db, 'jobPosts'),
        where('status', '==', 'open'),
        where('district', '==', dbUser.district || 'Ramanagara')
      );
      const unsubJobs = onSnapshot(jobsQ, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const workerSkills = dbUser.skills || ['General'];
        const matched = docs.filter(j => 
          workerSkills.some(s => s.toLowerCase() === (j.skillRequired || '').toLowerCase())
        );
        setAvailableJobs(matched);
      });

      const appsQ = query(
        collection(db, 'worker_applications'),
        where('workerId', '==', dbUser.uid)
      );
      const unsubApps = onSnapshot(appsQ, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMyApplications(docs);
        setAppliedCount(docs.length);
        
        const completed = docs.filter(a => a.status === 'accepted').length;
        setCompletedCount(completed);
      });

      return () => {
        unsubJobs();
        unsubApps();
      };
    }, [dbUser]);

    const toggleAvailability = async () => {
      const nextVal = !isAvailable;
      setIsAvailable(nextVal);
      try {
        await setDoc(doc(db, 'users', dbUser.uid), { isAvailable: nextVal }, { merge: true });
        await setDoc(doc(db, 'workers', dbUser.uid), { isAvailable: nextVal }, { merge: true });
        toast.success(nextVal ? "You are now visible to employers!" : "Availability disabled");
      } catch (err) {
        console.error(err);
      }
    };

    const handleApplySubmit = async (e) => {
      e.preventDefault();
      if (!selectedJob) return;
      setSubmittingApp(true);

      try {
        await addDoc(collection(db, 'worker_applications'), {
          workerId: dbUser.uid,
          workerName: dbUser.name,
          workerSkills: dbUser.skills || ['General'],
          workerRating: avgRating,
          jobId: selectedJob.id,
          jobTitle: selectedJob.title,
          posterId: selectedJob.posterId || 'anonymous',
          proposedRate: Number(proposedRate),
          message: coverMessage,
          status: 'pending',
          appliedAt: new Date().toISOString()
        });
        toast.success("Application submitted successfully!");
        setSelectedJob(null);
        setCoverMessage('');
      } catch (err) {
        console.error(err);
        toast.error("Failed to submit application");
      } finally {
        setSubmittingApp(false);
      }
    };

    return (
      <div className="space-y-6">
        <PageHeader 
          title={dbUser?.name || 'Worker'} 
          subtitle={(dbUser?.skills || []).join(', ') + ` · Rating: ${avgRating.toFixed(1)}`}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: theme.surface2, padding: '12px 16px', borderRadius: '12px', border: '1px solid ' + theme.border }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text, display: 'block' }}>Available for Work</span>
                <span style={{ fontSize: '10px', color: theme.muted }}>Visible to employers nearby</span>
              </div>
              <button 
                onClick={toggleAvailability}
                style={{ 
                  background: isAvailable ? 'var(--success)' : '#64748B', 
                  border: 'none', borderRadius: '20px', width: '52px', height: '26px', 
                  cursor: 'pointer', transition: 'all 0.2s', padding: '2px', position: 'relative'
                }}
              >
                <div style={{ 
                  width: '22px', height: '22px', borderRadius: '50%', background: '#fff',
                  transform: isAvailable ? 'translateX(26px)' : 'translateX(0)', transition: 'transform 0.2s'
                }} />
              </button>
            </div>
          }
        />

        {/* Stats Row */}
        <Grid desktopCols={3} mobileCols={2}>
          <Card padding="16px" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)', display: 'block' }}>{appliedCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Jobs Applied</span>
          </Card>
          <Card padding="16px" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', display: 'block' }}>{completedCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Jobs Completed</span>
          </Card>
          <Card padding="16px" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#FBBF24', display: 'block' }}>{avgRating.toFixed(1)}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Average Rating</span>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid desktopCols={4} mobileCols={2}>
          {[
            { path: '/workers', icon: Briefcase, color: '#F59E0B', label: 'Browse Jobs' },
            { path: '/workers?tab=applications', icon: FileText, color: '#3B82F6', label: 'My Applications' },
            { path: '/profile', icon: User, color: '#8B5CF6', label: 'Edit Profile' },
            { path: '/community', icon: MessageSquare, color: '#3B82F6', label: 'Community' },
          ].map(action => (
            <Card 
              key={action.path} 
              onClick={() => navigate(action.path)} 
              padding="16px" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 110,
              }}
            >
              <action.icon size={24} color={action.color} />
              <span style={{fontSize: 11, fontWeight: 800, color: theme.text, textAlign: 'center'}}>
                {action.label}
              </span>
            </Card>
          ))}
        </Grid>

        {/* Available Jobs Feed */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', marginBottom: '16px', tracking: 'wide' }}>
            Available Job Posts Matches Your Skills
          </h3>
          {availableJobs.length === 0 ? (
            <p style={{ fontSize: '12px', color: theme.muted }}>No matching job openings found in your district.</p>
          ) : (
            <div className="space-y-4">
              {availableJobs.map(job => (
                <div key={job.id} style={{ padding: '16px', borderRadius: '12px', background: theme.surface2, border: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: theme.text, display: 'block' }}>{job.title}</span>
                    <span style={{ fontSize: '11px', color: theme.muted }}>Skill required: {job.skillRequired} &bull; Daily rate: ₹{job.payPerDay}</span>
                    <span style={{ fontSize: '10px', color: theme.muted, display: 'block', marginTop: '4px' }}>Location: {job.village || 'Nearby'} &bull; Workers needed: {job.workersNeeded || 1}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedJob(job);
                      setProposedRate(dbUser?.dailyRate || job.payPerDay || 400);
                    }}
                    style={{ background: theme.accent, border: 'none', color: '#fff', fontWeight: 800, fontSize: '12px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Applications Section */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', marginBottom: '16px', tracking: 'wide' }}>
            My Job Applications
          </h3>
          {myApplications.length === 0 ? (
            <p style={{ fontSize: '12px', color: theme.muted }}>You haven't submitted any job applications yet.</p>
          ) : (
            <div className="space-y-3">
              {myApplications.map(app => {
                const isPending = app.status === 'pending';
                const isAccepted = app.status === 'accepted';
                const statusColor = isAccepted ? 'var(--success)' : isPending ? 'var(--warning)' : 'var(--danger)';
                const StatusIcon = isAccepted ? CheckCircle2 : isPending ? Clock : XCircle;

                return (
                  <div key={app.id} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '12px', borderRadius: '12px', background: theme.surface2, border: '1px solid ' + theme.border }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text, display: 'block' }}>{app.jobTitle}</span>
                      <span style={{ fontSize: '10px', color: theme.muted }}>Proposed rate: ₹{app.proposedRate}/day</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColor, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                      <StatusIcon size={14} />
                      {app.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Application Modal */}
        {selectedJob && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow)', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: theme.text, margin: 0 }}>Apply for {selectedJob.title}</h3>
                <button onClick={() => setSelectedJob(null)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: '18px' }}>&times;</button>
              </div>
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: theme.muted, display: 'block', marginBottom: '6px' }}>Proposed Daily Rate (₹)</label>
                  <input 
                    type="number" 
                    value={proposedRate} 
                    onChange={e => setProposedRate(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.surface2, border: '1px solid ' + theme.border, color: theme.text, outline: 'none' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: theme.muted, display: 'block', marginBottom: '6px' }}>Cover Message</label>
                  <textarea 
                    rows={3}
                    placeholder="Why are you the right person for this job?"
                    value={coverMessage} 
                    onChange={e => setCoverMessage(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.surface2, border: '1px solid ' + theme.border, color: theme.text, outline: 'none', resize: 'none' }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submittingApp}
                  style={{ width: '100%', padding: '14px', background: theme.accent, border: 'none', color: '#fff', fontWeight: 800, borderRadius: '8px', cursor: submittingApp ? 'not-allowed' : 'pointer' }}
                >
                  {submittingApp ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // OFFICIAL DASHBOARD
  // ─────────────────────────────────────────────────────────────────
  if (role === 'official') {
    const [criticalCount, setCriticalCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [resolvedToday, setResolvedToday] = useState(0);
    const [totalReportsThisWeek, setTotalReportsThisWeek] = useState(0);
    
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [officialNote, setOfficialNote] = useState('');
    const [updateStatus, setUpdateStatus] = useState('open');
    const [submittingStatus, setSubmittingStatus] = useState(false);

    useEffect(() => {
      if (!dbUser) return;

      const qIssues = query(
        collection(db, 'issues'),
        where('district', '==', dbUser.district || 'Ramanagara')
      );
      
      const unsub = onSnapshot(qIssues, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const sorted = docs.sort((a,b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        setIssues(sorted);
        
        const criticals = docs.filter(i => i.severity === 'red' && i.status === 'open').length;
        setCriticalCount(criticals);

        const openPending = docs.filter(i => i.status === 'open').length;
        setPendingCount(openPending);

        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const resolved = docs.filter(i => i.status === 'resolved' && i.resolvedAt && new Date(i.resolvedAt).getTime() > dayAgo).length;
        setResolvedToday(resolved);

        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const weekly = docs.filter(i => i.createdAt && new Date(i.createdAt).getTime() > weekAgo).length;
        setTotalReportsThisWeek(weekly);
      });

      return () => unsub();
    }, [dbUser]);

    const handleStatusUpdate = async (e) => {
      e.preventDefault();
      if (!selectedIssue) return;
      setSubmittingStatus(true);

      try {
        await updateDoc(doc(db, 'issues', selectedIssue.id), {
          status: updateStatus,
          officialNote: officialNote,
          officialId: dbUser.uid,
          officialName: dbUser.name,
          updatedAt: new Date().toISOString(),
          ...(updateStatus === 'resolved' ? { resolvedAt: new Date().toISOString() } : {})
        });
        toast.success("Issue status updated successfully!");
        setSelectedIssue(null);
        setOfficialNote('');
      } catch (err) {
        console.error(err);
        toast.error("Failed to update status");
      } finally {
        setSubmittingStatus(false);
      }
    };

    const quickUpdateStatus = async (issueId, newStatus) => {
      try {
        await updateDoc(doc(db, 'issues', issueId), {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          ...(newStatus === 'resolved' ? { resolvedAt: new Date().toISOString() } : {})
        });
        toast.success(`Marked issue as ${newStatus.replace('_', ' ')}`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update status");
      }
    };

    const filteredIssues = issues.filter(issue => {
      if (filter === 'critical' && issue.severity !== 'red') return false;
      if (filter === 'open' && issue.status !== 'open') return false;
      if (filter === 'in_progress' && issue.status !== 'in_progress') return false;
      if (filter === 'resolved' && issue.status !== 'resolved') return false;

      if (searchQuery.trim()) {
        const queryStr = searchQuery.toLowerCase();
        const categoryMatch = (issue.categoryLabel || issue.category || '').toLowerCase().includes(queryStr);
        const villageMatch = (issue.village || '').toLowerCase().includes(queryStr);
        const descMatch = (issue.description || '').toLowerCase().includes(queryStr);
        return categoryMatch || villageMatch || descMatch;
      }

      return true;
    });

    const reportersToday = [];
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const todayIssues = issues.filter(i => i.createdAt && new Date(i.createdAt).getTime() > dayAgo);
    
    const grouped = {};
    todayIssues.forEach(issue => {
      if (!issue.reporterId) return;
      if (!grouped[issue.reporterId]) {
        grouped[issue.reporterId] = {
          name: issue.reporterName || 'Citizen',
          village: issue.village || 'Ramanagara',
          ward: issue.ward || '6',
          count: 0
        };
      }
      grouped[issue.reporterId].count += 1;
    });

    Object.keys(grouped).forEach(k => reportersToday.push(grouped[k]));

    return (
      <div className="space-y-6">
        <PageHeader 
          title={dbUser?.name || 'Official'} 
          subtitle={`${dbUser?.department || 'Municipality'} · ${dbUser?.designation || 'Ward Officer'}`} 
        />

        {/* Stats Row */}
        <Grid desktopCols={4} mobileCols={2}>
          <Card 
            onClick={() => setFilter('critical')}
            style={{ background: '#FEF2F2', borderColor: '#FECACA', textAlign: 'center' }}
          >
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#DC2626', display: 'block' }}>{criticalCount}</span>
            <span style={{ fontSize: '11px', color: '#B91C1C', fontWeight: 800, display: 'block', marginTop: '4px', textTransform: 'uppercase' }}>Critical Issues</span>
          </Card>
          <Card 
            onClick={() => setFilter('open')}
            style={{ background: '#FFFBEB', borderColor: '#FDE68A', textAlign: 'center' }}
          >
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#D97706', display: 'block' }}>{pendingCount}</span>
            <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 800, display: 'block', marginTop: '4px', textTransform: 'uppercase' }}>Pending Open</span>
          </Card>
          <Card 
            onClick={() => setFilter('resolved')}
            style={{ background: '#F0FDF4', borderColor: '#BBF7D0', textAlign: 'center' }}
          >
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#16A34A', display: 'block' }}>{resolvedToday}</span>
            <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 800, display: 'block', marginTop: '4px', textTransform: 'uppercase' }}>Resolved Today</span>
          </Card>
          <Card 
            onClick={() => setFilter('all')}
            style={{ background: '#EFF6FF', borderColor: '#BFDBFE', textAlign: 'center' }}
          >
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#1D4ED8', display: 'block' }}>{totalReportsThisWeek}</span>
            <span style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 800, display: 'block', marginTop: '4px', textTransform: 'uppercase' }}>Reports This Week</span>
          </Card>
        </Grid>

        {/* Issue Management Panel */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', tracking: 'wide', margin: 0 }}>
              Issue Management Panel
            </h3>
            
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['all', 'critical', 'open', 'in_progress', 'resolved'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? theme.accent : theme.surface2,
                    border: '1px solid ' + theme.border,
                    color: filter === f ? '#fff' : theme.text,
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: theme.muted }} />
            <input 
              type="text" 
              placeholder="Search by category, village or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                borderRadius: '12px',
                background: theme.surface2,
                border: '1px solid ' + theme.border,
                color: theme.text,
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid ' + theme.border }}>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: 800, color: theme.muted, textTransform: 'uppercase' }}>Reporter</th>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: 800, color: theme.muted, textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: 800, color: theme.muted, textTransform: 'uppercase' }}>Severity</th>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: 800, color: theme.muted, textTransform: 'uppercase' }}>Location</th>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: 800, color: theme.muted, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: 800, color: theme.muted, textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: theme.muted }}>
                      No complaints match this criteria.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map(issue => (
                    <tr key={issue.id} style={{ borderBottom: '1px solid ' + theme.border }}>
                      <td style={{ padding: '12px', fontSize: '12px', fontWeight: 700, color: theme.text }}>
                        {issue.reporterName || 'Citizen'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: theme.text }}>
                        {issue.categoryLabel || issue.category}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ ...getSeverityStyle(issue.severity), fontSize: '9px', fontWeight: 800, padding: '3px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {issue.severity}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: theme.muted }}>
                        {issue.village}, Ward {issue.ward}
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', fontWeight: 700, color: theme.text, textTransform: 'capitalize' }}>
                        {issue.status}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => {
                              setSelectedIssue(issue);
                              setUpdateStatus(issue.status || 'open');
                              setOfficialNote(issue.officialNote || '');
                            }}
                            className="bg-accent hover:opacity-90 transition p-2 rounded-lg text-white cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          {issue.status === 'open' && (
                            <button 
                              onClick={() => quickUpdateStatus(issue.id, 'in_progress')}
                              style={{ background: 'var(--warning)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '6px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                            >
                              In Progress
                            </button>
                          )}
                          {issue.status !== 'resolved' && (
                            <button 
                              onClick={() => quickUpdateStatus(issue.id, 'resolved')}
                              style={{ background: 'var(--success)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '6px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Reporters Section */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', marginBottom: '16px', tracking: 'wide' }}>
            Active Reporters Today
          </h3>
          {reportersToday.length === 0 ? (
            <p style={{ fontSize: '12px', color: theme.muted }}>No complaints filed today yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {reportersToday.map(r => (
                <div key={r.name} style={{ background: theme.surface2, border: '1px solid ' + theme.border, padding: '16px', borderRadius: '12px', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text, display: 'block' }}>{r.name}</span>
                    <span style={{ fontSize: '10px', color: theme.muted }}>Village: {r.village} &bull; Ward {r.ward}</span>
                  </div>
                  <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '20px' }}>
                    {r.count} reports
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TASK 6: Official Issue Detail Slide-Over Modal */}
        {selectedIssue && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justify: 'flex-end', zIndex: 100 }}>
            <div style={{ background: theme.surface, width: '100%', maxWidth: '520px', height: '100%', overflowY: 'auto', padding: '32px 24px', boxShadow: 'var(--shadow)', boxSizing: 'border-box', borderLeft: '1px solid ' + theme.border, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: theme.text, margin: 0 }}>Civic Complaint Report</h3>
                <button onClick={() => setSelectedIssue(null)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: '24px' }}>&times;</button>
              </div>

              <div style={{ width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', background: theme.surface2, border: '1px solid ' + theme.border }}>
                <img 
                  src={selectedIssue.imageUrl || 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=400&auto=format&fit=crop'} 
                  alt="Civic Issue" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              <div style={{ background: theme.surface2, padding: '16px', borderRadius: '12px', border: '1px solid ' + theme.border, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: theme.muted, textTransform: 'uppercase' }}>AI Analysis Verdict</span>
                  <span style={{ ...getSeverityStyle(selectedIssue.severity), fontSize: '9px', fontWeight: 850, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {selectedIssue.severityLabel || selectedIssue.severity}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
                  <div style={{
                    width: '54px', height: '54px', borderRadius: '50%',
                    border: '4px solid ' + theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 800, color: theme.text
                  }}>
                    {selectedIssue.impactScore || selectedIssue.analysis?.impactScore || 65}
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text, display: 'block' }}>Civic Impact Score</span>
                    <span style={{ fontSize: '10px', color: theme.muted }}>Calculated risk factors to residents</span>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: theme.text, lineHeight: '1.5' }}>
                  <strong>Risk:</strong> {selectedIssue.riskPrediction || selectedIssue.analysis?.riskPrediction || 'No immediate emergency predicted.'}
                </div>
                <div style={{ fontSize: '11px', color: theme.text }}>
                  <strong>Authority:</strong> {selectedIssue.recommendedAuthority || selectedIssue.analysis?.recommendedAuthority || 'Local Ward Committee'}
                </div>
              </div>

              <div style={{ borderLeft: '4px solid ' + theme.accent, paddingLeft: '16px', fontStyle: 'italic', fontSize: '12px', color: theme.muted, lineHeight: '1.6' }}>
                {selectedIssue.reportText || selectedIssue.analysis?.reportText || selectedIssue.description || 'No detailed analysis report generated.'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: theme.surface2, padding: '12px', borderRadius: '8px', border: '1px solid ' + theme.border, fontSize: '11px' }}>
                <span style={{ color: theme.muted }}><strong>Reporter:</strong> {selectedIssue.reporterName || 'Citizen'}</span>
                <span style={{ color: theme.muted }}><strong>Location:</strong> {selectedIssue.village}, Ward {selectedIssue.ward}</span>
                <span style={{ color: theme.muted }}><strong>Reported At:</strong> {selectedIssue.createdAt ? new Date(selectedIssue.createdAt).toLocaleString() : 'Just now'}</span>
              </div>

              <div style={{ fontSize: '12px', color: theme.text }}>
                <strong>Confirmations:</strong> {selectedIssue.confirmations?.length || 0} community members verified this hazard.
              </div>

              <form onSubmit={handleStatusUpdate} style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid ' + theme.border, paddingTop: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, display: 'block', marginBottom: '6px' }}>Current Status badge</label>
                  <select
                    value={updateStatus}
                    onChange={e => setUpdateStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: theme.surface2,
                      border: '1px solid ' + theme.border,
                      color: theme.text,
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, display: 'block', marginBottom: '6px' }}>Add Official Response Note</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about the action taken..."
                    value={officialNote}
                    onChange={e => setOfficialNote(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: theme.surface2,
                      border: '1px solid ' + theme.border,
                      color: theme.text,
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submittingStatus}
                  style={{
                    background: theme.accent, border: 'none', color: '#fff', fontWeight: 800,
                    fontSize: '13px', padding: '14px', borderRadius: '8px', cursor: submittingStatus ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // VOLUNTEER DASHBOARD
  // ─────────────────────────────────────────────────────────────────
  if (role === 'volunteer') {
    const [confirmedCount, setConfirmedCount] = useState(0);
    const [reportedCount, setReportedCount] = useState(0);
    const [emergenciesResponded, setEmergenciesResponded] = useState(0);
    const [activeEmergencies, setActiveEmergencies] = useState([]);
    const [needingConfirm, setNeedingConfirm] = useState([]);

    useEffect(() => {
      if (!dbUser) return;

      // 1. Fetch reported count
      const repQ = query(collection(db, 'issues'), where('reporterId', '==', dbUser.uid));
      const unsubRep = onSnapshot(repQ, (snap) => {
        setReportedCount(snap.size);
      });

      // 2. Fetch confirmed issues count
      const confQ = query(collection(db, 'issues'));
      const unsubConf = onSnapshot(confQ, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const myConfirmed = docs.filter(i => (i.confirmations || []).includes(dbUser.uid));
        setConfirmedCount(myConfirmed.length);
        
        // Find issues needing confirmation (less than 3 confirmations, open status, in same district)
        const unconfirmed = docs.filter(i => 
          i.status === 'open' && 
          (!i.confirmations || i.confirmations.length < 3) &&
          i.district === dbUser.district
        );
        setNeedingConfirm(unconfirmed);
      });

      // 3. Fetch active emergencies
      const emerQ = query(collection(db, 'emergencies'), where('isResolved', '==', false));
      const unsubEmer = onSnapshot(emerQ, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setActiveEmergencies(docs);
        
        const myResponses = docs.filter(e => (e.responders || []).includes(dbUser.name)).length;
        setEmergenciesResponded(myResponses);
      });

      return () => {
        unsubRep();
        unsubConf();
        unsubEmer();
      };
    }, [dbUser]);

    const handleConfirm = async (issueId, currentConfirmations = []) => {
      if (currentConfirmations.includes(dbUser.uid)) {
        toast.error("You already confirmed this issue!");
        return;
      }
      try {
        await updateDoc(doc(db, 'issues', issueId), {
          confirmations: [...currentConfirmations, dbUser.uid]
        });
        toast.success("Issue confirmed successfully!");
      } catch (err) {
        console.error(err);
      }
    };

    const handleRespond = async (emergencyId, currentResponders = []) => {
      if (currentResponders.includes(dbUser.name)) {
        toast.error("You are already responding!");
        return;
      }
      try {
        await updateDoc(doc(db, 'emergencies', emergencyId), {
          responders: [...currentResponders, dbUser.name]
        });
        toast.success("You have signed up to respond to this emergency!");
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <div className="space-y-6">
        <PageHeader 
          title={dbUser?.name || 'Volunteer'} 
          subtitle={`Protecting village of ${dbUser?.village || 'Ramanagara'}`} 
        />

        {/* Stats Row */}
        <Grid desktopCols={3} mobileCols={2}>
          <Card padding="16px" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', display: 'block' }}>{confirmedCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Issues Confirmed</span>
          </Card>
          <Card padding="16px" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)', display: 'block' }}>{reportedCount}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Issues Reported</span>
          </Card>
          <Card padding="16px" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--danger)', display: 'block' }}>{emergenciesResponded}</span>
            <span style={{ fontSize: '11px', color: theme.muted, fontWeight: 700, display: 'block', marginTop: '4px' }}>Responded Alerts</span>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid desktopCols={4} mobileCols={2}>
          {[
            { path: '/report', icon: AlertTriangle, color: '#EF4444', label: 'Report Issue' },
            { path: '/emergency', icon: Shield, color: '#EF4444', label: 'Active Emergencies' },
            { path: '/community', icon: MessageSquare, color: '#3B82F6', label: 'Community Chat' },
            { path: '/map', icon: Map, color: '#3B82F6', label: 'Live Map' },
          ].map(action => (
            <Card 
              key={action.path} 
              onClick={() => navigate(action.path)} 
              padding="16px" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 110,
              }}
            >
              <action.icon size={24} color={action.color} />
              <span style={{fontSize: 11, fontWeight: 800, color: theme.text, textAlign: 'center'}}>
                {action.label}
              </span>
            </Card>
          ))}
        </Grid>

        {/* Active Emergencies Feed */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', marginBottom: '16px', tracking: 'wide' }}>
            Active Emergencies Feed
          </h3>
          {activeEmergencies.length === 0 ? (
            <p style={{ fontSize: '12px', color: theme.muted }}>All clear. No active emergencies reported.</p>
          ) : (
            <div className="space-y-4">
              {activeEmergencies.map(e => (
                <div key={e.id} style={{ borderLeft: '4px solid var(--danger)', padding: '16px', borderRadius: '12px', background: theme.surface2, border: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 850, color: 'var(--danger)', display: 'block', textTransform: 'uppercase' }}>
                      {e.category}
                    </span>
                    <span style={{ fontSize: '11px', color: theme.muted, display: 'block', marginTop: '2px' }}>
                      Location: {e.village || 'Ward Office'} &bull; Reported At: {e.createdAt ? new Date(e.createdAt).toLocaleTimeString() : 'Just now'}
                    </span>
                    {e.responders && e.responders.length > 0 && (
                      <span style={{ fontSize: '10px', color: theme.muted, display: 'block', marginTop: '4px' }}>
                        Responders: {e.responders.join(', ')}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRespond(e.id, e.responders || [])}
                    style={{ background: 'var(--danger)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '12px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Respond
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Issues Needing Confirmation */}
        <div style={{ background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', marginBottom: '16px', tracking: 'wide' }}>
            Issues Needing Verification
          </h3>
          {needingConfirm.length === 0 ? (
            <p style={{ fontSize: '12px', color: theme.muted }}>No issues need verification in your area.</p>
          ) : (
            <div className="space-y-3">
              {needingConfirm.map(issue => (
                <div key={issue.id} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', padding: '12px', borderRadius: '12px', background: theme.surface2, border: '1px solid ' + theme.border }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: theme.text, display: 'block' }}>{issue.title}</span>
                    <span style={{ fontSize: '10px', color: theme.muted }}>Village: {issue.village} &bull; Confirmations: {issue.confirmations?.length || 0}/3</span>
                  </div>
                  <button 
                    onClick={() => handleConfirm(issue.id, issue.confirmations || [])}
                    style={{ background: 'var(--success)', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Confirm
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback loading skeleton / basic layout
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: theme.muted }}>
      Loading Vanguard Dashboard ({role})...
    </div>
  );
}

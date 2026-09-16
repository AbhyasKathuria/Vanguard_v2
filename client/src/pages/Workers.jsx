import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  MapPin, 
  PlusCircle, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Star,
  Loader2,
  Briefcase
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import PageHeader from '../components/ui/PageHeader';
import Grid from '../components/ui/Grid';
import Card from '../components/ui/Card';
import WorkerCard from '../components/ui/WorkerCard';

export default function Workers() {
  const { t } = useTranslation();
  const { dbUser, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('find'); // 'find' | 'post' | 'my-posts'
  const [workers, setWorkers] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [myJobApplications, setMyJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Modal / Detailed view states
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Form state
  const [postForm, setPostForm] = useState({
    title: '',
    skillRequired: 'Electrician',
    workersNeeded: '1',
    description: '',
    location: dbUser?.village || '',
    payPerDay: ''
  });
  const [posting, setPosting] = useState(false);

  // Load Workers and sort by district/rating
  useEffect(() => {
    if (!dbUser) return;
    setLoading(true);

    const workersQuery = query(collection(db, 'workers'));
    const unsubscribeWorkers = onSnapshot(workersQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = list.sort((a, b) => {
        const aMatch = a.district === dbUser.district ? 1 : 0;
        const bMatch = b.district === dbUser.district ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
        return (b.rating || 0) - (a.rating || 0);
      });
      setWorkers(sorted);
      setLoading(false);
    }, (err) => {
      console.warn("Workers listener failed:", err);
      setLoading(false);
    });

    // Fetch Job Posts
    const jobsQuery = query(
      collection(db, 'jobPosts'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      setJobPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      const simpleQuery = query(collection(db, 'jobPosts'));
      onSnapshot(simpleQuery, (snap) => {
        setJobPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    });

    // Fetch My Job Applications
    const applicationsQuery = query(
      collection(db, 'worker_applications')
    );
    const unsubscribeApps = onSnapshot(applicationsQuery, (snapshot) => {
      setMyJobApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeWorkers();
      unsubscribeJobs();
      unsubscribeApps();
    };
  }, [dbUser]);

  // Handle Post Job Form Submission
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.payPerDay) {
      toast.error("Please fill in the title and pay fields.");
      return;
    }
    setPosting(true);
    const postToast = toast.loading("Publishing job post to community boards...");
    try {
      await addDoc(collection(db, 'jobPosts'), {
        posterId: user?.uid || 'anonymous',
        posterName: dbUser?.name || 'Citizen User',
        title: postForm.title,
        skillRequired: postForm.skillRequired.toLowerCase(),
        workersNeeded: Number(postForm.workersNeeded),
        description: postForm.description,
        location: postForm.location || dbUser?.village || 'Community Area',
        payPerDay: Number(postForm.payPerDay),
        status: 'open',
        applications: [],
        createdAt: serverTimestamp()
      });
      toast.dismiss(postToast);
      toast.success("Job posted successfully!");
      setPostForm({
        title: '',
        skillRequired: 'Electrician',
        workersNeeded: '1',
        description: '',
        location: dbUser?.village || '',
        payPerDay: ''
      });
      setActiveTab('my-posts');
    } catch (err) {
      console.error(err);
      toast.dismiss(postToast);
      toast.error("Failed to post job. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  // Submit Job Application
  const handleApplyJob = async (jobId, jobTitle) => {
    const applyToast = toast.loading("Submitting job application...");
    try {
      // Check if already applied
      const alreadyApplied = myJobApplications.some(app => app.jobId === jobId && app.workerId === user?.uid);
      if (alreadyApplied) {
        toast.dismiss(applyToast);
        toast.error("You have already applied to this job post.");
        return;
      }

      await addDoc(collection(db, 'worker_applications'), {
        jobId,
        jobTitle,
        workerId: user?.uid,
        workerName: dbUser?.name || 'Daily Worker',
        workerPhone: dbUser?.phone || '',
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
      toast.dismiss(applyToast);
      toast.success("Applied to job successfully!");
    } catch (err) {
      console.error(err);
      toast.dismiss(applyToast);
      toast.error("Failed to apply for job.");
    }
  };

  const getFilteredWorkers = () => {
    return workers.filter(worker => {
      const matchesSearch = worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            worker.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = activeFilter === 'all' || worker.skills?.includes(activeFilter.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  };

  const filteredWorkers = getFilteredWorkers();

  // Helper render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const val = rating || 5.0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${
            i <= Math.floor(val) 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-slate-350 dark:text-slate-650'
          }`} 
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const filterChips = ['All', 'Electrician', 'Plumber', 'Farmer', 'Construction', 'Carpenter'];

  return (
    <div className="space-y-4">
      <PageHeader title={t('nav_workers', 'Worker Market')} subtitle={t('workers_subtitle', 'Find local workers and post job opportunities')} />
      {/* Tabs */}
      <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl flex gap-1.5 self-start max-w-md">
        <button
          onClick={() => setActiveTab('find')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer ${
            activeTab === 'find' ? 'bg-accent text-white shadow-sm' : 'text-text-muted dark:text-slate-300'
          }`}
        >
          {t('find_workers', 'Find Workers')}
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer ${
            activeTab === 'post' ? 'bg-accent text-white shadow-sm' : 'text-text-muted dark:text-slate-300'
          }`}
        >
          {t('post_job', 'Post a Job')}
        </button>
        <button
          onClick={() => setActiveTab('my-posts')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer ${
            activeTab === 'my-posts' ? 'bg-accent text-white shadow-sm' : 'text-text-muted dark:text-slate-300'
          }`}
        >
          {t('my_posts', 'Open Jobs Board')}
        </button>
      </div>

      {activeTab === 'find' && (
        <div className="space-y-4">
          {/* Search bar & filter row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_skill', 'Search by skill...')}
                className="w-full h-11 pl-9 pr-4 bg-surface dark:bg-slate-850 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filterChips.map(chip => (
              <button
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
                  activeFilter.toLowerCase() === chip.toLowerCase()
                    ? 'bg-accent border-accent text-white shadow-sm'
                    : 'bg-surface dark:bg-slate-850 border-border dark:border-slate-700 text-text-muted hover:text-text'
                }`}
              >
                {t(chip.toLowerCase(), chip)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-10 bg-surface dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700">
              <p className="text-xs text-text-muted font-bold">No registered workers found in {dbUser?.district || 'this area'}.</p>
            </div>
          ) : (
            <Grid desktopCols={1} mobileCols={1} gap={16}>
              {filteredWorkers.map(worker => (
                <WorkerCard
                  key={worker.id}
                  worker={{
                    ...worker,
                    isNearYou: worker.district === dbUser?.district
                  }}
                  onHire={(w) => setSelectedWorker(w)}
                />
              ))}
            </Grid>
          )}
        </div>
      )}

      {activeTab === 'post' && (
        <form onSubmit={handlePostJob} className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4 max-w-xl">
          <h3 className="text-sm font-black text-text dark:text-white flex items-center gap-1.5">
            <PlusCircle className="w-5 h-5 text-accent" /> {t('post_helper_job_req', 'Post Local Helper Job Requirement')}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase">{t('job_title', 'Job Title')}</label>
              <input
                type="text"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                placeholder="e.g. Need electrician to fix borewell starter"
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase">{t('skill_required', 'Skill Required')}</label>
                <select
                  value={postForm.skillRequired}
                  onChange={(e) => setPostForm({ ...postForm, skillRequired: e.target.value })}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white font-bold"
                >
                  <option value="Electrician">{t('electrician', 'Electrician')}</option>
                  <option value="Plumber">{t('plumber', 'Plumber')}</option>
                  <option value="Farmer">{t('farmer', 'Farmer')}</option>
                  <option value="Construction">{t('construction', 'Construction')}</option>
                  <option value="Carpenter">{t('carpenter', 'Carpenter')}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase">{t('workers_needed', 'Workers Needed')}</label>
                <input
                  type="number"
                  min={1}
                  value={postForm.workersNeeded}
                  onChange={(e) => setPostForm({ ...postForm, workersNeeded: e.target.value })}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase">{t('job_description', 'Job Description')}</label>
              <textarea
                value={postForm.description}
                onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                placeholder="Describe details like timing, equipment needed, and overall work expectations..."
                className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase">{t('location', 'Location')}</label>
                <input
                  type="text"
                  value={postForm.location}
                  onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase">{t('pay_per_day', 'Pay Per Day (₹)')}</label>
                <input
                  type="number"
                  value={postForm.payPerDay}
                  onChange={(e) => setPostForm({ ...postForm, payPerDay: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl text-xs focus:outline-none dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={posting}
            className="w-full h-12 bg-accent hover:bg-opacity-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            {posting && <Loader2 className="w-4 h-4 animate-spin" />} {t('publish_requirement', 'Publish Requirement')}
          </button>
        </form>
      )}

      {activeTab === 'my-posts' && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-text dark:text-white flex items-center gap-1.5">
            <Briefcase className="w-5 h-5 text-accent" /> {t('active_open_job_posts', 'Active Open Community Job Posts')}
          </h3>
          {jobPosts.length === 0 ? (
            <div className="text-center py-10 bg-surface dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700">
              <p className="text-xs text-text-muted font-bold">{t('no_active_job_posts', 'No active job posts online.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {jobPosts.map(job => {
                const applicants = myJobApplications.filter(app => app.jobId === job.id);
                return (
                  <div key={job.id} className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-text dark:text-white">{job.title}</h4>
                        <span className="bg-orange-50 dark:bg-orange-950/20 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                          {job.skillRequired}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{job.description}</p>
                      <div className="flex gap-3 text-[10px] text-text-muted font-bold pt-1.5">
                        <span>📍 {job.location}</span>
                        <span>💰 ₹{job.payPerDay}/day</span>
                        <span>👥 Need: {job.workersNeeded} workers</span>
                      </div>
                      <span className="text-[9px] text-slate-400 block pt-1 font-bold">
                        Posted by: {job.posterName}
                      </span>
                    </div>

                    <div className="flex flex-col justify-center items-end gap-2">
                      <button
                        onClick={() => handleApplyJob(job.id, job.title)}
                        className="h-10 px-6 bg-accent text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer hover:bg-opacity-95 w-full sm:w-auto"
                      >
                        Apply for Job
                      </button>
                      <span className="text-[10px] font-bold text-accent">
                        {applicants.length} Applicants registered
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Worker Profile Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-slate-800 rounded-3xl p-6 border border-border dark:border-slate-700 shadow-xl max-w-md w-full relative animate-fadeIn">
            <button 
              onClick={() => setSelectedWorker(null)}
              className="absolute top-4.5 right-4.5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center text-text-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 800,
              }}>
                {(selectedWorker.name || 'W').charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="text-base font-black text-text dark:text-white">{selectedWorker.name}</h3>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {renderStars(selectedWorker.rating)}
                  <span className="text-[10px] text-text-muted font-bold">({selectedWorker.reviewCount || 0} reviews)</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-text-muted font-bold mt-1">
                  <MapPin className="w-3.5 h-3.5 text-accent" /> {selectedWorker.village || 'Community Area'}
                </div>
              </div>

              <div className="border-t border-b border-border dark:border-slate-700 py-3 w-full space-y-2 text-left">
                <p className="text-xs text-text dark:text-slate-350 leading-relaxed font-semibold">
                  <span className="font-bold text-text-muted uppercase block text-[10px] tracking-wider mb-0.5">Worker Bio</span>
                  "{selectedWorker.bio || 'Professional worker serving community daily operations.'}"
                </p>
                <div className="flex justify-between text-xs font-bold text-text dark:text-white pt-2">
                  <span>💰 Daily Wage Rate:</span>
                  <span className="text-accent">₹{selectedWorker.dailyRate}/day</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-text dark:text-white">
                  <span>📅 Available Status:</span>
                  <span className="text-green-600">Active online</span>
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <a
                  href={`tel:${selectedWorker.phone || '100'}`}
                  className="flex-1 h-12 bg-accent text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:bg-opacity-95"
                >
                  <Phone className="w-4 h-4" /> Call Worker
                </a>
                <a
                  href="mailto:help@vanguard.org"
                  className="w-12 h-12 bg-slate-105 border border-border dark:bg-slate-700 dark:border-slate-650 rounded-xl flex items-center justify-center text-text-muted cursor-pointer hover:bg-slate-200"
                >
                  <Mail className="w-4 h-4 text-accent" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  MapPin, 
  Award, 
  Languages, 
  Bell, 
  Moon, 
  Sun,
  LogOut, 
  ChevronRight,
  TrendingUp,
  Briefcase,
  CheckCircle,
  FileCheck,
  X
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useIssues from '../hooks/useIssues';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import PageHeader from '../components/ui/PageHeader';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dbUser, logout } = useAuth();
  const { issues } = useIssues();
  const { currentLang, changeLanguage, languagesList } = useLanguage();

  // Local settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('vanguard_notifications') === 'true'
  );
  
  const { theme, toggleTheme } = useTheme();

  const [showLangModal, setShowLangModal] = useState(false);

  // Stats calculation
  const [userReportCount, setUserReportCount] = useState(0);
  const [userConfirmCount, setUserConfirmCount] = useState(0);
  const [communityScore, setCommunityScore] = useState(50); // base score

  useEffect(() => {
    if (issues && dbUser) {
      // Find reports created by user
      const reports = issues.filter(issue => issue.reporterId === dbUser.id || issue.reporterName === dbUser.name);
      setUserReportCount(reports.length);

      // Find confirmations (issues where user is in confirmations array)
      const confirmed = issues.filter(issue => issue.confirmations?.includes(dbUser.id));
      setUserConfirmCount(confirmed.length);

      // Community Score = 50 base + 15 per report + 5 per confirmation
      const score = 50 + (reports.length * 15) + (confirmed.length * 5);
      setCommunityScore(score);
    }
  }, [issues, dbUser]);

  // Notification Toggle
  const toggleNotifications = () => {
    const nextVal = !notificationsEnabled;
    setNotificationsEnabled(nextVal);
    localStorage.setItem('vanguard_notifications', String(nextVal));
    if (nextVal) {
      // Request browser notification permission
      Notification.requestPermission();
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your account settings" />
      
      {/* 1. Header Profile details Card */}
      <div className="card p-6 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
        {/* Decorative corner background */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--accent-soft)] rounded-full opacity-40" />
        
        {/* Large Avatar */}
        <div className="relative">
          <img 
            src={dbUser?.profileImageUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} 
            alt="profile" 
            width={64}
            height={64}
            className="w-16 h-16 rounded-2xl object-cover border-4 border-[var(--surface)] shadow-md bg-[var(--surface-2)]"
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-[var(--success)] rounded-full border-2 border-[var(--surface)]" />
        </div>

        {/* Username & Badges */}
        <div>
          <h3 className="text-xl font-black text-[var(--text)] leading-tight">
            {dbUser?.name || 'Citizen'}
          </h3>
          
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <span className="bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {dbUser?.role || 'Citizen'}
            </span>
            <div className="flex items-center justify-center gap-0.5 text-xs text-[var(--text-muted)] font-bold ml-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{dbUser?.village || 'Ramanagara'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Counters Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl text-center space-y-1 shadow-sm">
          <FileCheck className="w-5 h-5 text-[var(--accent)] mx-auto" />
          <span className="block text-2xl font-black text-[var(--text)] leading-none pt-1">
            {userReportCount}
          </span>
          <span className="block text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
            Reports
          </span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl text-center space-y-1 shadow-sm">
          <CheckCircle className="w-5 h-5 text-[var(--success)] mx-auto" />
          <span className="block text-2xl font-black text-[var(--text)] leading-none pt-1">
            {userConfirmCount}
          </span>
          <span className="block text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
            Verified
          </span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl text-center space-y-1 shadow-sm">
          <Award className="w-5 h-5 text-[var(--warning)] mx-auto" />
          <span className="block text-2xl font-black text-[var(--text)] leading-none pt-1">
            {communityScore}
          </span>
          <span className="block text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
            Score
          </span>
        </div>
      </div>

      {/* 3. Settings Control panel list */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm divide-y divide-[var(--border)]">
        
        {/* Toggle Language picker */}
        <button
          onClick={() => setShowLangModal(true)}
          className="w-full flex items-center justify-between p-4.5 hover:bg-[var(--surface-2)] text-left transition cursor-pointer min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent-soft)] text-[var(--accent)] rounded-xl flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-[var(--text)] block">🌐 Language / भाषा</span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium capitalize mt-0.5 block">
                {languagesList.find(l => l.code === currentLang)?.nativeName || 'English'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
        </button>

        {/* Toggle Notifications switch */}
        <div className="flex items-center justify-between p-4.5 min-h-[56px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--surface-3)] text-[var(--warning)] rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-[var(--text)] block">🔔 Push Notifications</span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 block">
                Get real-time community safety alerts.
              </span>
            </div>
          </div>
          <button
            onClick={toggleNotifications}
            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
              notificationsEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
            }`}
          >
            <div 
              className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle Dark Mode manually */}
        <div className="flex items-center justify-between p-4.5 min-h-[56px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent-soft)] text-[var(--accent)] rounded-xl flex items-center justify-center">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-sm font-bold text-[var(--text)] block">Dark Appearance</span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 block">
                Enable low-light readability themes.
              </span>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className="px-4 py-2 bg-[var(--accent)] text-white font-bold text-xs rounded-xl hover:bg-opacity-90 transition cursor-pointer"
          >
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>

        {/* Action Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4.5 hover:bg-[var(--danger)]/10 text-left transition cursor-pointer min-h-[56px] text-[var(--danger)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--danger)]/20 text-[var(--danger)] rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block">🚪 Logout Account</span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 block">
                Sign out of this user session.
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>

      {/* 4. LANGUAGE SELECT MODAL OVERLAY */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-6 max-w-sm w-full relative space-y-4 shadow-2xl">
            <button 
              onClick={() => setShowLangModal(false)}
              className="absolute top-4 right-4 w-9 h-9 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-xl flex items-center justify-center text-[var(--text-muted)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-base font-black text-[var(--text)]">Select Language</h4>
            
            <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
              {languagesList.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { changeLanguage(lang.code); setShowLangModal(false); }}
                  className={`p-3 border rounded-xl text-left transition ${
                    currentLang === lang.code
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
                      : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <span className="text-lg mr-1.5">{lang.flag}</span>
                  <span className="text-xs font-bold">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

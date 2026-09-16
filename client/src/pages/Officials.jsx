import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ShieldAlert, Award, SlidersHorizontal, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import OfficialCard from '../components/ui/OfficialCard';
import PageHeader from '../components/ui/PageHeader';
import Grid from '../components/ui/Grid';

export default function Officials() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial seed list of 10 Indian officials
  const sampleOfficialsList = [
    { id: 'off_1', name: 'Dr. Srinivas Prasad', role: 'Chief Medical Officer', department: 'Health', phone: '+918023456789', email: 'srinivas.p@karnataka.gov.in' },
    { id: 'off_2', name: 'Kiran Gowda', role: 'Ward 6 Assistant Engineer', department: 'Electricity', phone: '+919845012345', email: 'kiran.g@bescom.co.in' },
    { id: 'off_3', name: 'Rajeshwari M.', role: 'Chief Sanitation Inspector', department: 'Municipality', phone: '+918023451122', email: 'rajeshwari.m@ramanagara.gov.in' },
    { id: 'off_4', name: 'Inspector Anil Kumar', role: 'Circle Inspector', department: 'Police', phone: '100', email: 'anil.k@ksp.gov.in' },
    { id: 'off_5', name: 'Manjunatha Swamy', role: 'Sewerage Line Inspector', department: 'Water', phone: '+919900112233', email: 'manju.s@bwssb.gov.in' },
    { id: 'off_6', name: 'Preetha Murthy', role: 'Ward 6 Corporator', department: 'Ward', phone: '+919448055667', email: 'preetha.m@bbmp.gov.in' },
    { id: 'off_7', name: 'Sub-Inspector Sandeep Patil', role: 'Traffic Sub-Inspector', department: 'Police', phone: '+918023451001', email: 'sandeep.p@ksp.gov.in' },
    { id: 'off_8', name: 'Veerabhadraiah S.', role: 'Power Distribution Officer', department: 'Electricity', phone: '+919448011223', email: 'veerabhadraiah@kptcl.com' },
    { id: 'off_9', name: 'Dr. Meena Iyer', role: 'Primary Health Center Officer', department: 'Health', phone: '+919448044556', email: 'meena.iyer@karnataka.gov.in' },
    { id: 'off_10', name: 'Harish Gowda', role: 'Water Revenue Inspector', department: 'Water', phone: '+919945033445', email: 'harish.gowda@bwssb.gov.in' }
  ];

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      if (db.isMock) {
        // Mock officials
        const stored = localStorage.getItem('vanguard_officials_list');
        if (!stored) {
          localStorage.setItem('vanguard_officials_list', JSON.stringify(sampleOfficialsList));
          setOfficials(sampleOfficialsList);
        } else {
          setOfficials(JSON.parse(stored));
        }
        setLoading(false);
      } else {
        // Fetch from Firestore
        const ref = collection(db, 'officials');
        unsubscribe = onSnapshot(ref, (snapshot) => {
          if (snapshot.empty) {
            // Seed sample list if empty in Firestore
            sampleOfficialsList.forEach(async (off) => {
              const docRef = doc(db, 'officials', off.id);
              await setDoc(docRef, off);
            });
            setOfficials(sampleOfficialsList);
          } else {
            const fetched = [];
            snapshot.forEach(docSnap => {
              fetched.push({ id: docSnap.id, ...docSnap.data() });
            });
            setOfficials(fetched);
          }
          setLoading(false);
        });
      }
    } catch (err) {
      console.error(err);
      setOfficials(sampleOfficialsList);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const getFilteredOfficials = () => {
    return officials.filter((off) => {
      const nameMatch = off.name.toLowerCase().includes(searchQuery.toLowerCase());
      const deptMatch = off.department.toLowerCase().includes(searchQuery.toLowerCase());
      const roleMatch = off.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const filterMatch = activeFilter === 'all' || off.department.toLowerCase() === activeFilter.toLowerCase();
      
      return (nameMatch || deptMatch || roleMatch) && filterMatch;
    });
  };

  const filtered = getFilteredOfficials();

  const filterTabs = ['All', 'Ward', 'Police', 'Health', 'Electricity', 'Municipality'];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Local Officials" 
        subtitle="Quick contact directory for municipal officers, emergency wards, and departments" 
      />
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or department..."
          className="w-full min-h-[56px] pl-12 pr-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Filter Tabs scrollbar */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab.toLowerCase())}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-bold border transition cursor-pointer min-h-[38px] ${
              activeFilter === tab.toLowerCase()
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm'
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Officials List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center p-8 space-y-2">
          <ShieldAlert className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-45" />
          <p className="font-bold text-sm text-[var(--text-muted)]">No officials matched search criteria</p>
        </div>
      ) : (
        <Grid desktopCols={2} mobileCols={1} gap={14}>
          {filtered.map((off) => (
            <OfficialCard key={off.id} official={off} />
          ))}
        </Grid>
      )}
    </div>
  );
}

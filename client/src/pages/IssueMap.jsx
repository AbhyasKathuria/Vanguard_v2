import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  useMap 
} from 'react-leaflet';
import { 
  MapPin, 
  Users, 
  ArrowRight, 
  Navigation,
  Building,
  Phone,
  Mail,
  SlidersHorizontal,
  Compass,
  AlertTriangle,
  X
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';
import SeverityBadge from '../components/ui/SeverityBadge';
import PageHeader from '../components/ui/PageHeader';

// Helper component to locate user on load and handle recenter
function MapController({ triggerLocate, setTriggerLocate, userCoords }) {
  const map = useMap();

  useEffect(() => {
    // Initial locate on mount using navigator.geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
        },
        (error) => {
          console.warn("Geolocation failed on mount, centering on user default coords:", error);
          if (userCoords) {
            map.setView(userCoords, 13);
          }
        },
        { timeout: 10000 }
      );
    } else {
      if (userCoords) {
        map.setView(userCoords, 13);
      }
    }
  }, [map]);

  useEffect(() => {
    if (triggerLocate) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13);
          },
          (error) => {
            console.warn("Geolocation click failed:", error);
          }
        );
      }
      setTriggerLocate(false);
    }
  }, [triggerLocate, map]);

  return null;
}

export default function IssueMap() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dbUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('issues'); // 'issues' | 'officials'
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'road' | 'electric' | 'water'
  const [selectedPin, setSelectedPin] = useState(null); // issue or official
  const [showFilters, setShowFilters] = useState(false);
  const [triggerLocate, setTriggerLocate] = useState(false);
  
  // Real-time issues from firestore
  const [issues, setIssues] = useState([]);

  // Default coordinate pairs
  const userCoords = [dbUser?.lat || 12.7244, dbUser?.lng || 77.2911];
  const mapCenter = [20.5937, 78.9629]; // center of India

  // Query issues from firestore on mount
  useEffect(() => {
    const q = query(collection(db, 'issues'), where('status', '==', 'open'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 5 sample officials with realistic Indian names and roles
  const sampleOfficials = [
    { id: 'off_1', name: 'Dr. Srinivas Prasad', role: 'Chief Medical Officer', department: 'Health', lat: userCoords[0] + 0.0015, lng: userCoords[1] + 0.002, phone: '+918023456789', email: 'srinivas.p@karnataka.gov.in' },
    { id: 'off_2', name: 'Kiran Gowda', role: 'Ward 6 Assistant Engineer', department: 'Electricity', lat: userCoords[0] - 0.002, lng: userCoords[1] + 0.001, phone: '+919845012345', email: 'kiran.g@bescom.co.in' },
    { id: 'off_3', name: 'Rajeshwari M.', role: 'Chief Sanitation Inspector', department: 'Municipality', lat: userCoords[0] + 0.0025, lng: userCoords[1] - 0.0015, phone: '+918023451122', email: 'rajeshwari.m@ramanagara.gov.in' },
    { id: 'off_4', name: 'Inspector Anil Kumar', role: 'Circle Inspector', department: 'Police', lat: userCoords[0] - 0.001, lng: userCoords[1] - 0.0025, phone: '100', email: 'anil.k@ksp.gov.in' },
    { id: 'off_5', name: 'Manjunatha Swamy', role: 'Sewerage Line Inspector', department: 'Water', lat: userCoords[0] + 0.0005, lng: userCoords[1] - 0.003, phone: '+919900112233', email: 'manju.s@bwssb.gov.in' }
  ];

  // Filter Issues logic
  const getFilteredIssues = () => {
    return issues.filter((issue) => {
      // 1. Category filters
      if (filter === 'critical' && issue.severity !== 'red') return false;
      if (filter === 'road' && issue.category !== 'broken_road' && issue.category !== 'pothole') return false;
      if (filter === 'electric' && issue.category !== 'electrical_wire' && issue.category !== 'broken_streetlight') return false;
      if (filter === 'water' && issue.category !== 'water_leakage' && issue.category !== 'open_drain' && issue.category !== 'sewage') return false;
      return true;
    });
  };

  const getFilteredOfficials = () => {
    if (filter === 'electric') return sampleOfficials.filter(o => o.department === 'Electricity');
    if (filter === 'water') return sampleOfficials.filter(o => o.department === 'Water');
    if (filter === 'road') return sampleOfficials.filter(o => o.department === 'Municipality');
    return sampleOfficials;
  };

  const filteredIssues = getFilteredIssues();
  const filteredOfficials = getFilteredOfficials();

  // Helper colors mapping for pins
  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'red': return '#DC2626';
      case 'orange': return '#EA580C';
      case 'yellow': return '#EAB308';
      case 'green':
      default: return '#16A34A';
    }
  };

  const filterChips = [
    { id: 'all', label: 'All' },
    { id: 'critical', label: '🔴 Critical' },
    { id: 'road', label: '🟡 Road / Infrastructure' },
    { id: 'electric', label: '⚡ Electricity' },
    { id: 'water', label: '💧 Water & Sewage' }
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Interactive Safety Map" 
        subtitle="View safety hazards, open issues, and local officials in your district" 
      />
      {/* 1. Header controls overlay */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        
        {/* Toggle between Issues/Officials */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl flex gap-1.5 self-start">
          <button
            onClick={() => { setActiveTab('issues'); setSelectedPin(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer ${
              activeTab === 'issues' 
                ? 'bg-accent text-white shadow-sm' 
                : 'text-text-muted hover:text-text dark:text-slate-300'
            }`}
          >
            Reported Issues
          </button>
          <button
            onClick={() => { setActiveTab('officials'); setSelectedPin(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition min-h-[36px] cursor-pointer ${
              activeTab === 'officials' 
                ? 'bg-accent text-white shadow-sm' 
                : 'text-text-muted hover:text-text dark:text-slate-300'
            }`}
          >
            Officials Directory
          </button>
        </div>

        {/* Toggle Filters bar */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="min-h-[44px] px-4 bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 text-text-muted hover:text-text cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter Listings
        </button>
      </div>

      {/* 2. Horizontal Filter chips overlay */}
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
                filter === chip.id
                  ? 'bg-accent border-accent text-white shadow-sm'
                  : 'bg-surface dark:bg-slate-800 border-border dark:border-slate-700 text-text-muted hover:text-text'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* 3. Render Leaflet Map */}
      <div className="h-[calc(100vh-210px)] md:h-[calc(100vh-160px)] w-full rounded-2xl overflow-hidden border border-border dark:border-slate-700 relative shadow-sm z-0">
        <MapContainer
          center={mapCenter}
          zoom={5}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location tracker controller */}
          <MapController 
            triggerLocate={triggerLocate} 
            setTriggerLocate={setTriggerLocate} 
            userCoords={userCoords}
          />

          {/* Blue Dot user location marker */}
          <CircleMarker
            center={userCoords}
            radius={7}
            fillColor="#1B6FD8"
            color="#FFFFFF"
            weight={2}
            fillOpacity={1}
          />

          {/* Render Issues Circle Markers */}
          {activeTab === 'issues' && filteredIssues.map(issue => {
            const lat = Number(issue.lat) || userCoords[0];
            const lng = Number(issue.lng) || userCoords[1];
            const color = getSeverityColor(issue.severity);
            const timeAgoStr = issue.createdAt ? new Date(issue.createdAt.toDate ? issue.createdAt.toDate() : issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
            const shortDesc = issue.description ? (issue.description.substring(0, 60) + (issue.description.length > 60 ? '...' : '')) : 'No description';

            return (
              <CircleMarker
                key={issue.id}
                center={[lat, lng]}
                radius={10}
                fillColor={color}
                color={color}
                weight={2}
                fillOpacity={0.8}
                eventHandlers={{
                  click: () => setSelectedPin(issue)
                }}
              >
                <Popup>
                  <div className="text-slate-850 dark:text-slate-200 p-1 space-y-2 min-w-[200px]">
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
                      <span>⏰ {timeAgoStr}</span>
                      <button
                        onClick={() => navigate(`/issues/${issue.id}`)}
                        className="text-accent font-black hover:underline flex items-center gap-0.5"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Render Officials Circle Markers */}
          {activeTab === 'officials' && filteredOfficials.map(off => {
            const lat = Number(off.lat) || userCoords[0];
            const lng = Number(off.lng) || userCoords[1];

            return (
              <CircleMarker
                key={off.id}
                center={[lat, lng]}
                radius={10}
                fillColor="#1B6FD8"
                color="#FFFFFF"
                weight={2}
                fillOpacity={0.8}
                eventHandlers={{
                  click: () => setSelectedPin(off)
                }}
              >
                <Popup>
                  <div className="text-slate-800 dark:text-slate-200 p-1 space-y-2 min-w-[200px]">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{off.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold">{off.role}</p>
                      <span className="inline-block bg-slate-100 text-slate-800 text-[9px] font-black px-1.5 py-0.5 rounded mt-1 uppercase">
                        {off.department}
                      </span>
                    </div>

                    <div className="flex gap-1.5 pt-1 border-t border-slate-100">
                      <a 
                        href={`tel:${off.phone}`}
                        className="flex-1 py-1 bg-accent text-white text-[9px] font-black rounded text-center flex items-center justify-center gap-1"
                      >
                        <Phone className="w-2.5 h-2.5" /> Call
                      </a>
                      <a 
                        href={`mailto:${off.email}`}
                        className="flex-1 py-1 bg-slate-100 text-slate-800 text-[9px] font-black rounded text-center flex items-center justify-center gap-1 border border-slate-200"
                      >
                        <Mail className="w-2.5 h-2.5" /> Email
                      </a>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Compass location finder floating button */}
        <button
          onClick={() => setTriggerLocate(true)}
          className="absolute bottom-4 right-4 w-12 h-12 bg-surface hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-text dark:text-white rounded-xl shadow-lg flex items-center justify-center border border-border dark:border-slate-700 cursor-pointer z-10"
          title="Recenter Map"
        >
          <Compass className="w-5 h-5 text-accent" />
        </button>
      </div>

      {/* 4. Bottom Info Sheet if marker is selected */}
      {selectedPin && (
        <div className="fixed bottom-[72px] md:bottom-6 left-4 right-4 md:left-[270px] md:right-6 bg-surface dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700 p-4 shadow-xl z-50 flex gap-4 max-w-xl mx-auto">
          <button 
            onClick={() => setSelectedPin(null)}
            className="absolute top-2.5 right-2.5 w-7 h-7 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 rounded-full flex items-center justify-center text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>

          {selectedPin.reporterId !== undefined ? (
            <>
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 border border-border dark:border-slate-600">
                <img 
                  src={selectedPin.photoUrl || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=300&q=80'} 
                  alt="Issue" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between pr-4">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-slate-100 dark:bg-slate-700 text-text dark:text-slate-300 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                      {selectedPin.categoryLabel || selectedPin.category}
                    </span>
                    <SeverityBadge severity={selectedPin.severity} />
                  </div>
                  <h4 className="text-sm font-bold text-text dark:text-white truncate mt-1">
                    {selectedPin.title || selectedPin.description}
                  </h4>
                  <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span>{selectedPin.confirmations?.length || 0} residents confirmed</span>
                  </p>
                </div>
                
                <button
                  onClick={() => navigate(`/issues/${selectedPin.id}`)}
                  className="text-xs text-accent dark:text-blue-400 font-bold flex items-center gap-1 hover:underline mt-2 self-start"
                >
                  View Full Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between pr-4">
                <div>
                  <h4 className="text-sm font-bold text-text dark:text-white truncate">
                    {selectedPin.name}
                  </h4>
                  <p className="text-xs text-text-muted font-semibold mt-0.5">{selectedPin.role}</p>
                  <span className="inline-block bg-slate-100 dark:bg-slate-700 text-text dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 uppercase">
                    {selectedPin.department}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <a 
                    href={`tel:${selectedPin.phone}`}
                    className="h-9 px-3 bg-accent text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-opacity-95"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <a 
                    href={`mailto:${selectedPin.email}`}
                    className="h-9 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-text dark:text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

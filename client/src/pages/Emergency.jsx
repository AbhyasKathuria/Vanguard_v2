import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Flame, 
  Car, 
  Activity, 
  ShieldAlert, 
  Waves, 
  Zap, 
  MapPin, 
  Loader2, 
  Phone,
  ArrowLeft,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import useAuth from '../hooks/useAuth';
import PageHeader from '../components/ui/PageHeader';
import Grid from '../components/ui/Grid';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

const categories = [
  { id: 'Fire', icon: Flame, label: 'Fire', color: 'bg-red-600 hover:bg-red-750' },
  { id: 'Accident', icon: Car, label: 'Accident', color: 'bg-orange-600 hover:bg-orange-750' },
  { id: 'Medical', icon: Activity, label: 'Medical', color: 'bg-emerald-600 hover:bg-emerald-750' },
  { id: 'Crime', icon: ShieldAlert, label: 'Crime', color: 'bg-slate-700 hover:bg-slate-800' },
  { id: 'Flood', icon: Waves, label: 'Flood', color: 'bg-blue-600 hover:bg-blue-750' },
  { id: 'Electric', icon: Zap, label: 'Electric', color: 'bg-amber-600 hover:bg-amber-750' }
];

export default function Emergency() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dbUser, user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [coords, setCoords] = useState([20.5937, 78.9629]);
  const [address, setAddress] = useState('Detecting current coordinates...');
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [sending, setSending] = useState(false);

  const [activeEmergencies, setActiveEmergencies] = useState([]);

  // Geolocation trigger on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then(r => r.json())
            .then(data => {
              setAddress(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            });
        },
        (error) => {
          console.warn("Unable to fetch GPS position.");
          const defaults = [dbUser?.lat || 12.7244, dbUser?.lng || 77.2911];
          setCoords(defaults);
          setAddress(dbUser?.village || "Community Area");
        }
      );
    }
  }, [dbUser]);

  // Real-time active emergencies list
  useEffect(() => {
    if (!dbUser) return;
    const q = query(
      collection(db, 'emergencies'),
      where('district', '==', dbUser.district || 'Bangalore'),
      where('isResolved', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort manually in client in case created index is missing
      items.sort((a, b) => {
        const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return tB - tA;
      });
      setActiveEmergencies(items);
    }, (err) => {
      console.warn("Emergencies query listener failed, using fallback query.");
      const simpleQ = query(collection(db, 'emergencies'), where('isResolved', '==', false));
      onSnapshot(simpleQ, (snap) => {
        setActiveEmergencies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    });
    return () => unsubscribe();
  }, [dbUser]);

  // Trigger Send alert
  const handleSendAlert = async () => {
    setSending(true);
    try {
      await addDoc(collection(db, 'emergencies'), {
        reporterId: user?.uid || 'anonymous',
        reporterName: dbUser?.name || 'Citizen User',
        category: selectedCategory.id,
        description: description,
        lat: coords[0],
        lng: coords[1],
        ward: dbUser?.ward || 'N/A',
        village: dbUser?.village || 'N/A',
        district: dbUser?.district || 'N/A',
        isResolved: false,
        createdAt: serverTimestamp()
      });

      // Post notification/message to community Emergency Chat too
      const communityId = `${dbUser?.district || 'bangalore'}_${dbUser?.village || 'ward6'}`.toLowerCase().replace(/\s+/g, '');
      await addDoc(collection(db, 'communities', communityId, 'messages'), {
        senderId: 'system_alert',
        senderName: 'BROADCAST ALERT',
        senderRole: 'Emergency Broadcast',
        text: `EMERGENCY ALERT PLACED: "${selectedCategory.id}". Action description: "${description || 'Help needed immediately!'}" at location: "${address}"`,
        type: 'text',
        channel: 'Emergency',
        timestamp: serverTimestamp()
      });

      setAlertSent(true);
      setShowConfirm(false);
      toast.success("🚨 Alert broadcasted to all local residents & officials!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to broadcast alert. Please retry.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader 
        title={t('emergency_title')} 
        subtitle={t('emergency_subtitle')} 
        action={
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 flex items-center justify-center text-text cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
          </button>
        }
      />
      <div className="space-y-6">

      {!alertSent ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Category Select grid */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('choose_emergency_category', 'Choose Emergency Category')}</span>
            <Grid desktopCols={3} mobileCols={2} gap={12}>
              {categories.map(cat => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`min-h-[88px] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition select-none ${
                      isSelected 
                        ? 'bg-red-600 border-2 border-white text-white' 
                        : `${cat.color} text-white`
                    }`}
                  >
                    <cat.icon className="w-8 h-8" />
                    <span className="text-xs font-black">{t(cat.id.toLowerCase())}</span>
                  </button>
                );
              })}
            </Grid>
          </div>

          {selectedCategory && (
            <div className="space-y-4 animate-slideUp bg-white/5 p-5 rounded-2xl border border-white/10">
              
              {/* Optional brief details */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t('brief_description', 'Brief Description (Optional)')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('describe_emergency_details', 'Describe emergency details (e.g. Fire in secondary electrical meter, water flash flooding blocking the bypass street...)')}
                  className="w-full h-20 p-3 bg-black/40 border border-white/10 focus:border-red-650 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Live Location coordinates check */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('alert_dispatch_address', 'Alert Dispatch Address')}</span>
                <p className="text-xs text-slate-200 font-semibold">{address}</p>
                <div className="h-[140px] w-full rounded-xl overflow-hidden border border-white/10 relative z-0">
                  <MapContainer
                    center={coords}
                    zoom={13}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker
                      center={coords}
                      radius={8}
                      fillColor="#DC2626"
                      color="#FFFFFF"
                      weight={2}
                      fillOpacity={0.8}
                    />
                  </MapContainer>
                </div>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98 transition uppercase tracking-widest mt-4"
              >
                {t('send_alert')}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Success alert animation */
        <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center animate-fadeIn">
          <div className="relative flex items-center justify-center">
            {/* expanding ripple animation circles */}
            <div className="absolute w-24 h-24 bg-red-600 rounded-full animate-ping opacity-25" />
            <div className="absolute w-16 h-16 bg-red-600 rounded-full animate-ping opacity-45" />
            <CheckCircle className="w-16 h-16 text-green-500 relative z-10" />
          </div>
          <div>
            <h2 className="text-xl font-black text-green-400">{t('alert_sent')}</h2>
            <p className="text-xs text-slate-350 mt-1 max-w-sm font-semibold mx-auto">
              {t('alert_broadcast_success', 'Broadcast successfully delivered to local residents and rescue channels. Dispatch crews are being geolocated.')}
            </p>
          </div>
          <button
            onClick={() => { setAlertSent(false); setSelectedCategory(null); setDescription(''); }}
            className="px-6 h-11 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            {t('report_another_alert', 'Report Another Alert')}
          </button>
        </div>
      )}

      {/* Active Emergencies Listing */}
      <div className="space-y-3 border-t border-white/10 pt-5">
        <h3 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
          {t('active_emergencies')}
        </h3>
        
        {activeEmergencies.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold">{t('no_active_emergencies', 'No active emergencies reported nearby.')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeEmergencies.map(emerg => {
              const timeAgo = emerg.createdAt?.toDate ? new Date(emerg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
              return (
                <div key={emerg.id} className="p-4 bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl flex items-center justify-between gap-4 animate-fadeIn">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-red-500 uppercase">{t(emerg.category.toLowerCase())} Alert</span>
                      <span className="text-[9px] text-text-muted font-bold">Time: {timeAgo}</span>
                    </div>
                    <p className="text-xs text-text leading-relaxed font-semibold">
                      {emerg.description || `${emerg.category} emergency reported near ${emerg.village || 'this area'} — see map for exact location.`}
                    </p>
                    <span className="text-[10px] text-text-muted block font-bold">
                      Reported by: {emerg.reporterName}
                    </span>
                  </div>
                  <a 
                    href="tel:108"
                    className="w-10 h-10 bg-red-600 hover:bg-red-750 text-white rounded-lg flex items-center justify-center cursor-pointer shadow-md"
                    title="Call medical rescue"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
            <h4 className="text-base font-black text-text dark:text-white uppercase">{t('confirm_alert_title', 'Confirm Emergency Alert')}</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              {t('confirm_alert')}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-12 bg-surface-2 hover:bg-surface-3 border border-border text-text text-xs font-bold rounded-xl cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSendAlert}
                disabled={sending}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {sending && <Loader2 className="w-4 h-4 animate-spin" />} {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

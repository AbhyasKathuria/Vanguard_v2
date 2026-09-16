import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Mic, 
  MapPin, 
  Loader2, 
  ArrowLeft, 
  Check, 
  Download, 
  Share2, 
  AlertTriangle,
  Phone,
  Mail,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadImage, fileToBase64 } from '../lib/imageUpload';
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { analyzeIssueImage } from '../lib/gemini';
import { generateIssuePDF } from '../lib/pdfGenerator';
import PageHeader from '../components/ui/PageHeader';
import { FONT, SPACE } from '../styles/tokens';

function getScoreColor(score) {
  if (score >= 81) return '#DC2626' // red
  if (score >= 61) return '#EA580C' // orange  
  if (score >= 31) return '#D97706' // yellow
  return '#16A34A' // green
}

function ClickMapEvents({ setCoords, setAddress }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoords({ lat, lng });
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(r => r.json())
        .then(data => {
          setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        })
        .catch(err => {
          console.error("Geocoding failed:", err);
          setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        });
    }
  });
  return null;
}

export default function ReportIssue() {
  console.log('Gemini key loaded:', !!import.meta.env.VITE_GEMINI_API_KEY);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dbUser, user } = useAuth();

  const [step, setStep] = useState(1);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [coords, setCoords] = useState([20.5937, 78.9629]);
  const [address, setAddress] = useState('Detecting location...');
  
  // Loading & AI Result States
  const [aiLoading, setAiLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [aiResult, setAiResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const recognitionRef = useRef(null);
  const loadingTexts = [
    "Analyzing image...",
    "Detecting hazard...",
    "Calculating risk...",
    "Determining authority..."
  ];

  // Geolocation detection on mount or manual trigger
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then(r => r.json())
            .then(data => {
              setAddress(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            })
            .catch(err => {
              setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            });
        },
        (error) => {
          console.warn("Unable to fetch GPS position, using default user coordinates.");
          const defaultCoords = [dbUser?.lat || 12.7244, dbUser?.lng || 77.2911];
          setCoords(defaultCoords);
          setAddress(dbUser?.village || "Community Area");
        }
      );
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Web Speech API configuration
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      const getSpeechLang = (lang) => {
        const mapping = {
          en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN',
          ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN'
        };
        return mapping[lang] || 'en-IN';
      };

      rec.lang = getSpeechLang(localStorage.getItem('vanguard_language') || 'en');

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscription(text);
        setDescription(prev => prev ? `${prev}. ${text}` : text);
        setIsListening(false);
      };

      rec.onerror = (err) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Interval timer for rotating AI loading texts
  useEffect(() => {
    let interval;
    if (aiLoading) {
      interval = setInterval(() => {
        setLoadingTextIndex(prev => (prev + 1) % loadingTexts.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [aiLoading]);

  // Convert uploaded image to base64
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      const base64 = await fileToBase64(file);
      setPhotoBase64(base64);
    }
  };

  // Mic Listening Actions
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Triggers Gemini Image analysis
  const runAIAnalysis = async () => {
    if (!photoBase64) {
      toast.error("Please upload or take a photo first.");
      return;
    }
    setAiLoading(true);
    try {
      const base64Clean = photoBase64.split(',')[1] || photoBase64;
      const result = await analyzeIssueImage(
        base64Clean,
        description,
        localStorage.getItem('vanguard_language') || 'en'
      );
      setAiResult(result);
      setStep(4);
    } catch (e) {
      console.error(e);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Save issue data to Firebase
  const handleSaveIssue = async (shareWithCommunity = false) => {
    if (isSaving) return;
    setIsSaving(true);
    const saveToast = toast.loading("Submitting report to VANGUARD civic logs...");
    try {
      let downloadUrl = '';
      if (photoFile) {
        const base64 = await fileToBase64(photoFile);
        downloadUrl = `data:image/jpeg;base64,${base64}`;
      }

      const issuePayload = {
        reporterId: user?.uid || 'anonymous',
        reporterName: dbUser?.name || 'Citizen User',
        title: aiResult?.categoryLabel || 'Civic Issue',
        description: description || aiResult?.reportText || 'Community reported issue',
        photoUrl: downloadUrl,
        lat: coords[0],
        lng: coords[1],
        ward: dbUser?.ward || 'N/A',
        village: dbUser?.village || 'N/A',
        district: dbUser?.district || 'N/A',
        state: dbUser?.state || 'N/A',
        category: aiResult?.category || 'other',
        categoryLabel: aiResult?.categoryLabel || 'Issue',
        severity: aiResult?.severity || 'yellow',
        severityLabel: aiResult?.severityLabel || 'Needs Attention',
        riskSummary: aiResult?.riskPrediction || 'Civic safety hazard',
        impactScore: aiResult?.impactScore || 50,
        recommendedAuthority: aiResult?.recommendedAuthority || 'Local Ward Office',
        escalationLevel: aiResult?.escalationLevel || 'ward',
        status: 'open',
        aiReportText: aiResult?.reportText || '',
        confirmations: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'issues'), issuePayload);

      // If requested, post issue details to community emergency chat
      if (shareWithCommunity) {
        const communityId = `${dbUser?.district || 'bangalore'}_${dbUser?.village || 'ward6'}`.toLowerCase().replace(/\s+/g, '');
        await addDoc(collection(db, 'communities', communityId, 'messages'), {
          senderId: 'system_ai',
          senderName: '🛡 VANGUARD AI',
          senderRole: 'AI',
          text: `🚨 EMERGENCY HAZARD REPORTED: ${aiResult?.categoryLabel || aiResult?.category} has been logged in our area. Severity: ${aiResult?.severityLabel || aiResult?.severity.toUpperCase()}. Prediction: ${aiResult?.riskPrediction}`,
          mediaUrl: downloadUrl,
          type: 'image',
          channel: 'Emergency',
          timestamp: serverTimestamp()
        });
        toast.success("Alert shared with community channel!");
      }

      toast.dismiss(saveToast);
      toast.success("Issue reported successfully!");
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (e) {
      console.error(e);
      toast.dismiss(saveToast);
      toast.error("Failed to submit issue. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitIssue = async () => {
    if (!aiResult) {
      toast.error('Please analyze the image first')
      return
    }
    const currentUser = user;
    const issueLocation = coords ? { lat: coords[0], lng: coords[1] } : null;
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'issues'), {
        reporterId: currentUser?.uid || 'guest',
        reporterName: dbUser?.name || 'Citizen',
        category: aiResult.category || 'other',
        categoryLabel: aiResult.categoryLabel || 'Community Issue',
        severity: aiResult.severity || 'yellow',
        severityLabel: aiResult.severityLabel || 'Needs Attention',
        impactScore: Number(aiResult.impactScore) || 0,
        riskPrediction: aiResult.riskPrediction || '',
        recommendedAuthority: aiResult.recommendedAuthority || '',
        escalationLevel: aiResult.escalationLevel || 'ward',
        reportText: aiResult.reportText || '',
        isEmergency: Boolean(aiResult.isEmergency),
        description: description || '',
        lat: issueLocation?.lat || dbUser?.lat || null,
        lng: issueLocation?.lng || dbUser?.lng || null,
        village: dbUser?.village || '',
        ward: dbUser?.ward || '',
        district: dbUser?.district || '',
        status: 'open',
        confirmations: [],
        createdAt: new Date().toISOString(),
      })
      toast.success('Issue submitted!')
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      console.error('Submit failed:', err)
      toast.error('Failed to submit: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Generate and save local report PDF
  const downloadReportPDF = () => {
    if (!aiResult) return;
    const doc = generateIssuePDF({ address, ward: dbUser?.ward, village: dbUser?.village }, aiResult);
    doc.save(`vanguard_report_${Date.now()}.pdf`);
    toast.success("PDF Downloaded successfully!");
  };

  // Step header wizard indicator
  const renderProgress = () => {
    const stepsList = [
      { id: 1, label: t('photo', 'Photo') },
      { id: 2, label: t('details', 'Details') },
      { id: 3, label: t('location', 'Location') },
      { id: 4, label: t('ai_report', 'AI Report') }
    ];
    return (
      <div className="flex items-center justify-between border-b pb-4 border-[var(--border)]">
        {stepsList.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step >= s.id 
                  ? 'bg-accent text-white shadow-sm' 
                  : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
              }`}>
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </span>
              <span className={`text-xs font-bold hidden sm:inline ${
                step === s.id ? 'text-[var(--text)]' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
            {idx < stepsList.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition ${
                step > s.id ? 'bg-accent' : 'bg-[var(--border)]'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Loading Screen Overlay
  if (aiLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900 bg-opacity-95 z-[9999] flex flex-col items-center justify-center p-6 text-white select-none">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-24 h-24 text-accent animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full animate-spin" />
        </div>
        <h3 className="text-xl font-bold mt-6 tracking-wide transition-all duration-300">
          {loadingTexts[loadingTextIndex]}
        </h3>
        <p className="text-xs text-slate-400 mt-2">VANGUARD Civic Assistant Engine</p>
      </div>
    );
  }

  const photoPreviewUrl = previewUrl;
  const setPhoto = (val) => {
    if (val === null) {
      setPhotoFile(null);
      setPreviewUrl(null);
      setPhotoBase64(null);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/');
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!photoFile) {
        toast.error("Please upload or take a photo first.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      runAIAnalysis();
    }
  };

  const renderCurrentStep = () => {
    const cardStyle = {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 24,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      flex: 1,
    };

    switch (step) {
      case 1:
        return (
          <div style={cardStyle}>
            <div className="space-y-6" style={{ flex: 1 }}>
              <h2 className="text-lg font-black text-[var(--text)] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[var(--accent)]" /> {t('step_1_upload', 'Step 1: Upload Civic Hazard Photo')}
              </h2>

              {!previewUrl ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] rounded-2xl h-[180px] cursor-pointer transition p-4 text-center">
                  <Camera className="w-10 h-10 text-slate-400 mb-2" />
                  <span className="text-sm font-bold text-[var(--text)]">{t('take_photo_upload', 'Take Photo or Upload from Gallery')}</span>
                  <span className="text-[10px] text-[var(--text-muted)] mt-1">{t('accepts_images', 'Accepts images (JPEG, PNG) up to 5MB')}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>
              ) : (
                <div style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: 'var(--surface-3)',
                  position: 'relative',
                }}>
                  <img
                    src={photoPreviewUrl}
                    alt="Uploaded photo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <button
                    onClick={() => setPhoto(null)}
                    style={{
                      position: 'absolute',
                      top: 10, right: 10,
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Change Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div style={cardStyle}>
            <div className="space-y-6" style={{ flex: 1 }}>
              <h2 className="text-lg font-black text-[var(--text)] flex items-center gap-2">
                <Mic className="w-5 h-5 text-[var(--accent)]" /> {t('step_2_describe', 'Step 2: Describe the Hazard')}
              </h2>

              <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--text-muted)]">{t('describe_using_voice', 'Describe using text or record voice note:')}</label>
                <div className="relative">
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('textarea_placeholder', 'Describe the issue (e.g. Broken road with dangerous potholes near public park, water pipe leakage creating a massive sinkhole...)')}
                    className="w-full h-32 p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text)]"
                    maxLength={300}
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] font-bold text-[var(--text-muted)]">
                    {description.length}/300
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
                  <button
                    onClick={toggleListening}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition cursor-pointer ${
                      isListening 
                        ? 'bg-red-600 text-white animate-pulse' 
                        : 'bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
                    }`}
                    title="Tap to speak"
                  >
                    <Mic className="w-6 h-6" />
                  </button>
                  <span className="text-xs font-bold mt-2 text-[var(--text)]">
                    {isListening ? t('listening_speak', "Listening... Speak now") : t('tap_to_speak', "Tap to Speak (Voice Input)")}
                  </span>
                  {transcription && (
                    <p className="text-xs text-[var(--accent)] font-bold mt-2 text-center italic">
                      {t('transcribed', 'Transcribed')}: "{transcription}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div style={cardStyle}>
            <div className="space-y-6" style={{ flex: 1 }}>
              <h2 className="text-lg font-black text-[var(--text)] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--accent)]" /> {t('step_3_confirm', 'Step 3: Confirm GPS Location')}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-[var(--accent)] uppercase block">{t('gps_detected', 'GPS Detected Address')}</span>
                    <p className="text-xs font-bold text-[var(--text)] truncate">{address}</p>
                  </div>
                  <button 
                    onClick={detectLocation}
                    className="w-9 h-9 flex items-center justify-center bg-[var(--surface)] rounded-lg border border-[var(--border)] text-[var(--accent)] cursor-pointer hover:bg-[var(--surface-2)]"
                    title="Refresh location"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-[200px] w-full rounded-xl overflow-hidden border border-[var(--border)] relative z-0">
                  <MapContainer
                    center={coords}
                    zoom={13}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickMapEvents setCoords={setCoords} setAddress={setAddress} />
                    <CircleMarker
                      center={coords}
                      radius={10}
                      fillColor="#1B6FD8"
                      color="#FFFFFF"
                      weight={2}
                      fillOpacity={0.8}
                    />
                  </MapContainer>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-bold text-center">
                  {t('map_drag_instruction', 'Drag or tap anywhere on the map above to manually correct the pin position.')}
                </p>
              </div>
            </div>
          </div>
        );
      case 4:
        if (!aiResult) return null;
        return (
          <div style={cardStyle}>
            <div style={{ flex: 1 }} className="space-y-6">
              {/* Severity Colored banner */}
              <div style={{
                height: 52,
                borderRadius: 14,
                background: aiResult.severity === 'red' ? '#DC2626' :
                            aiResult.severity === 'orange' ? '#EA580C' :
                            aiResult.severity === 'yellow' ? '#D97706' : '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingInline: 20,
                color: '#fff',
                marginBottom: 20,
              }}>
                <span style={{ fontSize: FONT.lg, fontWeight: 800 }} className="uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-5 h-5" /> {aiResult.severityLabel || 'Hazard Status'}
                </span>
                <span style={{ fontSize: FONT.xs, fontWeight: 800 }} className="uppercase bg-white bg-opacity-20 px-2.5 py-1 rounded">
                  {t('escalated_to', 'Escalated to')}: {aiResult.escalationLevel}
                </span>
              </div>

              <div style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 32,
              }} className="space-y-6">
                
                {/* Category info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: 20,
                  marginBottom: 24,
                }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                      {t('civic_category', 'Civic Category')}
                    </span>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
                      {aiResult.categoryLabel || aiResult.category?.replace('_', ' ')}
                    </h3>
                  </div>
                  <div style={{
                    flexShrink: 0,
                    width: 64, height: 64,
                    borderRadius: '50%',
                    border: `4px solid ${getScoreColor(aiResult.impactScore)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 800,
                    color: getScoreColor(aiResult.impactScore),
                  }}>
                    {aiResult.impactScore}
                  </div>
                </div>

                {/* Severity choose explanation reason */}
                <div style={{ marginBottom: 24 }} className="space-y-1.5">
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                    {t('analysis_reason', 'Analysis Reason')}
                  </span>
                  <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', lineHeight: '1.7' }}>
                    {aiResult.severityReason}
                  </p>
                </div>

                {/* Risk Prediction summary */}
                <div style={{ marginBottom: 24 }} className="p-4 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                      {t('predicted_risk', 'predicted community risk')}
                    </span>
                    <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--danger)', marginTop: 2, lineHeight: '1.6' }}>
                      {aiResult.riskPrediction}
                    </p>
                  </div>
                </div>

                {/* Recommended Authority */}
                <div style={{ marginBottom: 24 }} className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                      {t('dispatch_agency', 'recommended dispatch agency')}
                    </span>
                    <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
                      {aiResult.recommendedAuthority}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href="tel:100"
                      className="w-12 h-12 bg-[var(--accent-soft)] text-[var(--accent)] rounded-xl flex items-center justify-center cursor-pointer"
                      title="Call helpline"
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                    <a 
                      href="mailto:civic@vanguard.in"
                      className="w-12 h-12 bg-[var(--surface-3)] text-[var(--text-muted)] rounded-xl flex items-center justify-center border border-[var(--border)] cursor-pointer"
                      title="Send official report"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* Official complaint paragraph */}
                <div style={{ marginBottom: 24 }} className="space-y-1.5">
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                    {t('complaint_text', 'Generated Complaint Text')}
                  </span>
                  <blockquote style={{ borderLeft: '4px solid var(--accent)', paddingLeft: 16, paddingBlock: 4, fontStyle: 'italic', fontSize: 17, color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    "{aiResult.reportText}"
                  </blockquote>
                </div>

                {/* Action buttons grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={downloadReportPDF}
                    className="h-12 bg-[var(--surface)] border border-[var(--accent)] text-[var(--accent)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-[var(--surface-2)] cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> {t('download_pdf_report', 'Download PDF Report')}
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={() => handleSaveIssue(true)}
                    className="h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Share2 className="w-4 h-4" /> {t('share_with_community', 'Share with Community')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 180px)',
      gap: 24,
    }}>
      <PageHeader 
        title="Report Civic Issue" 
        subtitle="Log safety hazards, road blockages, medical concerns, or public safety issues" 
      />
      {/* progress card */}
      <div className="bg-[var(--surface)] p-4 rounded-2xl shadow-sm border border-[var(--border)]">
        {renderProgress()}
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
        {/* step content */}
        <div style={{ flex: 1, paddingTop: 16, display: 'flex', flexDirection: 'column' }}>
          {renderCurrentStep()}
        </div>
        {/* nav buttons at bottom */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          marginTop: 16,
        }}>
          <button
            onClick={handleBack}
            style={{
              padding: '12px 24px',
              background: 'var(--surface-2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel / Back
          </button>
          {step === 4 ? (
            <button
              onClick={handleSubmitIssue}
              disabled={submitting || !aiResult}
              style={{
                padding: '13px 28px',
                background: 'var(--accent)',
                color: '#fff', border: 'none',
                borderRadius: 10, fontSize: 15,
                fontWeight: 700, cursor: 'pointer',
                opacity: (submitting || !aiResult) ? 0.55 : 1,
                fontFamily: 'inherit',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Issue Log'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={step === 1 && !photoFile}
              style={{
                padding: '12px 24px',
                background: (step === 1 && !photoFile) ? 'var(--surface-3)' : 'var(--accent)',
                color: (step === 1 && !photoFile) ? 'var(--text-muted)' : '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: (step === 1 && !photoFile) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {step === 3 ? 'Analyze with AI' : 'Next Step'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

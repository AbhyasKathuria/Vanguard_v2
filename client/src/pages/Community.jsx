import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Paperclip, 
  Send, 
  Mic, 
  Volume2, 
  PhoneOff, 
  Users, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Loader2,
  Radio,
  FileUp,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { uploadImage } from '../lib/imageUpload';
import toast from 'react-hot-toast';
import LiveBroadcast from '../components/community/LiveBroadcast';
import PageHeader from '../components/ui/PageHeader';
import MessageBubble from '../components/community/MessageBubble';

export default function Community() {
  const { t } = useTranslation();
  const { currentUser, dbUser, userProfile } = useAuth();
  
  const [activeChannel, setActiveChannel] = useState('General');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showVoiceRoom, setShowVoiceRoom] = useState(false);
  const [pttSpeaking, setPttSpeaking] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  
  // Voice recording state
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Theme object for clean Dark/Light mode compliance
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

  // Compute community id from user district & village
  const communityId = `${dbUser?.district || 'bangalore'}_${dbUser?.village || 'ward6'}`.toLowerCase().replace(/\s+/g, '');

  // Real-time messages listener
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'communities', communityId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (err) => {
      console.error("Firestore listener failed:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [communityId]);

  // Complete cleanup function - ALWAYS call this
  const cleanupRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    chunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const startRecording = async () => {
    // Clean up any previous recording
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
      setRecordedBlob(null);
    }
    cleanupRecording();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        },
        video: false
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Pick best supported format
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ].find(t => MediaRecorder.isTypeSupported(t)) || '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedBlob(blob);
          setRecordedUrl(url);
        }
        // Stop all tracks after recording stops
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      };

      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        cleanupRecording();
      };

      recorder.start(250);
      setIsRecording(true);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => {
          if (t >= 60) { stopRecording(); return 0; }
          return t + 1;
        });
      }, 1000);

    } catch (err) {
      cleanupRecording();
      if (err.name === 'NotAllowedError') {
        alert('Microphone permission denied. Please allow mic access in browser settings.');
      } else if (err.name === 'NotFoundError') {
        alert('No microphone found on this device.');
      } else {
        alert('Could not start recording: ' + err.message);
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
    // Stream tracks stopped in recorder.onstop
  };

  const cancelRecording = () => {
    cleanupRecording();
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
  };

  const sendVoiceMessage = async () => {
    if (!recordedBlob) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Audio = reader.result;
      try {
        await addDoc(collection(db, 'communities', communityId, 'messages'), {
          senderId: currentUser?.uid || 'guest',
          senderName: dbUser?.name || userProfile?.name || 'User',
          senderRole: dbUser?.role || userProfile?.role || 'citizen',
          audioData: base64Audio,
          type: 'audio',
          duration: recordingTime,
          channel: activeChannel,
          timestamp: serverTimestamp()
        });
        // Clear after send
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        setRecordedBlob(null);
        setRecordedUrl(null);
      } catch (err) {
        console.error('Failed to send voice message:', err);
      }
    };
    reader.readAsDataURL(recordedBlob);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageToSend = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'communities', communityId, 'messages'), {
        senderId: currentUser?.uid || 'anonymous',
        senderName: dbUser?.name || 'Citizen',
        senderRole: dbUser?.role || 'Citizen',
        text: messageToSend,
        type: 'text',
        channel: activeChannel,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Message send failed:", err);
      toast.error("Failed to send message.");
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowAttachments(false);
    setUploadingFile(true);
    const uploadToast = toast.loading(`Uploading ${type}...`);

    try {
      const downloadUrl = await uploadImage(file);
      await addDoc(collection(db, 'communities', communityId, 'messages'), {
        senderId: currentUser?.uid || 'anonymous',
        senderName: dbUser?.name || 'Citizen',
        senderRole: dbUser?.role || 'Citizen',
        text: type === 'image' ? 'Sent an image' : file.name,
        mediaUrl: downloadUrl,
        type: type,
        channel: activeChannel,
        timestamp: serverTimestamp()
      });
      toast.dismiss(uploadToast);
      toast.success(`${type} sent!`);
    } catch (err) {
      console.error(err);
      toast.dismiss(uploadToast);
      toast.error(`Failed to upload ${type}.`);
    } finally {
      setUploadingFile(false);
    }
  };

  const channelsList = [
    { id: 'General', label: t('general') },
    { id: 'Emergency', label: t('emergency_ch') },
    { id: 'Workers', label: t('workers_ch') },
    { id: 'Announcements', label: t('announcements') },
    { id: 'Agriculture', label: t('agriculture') }
  ];

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'official': return <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Official</span>;
      case 'volunteer': return <span className="bg-green-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Volunteer</span>;
      case 'worker': return <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Worker</span>;
      default: return null;
    }
  };

  const filteredMessages = messages.filter(m => m.channel === activeChannel);

  return (
    <>
      <PageHeader 
        title={`${dbUser?.village || 'Our Village'} Community`} 
        subtitle={`${dbUser?.district || 'District'} District Community Hub · ${activeChannel}`} 
        action={
          <button onClick={() => setShowBroadcast(true)} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'6px 14px', background:'#DC2626',
            color:'white', border:'none', borderRadius:8,
            fontSize:13, fontWeight:600, cursor:'pointer'
          }}>
            <Radio size={16} /> {t('live_broadcast', 'Live Broadcast')}
          </button>
        }
      />
      <div 
        className="flex flex-col h-[calc(100vh-230px)] rounded-2xl border overflow-hidden shadow-sm"
        style={{ background: theme.bg, borderColor: theme.border }}
      >

      {showBroadcast && (
        <LiveBroadcast
          communityId={communityId}
          onClose={() => setShowBroadcast(false)}
        />
      )}

      {/* Horizontal Scrollable Channel Tabs */}
      <div 
        className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none z-10"
        style={{ background: theme.surface, borderBottom: '1px solid ' + theme.border }}
      >
        {channelsList.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveChannel(tab.id)}
            style={{
              background: activeChannel === tab.id ? theme.accent : theme.surface2,
              color: activeChannel === tab.id ? '#fff' : theme.text,
              border: '1px solid ' + theme.border
            }}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-black transition cursor-pointer"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Panel */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{ overflowX: 'hidden', width: '100%', boxSizing: 'border-box' }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-xs mt-2 font-bold">Synchronizing community logs...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center" style={{ color: theme.muted }}>
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-xs font-bold mt-2" style={{ color: theme.text }}>No discussions here yet</p>
            <p className="text-[10px] mt-1">Be the first to start the conversation in #{activeChannel}!</p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflowX: 'hidden',
            width: '100%',
          }}>
            {filteredMessages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isOwn={msg.senderId === currentUser?.uid}
              />
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Attachment panel overlay */}
      {showAttachments && (
        <div 
          className="p-4 grid grid-cols-2 gap-3 animate-slideUp"
          style={{ background: theme.surface, borderTop: '1px solid ' + theme.border }}
        >
          <label className="flex items-center justify-center gap-2 hover:bg-slate-150 dark:hover:bg-slate-750 p-3 rounded-xl border text-xs font-bold cursor-pointer" style={{ background: theme.surface2, borderColor: theme.border, color: theme.text }}>
            <ImageIcon className="w-4 h-4 text-accent" /> Share Photo
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, 'image')}
              className="hidden"
            />
          </label>
          <label className="flex items-center justify-center gap-2 hover:bg-slate-150 dark:hover:bg-slate-750 p-3 rounded-xl border text-xs font-bold cursor-pointer" style={{ background: theme.surface2, borderColor: theme.border, color: theme.text }}>
            <FileUp className="w-4 h-4 text-orange-500" /> Share PDF File
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => handleFileUpload(e, 'pdf')}
              className="hidden"
            />
          </label>
        </div>
      )}



      {/* Bottom Message Input Bar */}
      <div 
        className="p-4 flex items-center gap-3"
        style={{ background: theme.surface, borderTop: '1px solid ' + theme.border }}
      >
        <button
          type="button"
          onClick={() => setShowAttachments(!showAttachments)}
          style={{ background: theme.surface2, borderColor: theme.border }}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-text-muted hover:text-text cursor-pointer border"
          title="Attach files"
        >
          <Paperclip className="w-5 h-5 text-accent" />
        </button>

        {!isRecording && !recordedUrl ? (
          <>
            <button
              onClick={startRecording}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--accent)', border: 'none',
                color: 'white', cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Mic size={18} />
            </button>
            <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message #${activeChannel}...`}
                style={{ background: theme.surface2, borderColor: theme.border, color: theme.text }}
                className="flex-1 h-11 px-4 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-11 h-11 bg-accent disabled:opacity-40 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : isRecording ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            flex: 1, padding: '8px 16px',
            background: 'var(--surface-2)', borderRadius: 12
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#DC2626',
              animation: 'pulse 1s infinite'
            }} />
            <span style={{color: 'var(--text)', fontSize: 14}}>
              Recording... {recordingTime}s
            </span>
            <button onClick={stopRecording} style={{
              marginLeft: 'auto', padding: '6px 16px',
              background: '#DC2626', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600
            }}>
              Stop
            </button>
            <button onClick={cancelRecording} style={{
              padding: '6px 12px', background: 'var(--surface)',
              color: 'var(--text-muted)', border: '1px solid var(--border)',
              borderRadius: 8, cursor: 'pointer', fontSize: 13
            }}>
              Cancel
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            flex: 1, padding: '8px 12px',
            background: 'var(--surface-2)', borderRadius: 12
          }}>
            <audio controls src={recordedUrl}
                   style={{height: 32, flex: 1, minWidth: 0}} />
            <button onClick={sendVoiceMessage} style={{
              padding: '6px 14px', background: 'var(--accent)',
              color: 'white', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              flexShrink: 0
            }}>
              Send
            </button>
            <button onClick={cancelRecording} style={{
              padding: '6px 10px', background: 'transparent',
              color: 'var(--text-muted)', border: '1px solid var(--border)',
              borderRadius: 8, cursor: 'pointer', fontSize: 13,
              flexShrink: 0
            }}>
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

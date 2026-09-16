import { useState, useRef, useEffect } from 'react'
import { Radio, Mic, MicOff, X, Users } from 'lucide-react'
import { db } from '../../lib/firebase'
import { collection, addDoc, onSnapshot, 
         query, orderBy, serverTimestamp, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'

export default function LiveBroadcast({ communityId, onClose }) {
  const { currentUser, userProfile } = useAuth()
  const [isLive, setIsLive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [participants, setParticipants] = useState([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPushToTalk, setIsPushToTalk] = useState(false)
  
  const streamRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  // Join broadcast room
  useEffect(() => {
    if (!communityId || !currentUser) return

    // Add self to participants
    const participantRef = doc(db, 'broadcastRooms', communityId, 'participants', currentUser.uid || 'guest')
    setDoc(participantRef, {
      uid: currentUser.uid || 'guest',
      name: userProfile?.name || 'User',
      role: userProfile?.role || 'citizen',
      joinedAt: serverTimestamp(),
      isMuted: false,
      isSpeaking: false
    })

    // Listen to participants
    const q = query(collection(db, 'broadcastRooms', communityId, 'participants'))
    const unsub = onSnapshot(q, (snap) => {
      setParticipants(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    return () => {
      unsub()
      deleteDoc(participantRef)
      stopBroadcast()
    }
  }, [communityId, currentUser])

  const startBroadcast = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false
      })
      streamRef.current = stream
      setIsLive(true)

      // Voice activity detection
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

    } catch (err) {
      alert('Microphone access needed for broadcast: ' + err.message)
    }
  }

  const stopBroadcast = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setIsLive(false)
    setIsSpeaking(false)
  }

  const handlePushToTalkStart = () => {
    if (!isLive || isMuted) return
    setIsSpeaking(true)
    // Start recording this segment
    if (streamRef.current) {
      chunksRef.current = []
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm'
      const mr = new MediaRecorder(streamRef.current, { mimeType })
      mediaRecorderRef.current = mr
      mr.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType })
          const reader = new FileReader()
          reader.onload = async () => {
            await addDoc(collection(db, 'broadcastRooms', communityId, 'segments'), {
              speakerId: currentUser.uid || 'guest',
              speakerName: userProfile?.name || 'User',
              audioData: reader.result,
              timestamp: serverTimestamp()
            })
          }
          reader.readAsDataURL(blob)
        }
      }
      mr.start(100)
    }
  }

  const handlePushToTalkEnd = () => {
    setIsSpeaking(false)
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 20,
        padding: 28, width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{
              width:10, height:10, borderRadius:'50%',
              background: isLive ? '#DC2626' : 'var(--text-muted)',
              animation: isLive ? 'pulse 1s infinite' : 'none'
            }} />
            <span style={{fontWeight:700, fontSize:16, color:'var(--text)'}}>
              Live Broadcast Room
            </span>
          </div>
          <button onClick={() => { stopBroadcast(); onClose() }} style={{
            background:'transparent', border:'none', cursor:'pointer',
            color:'var(--text-muted)', padding:4
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Participants */}
        <div style={{
          background:'var(--surface-2)', borderRadius:12,
          padding:16, marginBottom:20
        }}>
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            marginBottom:12, color:'var(--text-muted)', fontSize:13
          }}>
            <Users size={14} />
            <span>{participants.length} in room</span>
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
            {participants.map(p => (
              <div key={p.id} style={{
                display:'flex', alignItems:'center', gap:6,
                background:'var(--surface)', padding:'6px 10px',
                borderRadius:20, fontSize:13
              }}>
                <div style={{
                  width:8, height:8, borderRadius:'50%',
                  background: p.isSpeaking ? '#22C55E' : 'var(--border)'
                }} />
                <span style={{color:'var(--text)'}}>{p.name}</span>
                {p.isMuted && <MicOff size={10} color="var(--text-muted)" />}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        {!isLive ? (
          <button onClick={startBroadcast} style={{
            width:'100%', padding:16, background:'#DC2626',
            color:'white', border:'none', borderRadius:12,
            fontSize:15, fontWeight:700, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8
          }}>
            <Radio size={18} />
            Join Broadcast
          </button>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {/* Push to Talk */}
            <button
              onMouseDown={handlePushToTalkStart}
              onMouseUp={handlePushToTalkEnd}
              onTouchStart={handlePushToTalkStart}
              onTouchEnd={handlePushToTalkEnd}
              style={{
                width:'100%', padding:20,
                background: isSpeaking ? '#DC2626' : 'var(--accent)',
                color:'white', border:'none', borderRadius:12,
                fontSize:15, fontWeight:700, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                transform: isSpeaking ? 'scale(0.97)' : 'scale(1)',
                transition: 'all 0.1s',
                userSelect: 'none', WebkitUserSelect: 'none'
              }}
            >
              <Mic size={20} />
              {isSpeaking ? 'Speaking...' : 'Hold to Speak'}
            </button>

            <div style={{display:'flex', gap:8}}>
              <button onClick={() => setIsMuted(!isMuted)} style={{
                flex:1, padding:12,
                background: isMuted ? '#DC2626' : 'var(--surface-2)',
                color: isMuted ? 'white' : 'var(--text)',
                border:'1px solid var(--border)', borderRadius:10,
                fontSize:13, fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6
              }}>
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button onClick={() => { stopBroadcast(); onClose() }} style={{
                flex:1, padding:12,
                background:'var(--surface-2)',
                color:'var(--text)',
                border:'1px solid var(--border)', borderRadius:10,
                fontSize:13, fontWeight:600, cursor:'pointer'
              }}>
                Leave Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

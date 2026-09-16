import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import useAuth from './useAuth';

export const useCommunity = (channel = 'General') => {
  const { user, dbUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [voiceRoomUsers, setVoiceRoomUsers] = useState([]);
  const [voiceRoomActive, setVoiceRoomActive] = useState(false);

  const communityId = dbUser?.village || 'Ramanagara Town';

  // 1. Listen for real-time messages for the active channel
  useEffect(() => {
    if (!communityId) return;

    setLoading(true);
    let unsubscribe = () => {};

    try {
      if (db.isMock) {
        // Read messages from mock database local storage
        unsubscribe = db.onSnapshotCollection({ name: `messages` }, (data) => {
          // Filter by community village and channel
          const filtered = data
            .filter(msg => msg.communityId === communityId && msg.channel === channel)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setMessages(filtered);
          setLoading(false);
        });
      } else {
        const messagesRef = collection(db, 'communities', communityId, 'messages');
        const q = query(
          messagesRef,
          where('channel', '==', channel),
          orderBy('timestamp', 'asc')
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched = [];
          snapshot.forEach((docSnap) => {
            fetched.push({ id: docSnap.id, ...docSnap.data() });
          });
          setMessages(fetched);
          setLoading(false);
        }, (err) => {
          console.error("Firestore messages snapshot error:", err);
          setLoading(false);
        });
      }
    } catch (err) {
      console.error("Failed to load community messages:", err);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [communityId, channel]);

  // 2. Fetch community members list
  useEffect(() => {
    if (!communityId) return;

    let unsubscribe = () => {};

    try {
      if (db.isMock) {
        // Mock members
        const mockMembers = [
          { uid: 'mock_official_1', name: 'Dr. Srinivas Prasad', role: 'Official', department: 'Health Department' },
          { uid: 'mock_official_2', name: 'Kiran Gowda', role: 'Official', department: 'Electricity Board' },
          { uid: 'mock_volunteer_1', name: 'Ramesh Kumar', role: 'Volunteer' },
          { uid: 'mock_volunteer_2', name: 'Anitha Reddy', role: 'Volunteer' },
          { uid: 'mock_user_1', name: 'Gopal Hegde', role: 'Citizen' },
          { uid: 'mock_user_2', name: 'Suma Shastri', role: 'Citizen' }
        ];
        setMembers(mockMembers);
      } else {
        const membersRef = collection(db, 'communities', communityId, 'members');
        unsubscribe = onSnapshot(membersRef, (snapshot) => {
          const fetched = [];
          snapshot.forEach(docSnap => {
            fetched.push({ id: docSnap.id, ...docSnap.data() });
          });
          setMembers(fetched);
        });
      }
    } catch (e) {
      console.error("Failed to load members:", e);
    }

    return () => unsubscribe();
  }, [communityId]);

  // 3. Send message
  const sendMessage = async (messageData) => {
    if (!user || !dbUser) throw new Error("Authentication required");

    const payload = {
      senderId: user.uid,
      senderName: dbUser.name || 'Citizen',
      senderRole: dbUser.role || 'Citizen',
      text: messageData.text || '',
      audioUrl: messageData.audioUrl || '',
      mediaUrl: messageData.mediaUrl || '',
      type: messageData.type || 'text', // text, audio, image, video, pdf
      channel: channel,
      timestamp: new Date().toISOString(),
      communityId: communityId // for mock filter convenience
    };

    try {
      if (db.isMock) {
        await db.addDoc({ name: `messages` }, payload);
      } else {
        const ref = collection(db, 'communities', communityId, 'messages');
        await addDoc(ref, payload);
      }
    } catch (e) {
      console.error("Failed to send message:", e);
      throw e;
    }
  };

  // 4. Voice Room Listeners (Simulated or Real-time)
  useEffect(() => {
    if (!communityId) return;

    let unsubscribe = () => {};
    
    if (db.isMock) {
      // Periodic mock active user simulation
      const interval = setInterval(() => {
        const isActive = localStorage.getItem(`vanguard_voiceroom_active_${communityId}`) === 'true';
        setVoiceRoomActive(isActive);

        if (isActive) {
          const mockActiveUsers = [
            { uid: 'mock_official_1', name: 'Dr. Srinivas Prasad', role: 'Official' },
            { uid: 'mock_volunteer_1', name: 'Ramesh Kumar', role: 'Volunteer' }
          ];
          // Include current user if they are in the voice room
          const isUserIn = localStorage.getItem(`vanguard_voiceroom_user_in_${communityId}`) === 'true';
          if (isUserIn) {
            mockActiveUsers.push({ uid: user?.uid, name: dbUser?.name, role: dbUser?.role });
          }
          setVoiceRoomUsers(mockActiveUsers);
        } else {
          setVoiceRoomUsers([]);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // In real Firebase we would listen to a 'voiceRooms' document in Firestore
      const roomRef = doc(db, 'communities', communityId, 'voiceRooms', 'active');
      unsubscribe = onSnapshot(roomRef, (docSnap) => {
        if (docSnap.exists()) {
          const roomData = docSnap.data();
          setVoiceRoomActive(roomData.active || false);
          setVoiceRoomUsers(roomData.participants || []);
        } else {
          setVoiceRoomActive(false);
          setVoiceRoomUsers([]);
        }
      });
    }

    return () => unsubscribe();
  }, [communityId, user?.uid, dbUser?.name]);

  // Join Voice Room
  const joinVoiceRoom = async () => {
    if (!user || !dbUser) return;
    if (db.isMock) {
      localStorage.setItem(`vanguard_voiceroom_active_${communityId}`, 'true');
      localStorage.setItem(`vanguard_voiceroom_user_in_${communityId}`, 'true');
      setVoiceRoomActive(true);
    } else {
      const roomRef = doc(db, 'communities', communityId, 'voiceRooms', 'active');
      const docSnap = await getDoc(roomRef);
      const participants = docSnap.exists() ? docSnap.data().participants || [] : [];
      
      if (!participants.some(p => p.uid === user.uid)) {
        participants.push({ uid: user.uid, name: dbUser.name, role: dbUser.role });
      }

      await setDoc(roomRef, {
        active: true,
        participants: participants,
        updatedAt: new Date().toISOString()
      });
    }
  };

  // Leave Voice Room
  const leaveVoiceRoom = async () => {
    if (!user) return;
    if (db.isMock) {
      localStorage.setItem(`vanguard_voiceroom_user_in_${communityId}`, 'false');
      // If no one else, deactivate room
      setTimeout(() => {
        localStorage.setItem(`vanguard_voiceroom_active_${communityId}`, 'false');
      }, 5000);
    } else {
      const roomRef = doc(db, 'communities', communityId, 'voiceRooms', 'active');
      const docSnap = await getDoc(roomRef);
      if (docSnap.exists()) {
        const participants = docSnap.data().participants || [];
        const updatedParticipants = participants.filter(p => p.uid !== user.uid);
        
        await setDoc(roomRef, {
          active: updatedParticipants.length > 0,
          participants: updatedParticipants,
          updatedAt: new Date().toISOString()
        });
      }
    }
  };

  return {
    messages,
    loading,
    members,
    voiceRoomUsers,
    voiceRoomActive,
    sendMessage,
    joinVoiceRoom,
    leaveVoiceRoom
  };
};

export default useCommunity;

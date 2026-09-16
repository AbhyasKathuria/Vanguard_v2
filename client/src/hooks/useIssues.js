import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc,
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import useAuth from './useAuth';

export const useIssues = () => {
  const { dbUser, user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch local community issues
  useEffect(() => {
    if (!dbUser?.village) {
      setIssues([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe = () => {};

    try {
      if (db.isMock) {
        // Mock DB utilizes local storage event snapshots
        unsubscribe = db.onSnapshotCollection({ name: 'issues' }, (data) => {
          // Filter by village
          const filtered = data
            .filter(issue => issue.village === dbUser.village)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setIssues(filtered);
          setLoading(false);
        });
      } else {
        const issuesRef = collection(db, 'issues');
        const q = query(
          issuesRef, 
          where('village', '==', dbUser.village),
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched = [];
          snapshot.forEach((docSnap) => {
            fetched.push({ id: docSnap.id, ...docSnap.data() });
          });
          setIssues(fetched);
          setLoading(false);
        }, (err) => {
          console.error("Firestore onSnapshot error:", err);
          setError(err.message);
          setLoading(false);
        });
      }
    } catch (err) {
      console.error("Failed to load issues:", err);
      setError(err.message);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [dbUser?.village]);

  // Create new issue report
  const reportIssue = async (issueData) => {
    if (!user || !dbUser) throw new Error("Authenticated user required");

    const payload = {
      reporterId: user.uid,
      reporterName: dbUser.name || 'Citizen',
      title: issueData.title || issueData.categoryLabel || 'Civic safety issue',
      description: issueData.description || '',
      photoUrl: issueData.photoUrl || '',
      audioNoteUrl: issueData.audioNoteUrl || '',
      lat: issueData.lat || dbUser.lat || 12.7244,
      lng: issueData.lng || dbUser.lng || 77.2911,
      state: dbUser.state || 'Karnataka',
      district: dbUser.district || 'Ramanagara',
      village: dbUser.village || 'Ramanagara Town',
      ward: dbUser.ward || 'Ward 6',
      category: issueData.category || 'other',
      severity: issueData.severity || 'green',
      riskSummary: issueData.riskPrediction || issueData.severityReason || 'Standard report',
      impactScore: issueData.impactScore || 30,
      recommendedAuthority: issueData.recommendedAuthority || 'Municipal Board',
      escalationLevel: issueData.escalationLevel || 'community',
      status: 'Open',
      aiReportText: issueData.reportText || '',
      pdfUrl: issueData.pdfUrl || '',
      confirmations: [], // array of userIds
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (db.isMock) {
        const docRef = await db.addDoc({ name: 'issues' }, payload);
        return docRef.id;
      } else {
        const docRef = await addDoc(collection(db, 'issues'), payload);
        return docRef.id;
      }
    } catch (err) {
      console.error("Failed to report issue:", err);
      throw err;
    }
  };

  // Confirm issue severity/existence
  const confirmIssue = async (issueId) => {
    if (!user) throw new Error("Authentication required");

    try {
      const issueRef = doc(db, 'issues', issueId);
      
      let issueData = null;
      if (db.isMock) {
        const snap = await db.getDoc(issueRef);
        issueData = snap.data();
      } else {
        const snap = await getDoc(issueRef);
        issueData = snap.data();
      }

      if (!issueData) throw new Error("Issue not found");

      const confirmations = issueData.confirmations || [];
      if (confirmations.includes(user.uid)) {
        console.log("User already confirmed this issue");
        return; // already confirmed
      }

      const updatedConfirmations = [...confirmations, user.uid];

      if (db.isMock) {
        await db.updateDoc(issueRef, { confirmations: updatedConfirmations });
      } else {
        await updateDoc(issueRef, { confirmations: updatedConfirmations });
      }
    } catch (err) {
      console.error("Failed to confirm issue:", err);
      throw err;
    }
  };

  // Fetch issue detail by ID (runs once or snapshot)
  const getIssueDetail = (issueId, callback) => {
    const issueRef = doc(db, 'issues', issueId);
    
    if (db.isMock) {
      return db.onSnapshotDoc(issueRef, (snap) => {
        if (snap.exists()) {
          callback({ id: snap.id, ...snap.data() });
        } else {
          callback(null);
        }
      });
    } else {
      return onSnapshot(issueRef, (snap) => {
        if (snap.exists()) {
          callback({ id: snap.id, ...snap.data() });
        } else {
          callback(null);
        }
      });
    }
  };

  return {
    issues,
    loading,
    error,
    reportIssue,
    confirmIssue,
    getIssueDetail
  };
};

export default useIssues;

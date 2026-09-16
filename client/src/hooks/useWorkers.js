import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import useAuth from './useAuth';

export const useWorkers = () => {
  const { user, dbUser } = useAuth();
  
  const [workers, setWorkers] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const village = dbUser?.village || 'Ramanagara Town';

  // 1. Fetch available workers in same village
  useEffect(() => {
    if (!village) return;

    setLoading(true);
    let unsubscribe = () => {};

    try {
      if (db.isMock) {
        // Load mock worker seed list from localStorage or seed initial values
        const getStored = () => JSON.parse(localStorage.getItem('vanguard_workers_list') || '[]');
        const stored = getStored();
        
        if (stored.length === 0) {
          const seed = [
            { id: 'w_1', name: 'Raju Prasad', skills: ['Electrician', 'Plumber'], experienceYears: 8, dailyRate: 500, bio: 'Experienced in house wiring, motor installations, and pipe leaks repairing.', rating: 4.8, reviewCount: 24, isAvailable: true, village: village },
            { id: 'w_2', name: 'Basavaraj Swamy', skills: ['Farmer', 'Construction'], experienceYears: 12, dailyRate: 400, bio: 'Specialist in crop harvesting, tractor plowing, and brick laying.', rating: 4.6, reviewCount: 38, isAvailable: true, village: village },
            { id: 'w_3', name: 'Manpreet Singh', skills: ['Carpenter'], experienceYears: 5, dailyRate: 600, bio: 'Furniture making, doors repairing, and timber work specialist.', rating: 4.9, reviewCount: 16, isAvailable: true, village: village },
            { id: 'w_4', name: 'Kavitha Devi', skills: ['Farmer', 'Tailoring'], experienceYears: 6, dailyRate: 350, bio: 'Available for organic farming guidance and ladies tailoring works.', rating: 4.7, reviewCount: 11, isAvailable: false, village: village }
          ];
          localStorage.setItem('vanguard_workers_list', JSON.stringify(seed));
          setWorkers(seed);
        } else {
          // Filter by village
          setWorkers(stored.filter(w => w.village === village));
        }
        setLoading(false);
      } else {
        const workersRef = collection(db, 'workers');
        const q = query(workersRef, where('village', '==', village));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched = [];
          snapshot.forEach(docSnap => {
            fetched.push({ id: docSnap.id, ...docSnap.data() });
          });
          setWorkers(fetched);
          setLoading(false);
        });
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [village]);

  // 2. Fetch Job Posts posted by current user
  useEffect(() => {
    if (!user) return;

    let unsubscribe = () => {};
    try {
      if (db.isMock) {
        unsubscribe = db.onSnapshotCollection({ name: 'jobPosts' }, (data) => {
          const filtered = data.filter(job => job.posterId === user.uid);
          setJobPosts(filtered);
        });
      } else {
        const jobsRef = collection(db, 'jobPosts');
        const q = query(jobsRef, where('posterId', '==', user.uid));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched = [];
          snapshot.forEach(docSnap => {
            fetched.push({ id: docSnap.id, ...docSnap.data() });
          });
          setJobPosts(fetched);
        });
      }
    } catch (e) {
      console.error(e);
    }

    return () => unsubscribe();
  }, [user]);

  // 3. Post a new Job
  const postJob = async (jobData) => {
    if (!user || !dbUser) throw new Error("Authentication required");

    // Add 2 mock applications automatically in mock mode to show notification triggers!
    const mockApplicants = db.isMock ? [
      { workerId: 'w_1', name: 'Raju Prasad', skills: ['Electrician'], dailyRate: 500, rating: 4.8, status: 'pending' },
      { workerId: 'w_2', name: 'Basavaraj Swamy', skills: ['Farmer'], dailyRate: 400, rating: 4.6, status: 'pending' }
    ] : [];

    const payload = {
      posterId: user.uid,
      posterName: dbUser.name || 'Citizen',
      title: jobData.title,
      skillRequired: jobData.skillRequired,
      workersNeeded: Number(jobData.workersNeeded) || 1,
      description: jobData.description,
      location: jobData.location || village,
      payPerDay: Number(jobData.payPerDay),
      status: 'Open',
      applications: mockApplicants,
      createdAt: new Date().toISOString()
    };

    try {
      if (db.isMock) {
        await db.addDoc({ name: 'jobPosts' }, payload);
      } else {
        await addDoc(collection(db, 'jobPosts'), payload);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // 4. Update applicant status (Accept/Reject application)
  const updateApplicationStatus = async (jobId, workerId, newStatus) => {
    try {
      const jobRef = doc(db, 'jobPosts', jobId);
      
      let jobData = null;
      if (db.isMock) {
        const snap = await db.getDoc(jobRef);
        jobData = snap.data();
      } else {
        const snap = await getDoc(jobRef);
        jobData = snap.data();
      }

      if (!jobData) throw new Error("Job post not found");

      const updatedApps = (jobData.applications || []).map(app => {
        if (app.workerId === workerId) {
          return { ...app, status: newStatus };
        }
        return app;
      });

      if (db.isMock) {
        await db.updateDoc(jobRef, { applications: updatedApps });
      } else {
        await updateDoc(jobRef, { applications: updatedApps });
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return {
    workers,
    jobPosts,
    loading,
    postJob,
    updateApplicationStatus
  };
};

export default useWorkers;

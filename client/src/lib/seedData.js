import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function seedOfficials() {
  try {
    // 1. Seed officials
    const sampleOfficials = [
      { id: "official_1", name: "Ramesh Kumar", role: "Ward Member", department: "Ward Office",
        phone: "+91-9876543210", email: "ward6@teghra.gov.in",
        ward: "6", village: "Teghra", district: "Teghra", lat: 25.4974, lng: 85.9704 },
      { id: "official_2", name: "Suresh Patil", role: "Station House Officer", 
        department: "Police", phone: "100",
        email: "sho.teghra@ksp.gov.in",
        ward: "6", village: "Teghra", district: "Teghra", lat: 25.4984, lng: 85.9714 },
      { id: "official_3", name: "Meena Sharma", role: "Junior Engineer",
        department: "Electricity Board - BESCOM",
        phone: "1912", email: "je.bescom@bihar.gov.in",
        ward: "6", village: "Teghra", district: "Teghra", lat: 25.4964, lng: 85.9694 },
      { id: "official_4", name: "Dr. Anand Rao", role: "Medical Officer",
        department: "Primary Health Centre",
        phone: "108", email: "phc.teghra@health.bih.nic.in",
        ward: "6", village: "Teghra", district: "Teghra", lat: 25.4994, lng: 85.9724 },
      { id: "official_5", name: "Kavitha Nair", role: "Sanitation Officer",
        department: "Municipality",
        phone: "+91-8765432109", email: "sanitation@teghramun.gov.in",
        ward: "6", village: "Teghra", district: "Teghra", lat: 25.4954, lng: 85.9684 }
    ];

    console.log("Seeding default officials data into Firestore...");
    for (const off of sampleOfficials) {
      await setDoc(doc(db, 'officials', off.id), {
        ...off,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }
    console.log("Seeding officials complete!");

    // 2. Seed workers
    const seedWorkers = [
      { id: 'worker_1', name: 'Raju Kumar', skills: ['electrician'],
        experienceYears: 8, dailyRate: 800, rating: 4.5, reviewCount: 23,
        isAvailable: true, village: 'Teghra', ward: '6', district: 'Teghra',
        bio: 'Experienced electrician for home and farm wiring.', lat: 25.4974, lng: 85.9704 },
      { id: 'worker_2', name: 'Sunil Yadav', skills: ['plumber'],
        experienceYears: 5, dailyRate: 600, rating: 4.2, reviewCount: 15,
        isAvailable: true, village: 'Teghra', ward: '6', district: 'Teghra',
        bio: 'Plumbing repairs and installation.', lat: 25.4984, lng: 85.9714 },
      { id: 'worker_3', name: 'Krishna Mahto', skills: ['construction', 'labor'],
        experienceYears: 12, dailyRate: 500, rating: 4.7, reviewCount: 41,
        isAvailable: true, village: 'Teghra', ward: '4', district: 'Teghra',
        bio: 'Construction and masonry work.', lat: 25.4964, lng: 85.9694 },
      { id: 'worker_4', name: 'Mohan Lal', skills: ['farmer'],
        experienceYears: 15, dailyRate: 450, rating: 4.8, reviewCount: 32,
        isAvailable: true, village: 'Teghra', ward: '5', district: 'Teghra',
        bio: 'Farm labor, harvesting, planting.', lat: 25.4994, lng: 85.9724 },
      { id: 'worker_5', name: 'Ramesh Prasad', skills: ['carpenter'],
        experienceYears: 10, dailyRate: 700, rating: 4.4, reviewCount: 19,
        isAvailable: true, village: 'Teghra', ward: '6', district: 'Teghra',
        bio: 'Furniture and woodwork specialist.', lat: 25.4954, lng: 85.9684 },
      { id: 'worker_6', name: 'Anil Mahto', skills: ['electrician', 'plumber'],
        experienceYears: 6, dailyRate: 650, rating: 4.3, reviewCount: 11,
        isAvailable: false, village: 'Teghra', ward: '3', district: 'Teghra',
        bio: 'Multi-skilled handyman.', lat: 25.4974, lng: 85.9704 },
    ];

    console.log("Seeding default workers data into Firestore...");
    for (const w of seedWorkers) {
      await setDoc(doc(db, 'workers', w.id), {
        ...w,
        userId: w.id,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }
    console.log("Seeding workers complete!");

  } catch (err) {
    console.error("Error seeding default Firestore resources:", err);
  }
}

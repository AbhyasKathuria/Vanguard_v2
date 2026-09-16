// VANGUARD Authentication Context Provider
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously,
         signInWithPopup, GoogleAuthProvider,
         createUserWithEmailAndPassword,
         signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import i18n from '../lib/i18n'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(undefined)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if a local session exists
    const cachedUser = localStorage.getItem('vanguard_session_user')
    const cachedDbUser = localStorage.getItem('vanguard_session_dbuser')
    
    if (cachedUser && cachedDbUser) {
      setCurrentUser(JSON.parse(cachedUser))
      setUserProfile(JSON.parse(cachedDbUser))
      setLoading(false)
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
        try {
          const profileDoc = await getDoc(doc(db, 'users', user.uid))
          if (profileDoc.exists()) {
            const profile = profileDoc.data()
            setUserProfile(profile)
            localStorage.setItem('vanguard_session_user', JSON.stringify(user))
            localStorage.setItem('vanguard_session_dbuser', JSON.stringify(profile))
            // Restore language from profile
            if (profile.language) {
              i18n.changeLanguage(profile.language)
              localStorage.setItem('vanguard_language', profile.language)
            }
          }
        } catch (err) {
          console.error('Profile load error:', err)
        }
      } else {
        const cachedUserObj = localStorage.getItem('vanguard_session_user')
        if (!cachedUserObj || !JSON.parse(cachedUserObj).isLocalGuest) {
          setCurrentUser(null)
          setUserProfile(null)
        }
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const saveProfile = async (uid, profileData) => {
    const profile = {
      ...profileData,
      updatedAt: new Date().toISOString()
    }
    await setDoc(doc(db, 'users', uid), profile, { merge: true })
    
    // Seed official worker database link if needed
    if ((profile.role || '').toLowerCase() === 'worker') {
      await setDoc(doc(db, 'workers', uid), {
        userId: uid,
        name: profileData.name || 'Helper',
        skills: ['general'],
        experienceYears: 1,
        dailyRate: 400,
        bio: 'Self-registered daily worker ready to help.',
        rating: 5.0,
        reviewCount: 1,
        isAvailable: true,
        village: profileData.village || '',
        ward: profileData.ward || '',
        district: profileData.district || '',
        lat: profileData.lat || 12.9716,
        lng: profileData.lng || 77.5946
      }, { merge: true })
    }
    
    setUserProfile(profile)
  }

  const loginAsGuest = async (onboardingData) => {
    const result = await signInAnonymously(auth)
    await saveProfile(result.user.uid, {
      uid: result.user.uid,
      name: onboardingData.name || 'Guest User',
      language: onboardingData.language || 'en',
      role: onboardingData.role || 'citizen',
      village: onboardingData.village || '',
      ward: onboardingData.ward || '',
      district: onboardingData.district || '',
      state: onboardingData.state || '',
      isGuest: true,
      createdAt: new Date().toISOString()
    })
    return result
  }

  const loginWithGoogle = async (onboardingData) => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    await saveProfile(result.user.uid, {
      uid: result.user.uid,
      name: result.user.displayName || 'User',
      email: result.user.email,
      language: onboardingData?.language || 
                localStorage.getItem('vanguard_language') || 'en',
      role: onboardingData?.role || 'citizen',
      village: onboardingData?.village || '',
      ward: onboardingData?.ward || '',
      district: onboardingData?.district || '',
      state: onboardingData?.state || '',
      createdAt: new Date().toISOString()
    })
    return result
  }

  const loginWithEmail = async (email, password, onboardingData) => {
    let result
    try {
      result = await createUserWithEmailAndPassword(auth, email, password)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        result = await signInWithEmailAndPassword(auth, email, password)
      } else throw err
    }
    await saveProfile(result.user.uid, {
      uid: result.user.uid,
      name: onboardingData?.name || email.split('@')[0],
      email: email,
      language: onboardingData?.language || 
                localStorage.getItem('vanguard_language') || 'en',
      role: onboardingData?.role || 'citizen',
      village: onboardingData?.village || '',
      ward: onboardingData?.ward || '',
      district: onboardingData?.district || '',
      state: onboardingData?.state || '',
      createdAt: new Date().toISOString()
    })
    return result
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (e) {
      console.warn('Signout error:', e)
    }
    localStorage.removeItem('vanguard_session_user')
    localStorage.removeItem('vanguard_session_dbuser')
    localStorage.removeItem('vanguard_language')
    setCurrentUser(null)
    setUserProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      user: currentUser, // backwards compatibility
      userProfile,
      dbUser: userProfile, // backwards compatibility
      loading,
      loginAsGuest,
      loginWithGoogle,
      loginWithEmail,
      saveProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

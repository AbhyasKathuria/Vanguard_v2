import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { Toaster } from 'react-hot-toast'
import { seedOfficials } from './lib/seedData'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import './lib/i18n' // import to initialize translation engine

// Pages
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import ReportIssue from './pages/ReportIssue'
import IssueDetail from './pages/IssueDetail'
import IssueMap from './pages/IssueMap'
import Community from './pages/Community'
import Workers from './pages/Workers'
import Emergency from './pages/Emergency'
import AIAssistant from './pages/AIAssistant'
import Officials from './pages/Officials'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

function AdminRoute({ children }) {
  const { dbUser } = useAuth()
  return (dbUser?.role || '').toLowerCase() === 'official' 
    ? children 
    : <Navigate to="/" replace />
}

export default function App() {
  useEffect(() => {
    seedOfficials()
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Toaster 
              position="top-center" 
              reverseOrder={false}
              toastOptions={{
                style: {
                  borderRadius: '12px',
                  background: '#0F2B4E',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600'
                }
              }}
            />
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />

              <Route element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<ReportIssue />} />
                <Route path="/issues/:id" element={<IssueDetail />} />
                <Route path="/map" element={<IssueMap />} />
                <Route path="/community" element={<Community />} />
                <Route path="/workers" element={<Workers />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/ai" element={<AIAssistant />} />
                <Route path="/officials" element={<Officials />} />
                <Route path="/profile" element={<Profile />} />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

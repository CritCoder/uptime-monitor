import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { useSocket } from './hooks/useSocket'
import Layout from './components/Layout'
import AnimatedPage from './components/AnimatedPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import TestDashboard from './pages/TestDashboard'
import SimpleDashboard from './pages/SimpleDashboard'
import MonitorsPage from './pages/MonitorsPage'
import MonitorDetailPage from './pages/MonitorDetailPage'
import CreateMonitorPage from './pages/CreateMonitorPage'
import IncidentsPage from './pages/IncidentsPage'
import IncidentDetailPage from './pages/IncidentDetailPage'
import AlertsPage from './pages/AlertsPage'
import StatusPagesPage from './pages/StatusPagesPage'
import StatusPageDetailPage from './pages/StatusPageDetailPage'
import IntegrationsPage from './pages/IntegrationsPage'
import SettingsPage from './pages/SettingsPage'
import PublicStatusPage from './pages/PublicStatusPage'
import DocsPage from './pages/DocsPage'
import AdminPage from './pages/AdminPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AboutPage from './pages/AboutPage'
import BlogPage from './pages/BlogPage'
import CareersPage from './pages/CareersPage'
import PressPage from './pages/PressPage'
import HelpCenterPage from './pages/HelpCenterPage'
import CommunityPage from './pages/CommunityPage'
import APIReferencePage from './pages/APIReferencePage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import SecurityPage from './pages/SecurityPage'
import CompliancePage from './pages/CompliancePage'
import LoadingSpinner from './components/LoadingSpinner'
import { Toaster } from './components/ui/sonner'

function App() {
  const { user, loading } = useAuth()
  const location = useLocation()
  useSocket()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Toaster />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={!user ? <AnimatedPage><LandingPage /></AnimatedPage> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <AnimatedPage><LoginPage /></AnimatedPage> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <AnimatedPage><RegisterPage /></AnimatedPage> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={!user ? <AnimatedPage><ForgotPasswordPage /></AnimatedPage> : <Navigate to="/dashboard" />} />
          <Route path="/verify-email" element={<AnimatedPage><VerifyEmailPage /></AnimatedPage>} />
          <Route path="/auth/callback" element={<AnimatedPage><AuthCallbackPage /></AnimatedPage>} />
          <Route path="/docs" element={<AnimatedPage><DocsPage /></AnimatedPage>} />
          <Route path="/status/:slug" element={<AnimatedPage><PublicStatusPage /></AnimatedPage>} />

          {/* Company pages */}
          <Route path="/about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
          <Route path="/blog" element={<AnimatedPage><BlogPage /></AnimatedPage>} />
          <Route path="/careers" element={<AnimatedPage><CareersPage /></AnimatedPage>} />
          <Route path="/press" element={<AnimatedPage><PressPage /></AnimatedPage>} />

          {/* Resources pages */}
          <Route path="/help" element={<AnimatedPage><HelpCenterPage /></AnimatedPage>} />
          <Route path="/community" element={<AnimatedPage><CommunityPage /></AnimatedPage>} />
          <Route path="/api" element={<AnimatedPage><APIReferencePage /></AnimatedPage>} />

          {/* Legal pages */}
          <Route path="/privacy" element={<AnimatedPage><PrivacyPage /></AnimatedPage>} />
          <Route path="/terms" element={<AnimatedPage><TermsPage /></AnimatedPage>} />
          <Route path="/security" element={<AnimatedPage><SecurityPage /></AnimatedPage>} />
          <Route path="/compliance" element={<AnimatedPage><CompliancePage /></AnimatedPage>} />

          {/* Protected routes */}
          <Route path="/dashboard" element={user ? <Layout><AnimatedPage><DashboardPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/monitors" element={user ? <Layout><AnimatedPage><MonitorsPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/monitors/create" element={user ? <Layout><AnimatedPage><CreateMonitorPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/monitors/:id" element={user ? <Layout><AnimatedPage><MonitorDetailPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/monitors/:id/edit" element={user ? <Layout><AnimatedPage><CreateMonitorPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/incidents" element={user ? <Layout><AnimatedPage><IncidentsPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/incidents/:id" element={user ? <Layout><AnimatedPage><IncidentDetailPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/alerts" element={user ? <Layout><AnimatedPage><AlertsPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/status-pages" element={user ? <Layout><AnimatedPage><StatusPagesPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/status-pages/create" element={user ? <Layout><AnimatedPage><StatusPageDetailPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/status-pages/:id" element={user ? <Layout><AnimatedPage><StatusPageDetailPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/integrations" element={user ? <Layout><AnimatedPage><IntegrationsPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Layout><AnimatedPage><SettingsPage /></AnimatedPage></Layout> : <Navigate to="/login" />} />

          {/* Admin route */}
          <Route path="/admin" element={user ? <AnimatedPage><AdminPage /></AnimatedPage> : <Navigate to="/login" />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App

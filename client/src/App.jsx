import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useSocket } from './hooks/useSocket'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
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
import SettingsPage from './pages/SettingsPage'
import PublicStatusPage from './pages/PublicStatusPage'
import DocsPage from './pages/DocsPage'
import AdminPage from './pages/AdminPage'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()
  useSocket()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/status/:slug" element={<PublicStatusPage />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={user ? <Layout><DashboardPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/monitors" element={user ? <Layout><MonitorsPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/monitors/create" element={user ? <Layout><CreateMonitorPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/monitors/:id" element={user ? <Layout><MonitorDetailPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/monitors/:id/edit" element={user ? <Layout><CreateMonitorPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/incidents" element={user ? <Layout><IncidentsPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/incidents/:id" element={user ? <Layout><IncidentDetailPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/alerts" element={user ? <Layout><AlertsPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/status-pages" element={user ? <Layout><StatusPagesPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/status-pages/create" element={user ? <Layout><StatusPageDetailPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/status-pages/:id" element={user ? <Layout><StatusPageDetailPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/settings" element={user ? <Layout><SettingsPage /></Layout> : <Navigate to="/login" />} />
      
      {/* Admin route */}
      <Route path="/admin" element={user ? <AdminPage /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App

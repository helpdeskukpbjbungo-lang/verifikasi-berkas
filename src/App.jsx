import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TopNavBar from './components/TopNavBar'
import SideNavBar from './components/SideNavBar'
import PengajuanForm from './pages/PengajuanForm'
import CekStatus from './pages/CekStatus'
import LoginVerifikator from './pages/LoginVerifikator'
import LoginPemohon from './pages/LoginPemohon'
import DashboardVerifikator from './pages/DashboardVerifikator'
import DashboardPemohon from './pages/DashboardPemohon'

function ProtectedRoute({ children }) {
  return children
}

function PublicRoute({ children }) {
  return children
}

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className="flex min-h-[calc(100vh-64px)]">
        <SideNavBar open={sidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 bg-background pt-6 px-4 md:px-6">
          {children}
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login/verifikator" element={
          <PublicRoute>
            <LoginVerifikator />
          </PublicRoute>
        } />
        <Route path="/login/pemohon" element={
          <PublicRoute>
            <LoginPemohon />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard/verifikator" element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardVerifikator />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/pemohon" element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPemohon />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Default Route */}
        <Route path="/" element={
          <PublicRoute>
            <AppLayout>
              <PengajuanForm />
            </AppLayout>
          </PublicRoute>
        } />

        {/* Cek Status Route */}
        <Route path="/cek-status" element={
          <PublicRoute>
            <AppLayout>
              <CekStatus />
            </AppLayout>
          </PublicRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

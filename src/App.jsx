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
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar />
      <div className="flex min-h-[calc(100vh-64px)]">
        <SideNavBar />
        <main className="ml-64 flex-1 bg-background pt-6">
          {children}
        </main>
      </div>
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

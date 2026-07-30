import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function TopNavBar({ onToggleSidebar, sidebarOpen }) {
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const navigate = useNavigate()

  const notifications = [
    { id: 1, text: 'Pengajuan Ahmad Verifikator berhasil diverifikasi', time: '2 menit lalu' },
    { id: 2, text: 'Draft pengajuan Siti Rahayu belum lengkap', time: '1 jam lalu' },
    { id: 3, text: 'Sistem akan maintenance pada pukul 22.00', time: '3 jam lalu' },
  ]

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifOpen || profileOpen) {
        setNotifOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen, profileOpen])

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-md py-xs bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline">
      <div className="flex items-center gap-sm">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-full hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed">menu</span>
        </button>
        <span className="text-headline-sm font-headline-sm font-bold text-primary dark:text-primary-fixed">LPSE Verifier Portal</span>
      </div>
      
      <div className="flex items-center gap-md">
        <div className="flex items-center gap-xs">
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors cursor-pointer active:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed">notifications</span>
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant rounded-lg shadow-lg z-50">
                <div className="px-4 py-3 border-b border-outline-variant">
                  <h4 className="font-label-md text-label-md text-primary">Notifikasi</h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-surface-container-low cursor-pointer border-b border-outline-variant last:border-b-0">
                      <p className="font-body-sm text-body-sm text-on-surface">{notif.text}</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-sm pl-md border-l border-outline-variant">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-label-md font-bold text-on-surface">Ahmad Verifikator</p>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Administrator</p>
          </div>
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center border border-outline-variant cursor-pointer hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-primary">person</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-lg shadow-lg z-50">
                <div className="px-4 py-3 border-b border-outline-variant">
                  <p className="font-label-md text-label-md font-bold text-on-surface">Ahmad Verifikator</p>
                  <p className="text-[11px] text-on-surface-variant">admin@lpse.go.id</p>
                </div>
                <div className="py-2">
                  <button onClick={() => { navigate('/dashboard/verifikator'); setProfileOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-on-surface font-body-sm text-body-sm">
                    Dashboard Verifikator
                  </button>
                  <button onClick={() => { navigate('/dashboard/pemohon'); setProfileOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-surface-container-low text-on-surface font-body-sm text-body-sm">
                    Dashboard Pemohon
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
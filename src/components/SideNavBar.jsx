import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function SideNavBar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/verifikator',
      activeStyle: 'bg-secondary-container text-on-secondary-container font-semibold',
      inactiveStyle: 'text-on-surface-variant hover:bg-surface-variant dark:hover:bg-surface-container-highest',
    },
    {
      label: 'Pengajuan Masuk',
      icon: 'inbox',
      path: '/pengajuan-masuk',
      activeStyle: 'bg-secondary-container text-on-secondary-container font-semibold',
      inactiveStyle: 'text-on-surface-variant hover:bg-surface-variant dark:hover:bg-surface-container-highest',
    },
    {
      label: 'Laporan',
      icon: 'assessment',
      path: '/verifikator/laporan',
      activeStyle: 'bg-secondary-container text-on-secondary-container font-semibold',
      inactiveStyle: 'text-on-surface-variant hover:bg-surface-variant dark:hover:bg-surface-container-highest',
    },
  ]

  const systemItems = []

  const handleNavigate = (path) => {
    if (path !== '#') {
      navigate(path)
    }
    onClose?.()
  }

  return (
    <>
      <aside
        className={`
          fixed top-16 inset-x-0 bottom-0 left-0 w-72 flex flex-col pb-md z-40
          bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline
          transform transition-transform duration-300 ease-in-out
          md:fixed md:top-16 md:bottom-0 md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="px-md pt-sm mb-lg">
          <div className="flex items-center gap-sm mb-xs">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-sm">shield</span>
            </div>
            <div className="mt-sm">
              <p className="text-label-md font-black text-primary leading-tight">LPSE Verifier</p>
              <p className="text-xs text-on-surface-variant font-medium">Official Portal</p>
            </div>
          </div>
          </div>

        <nav className="flex-1 px-sm space-y-xs overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const active = isActive(item.path)
            return (
              <a
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center gap-sm px-md py-sm cursor-pointer transition-all rounded-lg font-label-md text-label-md ${active ? item.activeStyle : item.inactiveStyle}`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </a>
            )
          })}

          {systemItems.map((item) => (
            <a
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="flex items-center gap-sm px-md py-sm cursor-pointer transition-all text-on-surface-variant hover:bg-surface-variant font-label-md text-label-md"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-auto px-md pt-md border-t border-outline-variant">
          <div className="flex items-center gap-sm mb-sm">
            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            </div>
            <div>
              <p className="text-label-md font-bold text-primary leading-tight">Administrator</p>
              <p className="text-[10px] text-on-surface-variant">admin@lpse.go.id</p>
            </div>
          </div>
          <div className="bg-surface-container rounded-lg p-sm">
            <p className="text-xs font-bold text-primary mb-1">Server Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-on-surface-variant">Operational - v2.4.1</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function SideNavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const menuItems = [
    {
      label: 'Pengajuan',
      icon: 'description',
      path: '/',
      activeStyle: 'bg-secondary-container text-on-secondary-container font-semibold',
      inactiveStyle: 'hover:bg-surface-variant dark:hover:bg-surface-container-highest text-on-surface-variant',
    },
    {
      label: 'Cek Status',
      icon: 'verified_user',
      path: '/cek-status',
      activeStyle: 'bg-secondary-container text-on-secondary-container font-semibold',
      inactiveStyle: 'hover:bg-surface-variant dark:hover:bg-surface-container-highest text-on-surface-variant',
    },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col pt-24 pb-md z-40 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline">
      
      <nav className="flex-1 px-sm space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.path)
          return (
            <a
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-sm px-md py-sm cursor-pointer transition-all rounded-lg font-label-md text-label-md ${active ? item.activeStyle : item.inactiveStyle}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>
      <div className="px-sm pt-md border-t border-outline-variant">
        <a onClick={() => alert('Fitur Settings akan segera hadir.')} className="flex items-center gap-sm px-md py-sm cursor-pointer transition-all hover:bg-surface-variant text-on-surface-variant font-label-md text-label-md">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </a>
      </div>
    </aside>
  )
}
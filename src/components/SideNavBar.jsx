import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../img/logo-ukpbjbungo.png'

export default function SideNavBar({ open, onClose }) {
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

  const handleNavigate = (path) => {
    navigate(path)
    onClose?.()
  }

  return (
    <>
      <aside
        className={`
          fixed top-16 inset-x-0 bottom-0 left-0 w-64 flex flex-col pb-md z-40
          bg-white dark:bg-white border-r border-outline-variant dark:border-outline
          transform transition-transform duration-300 ease-in-out
          md:relative md:inset-y-0 md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex justify-center py-4 pb-6">
          <img
            src={logo}
            alt="Logo UKPBJ Bungo"
            className="h-10 md:h-8 w-auto max-w-full object-contain shrink-0"
          />
        </div>

        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container-low transition-colors z-50"
        >
          <span className="material-symbols-outlined text-primary">close</span>
        </button>

        <nav className="flex-1 overflow-y-auto px-sm space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.path)
            return (
              <a
                key={item.path}
                onClick={() => handleNavigate(item.path)}
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
    </>
  )
}
import React from 'react'

export default function TopNavBar({ onToggleSidebar, sidebarOpen }) {
  const [profileOpen, setProfileOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-md py-xs bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline">
      <div className="flex items-center gap-md">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-full hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed">menu</span>
        </button>
        <h1 className="text-headline-sm font-headline-sm font-bold text-primary dark:text-primary-fixed">LPSE Portal</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setProfileOpen((prev) => !prev)}
          className="flex items-center gap-sm p-1 rounded-full hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-lg shadow-lg py-1 z-50">
            <button className="w-full text-left px-md py-sm text-label-md text-on-surface hover:bg-surface-container-low transition-colors">
              Profil
            </button>
            <button className="w-full text-left px-md py-sm text-label-md text-on-surface hover:bg-surface-container-low transition-colors">
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
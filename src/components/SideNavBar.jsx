import React from 'react'

export default function SideNavBar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col pt-24 pb-md z-40 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline">
      
      <nav className="flex-1 px-sm space-y-1">
        <a className="flex items-center gap-sm px-md py-sm cursor-pointer transition-all bg-secondary-container text-on-secondary-container font-semibold rounded-lg font-label-md text-label-md" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          <span>Pengajuan</span>
        </a>
        <a className="flex items-center gap-sm px-md py-sm cursor-pointer transition-all hover:bg-surface-variant dark:hover:bg-surface-container-highest text-on-surface-variant font-label-md text-label-md" href="#">
          <span className="material-symbols-outlined">verified_user</span>
          <span>Cek Status</span>
        </a>
      </nav>
      <div className="px-sm pt-md border-t border-outline-variant">
        <a className="flex items-center gap-sm px-md py-sm cursor-pointer transition-all hover:bg-surface-variant text-on-surface-variant font-label-md text-label-md" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </a>
      </div>
    </aside>
  )
}
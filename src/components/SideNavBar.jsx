import React from 'react'

export default function SideNavBar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col pt-24 pb-md z-40 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline">
      <div className="px-md mb-xl">
        <div className="flex items-center gap-sm p-sm bg-white rounded-xl border border-outline-variant shadow-sm">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-black text-sm">LP</div>
          <div>
            <h2 className="text-label-md font-black text-primary dark:text-primary-fixed leading-tight">LPSE Verifier</h2>
            <p className="text-[10px] text-on-surface-variant font-medium">Official Portal</p>
          </div>
        </div>
      </div>
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
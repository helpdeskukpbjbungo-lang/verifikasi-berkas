import React from 'react'

export default function TopNavBar() {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-md py-xs bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline">
      <div className="flex items-center gap-sm">
        <span className="text-headline-sm font-headline-sm font-bold text-primary dark:text-primary-fixed">LPSE Verifier Portal</span>
      </div>
      
      <div className="flex items-center gap-md">
        <div className="flex items-center gap-xs">
          <button className="p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors cursor-pointer active:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed">notifications</span>
          </button>
        </div>
        <div className="flex items-center gap-sm pl-md border-l border-outline-variant">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-label-md font-bold text-on-surface">Ahmad Verifikator</p>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
        </div>
      </div>
    </header>
  )
}
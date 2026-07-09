'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function PageShell({ children }) {
  const pathname = usePathname();
  const { theme, toggleTheme, toast } = useApp();

  const menuItems = [
    { name: 'Showcase Hub', path: '/', icon: 'dashboard' },
    { name: 'Project Hub', path: '/agent-hub', icon: 'grid_view' },
    { name: 'Hardware Config', path: '/configuration', icon: 'settings_suggest' },
    { name: 'Clearance Desk', path: '/admin-desk', icon: 'point_of_sale' },
    { name: 'Team Settings', path: '/team-settings', icon: 'manage_accounts' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-base text-on-background-base">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-base bg-surface-base/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary text-black rounded-lg flex items-center justify-center font-bold text-xl shadow-md">
            <span className="material-symbols-outlined material-symbols-filled">wb_sunny</span>
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              Stitch <span className="text-primary-container">Solar Agent</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">B2B SaaS Energy Platform</p>
          </div>
        </div>

        {/* Global Nav for Quick Access */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface-container/60 p-1 rounded-lg border border-border-base/50">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold font-display tracking-wide transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary-container border border-primary/20 shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Utilities: Theme Toggle & Mock Toggles */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="flex items-center justify-center rounded-lg h-9 w-9 bg-surface-container border border-border-base text-slate-300 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <span className="material-symbols-outlined text-lg">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User Profile Info Mock */}
          <div className="flex items-center gap-2 pl-3 border-l border-border-base">
            <div className="size-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container text-xs font-bold font-mono">
              SA
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-none">Syed Bilal</span>
              <span className="text-[10px] text-slate-500 font-medium leading-normal">Premium Agent</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-lg border shadow-xl text-sm font-semibold tracking-wide ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-500 text-red-200'
              : 'bg-slate-900/90 border-emerald-500 text-emerald-200'
          }`}>
            <span className="material-symbols-outlined text-lg">
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

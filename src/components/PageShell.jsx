'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function PageShell({ children, headerTitle }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, toast, user, signOut, company, lang, toggleLang, currency, toggleCurrency } = useApp();

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
              Solar Agent
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

        {/* Utilities: Theme Toggle, User Profile & Prominent Logout Button */}
        <div className="flex items-center gap-3">
          
          {/* Currency Toggle */}
          <button 
            onClick={toggleCurrency}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-amber-300 text-xs font-mono font-bold cursor-pointer hover:bg-slate-800"
          >
            {currency} ⇄ {currency === 'PKR' ? 'USD' : 'PKR'}
          </button>

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

          {/* User Profile Info Badge */}
          <div className="flex items-center gap-3 pl-3 border-l border-border-base">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-[#b45309] text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm">
                {user?.initials || 'SA'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-none">{user?.name || 'Syed Bilal'}</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold leading-normal">
                  {user?.role === 'super_admin' ? '👑 Super Admin' : `${company?.plan || 'Silver'} Agent`}
                </span>
              </div>
            </div>

            {/* PROMINENT LOGOUT BUTTON */}
            <button 
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer border border-red-500"
              title="Log Out from Portal"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Logout</span>
            </button>
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

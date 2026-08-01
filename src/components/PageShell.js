'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function PageShell({ children, headerTitle }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    theme, 
    toggleTheme, 
    lang, 
    toggleLang, 
    company, 
    toast,
    user,
    signOut,
    viewMode,
    setViewMode,
    currency,
    toggleCurrency,
    updateCompanyLogo
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const avatarInputRef = useRef(null);

  // Route Protection Guard
  useEffect(() => {
    if (!user && pathname !== '/login' && pathname !== '/activate-account' && pathname !== '/forgot-password' && pathname !== '/reset-password') {
      router.push('/login');
    }
  }, [user, pathname, router]);

  const handleAvatarClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target.result) {
        updateCompanyLogo(evt.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const workspaceMenuItems = [
    { label: 'Showcase Hub', urLabel: 'شوکیس ہب', path: '/', icon: 'space_dashboard' },
    { label: 'Project Hub', urLabel: 'پراجیکٹ ہب', path: '/agent-hub', icon: 'folder_open' },
    { label: 'Hardware Config', urLabel: 'ہارڈویئر کنفیگریشن', path: '/configuration', icon: 'settings_suggest' },
    { label: 'Clearance Desk', urLabel: 'کلیئرنس ڈیسک', path: '/customer-view', icon: 'present_to_all' },
    { label: 'Team Settings', urLabel: 'ٹیم سیٹنگز', path: '/team-settings', icon: 'manage_accounts' }
  ];

  const adminMenuItems = [
    { label: 'Governance Desk', urLabel: 'گورننس ڈیسک', path: '/admin-desk', icon: 'shield_person' },
    { label: 'Showcase Hub', urLabel: 'شوکیس ہب', path: '/', icon: 'space_dashboard' },
    { label: 'Hardware Config', urLabel: 'ہارڈویئر کنفیگریشن', path: '/configuration', icon: 'settings_suggest' }
  ];

  const menuItems = user?.role === 'super_admin' ? adminMenuItems : workspaceMenuItems;

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'dark bg-[#0e1013] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#181a1d]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 flex items-center justify-center font-black shadow-md">
              <span className="material-symbols-outlined text-xl">solar_power</span>
            </div>
            <span className="font-display font-black text-base tracking-wider text-slate-900 dark:text-white">
              SOLAR AGENT
            </span>
          </Link>

          <span className="hidden sm:inline text-xs font-mono text-slate-400">|</span>

          <span className="hidden sm:inline font-display font-extrabold text-xs text-slate-600 dark:text-slate-300">
            {headerTitle || 'B2B Distributor Engineering Platform'}
          </span>
        </div>

        {/* Action Controls & Profile Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleCurrency}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm text-emerald-500">payments</span>
            <span>{currency}</span>
          </button>

          <button
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm text-teal-500">translate</span>
            <span>{lang === 'en' ? 'UR' : 'EN'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                {company.logo_url || user.logo_url ? (
                  <img src={company.logo_url || user.logo_url} alt="Logo" className="size-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
                ) : (
                  <div className="size-9 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center border border-slate-700">
                    {user.initials || 'SO'}
                  </div>
                )}
                <input type="file" ref={avatarInputRef} onChange={handleAvatarFileChange} accept="image/*" className="hidden" />
              </div>

              <div className="hidden md:block text-left text-xs font-mono">
                <strong className="block text-slate-900 dark:text-white font-extrabold font-sans text-xs truncate max-w-[140px]">{user.company_name || user.name}</strong>
                <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
              </div>

              <button
                onClick={signOut}
                title="Sign Out"
                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex min-h-[calc(100vh-57px)]">
        
        {/* Left Navigation Sidebar */}
        <aside className="hidden md:block w-64 bg-white dark:bg-[#141619] border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 flex-shrink-0">
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest px-3 block mb-2">
              Workspace Navigation
            </span>
            {menuItems.map(item => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-display font-extrabold text-xs transition-all ${
                    active 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span>{lang === 'ur' ? item.urLabel : item.label}</span>
                </Link>
              );
            })}
          </div>

          {user?.role === 'super_admin' && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs font-mono space-y-1 text-amber-300">
              <span className="font-bold font-sans block">👑 Super Admin Governance</span>
              <span className="text-[11px] text-amber-400/80 block">Logged in with full governance override privileges</span>
            </div>
          )}
        </aside>

        {/* Page Main Content Workspace */}
        <div className="flex-grow max-w-full overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

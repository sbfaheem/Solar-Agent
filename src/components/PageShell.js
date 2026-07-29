'use client';

import React, { useEffect, useState } from 'react';
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
    currency,
    toggleCurrency,
    toast, 
    company, 
    getActiveLimit, 
    user, 
    signOut, 
    viewMode, 
    setViewMode 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Protected route block render guard
  if (!user && pathname !== '/login' && pathname !== '/customer-view') {
    return null; 
  }

  // Automatic path-to-view sync
  useEffect(() => {
    if (pathname === '/admin-desk') {
      setViewMode('admin');
    } else if (pathname !== '/login' && pathname !== '/customer-view') {
      setViewMode('workspace');
    }
  }, [pathname]);

  // Sidebar Menu Configs matching screenshot design
  const workspaceMenuItems = [
    { label: 'Dashboard', urLabel: 'ڈیش بورڈ', path: '/', icon: 'grid_view' },
    { label: 'Companies', urLabel: 'کمپنیاں', path: '/agent-hub', icon: 'domain' },
    { label: 'Payments', urLabel: 'ادائیگیاں', path: '/team-settings', icon: 'payments' },
    { label: 'Proposals', urLabel: 'پروپوزلز', path: '/configuration', icon: 'description' },
    { label: 'Tier Settings', urLabel: 'ٹیر سیٹنگز', path: '/admin-desk', icon: 'tune' },
    { label: 'Usage', urLabel: 'یوسیج', path: '/customer-view', icon: 'monitoring' },
  ];

  const adminMenuItems = [
    { label: 'Dashboard', urLabel: 'ڈیش بورڈ', path: '/admin-desk', icon: 'grid_view' },
    { label: 'Companies', urLabel: 'کمپنیاں', path: '/agent-hub', icon: 'domain' },
    { label: 'Payments', urLabel: 'ادائیگیاں', path: '/team-settings', icon: 'payments' },
    { label: 'Tier Settings', urLabel: 'ٹیر سیٹنگز', path: '/admin-desk', icon: 'tune' },
    { label: 'Logs', urLabel: 'لاگز', path: '/admin-desk', icon: 'history' },
    { label: 'Workspace Home', urLabel: 'ورک اسپیس ہوم', path: '/', icon: 'home' }
  ];

  const activeMenuItems = viewMode === 'admin' ? adminMenuItems : workspaceMenuItems;
  const activeLimit = getActiveLimit();

  const getTierBadgeText = () => {
    if (viewMode === 'admin') return 'SUPER ADMIN';
    if (company.plan === 'Silver') return 'SILVER AGENT';
    if (company.plan === 'Gold') return 'GOLD AGENT';
    return 'COMPANY ADMIN'; 
  };

  const getInitials = (name) => {
    if (!name) return 'SA';
    return name.split(' ').map(w => w[0]).join('').toUpperCase();
  };

  // Title calculation for header
  const getPageTitle = () => {
    if (headerTitle) return headerTitle;
    if (pathname === '/team-settings') return 'Subscription Payment';
    if (pathname === '/admin-desk') return 'Super Admin Overview';
    if (pathname === '/agent-hub') return 'Companies Workspace';
    if (pathname === '/configuration') return 'Solar Proposals Engineering';
    if (pathname === '/customer-view') return 'Live Presentation View';
    return 'Dashboard Workspace';
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col ${
      theme === 'dark' 
        ? 'bg-[#0f1113] text-[#e2e2e6]' 
        : 'bg-[#f8fafc] text-[#1e293b]'
    }`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      
      {/* Toast Alert Overlay */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border shadow-2xl flex items-center gap-3 animate-bounce font-medium text-xs ${
          toast.type === 'error' 
            ? 'bg-red-900/90 border-red-500/50 text-red-100' 
            : 'bg-[#b45309] border-amber-400/50 text-white'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row flex-1 min-h-screen">
        
        {/* Left Sidebar Navigation matching screenshot */}
        <aside className={`w-full lg:w-64 flex-shrink-0 flex flex-col justify-between p-5 border-b lg:border-b-0 ${
          theme === 'dark'
            ? 'bg-[#181a1d] border-[#2d3137]'
            : 'bg-white border-[#e2e8f0]'
        } ${lang === 'ur' ? 'lg:border-l' : 'lg:border-r'}`}>
          
          <div className="space-y-6">
            {/* Top Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="size-10 rounded-xl bg-[#ca8a04] text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">solar_power</span>
              </div>
              <div>
                <div className={`font-display font-extrabold text-lg tracking-tight leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-[#854d0e]'
                }`}>
                  Solar Agent
                </div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
                  ENGINEERING PRECISION
                </div>
              </div>
            </Link>

            {/* Nav Menu Items */}
            <nav className="space-y-1">
              {activeMenuItems.map((item) => {
                const active = pathname === item.path;
                return (
                  <Link 
                    key={item.label} 
                    href={item.path}
                    onClick={() => {
                      if (item.path === '/') setViewMode('workspace');
                    }}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                      active 
                        ? theme === 'dark'
                          ? 'bg-[#ca8a04]/15 text-[#facc15] font-bold border-r-4 border-[#ca8a04]'
                          : 'bg-[#fefce8] text-[#854d0e] font-bold border-r-4 border-[#ca8a04]'
                        : theme === 'dark'
                          ? 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                          : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-lg ${active ? 'text-[#ca8a04]' : 'text-slate-400'}`}>
                        {item.icon}
                      </span>
                      <span>{lang === 'ur' ? item.urLabel : item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Action Button */}
          <div className="pt-6 space-y-3">
            <button 
              onClick={() => router.push('/configuration')}
              className="w-full py-3 px-4 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs shadow-md shadow-amber-900/10 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>New Solar Calculation</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Header Bar matching screenshot */}
          <header className={`h-16 px-6 border-b flex items-center justify-between sticky top-0 z-30 ${
            theme === 'dark'
              ? 'bg-[#181a1d]/90 border-[#2d3137] backdrop-blur-md'
              : 'bg-white/90 border-[#e2e8f0] backdrop-blur-md'
          }`}>
            
            {/* Title / Search Bar */}
            <div className="flex items-center gap-4 flex-1 max-w-md">
              {viewMode === 'admin' ? (
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search companies..." 
                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-[#0f1113] border-[#3f474f] text-white focus:border-[#ca8a04]'
                        : 'bg-[#f8fafc] border-[#cbd5e1] text-slate-800 focus:border-[#b45309]'
                    }`}
                  />
                </div>
              ) : (
                <h1 className={`font-display text-lg font-extrabold tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-[#0f172a]'
                }`}>
                  {getPageTitle()}
                </h1>
              )}
            </div>

            {/* Utility Controls */}
            <div className="flex items-center gap-3">
              
              {/* PKR/USD Currency Toggle */}
              <button 
                onClick={toggleCurrency}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-[#282a2d] border-[#3f474f] text-amber-300 hover:bg-white/10'
                    : 'bg-[#fefce8] border-[#fef08a] text-[#854d0e] hover:bg-[#fef9c3]'
                }`}
                title="Toggle Currency"
              >
                <span className="material-symbols-outlined text-sm">currency_exchange</span>
                <span className="font-mono font-bold text-[11px]">{currency} ⇄ {currency === 'PKR' ? 'USD' : 'PKR'}</span>
              </button>

              {/* Language Switcher */}
              <button 
                onClick={toggleLang}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-[#282a2d] border-[#3f474f] text-slate-300 hover:bg-white/10'
                    : 'bg-[#f8fafc] border-[#cbd5e1] text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">translate</span>
                <span>{lang === 'en' ? 'English/Urdu' : 'اردو/English'}</span>
              </button>

              {/* Notification Bell Icon */}
              <button 
                className={`size-9 rounded-xl border flex items-center justify-center relative cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-[#282a2d] border-[#3f474f] text-slate-300 hover:text-white'
                    : 'bg-[#f8fafc] border-[#cbd5e1] text-slate-600 hover:text-slate-900'
                }`}
                title="Notifications"
              >
                <span className="material-symbols-outlined text-sm">notifications</span>
                <span className="size-2 rounded-full bg-red-500 absolute top-2 right-2 animate-pulse"></span>
              </button>

              {/* Theme Switcher */}
              <button 
                onClick={toggleTheme}
                className={`size-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-[#282a2d] border-[#3f474f] text-amber-300'
                    : 'bg-[#f8fafc] border-[#cbd5e1] text-slate-600'
                }`}
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined text-sm">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* User Profile Pill Block */}
              {user && (
                <div className={`flex items-center gap-3 pl-3 pr-2 py-1 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-[#282a2d] border-[#3f474f]'
                    : 'bg-[#f8fafc] border-[#cbd5e1]'
                }`}>
                  <div className="text-right hidden sm:block">
                    <div className={`font-display font-bold text-xs leading-none ${
                      theme === 'dark' ? 'text-white' : 'text-[#0f172a]'
                    }`}>
                      {user.name}
                    </div>
                    <div className="text-[#94a3b8] text-[9px] font-mono font-bold leading-none mt-1 uppercase">
                      {getTierBadgeText()}
                    </div>
                  </div>

                  <div className="size-8 rounded-full bg-[#ca8a04] text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm">
                    {user.initials || getInitials(user.name)}
                  </div>

                  <button 
                    onClick={signOut}
                    className="size-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                    title="Log Out"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                  </button>
                </div>
              )}

            </div>
          </header>

          {/* Main Dashboard Workspace Viewport */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

        </div>
      </div>

    </div>
  );
}

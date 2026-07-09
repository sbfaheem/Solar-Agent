'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function PageShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, lang, toggleLang, toast, company, getActiveLimit, user, signOut } = useApp();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Protected route block render guard
  if (!user && pathname !== '/login' && pathname !== '/customer-view') {
    return null; 
  }

  const menuItems = [
    { label: 'Workspace Hub', urLabel: 'مین پینل', path: '/', icon: 'dashboard' },
    { label: 'Project Hub', urLabel: 'پراجیکٹ ہب', path: '/agent-hub', icon: 'leaderboard' },
    { label: 'Specs Matcher', urLabel: 'ہارڈویئر میچر', path: '/configuration', icon: 'solar_power' },
    { label: 'Clearance CMS', urLabel: 'ایڈمن ڈیسک', path: '/admin-desk', icon: 'gavel' },
    { label: 'Billing Portal', urLabel: 'بلنگ اور ٹیم', path: '/team-settings', icon: 'payments' },
    { label: 'Customer View', urLabel: 'گاہک لائیو ویو', path: '/customer-view', icon: 'co_present' },
  ];

  const activeLimit = getActiveLimit();

  const getTierBadgeText = () => {
    if (company.plan === 'Silver') return 'Silver Agent';
    if (company.plan === 'Gold') return 'Gold Agent';
    return 'Premium Agent'; 
  };

  const getInitials = (name) => {
    if (!name) return 'SA';
    return name.split(' ').map(w => w[0]).join('').toUpperCase();
  };

  return (
    <div className={`min-h-screen bg-[#0b0c10] text-[#e2e2e6] font-sans flex flex-col`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Toast Alert overlay */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg border shadow-xl flex items-center gap-2 animate-bounce ${
          toast.type === 'error' 
            ? 'bg-red-950/90 border-red-500/30 text-red-200' 
            : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Corporate header banner */}
      <header className="bg-surface-base border-b border-border-base/70 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo brand */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="size-8 rounded-lg bg-primary text-black flex items-center justify-center font-bold text-base">
              <span className="material-symbols-outlined">solar_power</span>
            </span>
            <span className="font-display font-extrabold text-white text-base tracking-tight">
              Solar Agent <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary-container px-1.5 py-0.5 rounded font-mono font-bold uppercase ml-1">B2B SaaS</span>
            </span>
          </Link>

          {/* Quick Subscription Summary Tracker */}
          <div className="hidden lg:flex items-center gap-3 bg-black/30 border border-border-base px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-500">Plan Quota:</span>
            <span className="text-white font-bold">{company.proposals_generated} / {activeLimit}</span>
            <span className={`size-2 rounded-full ${company.billing_status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
          </div>

          {/* Toolbar utilities */}
          <div className="flex items-center gap-4">
            {/* LTR/RTL Language Switch */}
            <button 
              onClick={toggleLang}
              className="size-9 rounded-lg bg-surface-container hover:bg-white/5 border border-border-base/70 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Toggle Language (English / Urdu)"
            >
              <span className="material-symbols-outlined text-sm">translate</span>
            </button>

            {/* Theme switcher */}
            <button 
              onClick={toggleTheme}
              className="size-9 rounded-lg bg-surface-container hover:bg-white/5 border border-border-base/70 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Toggle Theme"
            >
              <span className="material-symbols-outlined text-sm">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Global User Profile Identity Card Block (Header Integrated for Instant Access) */}
            {user && (
              <div className="relative">
                <div 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-all ${
                    lang === 'ur' ? 'flex-row-reverse text-right' : 'text-left'
                  }`}
                >
                  {/* Dynamic Initials Avatar with premium dark gold outline */}
                  <div className="size-9 rounded-full border-2 border-primary-container text-primary-container flex items-center justify-center font-bold text-xs bg-primary-container/10 font-mono shadow-[0_0_10px_rgba(253,184,19,0.15)]">
                    {user.initials || getInitials(user.name)}
                  </div>
                  
                  {/* User Details */}
                  <div className="hidden sm:block">
                    <div className="font-display font-bold text-white text-xs leading-none">{user.name}</div>
                    <div className="text-slate-400 text-[10px] leading-none mt-1">{getTierBadgeText()}</div>
                  </div>

                  <span className="material-symbols-outlined text-slate-500 text-xs">
                    {profileMenuOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  </span>
                </div>

                {/* Floating Dropdown Menu Card (Floats downward from header) */}
                {profileMenuOpen && (
                  <div className={`absolute top-12 mt-2 z-50 w-48 bg-surface-container-high border border-border-base rounded-xl shadow-2xl p-2 animate-fadeIn ${
                    lang === 'ur' ? 'left-0 text-right' : 'right-0 text-left'
                  }`}>
                    <button 
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        router.push('/team-settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all text-left rtl:text-right cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">settings</span>
                      <span>Account Settings</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all text-left rtl:text-right cursor-pointer border-t border-border-base/30 mt-1"
                    >
                      <span className="material-symbols-outlined text-sm text-red-400">logout</span>
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Navigation Sidebar Panel */}
        <aside className={`w-full lg:w-64 bg-surface-base border-b lg:border-b-0 border-border-base/70 p-4 space-y-2 lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 ${
          lang === 'ur' ? 'lg:border-l' : 'lg:border-r'
        }`}>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold font-display cursor-pointer transition-all ${
                    active 
                      ? 'bg-primary text-black' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                  <span>{lang === 'ur' ? item.urLabel : item.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="pt-4 border-t border-border-base/40 lg:hidden flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">{company.name} ({company.plan} Tier)</span>
            <span className="text-white font-bold">{company.proposals_generated} / {activeLimit}</span>
          </div>
        </aside>

        {/* Dashboard workspace content area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0f14]">
          {children}
        </div>
      </div>
    </div>
  );
}

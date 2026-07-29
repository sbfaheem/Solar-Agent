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
    distributors,
    getActiveLimit, 
    user, 
    signInDistributor,
    signInSuperAdmin,
    signOut, 
    viewMode, 
    setViewMode 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  if (!user && pathname !== '/login' && pathname !== '/customer-view') {
    return null; 
  }

  useEffect(() => {
    if (pathname === '/admin-desk') {
      setViewMode('admin');
    } else if (pathname !== '/login' && pathname !== '/customer-view') {
      setViewMode('workspace');
    }
  }, [pathname]);

  const workspaceMenuItems = [
    { label: 'Dashboard', urLabel: 'ڈیش بورڈ', path: '/', icon: 'grid_view' },
    { label: 'Client Projects', urLabel: 'کلائنٹ پراجیکٹس', path: '/agent-hub', icon: 'domain' },
    { label: 'Payments & Billing', urLabel: 'ادائیگیاں', path: '/team-settings', icon: 'payments' },
    { label: 'Solar Engineering', urLabel: 'انجینئرنگ', path: '/configuration', icon: 'description' },
    { label: 'Live Presentation', urLabel: 'لائیو پیشکش', path: '/customer-view', icon: 'monitoring' },
  ];

  const adminMenuItems = [
    { label: 'Governance Desk', urLabel: 'گورننس ڈیسک', path: '/admin-desk', icon: 'shield_person' },
    { label: 'Distributor Hub', urLabel: 'ڈسٹری بیوٹرز', path: '/agent-hub', icon: 'domain' },
    { label: 'Payment Ledger', urLabel: 'لیجر', path: '/admin-desk', icon: 'payments' },
    { label: 'Tier Verification', urLabel: 'ٹیر سیکیورٹی', path: '/admin-desk', icon: 'verified' },
    { label: 'Workspace View', urLabel: 'ورک اسپیس ویو', path: '/', icon: 'home' }
  ];

  const activeMenuItems = (user?.role === 'super_admin' || viewMode === 'admin') ? adminMenuItems : workspaceMenuItems;
  const activeLimit = getActiveLimit();

  const getTierBadgeText = () => {
    if (user?.role === 'super_admin' || viewMode === 'admin') return '👑 SUPER ADMIN';
    return `DISTRIBUTOR (${company.plan || 'Silver'})`;
  };

  const getInitials = (name) => {
    if (!name) return 'SA';
    return name.split(' ').map(w => w[0]).join('').toUpperCase();
  };

  const getPageTitle = () => {
    if (headerTitle) return headerTitle;
    if (pathname === '/team-settings') return 'Distributor Subscription Payment & Billing';
    if (pathname === '/admin-desk') return 'Super Admin Verification & Governance Desk';
    if (pathname === '/agent-hub') return 'Distributor Client Projects Hub';
    if (pathname === '/configuration') return 'Solar Proposals Engineering';
    if (pathname === '/customer-view') return 'Live Presentation View';
    return 'Distributor Dashboard Workspace';
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
        
        {/* Left Sidebar Navigation */}
        <aside className={`w-full lg:w-64 flex-shrink-0 flex flex-col justify-between p-5 border-b lg:border-b-0 ${
          theme === 'dark'
            ? 'bg-[#181a1d] border-[#2d3137]'
            : 'bg-white border-[#e2e8f0]'
        } ${lang === 'ur' ? 'lg:border-l' : 'lg:border-r'}`}>
          
          <div className="space-y-6">
            {/* Top Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <span className="size-9 rounded-xl bg-[#b45309] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">solar_power</span>
              </span>
              <div>
                <span className={`font-display font-extrabold text-base tracking-tight block ${
                  theme === 'dark' ? 'text-white' : 'text-[#0f172a]'
                }`}>
                  Solar Agent
                </span>
                <span className="text-[10px] text-[#94a3b8] font-mono block">
                  {user?.role === 'super_admin' ? 'Super Admin Portal' : 'Distributor SaaS'}
                </span>
              </div>
            </Link>

            {/* Sidebar Dual-Role Toggle */}
            <div className="bg-slate-100 dark:bg-[#0f1113] p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1 text-xs font-bold font-display">
              <button 
                type="button"
                onClick={() => { setViewMode('workspace'); router.push('/'); }}
                className={`w-full py-1.5 px-3 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                  viewMode === 'workspace' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-sm">domain</span>
                <span>Distributor Portal</span>
              </button>
              <button 
                type="button"
                onClick={() => { setViewMode('admin'); router.push('/admin-desk'); }}
                className={`w-full py-1.5 px-3 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                  viewMode === 'admin' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-sm">shield_person</span>
                <span>Super Admin Desk</span>
              </button>
            </div>

            {/* Role Badge Indicator */}
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
              user?.role === 'super_admin'
                ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-base">
                  {user?.role === 'super_admin' ? 'shield_person' : 'domain'}
                </span>
                <span className="font-bold truncate">{user?.company_name || 'Distributor Portal'}</span>
              </div>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#b45309] text-white">
                {company.plan || 'Silver'}
              </span>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1">
              {activeMenuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-display font-extrabold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#b45309] text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                          : 'text-[#64748b] hover:text-[#0f172a] hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span>{lang === 'ur' ? item.urLabel : item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3 mt-6">
            {/* Bottom Quota Progress Meter */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              theme === 'dark' ? 'bg-[#0f1113] border-[#2d3137]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94a3b8] font-medium text-[10px] uppercase font-mono">Monthly Quota</span>
                <span className="font-mono font-bold text-[#b45309] text-[11px]">
                  {company.proposals_generated || 0} / {activeLimit}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    (company.proposals_generated || 0) >= activeLimit ? 'bg-red-500' : 'bg-[#b45309]'
                  }`}
                  style={{ width: `${Math.min(100, ((company.proposals_generated || 0) / activeLimit) * 100)}%` }}
                ></div>
              </div>
              <Link 
                href="/team-settings" 
                className="text-[10px] font-bold text-[#b45309] hover:underline block text-center mt-1"
              >
                + Upgrade Distributor Quota
              </Link>
            </div>

            {/* Sidebar Logout Button */}
            <button 
              onClick={signOut}
              className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-display font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Logout from Portal</span>
            </button>
          </div>

        </aside>

        {/* Right Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Navigation Header */}
          <header className={`px-6 py-4 border-b flex items-center justify-between gap-4 ${
            theme === 'dark' ? 'bg-[#181a1d] border-[#2d3137]' : 'bg-white border-[#e2e8f0]'
          }`}>
            
            {/* Left Header Title / Search */}
            <div className="flex items-center gap-4 flex-1">
              {pathname === '/agent-hub' ? (
                <div className="relative max-w-xs w-full">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search distributor proposals..." 
                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-[#0f1113] border-[#3f474f] text-white focus:border-[#b45309]'
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

            {/* Utility Controls & Distributor Account Selector */}
            <div className="flex items-center gap-3">

              {/* Distributor Account Switcher Dropdown */}
              <div className="hidden sm:block">
                <select 
                  value={user?.email || 'bilalfaheem47@gmail.com'}
                  onChange={(e) => {
                    if (e.target.value === 'superadmin@solaragent.pk') {
                      signInSuperAdmin(e.target.value, 'demo');
                    } else {
                      signInDistributor(e.target.value, 'demo');
                    }
                  }}
                  className="bg-slate-100 dark:bg-[#282a2d] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white px-3 py-1.5 rounded-xl text-xs font-bold font-mono cursor-pointer"
                >
                  <option value="kpkvolt@solaragent.pk">⚡ KPK Volt Tech (Silver - 35/35 Limit)</option>
                  <option value="info@indussolar.pk">⚡ Indus Solar Systems (Platinum - 450/500)</option>
                  <option value="sales@punjabenergy.pk">⚡ Punjab Energy EPC (Gold - 120/250)</option>
                  <option value="superadmin@solaragent.pk">👑 Super Admin Governance</option>
                </select>
              </div>

              {/* Currency Toggle */}
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
                <span>{lang === 'en' ? 'English' : 'اردو'}</span>
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

              {/* User Profile Pill & Prominent Logout Button */}
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

                  <div className="size-8 rounded-full bg-[#b45309] text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm">
                    {user.initials || getInitials(user.name)}
                  </div>

                  <button 
                    onClick={signOut}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-display font-extrabold text-xs shadow-sm cursor-pointer border border-red-500 transition-all"
                    title="Log Out from Portal"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}

            </div>
          </header>

          {/* Main Viewport */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

        </div>
      </div>

    </div>
  );
}

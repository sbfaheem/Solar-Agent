'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const { 
    signInDistributor, 
    signInSuperAdmin, 
    signInWithGoogle, 
    signUpDistributor, 
    lang, 
    toggleLang, 
    showToast 
  } = useApp();

  const [portalMode, setPortalMode] = useState('distributor'); // 'distributor' or 'admin'
  const [authTab, setAuthTab] = useState('signin'); // 'signin' or 'register'

  // Sign In State
  const [email, setEmail] = useState('bilalfaheem47@gmail.com');
  const [password, setPassword] = useState('••••••••');

  // Registration State
  const [regCompany, setRegCompany] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPlan, setRegPlan] = useState('Silver');

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email) {
      showToast("⚠️ Please enter a valid email address", "error");
      return;
    }
    if (portalMode === 'admin') {
      signInSuperAdmin(email, password);
    } else {
      signInDistributor(email, password);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regCompany || !regEmail) {
      showToast("⚠️ Please enter Company Name and Work Email", "error");
      return;
    }
    signUpDistributor({
      companyName: regCompany,
      name: regName || regCompany,
      email: regEmail,
      password: regPassword,
      plan: regPlan
    });
  };

  const handleQuickDemo = (demoEmail, role = 'distributor') => {
    setEmail(demoEmail);
    if (role === 'super_admin') {
      setPortalMode('admin');
      signInSuperAdmin(demoEmail, 'demo-pass');
    } else {
      setPortalMode('distributor');
      signInDistributor(demoEmail, 'demo-pass');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e2e2e6] flex flex-col justify-between p-4 sm:p-6" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      
      {/* Top Header & Portal Selector */}
      <header className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto w-full gap-4">
        <div className="flex items-center gap-3">
          <span className="size-9 rounded-xl bg-[#b45309] text-white flex items-center justify-center font-bold text-lg shadow-md">
            <span className="material-symbols-outlined">solar_power</span>
          </span>
          <div>
            <span className="font-display font-extrabold text-white text-lg block">Solar Agent</span>
            <span className="text-[10px] text-slate-400 font-mono">B2B Solar SaaS & Engineering Platform</span>
          </div>
        </div>

        {/* Portal Switcher Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1 text-xs font-bold font-display">
            <button 
              type="button"
              onClick={() => { setPortalMode('distributor'); setAuthTab('signin'); }}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                portalMode === 'distributor' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">domain</span>
              <span>Distributor Portal</span>
            </button>

            <button 
              type="button"
              onClick={() => { setPortalMode('admin'); setEmail('superadmin@solaragent.pk'); }}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                portalMode === 'admin' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">shield_person</span>
              <span>Super Admin Portal</span>
            </button>
          </div>

          <button 
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
          >
            {lang === 'en' ? 'اردو' : 'English'}
          </button>
        </div>
      </header>

      {/* Main Card */}
      <main className="my-auto max-w-lg mx-auto w-full bg-[#161920] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* DISTRIBUTOR PORTAL AUTHENTICATION */}
        {portalMode === 'distributor' ? (
          <div className="space-y-6">
            
            {/* Header & Mode Switcher */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="font-display font-extrabold text-white text-xl">Distributor Partner Portal</h2>
                <p className="text-slate-400 text-xs mt-0.5">Isolated EPC workspace & proposal management</p>
              </div>

              {/* Sign In vs Register Tabs */}
              <div className="flex bg-black/40 p-1 rounded-xl border border-slate-800 text-xs font-bold font-display">
                <button 
                  onClick={() => setAuthTab('signin')}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                    authTab === 'signin' ? 'bg-[#b45309] text-white' : 'text-slate-400'
                  }`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setAuthTab('register')}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                    authTab === 'register' ? 'bg-[#b45309] text-white' : 'text-slate-400'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* TAB 1: SIGN IN */}
            {authTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                
                {/* Google Sign-In Option */}
                <button 
                  type="button"
                  onClick={() => signInWithGoogle('distributor')}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-display font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-slate-200"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Sign In with Google</span>
                </button>

                <div className="flex items-center gap-3 my-2">
                  <div className="h-px bg-slate-800 flex-1"></div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">or work email</span>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Distributor Email Address
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. info@indussolar.pk"
                    className="w-full px-3.5 py-2.5 text-xs bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-white font-mono focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Account Password
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-white font-mono focus:outline-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold transition-all cursor-pointer shadow-md text-xs text-center flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">lock_open</span>
                  <span>Unlock Distributor Workspace</span>
                </button>
              </form>
            )}

            {/* TAB 2: CREATE AN ACCOUNT */}
            {authTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Company / EPC Firm Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Lahore Solar Tech"
                    value={regCompany}
                    onChange={e => setRegCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-white font-mono focus:outline-none text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Syed Bilal"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-white font-mono focus:outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Work Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="info@lahoresolar.pk"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-white font-mono focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Set Password</label>
                    <input 
                      type="password" 
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-white font-mono focus:outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Select Starter Tier</label>
                    <select 
                      value={regPlan}
                      onChange={e => setRegPlan(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-amber-400 font-mono font-bold focus:outline-none text-xs cursor-pointer"
                    >
                      <option value="Silver">Silver Plan (35 Quotes/mo)</option>
                      <option value="Gold">Gold Plan (60 Quotes/mo)</option>
                      <option value="Platinum">Platinum (100 Quotes/mo)</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold transition-all cursor-pointer shadow-md text-xs text-center flex items-center justify-center gap-2 mt-2"
                >
                  <span className="material-symbols-outlined text-sm">how_to_reg</span>
                  <span>Create Distributor Portal Account</span>
                </button>
              </form>
            )}

            {/* Quick Demo Distributor Accounts */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Quick Demo Distributor Portals</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button 
                  type="button"
                  onClick={() => handleQuickDemo('info@indussolar.pk')}
                  className="p-2 rounded-lg bg-black/40 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 hover:text-white transition-all cursor-pointer truncate"
                >
                  <span className="font-bold text-[#b45309] block text-[10px]">INDUS SOLAR</span>
                  <span>info@indussolar.pk</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleQuickDemo('kpkvolt@solaragent.pk')}
                  className="p-2 rounded-lg bg-black/40 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 hover:text-white transition-all cursor-pointer truncate"
                >
                  <span className="font-bold text-purple-400 block text-[10px]">KPK VOLT TECH</span>
                  <span>kpkvolt@solaragent.pk</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* SUPER ADMIN GOVERNANCE LOGIN PORTAL */
          <div className="space-y-6">
            <div className="border-b border-amber-800/40 pb-4 text-center space-y-1">
              <span className="size-10 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold mx-auto shadow-md">
                <span className="material-symbols-outlined text-xl">shield_person</span>
              </span>
              <h2 className="font-display font-extrabold text-amber-300 text-xl">Super Admin Governance Desk</h2>
              <p className="text-slate-400 text-xs">Full system oversight, distributor approval & ledger management</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Super Admin Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-black/60 border border-amber-700/60 focus:border-amber-400 rounded-xl text-amber-200 font-mono font-bold focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Governance Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-black/60 border border-amber-700/60 focus:border-amber-400 rounded-xl text-amber-200 font-mono font-bold focus:outline-none"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-900 font-display font-extrabold transition-all cursor-pointer shadow-lg text-xs text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>Unlock Super Admin Governance Desk</span>
              </button>
            </form>

            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-300 text-center font-mono">
              👑 Super Admin has global rights to view all registered distributors, verify receipts, and manage catalog settings.
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-600 font-mono max-w-7xl mx-auto w-full pt-4">
        © 2026 Solar Agent | B2B Solar SaaS Platform. Multi-Tenant Role Security Active.
      </footer>

    </div>
  );
}

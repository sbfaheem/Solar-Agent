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
  const [selectedDistributorAccount, setSelectedDistributorAccount] = useState('REGISTER_NEW'); // 'REGISTER_NEW', 'kpkvolt@solaragent.pk', etc.

  // Sign In Form State
  const [email, setEmail] = useState('kpkvolt@solaragent.pk');
  const [password, setPassword] = useState('••••••••');

  // Dynamic Distributor Registration Form State
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regCity, setRegCity] = useState('Peshawar');
  const [regPlan, setRegPlan] = useState('Silver');

  const handleDropdownSelect = (val) => {
    setSelectedDistributorAccount(val);
    if (val === 'REGISTER_NEW') {
      setEmail('');
    } else {
      setEmail(val);
    }
  };

  const handleSubmitDistributor = (e) => {
    e.preventDefault();
    if (selectedDistributorAccount === 'REGISTER_NEW') {
      if (!regCompany || !regEmail) {
        showToast("⚠️ Please enter Company Name and Work Email", "error");
        return;
      }
      signUpDistributor({
        companyName: regCompany,
        name: regCompany,
        email: regEmail,
        password: password || 'pass123',
        plan: regPlan,
        contact: regContact,
        city: regCity
      });
    } else {
      if (!email) {
        showToast("⚠️ Please enter a valid email address", "error");
        return;
      }
      signInDistributor(email, password);
    }
  };

  const handleAdminSignIn = (e) => {
    e.preventDefault();
    signInSuperAdmin(email, password);
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
              onClick={() => { setPortalMode('distributor'); setSelectedDistributorAccount('REGISTER_NEW'); }}
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
        
        {/* DISTRIBUTOR PORTAL AUTHENTICATION & DYNAMIC REGISTRATION */}
        {portalMode === 'distributor' ? (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="border-b border-slate-800 pb-4 space-y-1">
              <h2 className="font-display font-extrabold text-white text-xl">Distributor Partner Authorization</h2>
              <p className="text-slate-400 text-xs">Select an authorized distributor account or register a new EPC firm</p>
            </div>

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
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">or select distributor account</span>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            <form onSubmit={handleSubmitDistributor} className="space-y-4">
              
              {/* DISTRIBUTOR SELECT DROPDOWN (WITH ➕ REGISTER NEW DISTRIBUTOR AT TOP) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block font-sans">
                  Select Authorized Distributor Account
                </label>
                <select 
                  value={selectedDistributorAccount}
                  onChange={(e) => handleDropdownSelect(e.target.value)}
                  className="w-full px-3.5 py-3 text-xs bg-black/60 border border-[#b45309] rounded-xl text-amber-200 font-mono font-bold focus:outline-none cursor-pointer"
                >
                  <option value="REGISTER_NEW">➕ Register New Distributor...</option>
                  <option value="kpkvolt@solaragent.pk">⚡ KPK Volt Tech (kpkvolt@solaragent.pk - Silver Tier)</option>
                  <option value="info@indussolar.pk">⚡ Indus Solar Systems (info@indussolar.pk - Platinum Tier)</option>
                  <option value="sales@punjabenergy.pk">⚡ Punjab Energy EPC (sales@punjabenergy.pk - Gold Tier)</option>
                </select>
              </div>

              {/* DYNAMIC REGISTRATION FIELDS (REVEALED WHEN REGISTER NEW DISTRIBUTOR IS SELECTED) */}
              {selectedDistributorAccount === 'REGISTER_NEW' ? (
                <div className="space-y-4 bg-[#0f1115] p-4 rounded-2xl border border-slate-800 animate-fadeIn text-xs font-mono">
                  <div className="text-xs font-extrabold text-amber-400 font-sans uppercase border-b border-slate-800 pb-2">
                    Distributor Provisioning & Account Details
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                      Company Name (e.g. Khyber Green Energy)
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Khyber Green Energy"
                      value={regCompany}
                      onChange={e => setRegCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-white font-mono focus:outline-none text-xs font-bold"
                    />
                  </div>

                  {/* Work Email ID */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                      Work Email ID (e.g. info@khybergreen.pk)
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. info@khybergreen.pk"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-white font-mono focus:outline-none text-xs"
                    />
                  </div>

                  {/* Contact Number & City */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                        Contact Number
                      </label>
                      <input 
                        type="text" 
                        placeholder="+92 300 9876543"
                        value={regContact}
                        onChange={e => setRegContact(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-white font-mono focus:outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                        Location / City
                      </label>
                      <input 
                        type="text" 
                        placeholder="Peshawar / Karachi"
                        value={regCity}
                        onChange={e => setRegCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-white font-mono focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Subscription Tier Plan Selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                      Subscription Tier Plan
                    </label>
                    <select 
                      value={regPlan}
                      onChange={e => setRegPlan(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/45 border border-slate-800 focus:border-[#b45309] rounded-xl text-amber-300 font-mono font-bold focus:outline-none text-xs cursor-pointer"
                    >
                      <option value="Silver">Silver Plan (35 Proposals/mo - 35,000 PKR)</option>
                      <option value="Gold">Gold Tier Plan (60 Proposals/mo - 55,000 PKR)</option>
                      <option value="Platinum">Platinum Enterprise (100 Proposals/mo - 75,000 PKR)</option>
                    </select>
                  </div>

                </div>
              ) : (
                /* EXISTING DISTRIBUTOR LOGIN FIELDS */
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Distributor Work Email
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                </div>
              )}

              {/* Submit Action */}
              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold transition-all cursor-pointer shadow-md text-xs text-center flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-sm">
                  {selectedDistributorAccount === 'REGISTER_NEW' ? 'how_to_reg' : 'lock_open'}
                </span>
                <span>
                  {selectedDistributorAccount === 'REGISTER_NEW' 
                    ? 'Provision Distributor & Instant Launch Portal' 
                    : 'Unlock Distributor Workspace'}
                </span>
              </button>
            </form>

          </div>
        ) : (
          /* SUPER ADMIN GOVERNANCE PORTAL */
          <div className="space-y-6">
            <div className="border-b border-amber-800/40 pb-4 text-center space-y-1">
              <span className="size-10 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold mx-auto shadow-md">
                <span className="material-symbols-outlined text-xl">shield_person</span>
              </span>
              <h2 className="font-display font-extrabold text-amber-300 text-xl">Super Admin Governance Desk</h2>
              <p className="text-slate-400 text-xs">Full system oversight, distributor approval & ledger management</p>
            </div>

            <form onSubmit={handleAdminSignIn} className="space-y-4">
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

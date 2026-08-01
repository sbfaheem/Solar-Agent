'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const { 
    distributors,
    signInDistributor, 
    signInSuperAdmin, 
    signInWithGoogle, 
    signUpDistributor, 
    bankDetails,
    lang, 
    toggleLang, 
    showToast,
    formatPrice,
    currency,
    toggleCurrency
  } = useApp();

  const [portalMode, setPortalMode] = useState('distributor'); // 'distributor' or 'admin'
  const [authAction, setAuthAction] = useState('login'); // 'login' or 'register'

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingError, setPendingError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dynamic Passwordless Registration Form State
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regCity, setRegCity] = useState('Peshawar');
  const [regPlan, setRegPlan] = useState('Silver');

  // Registration Wire Modal State
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regModalData, setRegModalData] = useState(null);
  const [copiedIban, setCopiedIban] = useState(false);

  const handleGoogleClick = async () => {
    setPendingError(null);
    const res = await signInWithGoogle('google.partner@solaragent.pk');
    if (res && res.error) {
      setPendingError(res.message);
    }
  };

  const handleDistributorLogin = async (e) => {
    e.preventDefault();
    setPendingError(null);

    if (!email || !password) {
      showToast("⚠️ Please enter both work email and password", "error");
      return;
    }

    setLoading(true);

    const res = await signInDistributor(email, password);

    setLoading(false);

    if (!res.success) {
      setPendingError(res.message);
    }
  };

  const handleDistributorRegister = (e) => {
    e.preventDefault();
    setPendingError(null);

    if (!regCompany || !regEmail) {
      showToast("⚠️ Please enter Company Name and Work Email", "error");
      return;
    }

    const res = signUpDistributor({
      companyName: regCompany,
      email: regEmail,
      contact: regContact,
      city: regCity,
      plan: regPlan
    });

    if (res.success) {
      setRegModalData(res.distributor);
      setRegModalOpen(true);
      setRegCompany('');
      setRegEmail('');
      setRegContact('');
    } else if (res.error === 'exists') {
      setPendingError(`⚠️ Account already exists for ${regEmail}. Please log in or contact support.`);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setPendingError(null);

    if (!email || !password) {
      showToast("⚠️ Please enter Admin Email and Governance Password", "error");
      return;
    }

    signInSuperAdmin(email, password);
  };

  const handleCopyIban = () => {
    navigator.clipboard.writeText(bankDetails.iban);
    setCopiedIban(true);
    showToast("📋 IBAN copied to clipboard!");
    setTimeout(() => setCopiedIban(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* Dynamic Background Lighting Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-blue-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Navigation Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-3 px-2 z-10">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
            <span className="material-symbols-outlined text-2px">solar_power</span>
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-wider text-white block leading-tight">
              SOLAR AGENT
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
              B2B Solar SaaS Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleCurrency}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-emerald-400">payments</span>
            <span>{currency}</span>
          </button>

          <button
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-teal-400">translate</span>
            <span>{lang === 'en' ? 'اردو' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-xl w-full mx-auto my-8 z-10 animate-fadeIn">
        
        {/* Role Selector Tabs (Distributor Portal vs Super Admin) */}
        <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-1 mb-6 shadow-xl">
          <button
            onClick={() => { setPortalMode('distributor'); setPendingError(null); }}
            className={`flex-1 py-3 px-4 rounded-xl font-display font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              portalMode === 'distributor' 
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">storefront</span>
            <span>Distributor Partner Portal</span>
          </button>

          <button
            onClick={() => { setPortalMode('admin'); setPendingError(null); }}
            className={`flex-1 py-3 px-4 rounded-xl font-display font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              portalMode === 'admin' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">shield_person</span>
            <span>Super Admin Portal</span>
          </button>
        </div>

        {/* Distributor Auth Card */}
        {portalMode === 'distributor' ? (
          <div className="bg-[#121827]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Title & Toggle Action (Login vs Register) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-5 gap-3">
              <div>
                <h2 className="text-xl font-display font-black text-white tracking-wide">
                  {authAction === 'login' ? 'Distributor Partner Login' : 'Register New Distributor'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {authAction === 'login' 
                    ? 'Enter your work email and password to access your workspace' 
                    : 'Submit your business profile for Super Admin approval & activation'}
                </p>
              </div>

              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setAuthAction('login'); setPendingError(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authAction === 'login' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthAction('register'); setPendingError(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authAction === 'register' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Error & Pending Status Alerts */}
            {pendingError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium space-y-1 animate-fadeIn text-left">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span>Authentication Status Alert</span>
                </div>
                <p>{pendingError}</p>
              </div>
            )}

            {/* Google Sign-In Option */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-display font-bold text-xs shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  or continue with work email
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>
            </div>

            {/* FORM A: LOGIN MODE */}
            {authAction === 'login' && (
              <form onSubmit={handleDistributorLogin} className="space-y-4 text-left">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. info@khybergreen.pk"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 text-white text-xs font-mono transition-all outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Account Password
                    </label>
                    <Link href="/forgot-password" className="text-[11px] text-emerald-400 hover:underline font-medium">
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 text-white text-xs font-mono transition-all outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-display font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>{loading ? 'Authenticating Workspace...' : 'Login to Distributor Workspace'}</span>
                </button>
              </form>
            )}

            {/* FORM B: REGISTRATION MODE (PASSWORDLESS) */}
            {authAction === 'register' && (
              <form onSubmit={handleDistributorRegister} className="space-y-4 text-left">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">info</span>
                  <span>No password required now. You will create your password via activation email after Super Admin approval.</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="e.g. Khyber Green Energy"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 text-white text-xs transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. info@khybergreen.pk"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 text-white text-xs font-mono transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={regContact}
                      onChange={(e) => setRegContact(e.target.value)}
                      placeholder="+92 300 9876543"
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 text-white text-xs font-mono transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Location / City
                    </label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="Peshawar / Karachi"
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 text-white text-xs transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Subscription Tier Plan
                  </label>
                  <select
                    value={regPlan}
                    onChange={(e) => setRegPlan(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500 text-white text-xs font-mono transition-all outline-none cursor-pointer"
                  >
                    <option value="Silver">Silver Plan (50 Proposals/mo - {formatPrice(35000)})</option>
                    <option value="Gold">Gold Tier Plan (75 Proposals/mo - {formatPrice(55000)})</option>
                    <option value="Platinum">Platinum Enterprise (100 Proposals/mo - {formatPrice(75000)})</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-display font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">how_to_reg</span>
                  <span>Submit Registration & View Wire Details</span>
                </button>
              </form>
            )}

          </div>
        ) : (
          /* SUPER ADMIN PORTAL CARD */
          <div className="bg-[#121827]/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
            <div className="border-b border-slate-800 pb-5">
              <h2 className="text-xl font-display font-black text-amber-400 tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl">shield_person</span>
                <span>Super Admin Governance Desk</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Full system governance, distributor approvals, and transaction audit desk
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Super Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bilalfaheem47@gmail.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-amber-500 text-white text-xs font-mono transition-all outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Governance Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-amber-500 text-white text-xs font-mono transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-display font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>Unlock Super Admin Desk</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Wire Transfer Details Modal after Registration */}
      {regModalOpen && regModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121827] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-left space-y-5 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">account_balance</span>
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-white text-base">
                    Registration Submitted
                  </h3>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    Status: Pending Super Admin Approval
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRegModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <p>Dear <strong>{regModalData.name}</strong>,</p>
              <p>Your B2B distributor registration for the <strong>{regModalData.plan} Plan</strong> has been logged in Pending status.</p>
              <p>Once approved, an <strong>Account Activation Email</strong> will be sent to <strong>{regModalData.email}</strong> allowing you to create your password and activate your account.</p>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-amber-300 block">Bank Wire Instructions:</span>
              <div className="text-slate-300 space-y-1 font-mono text-[11px]">
                <div>Bank Name: <strong className="text-white">{bankDetails.bankName}</strong></div>
                <div>Account Title: <strong className="text-white">{bankDetails.accountTitle}</strong></div>
                <div>Account #: <strong className="text-white">{bankDetails.accountNumber}</strong></div>
                <div>IBAN: <strong className="text-emerald-400">{bankDetails.iban}</strong></div>
              </div>
              <button
                onClick={handleCopyIban}
                className="mt-2 w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">{copiedIban ? 'check' : 'content_copy'}</span>
                <span>{copiedIban ? 'IBAN Copied!' : 'Copy IBAN Code'}</span>
              </button>
            </div>

            <button
              onClick={() => setRegModalOpen(false)}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all cursor-pointer"
            >
              Got It, Close Modal
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-900/60 max-w-6xl w-full mx-auto">
        © 2026 Solar Agent | B2B Solar SaaS Platform. Multi-Tenant Role Security Active.
      </footer>
    </div>
  );
}

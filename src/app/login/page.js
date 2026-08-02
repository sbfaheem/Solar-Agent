'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const { 
    signInDistributor, 
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

  const handleCopyIban = () => {
    navigator.clipboard.writeText(bankDetails.iban);
    setCopiedIban(true);
    showToast("📋 IBAN copied to clipboard!");
    setTimeout(() => setCopiedIban(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Light Mode Gradient Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-100 via-teal-50/50 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-amber-100/60 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-3 px-2 z-10">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20">
            <span className="material-symbols-outlined text-2px">solar_power</span>
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-wider text-slate-900 block leading-tight">
              SOLAR AGENT
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
              B2B Solar SaaS Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleCurrency}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-emerald-600">payments</span>
            <span>{currency}</span>
          </button>

          <button
            onClick={toggleLang}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-teal-600">translate</span>
            <span>{lang === 'en' ? 'اردو' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-xl w-full mx-auto my-8 z-10 animate-fadeIn">
        
        {/* Distributor Auth Card (Exclusively B2B Partner Portal) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-900">
          
          {/* Title & Toggle Action (Login vs Register) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-5 gap-3">
            <div>
              <h2 className="text-xl font-display font-black text-slate-900 tracking-wide">
                {authAction === 'login' ? 'Distributor Partner Login' : 'Register New Distributor'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {authAction === 'login' 
                  ? 'Enter your work email and password to access your workspace' 
                  : 'Submit your business profile for Super Admin approval & activation'}
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setAuthAction('login'); setPendingError(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authAction === 'login' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthAction('register'); setPendingError(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authAction === 'register' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Error & Pending Status Alerts */}
          {pendingError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1 animate-fadeIn text-left">
              <div className="flex items-center gap-2 font-bold text-amber-800">
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
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-display font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
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
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                or continue with work email
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>
          </div>

          {/* FORM A: LOGIN MODE */}
          {authAction === 'login' && (
            <form onSubmit={handleDistributorLogin} className="space-y-4 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. info@khybergreen.pk"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-900 text-xs font-mono transition-all outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Account Password
                  </label>
                  <Link href="/forgot-password" className="text-[11px] text-emerald-600 hover:underline font-bold">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-900 text-xs font-mono transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-display font-black text-sm tracking-wide shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>{loading ? 'Authenticating Workspace...' : 'Login to Distributor Workspace'}</span>
              </button>
            </form>
          )}

          {/* FORM B: REGISTRATION MODE (PASSWORDLESS) */}
          {authAction === 'register' && (
            <form onSubmit={handleDistributorRegister} className="space-y-4 text-left">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-center gap-2 font-medium">
                <span className="material-symbols-outlined text-base text-amber-700">info</span>
                <span>No password required now. You will create your password via activation email after Super Admin approval.</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="e.g. Khyber Green Energy"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-900 text-xs font-medium transition-all outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. info@khybergreen.pk"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-900 text-xs font-mono transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={regContact}
                    onChange={(e) => setRegContact(e.target.value)}
                    placeholder="+92 300 9876543"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-900 text-xs font-mono transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Peshawar / Karachi"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-900 text-xs font-medium transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Subscription Tier Plan
                </label>
                <select
                  value={regPlan}
                  onChange={(e) => setRegPlan(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-900 text-xs font-medium transition-all outline-none cursor-pointer"
                >
                  <option value="Silver">Silver Plan (50 Proposals/mo - {formatPrice(35000)})</option>
                  <option value="Gold">Gold Tier Plan (75 Proposals/mo - {formatPrice(55000)})</option>
                  <option value="Platinum">Platinum Enterprise (100 Proposals/mo - {formatPrice(75000)})</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-display font-black text-sm tracking-wide shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">how_to_reg</span>
                <span>Submit Registration & View Wire Details</span>
              </button>
            </form>
          )}

        </div>
      </main>

      {/* Wire Transfer Details Modal after Registration */}
      {regModalOpen && regModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-left space-y-5 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">account_balance</span>
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 text-base">
                    Registration Submitted
                  </h3>
                  <span className="text-[11px] text-amber-700 font-bold">
                    Status: Pending Super Admin Approval
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRegModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-700">
              <p>Dear <strong>{regModalData.name}</strong>,</p>
              <p>Your B2B distributor registration for the <strong>{regModalData.plan} Plan</strong> has been logged in Pending status.</p>
              <p>Once approved, an <strong>Account Activation Email</strong> will be sent to <strong>{regModalData.email}</strong> allowing you to create your password and activate your account.</p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-amber-900 block">Bank Wire Instructions:</span>
              <div className="text-slate-700 space-y-1 font-mono text-[11px]">
                <div>Bank Name: <strong className="text-slate-900">{bankDetails.bankName}</strong></div>
                <div>Account Title: <strong className="text-slate-900">{bankDetails.accountTitle}</strong></div>
                <div>Account #: <strong className="text-slate-900">{bankDetails.accountNumber}</strong></div>
                <div>IBAN: <strong className="text-emerald-700">{bankDetails.iban}</strong></div>
              </div>
              <button
                onClick={handleCopyIban}
                className="mt-2 w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 text-emerald-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">{copiedIban ? 'check' : 'content_copy'}</span>
                <span>{copiedIban ? 'IBAN Copied!' : 'Copy IBAN Code'}</span>
              </button>
            </div>

            <button
              onClick={() => setRegModalOpen(false)}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
            >
              Got It, Close Modal
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-200 max-w-6xl w-full mx-auto font-medium">
        © 2026 Solar Agent | B2B Solar SaaS Platform. Multi-Tenant Role Security Active.
      </footer>
    </div>
  );
}

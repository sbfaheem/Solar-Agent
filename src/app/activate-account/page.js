'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { validatePasswordStrength } from '../../lib/authCrypto';

function ActivateAccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const { distributors, activateDistributorAccount } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetDistributor, setTargetDistributor] = useState(null);
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    if (token && distributors.length > 0) {
      const found = distributors.find(d => d.activation_token === token);
      if (found) {
        if (found.activation_expiry && new Date(found.activation_expiry) < new Date()) {
          setIsTokenValid(false);
          setErrorMsg("⚠️ Activation link has expired (24-hour limit). Please request a new link from Super Admin.");
        } else {
          setTargetDistributor(found);
          setIsTokenValid(true);
        }
      } else {
        setIsTokenValid(false);
        setErrorMsg("⚠️ Invalid or expired account activation token.");
      }
    }
  }, [token, distributors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg("❌ Passwords do not match.");
      return;
    }

    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      setErrorMsg(`⚠️ Password Requirements: ${strength.errors.join(' ')}`);
      return;
    }

    setLoading(true);

    const res = await activateDistributorAccount(token, password);

    setLoading(false);

    if (!res.success) {
      setErrorMsg(`❌ ${res.message}`);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10 animate-fadeIn text-center text-slate-900">
      {/* Header Branding */}
      <div className="size-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
        <span className="material-symbols-outlined text-3xl">key</span>
      </div>

      <h1 className="text-2xl font-display font-extrabold tracking-tight text-slate-900 mb-2">
        Create Your Password
      </h1>

      <p className="text-xs text-slate-500 mb-6 font-medium">
        {targetDistributor 
          ? `Welcome ${targetDistributor.name}! Please set your account password to complete activation.`
          : 'Set a strong password for your approved distributor account.'}
      </p>

      {errorMsg && (
        <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-left">
          {errorMsg}
        </div>
      )}

      {!isTokenValid ? (
        <div className="space-y-4">
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
          >
            Return to Distributor Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-900 text-xs font-mono transition-all outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-900 text-xs font-mono transition-all outline-none"
            />
          </div>

          {/* Password Policy Indicator */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block mb-1">Password Requirements:</span>
            <div className="flex items-center gap-1.5">
              <span className={`material-symbols-outlined text-xs ${password.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`}>check_circle</span>
              <span>Minimum 8 characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`material-symbols-outlined text-xs ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>check_circle</span>
              <span>Uppercase & lowercase letters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`material-symbols-outlined text-xs ${/[0-9]/.test(password) && /[!@#$%^&*]/.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>check_circle</span>
              <span>Number & special character (!@#$%^&*)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-display font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span>{loading ? 'Activating Account...' : 'Activate Account & Login'}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/50 rounded-full blur-[140px] pointer-events-none" />
      <Suspense fallback={<div className="text-slate-700 text-xs font-mono">Loading Activation Request...</div>}>
        <ActivateAccountContent />
      </Suspense>
    </div>
  );
}

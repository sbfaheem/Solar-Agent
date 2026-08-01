'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { validatePasswordStrength } from '../../lib/authCrypto';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const { resetPasswordWithToken } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      setErrorMsg("⚠️ Password reset token is missing.");
      return;
    }

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

    const res = await resetPasswordWithToken(token, password);

    setLoading(false);

    if (!res.success) {
      setErrorMsg(`❌ ${res.message}`);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10 text-center text-slate-900">
      <div className="size-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-3xl">lock_open</span>
      </div>

      <h1 className="text-2xl font-display font-extrabold text-slate-900 mb-2">
        Set New Password
      </h1>

      <p className="text-xs text-slate-500 mb-6 font-medium">
        Enter your new password below. Ensure it meets all strength requirements.
      </p>

      {errorMsg && (
        <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-left">
          {errorMsg}
        </div>
      )}

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
            Confirm New Password
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-extrabold text-xs tracking-wide shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{loading ? 'Updating Password...' : 'Save New Password & Login'}</span>
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <Suspense fallback={<div className="text-slate-700 text-xs font-mono">Loading Password Reset...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}

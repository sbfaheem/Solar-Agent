'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset } = useApp();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await requestPasswordReset(email);

    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMsg("❌ No registered distributor account was found matching that work email.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10 text-center text-slate-900">
        <div className="size-16 rounded-2xl bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">lock_reset</span>
        </div>

        <h1 className="text-2xl font-display font-extrabold text-slate-900 mb-2">
          Reset Your Password
        </h1>

        <p className="text-xs text-slate-500 mb-6 font-medium">
          Enter your registered distributor work email address. We will send you a secure 1-hour password reset link.
        </p>

        {errorMsg && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-left">
            {errorMsg}
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              ✅ Reset Link Dispatched! Please check <strong>{email}</strong> for instructions to reset your password.
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 text-slate-900 text-xs font-mono transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-extrabold text-xs tracking-wide shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>{loading ? 'Dispatching Link...' : 'Send Password Reset Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full py-2 text-center text-slate-500 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
            >
              ← Back to Distributor Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

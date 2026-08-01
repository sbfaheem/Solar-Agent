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
    <div className="min-h-screen bg-[#090d16] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#121827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
        <div className="size-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">lock_reset</span>
        </div>

        <h1 className="text-2xl font-display font-extrabold text-white mb-2">
          Reset Your Password
        </h1>

        <p className="text-xs text-slate-400 mb-6">
          Enter your registered distributor work email address. We will send you a secure 1-hour password reset link.
        </p>

        {errorMsg && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-left">
            {errorMsg}
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              ✅ Reset Link Dispatched! Please check <strong>{email}</strong> for instructions to reset your password.
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-blue-500 text-white text-xs font-mono transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-display font-extrabold text-xs tracking-wide shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>{loading ? 'Dispatching Link...' : 'Send Password Reset Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full py-2 text-center text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
            >
              ← Back to Distributor Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

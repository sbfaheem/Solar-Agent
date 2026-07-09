'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const { signIn, lang, toggleLang, showToast } = useApp();
  const [email, setEmail] = useState('bilalfaheem47@gmail.com');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      showToast("⚠️ Please enter a valid email", "error");
      return;
    }
    signIn(email, password);
  };

  const translations = {
    en: {
      welcome: "Welcome to Solar Agent",
      desc: "B2B SaaS Workspace Engineering & Lead management.",
      emailLabel: "Email Address",
      passLabel: "Access Password",
      btnLabel: "Unlock Workspace Dashboard",
      langSwitch: "اردو (Urdu)",
      toast: "Authenticating..."
    },
    ur: {
      welcome: "سولر ایجنٹ میں خوش آمدید",
      desc: "بی ٹو بی ساس پراجیکٹس اور لیڈز مینجمنٹ ورک اسپیس۔",
      emailLabel: "ای میل ایڈریس",
      passLabel: "پاس ورڈ",
      btnLabel: "ورک اسپیس کو ان لاک کریں",
      langSwitch: "English",
      toast: "تصدیق کی جا رہی ہے..."
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e2e2e6] flex flex-col justify-between p-6" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      
      {/* Top Header toggle */}
      <header className="flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="size-8 rounded-lg bg-primary text-black flex items-center justify-center font-bold text-base">
            <span className="material-symbols-outlined">solar_power</span>
          </span>
          <span className="font-display font-extrabold text-white text-base">Solar Agent</span>
        </div>
        <button 
          onClick={toggleLang}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
        >
          {t.langSwitch}
        </button>
      </header>

      {/* Main card */}
      <main className="my-auto max-w-md mx-auto w-full bg-[#161920] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className={`space-y-1.5 text-center ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
          <h2 className="font-display font-extrabold text-white text-2xl tracking-tight">{t.welcome}</h2>
          <p className="text-slate-400 text-xs">{t.desc}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={`text-[10px] font-bold text-slate-500 uppercase tracking-wider block ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
              {t.emailLabel}
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-black/45 border border-slate-800 focus:border-primary rounded-lg text-white font-mono focus:outline-none ${
                lang === 'ur' ? 'text-right' : 'text-left'
              }`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={`text-[10px] font-bold text-slate-500 uppercase tracking-wider block ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
              {t.passLabel}
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-black/45 border border-slate-800 focus:border-primary rounded-lg text-white font-mono focus:outline-none ${
                lang === 'ur' ? 'text-right' : 'text-left'
              }`}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-white text-black font-display font-bold transition-all cursor-pointer shadow-md text-xs text-center flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">lock_open</span>
            {t.btnLabel}
          </button>
        </form>

        <div className="text-center text-[10px] text-slate-500 font-mono">
          Mock Authentication Mode. Standard admin account initialized.
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-650 font-mono max-w-7xl mx-auto w-full">
        © 2026 Solar Agent. All Rights Reserved. Built with Lumina Logic.
      </footer>

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { subscribeLivePresentation } from '../../lib/firebaseService';

export default function CustomerView() {
  const [lang, setLang] = useState('en');
  const [liveData, setLiveData] = useState({
    systemSize: 5.0,
    panelCount: 9,
    panelModel: 'Longi Hi-Mo 7',
    inverterModel: 'Nitrox 5kW Hybrid',
    totalCost: 380000,
    annualSavings: 108000,
    paybackYears: 3.5,
    utilityProvider: 'IESCO',
    connectionType: 'On-Grid'
  });

  // Switch Language
  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'ur' : 'en';
    setLang(nextLang);
    const root = window.document.documentElement;
    root.setAttribute('dir', nextLang === 'ur' ? 'rtl' : 'ltr');
    root.setAttribute('lang', nextLang);
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = subscribeLivePresentation((data) => {
      if (data) {
        setLiveData(data);
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const translations = {
    en: {
      title: "Solar Proposal Presentation",
      subtitle: "Live read-only client proposal deck, synced with your installer agent.",
      syncActive: "Live Sync Connected",
      sysCap: "System Capacity",
      panels: "Total Solar Panels",
      inverter: "Selected Inverter",
      dailyGen: "Daily Energy Generation",
      annualSav: "Annual Savings (Estimated)",
      payback: "Payback Period",
      greenImpact: "Environmental Impact",
      co2: "CO2 Offset / Yr",
      trees: "Trees Planted Equivalent",
      pkr: "Rs.",
      years: "Years",
      modules: "Modules",
      utility: "Utility Grid Provider",
      phase: "Connection Type",
      treesUnit: "Trees",
      co2Unit: "Tons",
      backHome: "Showcase Hub"
    },
    ur: {
      title: "سولر سسٹم تجویز کی پیشکش",
      subtitle: "صارف کے لیے براہ راست پیشکش کا جائزہ، جو کہ سیلز ایجنٹ کے ساتھ ہم آہنگ ہے۔",
      syncActive: "لائیو کنکشن فعال ہے",
      sysCap: "سسٹم کی صلاحیت",
      panels: "کل سولر پینلز",
      inverter: "منتخب کردہ انورٹر",
      dailyGen: "روزانہ بجلی کی پیداوار",
      annualSav: "سالانہ بچت (متوقع)",
      payback: "سرمایہ کاری کی واپسی کا دورانیہ",
      greenImpact: "ماحولیاتی اثرات",
      co2: "سالانہ کاربن کی بچت",
      trees: "درخت لگانے کے برابر",
      pkr: "روپے",
      years: "سال",
      modules: "پینلز",
      utility: "بجلی فراہم کرنے والا گرڈ",
      phase: "کنکشن کی قسم",
      treesUnit: "درخت",
      co2Unit: "ٹن",
      backHome: "مین پیج پر جائیں"
    }
  };

  const t = translations[lang];

  // Estimated stats
  const dailyKwh = (liveData.systemSize * 4.2).toFixed(1); // 4.2 peak solar hours avg in Pakistan

  return (
    <div className={`min-h-screen bg-[#0b0c10] text-[#e2e2e6] font-sans flex flex-col justify-between p-6 ${
      lang === 'ur' ? 'text-right' : 'text-left'
    }`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      
      {/* Header bar */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="size-9 bg-[#fdb813] text-black rounded-lg flex items-center justify-center font-bold text-lg">
            <span className="material-symbols-outlined material-symbols-filled">solar_power</span>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-white text-lg tracking-tight">
              {t.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">{t.syncActive}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* LTR/RTL Mirror Trigger */}
          <button 
            onClick={toggleLang} 
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
          >
            {lang === 'en' ? 'اردو (Urdu)' : 'English'}
          </button>
        </div>
      </header>

      {/* Main Slides Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full my-auto py-8 space-y-10">
        
        {/* Slides Intro */}
        <div className="space-y-2">
          <h2 className="font-display font-bold text-white text-2xl lg:text-3xl">
            {lang === 'en' ? 'Your Solar Solution Estimate' : 'آپ کے سولر سسٹم کا تخمینہ'}
          </h2>
          <p className="text-slate-400 text-sm">{t.subtitle}</p>
        </div>

        {/* Technical overview grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Size */}
          <div className="bg-[#161920] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between gap-4 hover:border-slate-700 transition-all">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">{t.sysCap}</span>
              <h3 className="font-mono text-3xl font-extrabold text-white">
                {liveData.systemSize} <span className="text-sm text-slate-500">kWp</span>
              </h3>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1 border-t border-slate-800/60 pt-3">
              <span className="material-symbols-outlined text-sm text-[#fdb813]">offline_bolt</span>
              <span>{t.phase}: {liveData.connectionType}</span>
            </div>
          </div>

          {/* Card 2: Modules */}
          <div className="bg-[#161920] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between gap-4 hover:border-slate-700 transition-all">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">{t.panels}</span>
              <h3 className="font-mono text-3xl font-extrabold text-white">
                {liveData.panelCount} <span className="text-sm text-slate-500">{t.modules}</span>
              </h3>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1 border-t border-slate-800/60 pt-3">
              <span className="material-symbols-outlined text-sm text-emerald-400">inventory</span>
              <span className="truncate">{liveData.panelModel}</span>
            </div>
          </div>

          {/* Card 3: Inverter */}
          <div className="bg-[#161920] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between gap-4 hover:border-slate-700 transition-all">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">{t.inverter}</span>
              <h3 className="font-display text-lg font-bold text-white truncate pt-2">
                {liveData.inverterModel}
              </h3>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1 border-t border-slate-800/60 pt-3">
              <span className="material-symbols-outlined text-sm text-amber-500">router</span>
              <span>{t.utility}: {liveData.utilityProvider}</span>
            </div>
          </div>

        </div>

        {/* Projection summary slide */}
        <div className="bg-[#1c1f26] border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 rtl:divide-x-reverse">
            
            {/* Gen stats */}
            <div className="space-y-2 pb-4 sm:pb-0">
              <span className="text-xs text-slate-400 font-semibold uppercase">{t.dailyGen}</span>
              <div className="font-mono text-2xl font-extrabold text-white">{dailyKwh} <span className="text-xs text-slate-500">kWh</span></div>
            </div>

            {/* Financial savings */}
            <div className="space-y-2 pt-4 sm:pt-0 sm:px-6">
              <span className="text-xs text-slate-400 font-semibold uppercase">{t.annualSav}</span>
              <div className="font-mono text-2xl font-extrabold text-emerald-400">
                {lang === 'ur' ? `${liveData.annualSavings?.toLocaleString()} ${t.pkr}` : `${t.pkr} ${liveData.annualSavings?.toLocaleString()}`}
              </div>
            </div>

            {/* Payback period */}
            <div className="space-y-2 pt-4 sm:pt-0 sm:px-6">
              <span className="text-xs text-slate-400 font-semibold uppercase">{t.payback}</span>
              <div className="font-mono text-2xl font-extrabold text-[#fdb813]">{liveData.paybackYears} <span className="text-xs text-slate-500">{t.years}</span></div>
            </div>

          </div>
        </div>

        {/* Green Impact slide */}
        <div className="bg-[#161920]/60 border border-slate-800/60 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h4 className="font-display font-bold text-emerald-400 text-sm uppercase">{t.greenImpact}</h4>
            <p className="text-xs text-slate-500">Estimated environmental offset projections based on carbon grids.</p>
          </div>
          <div className="flex gap-8 font-mono text-sm">
            <div className="text-center">
              <div className="font-bold text-white">{(liveData.systemSize * 1.2).toFixed(1)} {t.co2Unit}</div>
              <div className="text-[10px] text-slate-500">{t.co2}</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white">{Math.round(liveData.systemSize * 18)} {t.treesUnit}</div>
              <div className="text-[10px] text-slate-500">{t.trees}</div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 pt-6 mt-8 flex justify-between items-center text-xs text-slate-500">
        <div>© 2026 Solar Agent. Powered by Lumina Logic.</div>
      </footer>

    </div>
  );
}

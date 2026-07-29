'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PageShell from '../components/PageShell';
import SolarCalculatorModal from '../components/SolarCalculatorModal';
import ProposalLimitModal from '../components/ProposalLimitModal';
import { useApp } from '../context/AppContext';
import { seedDatabase } from '../lib/firebaseService';

export default function Home() {
  const { company, lang, getActiveLimit, formatPrice, showToast, loadAllData } = useApp();
  const [solarActive, setSolarActive] = useState(true);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const handleSeed = async () => {
    const ok = await seedDatabase();
    if (ok) {
      showToast("🌱 Database seed data loaded successfully!");
      loadAllData();
    } else {
      showToast("❌ Seeding failed. Check console.", "error");
    }
  };

  const translations = {
    en: {
      title: "Solar Agent Workspace",
      subtitle: "B2B SaaS Pipeline & Configuration Engineering Platform for Pakistan.",
      seedBtn: "Reset & Seed Database Catalogs",
      metricsHeader: "Distributor Quota Tracker & Subscription Metrics",
      tierLabel: "Active Tier Plan",
      limitLabel: "Allocated Monthly Limit",
      generatedLabel: "Proposals Generated",
      statusLabel: "Billing Status",
      activeText: "Active / Active Quota",
      verifyingText: "Pending Verification",
      simTitle: "3D Solar Power Simulator",
      simStatusActive: "☀️ Solar Power: Active 24/7",
      simStatusDark: "🌑 Grid Blackout / Load Shedding",
      simToggleActive: "Switch Solar Backup ON",
      simToggleDark: "Simulate Grid Failure",
      floatingBadge: "⚡ 24/7 Uninterrupted Clean Energy"
    },
    ur: {
      title: "سولر ایجنٹ ورک اسپیس",
      subtitle: "پاکستان کے لیے بی ٹو بی ساس پراجیکٹ پائپ لائن اور انجینئرنگ پلیٹ فارم۔",
      seedBtn: "ڈیٹا بیس سیڈنگ ری سیٹ کریں",
      metricsHeader: "سبسکرپشن اور کوٹہ ٹریکر",
      tierLabel: "فعال پلان",
      limitLabel: "مجموعی حد",
      generatedLabel: "تیار کردہ پروپوزلز",
      statusLabel: "بلنگ کی کیفیت",
      activeText: "فعال",
      verifyingText: "تصدیق کے منتظر",
      simTitle: "تھری ڈی سولر پاور سمیلیٹر",
      simStatusActive: "☀️ سولر پاور: چوبیس گھنٹے فعال",
      simStatusDark: "🌑 لوڈ شیڈنگ / بجلی بند ہے",
      simToggleActive: "سولر بیک اپ آن کریں",
      simToggleDark: "بجلی بند ہونے کا تجربہ کریں",
      floatingBadge: "⚡ ہفتے کے 7 دن، 24 گھنٹے بلاتعطل بجلی"
    }
  };

  const t = translations[lang];
  const activeLimit = getActiveLimit();
  const usagePercentage = Math.min(100, Math.round(((company.proposals_generated || 0) / activeLimit) * 100));
  const isLimitReached = (company.proposals_generated || 0) >= activeLimit;

  return (
    <PageShell headerTitle="Solar Agent Workspace Overview">
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-12 animate-fadeIn text-[#0f172a] dark:text-[#f8fafc]" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        
        {/* Full-Bleed Cinematic Hero Banner */}
        <section className="relative min-h-[450px] flex items-center p-6 sm:p-10 lg:p-12 rounded-3xl overflow-hidden border border-[#e2e8f0] dark:border-[#2d3137] shadow-2xl isolate">
          
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            poster="/solar_hero_banner.png" 
            className="absolute inset-0 -z-20 w-full h-full object-cover transition-opacity duration-700"
          >
            <source src="/solar_hero_banner.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 -z-10 bg-slate-950/70 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent rtl:bg-gradient-to-l rtl:from-slate-950/90 rtl:via-slate-950/60 rtl:to-transparent"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            
            <div className={`lg:col-span-7 space-y-6 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b45309]/30 border border-[#fde047]/40 text-xs font-mono font-bold text-[#fef08a] shadow-xs">
                {t.floatingBadge}
              </div>

              <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {t.title}
              </h1>
              
              <p className="text-slate-200 text-sm sm:text-base max-w-xl leading-relaxed drop-shadow font-medium">
                {t.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/configuration" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs shadow-md transition-all">
                  <span className="material-symbols-outlined text-sm">wb_sunny</span>
                  <span>{lang === 'ur' ? 'حساب کتاب شروع کریں' : 'New Solar Calculation'}</span>
                </Link>
                <button 
                  onClick={() => setOcrModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-black border border-emerald-500/40 text-xs font-bold text-emerald-300 transition-all cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">document_scanner</span>
                  <span>Gemini Bill OCR Scanner</span>
                </button>
                <button 
                  onClick={handleSeed}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">database</span>
                  <span>{t.seedBtn}</span>
                </button>
              </div>
            </div>

            {/* Right Column: 3D Simulator Interactive Card */}
            <div className="lg:col-span-5 bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/15 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-extrabold text-white text-xs uppercase tracking-wide">{t.simTitle}</h3>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                  solarActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {solarActive ? t.simStatusActive : t.simStatusDark}
                </span>
              </div>

              <div className={`relative h-44 rounded-xl overflow-hidden border transition-all ${
                solarActive ? 'border-amber-400/40 shadow-amber-500/10 shadow-lg' : 'border-red-500/40 opacity-70 grayscale'
              }`}>
                <img 
                  src={solarActive ? "/solar_hero_banner.png" : "/solar_hero_dark.png"} 
                  alt="3D Solar Power Simulation" 
                  className="w-full h-full object-cover"
                />
              </div>

              <button 
                onClick={() => setSolarActive(!solarActive)}
                className={`w-full py-3 rounded-xl font-display font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                  solarActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{solarActive ? 'flash_off' : 'wb_sunny'}</span>
                <span>{solarActive ? t.simToggleDark : t.simToggleActive}</span>
              </button>
            </div>

          </div>
        </section>

        {/* Distributor Quota Tracker Dashboard Bar */}
        <section className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">{t.metricsHeader}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Real-time status bar showing active tier and monthly allocated proposals</p>
            </div>
            
            <div className="flex items-center gap-3">
              {isLimitReached && (
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 animate-pulse">
                  ⚠️ Limit Reached ({company.proposals_generated}/{activeLimit})
                </span>
              )}
              <button
                onClick={() => setLimitModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">upgrade</span>
                <span>Upgrade Plan & Upload Receipt</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">{t.tierLabel}</span>
              <div className="font-display text-xl font-black text-[#0f172a] dark:text-white">{company.plan || 'Silver'} Tier</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">{t.limitLabel}</span>
              <div className="font-mono text-xl font-black text-[#0f172a] dark:text-white">{activeLimit} Proposals</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">{t.generatedLabel}</span>
              <div className={`font-mono text-xl font-black ${isLimitReached ? 'text-red-600 dark:text-red-400' : 'text-[#b45309]'}`}>
                {company.proposals_generated || 0} Used
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">Plan Cost</span>
              <div className="font-mono text-xl font-black text-[#0f172a] dark:text-white">
                {formatPrice(company.plan === "Silver" ? 35000 : company.plan === "Gold" ? 55000 : 75000)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden border border-[#cbd5e1] dark:border-slate-800">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isLimitReached ? 'bg-red-600' : (usagePercentage > 80 ? 'bg-amber-500' : 'bg-[#b45309]')
                }`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-mono font-bold">
              <span>{usagePercentage}% Limit capacity consumed</span>
              <span>{company.proposals_generated || 0} / {activeLimit} Proposals</span>
            </div>
          </div>
        </section>

      </main>

      <SolarCalculatorModal 
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
      />

      <ProposalLimitModal 
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
      />
    </PageShell>
  );
}

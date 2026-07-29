'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PageShell from '../components/PageShell';
import SolarCalculatorModal from '../components/SolarCalculatorModal';
import { useApp } from '../context/AppContext';
import { seedDatabase } from '../lib/firebaseService';

export default function Home() {
  const { company, lang, getActiveLimit, formatPrice, showToast, loadAllData } = useApp();
  const [solarActive, setSolarActive] = useState(true);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);

  const handleSeed = async () => {
    const ok = await seedDatabase();
    if (ok) {
      showToast("🌱 Database seed data loaded successfully!");
      loadAllData();
    } else {
      showToast("❌ Seeding failed. Check console.", "error");
    }
  };

  // Translations
  const translations = {
    en: {
      title: "Solar Agent Workspace",
      subtitle: "B2B SaaS Pipeline & Configuration Engineering Platform for Pakistan.",
      seedBtn: "Reset & Seed Database Catalogs",
      metricsHeader: "Workspace Subscriptions & Usage Tracker",
      tierLabel: "Plan Tier",
      limitLabel: "Active Limit",
      generatedLabel: "Proposals Generated",
      statusLabel: "Billing Status",
      launcherHeader: "Available Platform Workspaces",
      agentHubTitle: "Agent Project Hub",
      agentHubDesc: "Manage pipeline leads, create proposals, and view team dashboards.",
      calcTitle: "Hardware Matcher",
      calcDesc: "Analyze utility bills, run engineering calculations, and generate slide proposals.",
      adminTitle: "Clearance Desk CMS",
      adminDesc: "Super User clearance desk. Approve bank receipts, activate plans, and review overrides.",
      teamTitle: "Billing & Workspace",
      teamDesc: "Upgrade subscription tiers, upload payment receipts, and manage field members.",
      custTitle: "Live Customer View",
      custDesc: "Open real-time presenter view in another window. Syncs live with installer calculations.",
      pkr: "PKR",
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
      launcherHeader: "دستیاب پینلز اور ورک اسپیس",
      agentHubTitle: "ایجنٹ پراجیکٹ ہب",
      agentHubDesc: "لیڈز کا انتظام کریں، پروپوزل بنائیں اور سیلز رپورٹنگ دیکھیں۔",
      calcTitle: "سولر کیلکولیٹر اور میچر",
      calcDesc: "بجلی کے بل کا تجزیہ کریں، انورٹرز میچ کریں اور پیشکش کارڈز بنائیں۔",
      adminTitle: "ایڈمن کلیئرنس پینل",
      adminDesc: "بینک رسیدوں کی تصدیق کریں، سبسکرپشنز کو فعال کریں اور کوٹہ بڑھائیں۔",
      teamTitle: "بلنگ اور ٹیم سیٹنگز",
      teamDesc: "سبسکرپشن پلان منتخب کریں، رسیدیں اپ لوڈ کریں اور ٹیم منظم کریں۔",
      custTitle: "گاہک کا لائیو ویو",
      custDesc: "گاہک کے لیے پیشکش کی لائیو اسکرین۔ یہ سیلز ایجنٹ کے ساتھ ہم آہنگ ہے۔",
      pkr: "روپے",
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
  const usagePercentage = Math.min(100, Math.round((company.proposals_generated / activeLimit) * 100));

  return (
    <PageShell headerTitle="Solar Agent Workspace Overview">
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-12 animate-fadeIn text-[#0f172a] dark:text-[#f8fafc]" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        
        {/* Full-Bleed Cinematic Hero Banner */}
        <section className="relative min-h-[450px] flex items-center p-6 sm:p-10 lg:p-12 rounded-3xl overflow-hidden border border-[#e2e8f0] dark:border-[#2d3137] shadow-2xl isolate">
          
          {/* Background Video */}
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

          {/* Dark Overlay for Hero Text Contrast */}
          <div className="absolute inset-0 -z-10 bg-slate-950/70 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent rtl:bg-gradient-to-l rtl:from-slate-950/90 rtl:via-slate-950/60 rtl:to-transparent"></div>

          {/* Banner Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            
            {/* Left Column: Hero Text */}
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
                  <span className="material-symbols-outlined text-sm text-emerald-400">document_scanner</span>
                  <span>{lang === 'ur' ? 'جیمنائی بل OCR اسکینر' : 'Gemini Bill OCR Scanner'}</span>
                </button>
                <button 
                  onClick={handleSeed}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-sm text-[#fdb813]">database</span>
                  <span>{t.seedBtn}</span>
                </button>
              </div>
            </div>

            {/* Right Column: 3D Simulator */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between gap-5 relative overflow-hidden">
              
              <div className={`flex justify-between items-center border-b border-slate-800 pb-2.5 ${
                lang === 'ur' ? 'flex-row-reverse' : ''
              }`}>
                <h3 className="font-display font-bold text-white text-xs">{t.simTitle}</h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  solarActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                }`}>
                  {solarActive ? t.simStatusActive : t.simStatusDark}
                </span>
              </div>

              {/* Viewport */}
              <div className="h-44 w-full relative border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                <img 
                  src="/solar_hero_dark.png" 
                  alt="Blackout state" 
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    !solarActive ? 'opacity-100' : 'opacity-0'
                  }`} 
                />
                <img 
                  src="/solar_hero_banner.png" 
                  alt="Solar Active state" 
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    solarActive ? 'opacity-100' : 'opacity-0'
                  }`} 
                />
              </div>

              <button 
                type="button"
                onClick={() => setSolarActive(!solarActive)}
                className={`w-full py-2.5 rounded-xl font-display text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                  solarActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#b45309] hover:bg-[#92400e] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {solarActive ? 'power_off' : 'wb_sunny'}
                </span>
                <span>{solarActive ? t.simToggleDark : t.simToggleActive}</span>
              </button>

            </div>

          </div>
        </section>

        {/* Multi-tenant Subscriptions Dashboard */}
        <section className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 ${
            lang === 'ur' ? 'flex-row-reverse' : ''
          }`}>
            <h2 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">{t.metricsHeader}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
              company.billing_status === 'Active' 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700' 
                : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 animate-pulse'
            }`}>
              {company.billing_status === 'Active' ? t.activeText : t.verifyingText}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">{t.tierLabel}</span>
              <div className="font-display text-xl font-black text-[#0f172a] dark:text-white">{company.plan} Tier</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">{t.limitLabel}</span>
              <div className="font-mono text-xl font-black text-[#0f172a] dark:text-white">{activeLimit} Proposals</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">{t.generatedLabel}</span>
              <div className="font-mono text-xl font-black text-[#b45309]">{company.proposals_generated} Generated</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">Plan Cost</span>
              <div className="font-mono text-xl font-black text-[#0f172a] dark:text-white">
                {formatPrice(company.plan === "Silver" ? 30000 : company.plan === "Gold" ? 50000 : 75000)}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="w-full h-3 bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden border border-[#cbd5e1] dark:border-slate-800">
              <div 
                className="h-full bg-[#b45309] transition-all duration-500 rounded-full"
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <div className={`flex justify-between text-xs text-slate-500 font-mono font-bold ${
              lang === 'ur' ? 'flex-row-reverse' : ''
            }`}>
              <span>{usagePercentage}% Limit capacity consumed</span>
              <span>{company.proposals_generated} / {activeLimit} Proposals</span>
            </div>
          </div>
        </section>

        {/* Navigation Workspace launcher Grid */}
        <section className="space-y-6">
          <h2 className={`font-display font-extrabold text-[#0f172a] dark:text-white text-lg border-b border-slate-200 dark:border-slate-800 pb-3 ${
            lang === 'ur' ? 'text-right' : 'text-left'
          }`}>{t.launcherHeader}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Agent Hub */}
            <Link href="/agent-hub" className="group block bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 hover:border-[#b45309] transition-all space-y-4 shadow-sm hover:-translate-y-1">
              <div className="size-11 rounded-xl bg-amber-50 text-[#b45309] dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center font-bold group-hover:bg-[#b45309] group-hover:text-white transition-all">
                <span className="material-symbols-outlined">leaderboard</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base group-hover:text-[#b45309] transition-all">{t.agentHubTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t.agentHubDesc}</p>
              </div>
            </Link>

            {/* Card 2: Configuration Matcher */}
            <Link href="/configuration" className="group block bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 hover:border-[#b45309] transition-all space-y-4 shadow-sm hover:-translate-y-1">
              <div className="size-11 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">solar_power</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base group-hover:text-emerald-700 transition-all">{t.calcTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t.calcDesc}</p>
              </div>
            </Link>

            {/* Card 3: Admin CMS */}
            <Link href="/admin-desk" className="group block bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 hover:border-[#b45309] transition-all space-y-4 shadow-sm hover:-translate-y-1">
              <div className="size-11 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center font-bold group-hover:bg-purple-600 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">gavel</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base group-hover:text-purple-700 transition-all">{t.adminTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t.adminDesc}</p>
              </div>
            </Link>

            {/* Card 4: Settings & Payments */}
            <Link href="/team-settings" className="group block bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 hover:border-[#b45309] transition-all space-y-4 shadow-sm hover:-translate-y-1">
              <div className="size-11 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base group-hover:text-blue-700 transition-all">{t.teamTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t.teamDesc}</p>
              </div>
            </Link>

            {/* Card 5: Public Customer View */}
            <Link href="/customer-view" className="group block bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 hover:border-[#b45309] transition-all space-y-4 shadow-sm hover:-translate-y-1">
              <div className="size-11 rounded-xl bg-amber-50 text-[#b45309] dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center font-bold group-hover:bg-[#b45309] group-hover:text-white transition-all">
                <span className="material-symbols-outlined">co_present</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base group-hover:text-[#b45309] transition-all">{t.custTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t.custDesc}</p>
              </div>
            </Link>

          </div>
        </section>

      </main>

      <SolarCalculatorModal isOpen={ocrModalOpen} onClose={() => setOcrModalOpen(false)} />
    </PageShell>
  );
}

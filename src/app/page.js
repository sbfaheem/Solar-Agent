'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PageShell from '../components/PageShell';
import { useApp } from '../context/AppContext';
import { seedDatabase } from '../lib/firebaseService';

export default function Home() {
  const { company, lang, getActiveLimit, showToast, loadAllData } = useApp();
  const [solarActive, setSolarActive] = useState(true);

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
    <PageShell>
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-12 animate-fadeIn" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        
        {/* Full-Bleed Cinematic Hero Banner Container */}
        <section className="relative min-h-[450px] flex items-center p-6 sm:p-10 lg:p-12 rounded-3xl overflow-hidden border border-border-base/70 shadow-2xl">
          
          {/* Loop/High-Impact Background Video Tag */}
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

          {/* Translucent overlay for primary text contrast */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent rtl:bg-gradient-to-l rtl:from-slate-950/90 rtl:via-slate-950/60 rtl:to-transparent"></div>

          {/* Banner content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            
            {/* Left Column: Primary Copy (8 cols) */}
            <div className={`lg:col-span-7 space-y-6 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
              
              {/* Floating Glowing Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-xs font-mono font-bold text-[#ffe16d] shadow-[0_0_15px_rgba(253,184,19,0.2)] animate-pulse">
                {t.floatingBadge}
              </div>

              <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {t.title}
              </h1>
              
              <p className="text-slate-200 text-sm sm:text-base max-w-xl leading-relaxed drop-shadow">
                {t.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/configuration" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-white text-black font-display font-semibold transition-all cursor-pointer shadow-md text-xs">
                  <span className="material-symbols-outlined text-sm">wb_sunny</span>
                  {lang === 'ur' ? 'حساب کتاب شروع کریں' : 'New Solar Calculation'}
                </Link>
                <button 
                  onClick={handleSeed}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-sm text-[#fdb813]">database</span>
                  {t.seedBtn}
                </button>
              </div>
            </div>

            {/* Right Column: Interactive 3D Simulator (5 cols) */}
            <div className="lg:col-span-5 bg-black/60 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between gap-5 relative overflow-hidden">
              
              <div className={`flex justify-between items-center border-b border-slate-800/60 pb-2.5 ${
                lang === 'ur' ? 'flex-row-reverse' : ''
              }`}>
                <h3 className="font-display font-bold text-white text-xs">{t.simTitle}</h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  solarActive 
                    ? 'bg-emerald-500/10 text-accent-emerald border-emerald-500/20' 
                    : 'bg-red-500/10 text-accent-red border-red-500/20 animate-pulse'
                }`}>
                  {solarActive ? t.simStatusActive : t.simStatusDark}
                </span>
              </div>

              {/* Scene Viewport */}
              <div className="h-36 w-full flex items-center justify-center relative bg-black/50 border border-slate-800/50 rounded-xl overflow-hidden">
                <div className={`absolute inset-0 transition-colors duration-700 ${
                  solarActive ? 'bg-sky-950/20' : 'bg-black/90'
                }`}></div>

                {solarActive ? (
                  <div className="absolute top-3 right-6 size-8 bg-[#fdb813] rounded-full blur-sm animate-pulse shadow-[0_0_15px_#fdb813]"></div>
                ) : (
                  <div className="absolute top-3 right-6 size-6 bg-slate-400 rounded-full blur-[1px] shadow-[0_0_8px_#94a3b8] flex items-center justify-center overflow-hidden">
                    <div className="size-5 bg-black rounded-full absolute -top-1 -left-1"></div>
                  </div>
                )}

                <div className="relative w-40 h-28 scale-85" style={{ perspective: '800px' }}>
                  <div className="w-full h-full relative transition-transform duration-700" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateZ(-35deg)' }}>
                    
                    <div className="absolute inset-0 bg-slate-800/30 border border-slate-700/40 rounded" style={{ transform: 'translateZ(-10px)' }}></div>

                    {/* House walls */}
                    <div className={`absolute w-16 h-12 origin-bottom-left transition-colors duration-700 ${
                      solarActive ? 'bg-slate-700' : 'bg-slate-900'
                    }`} style={{ transform: 'rotateX(-90deg) translate3d(15px, 0px, 0px)' }}></div>

                    <div className={`absolute w-16 h-12 origin-bottom-left border border-slate-800 transition-colors duration-700 ${
                      solarActive ? 'bg-slate-600' : 'bg-slate-950'
                    }`} style={{ transform: 'rotateX(-90deg) translate3d(15px, -15px, 0px)' }}>
                      <div className={`absolute bottom-0 left-4 w-4 h-7 border border-slate-800 transition-colors duration-700 ${
                        solarActive ? 'bg-amber-900' : 'bg-black'
                      }`}></div>
                      <div className={`absolute top-2 right-2 size-3 border border-slate-800 rounded transition-all duration-700 ${
                        solarActive ? 'bg-[#ffe16d] shadow-[0_0_6px_#ffe16d]' : 'bg-slate-900'
                      }`}></div>
                    </div>

                    <div className={`absolute w-16 h-12 origin-bottom-left border border-slate-800 transition-colors duration-700 ${
                      solarActive ? 'bg-slate-650' : 'bg-slate-900'
                    }`} style={{ transform: 'rotateY(90deg) rotateZ(-90deg) translate3d(0px, 0px, 15px)' }}>
                      <div className={`absolute top-2 left-3 w-4 h-3 border border-slate-800 rounded transition-all duration-700 ${
                        solarActive ? 'bg-[#ffe16d] shadow-[0_0_6px_#ffe16d]' : 'bg-slate-900'
                      }`}></div>
                    </div>

                    {/* Roof */}
                    <div className={`absolute w-18 h-18 origin-center transition-colors duration-700 ${
                      solarActive ? 'bg-slate-550' : 'bg-slate-800'
                    }`} style={{ transform: 'translate3d(14px, -16px, 12px) skewX(5deg)' }}>
                      <div className={`absolute top-1.5 bottom-1.5 left-1.5 right-10 border rounded grid grid-cols-2 gap-0.5 p-0.5 transition-all duration-700 ${
                        solarActive ? 'bg-[#0f2d59] border-[#4ea1de]/50 shadow-[0_0_4px_rgba(78,161,222,0.4)]' : 'bg-slate-900'
                      }`}>
                        <div className="bg-blue-600/30 border border-blue-400/20 rounded-sm"></div>
                        <div className="bg-blue-600/30 border border-blue-400/20 rounded-sm"></div>
                      </div>
                    </div>

                  </div>
                </div>

                {!solarActive && (
                  <div className="absolute bottom-2 left-2 right-2 text-center bg-red-950/90 border border-red-500/20 px-2 py-0.5 rounded text-[8px] text-red-200 font-mono animate-pulse">
                    🚨 Grid Load Shedding Active
                  </div>
                )}
                {solarActive && (
                  <div className="absolute bottom-2 left-2 right-2 text-center bg-emerald-950/90 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] text-emerald-200 font-mono">
                    🔋 24/7 Clean Energy Secured
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button 
                type="button"
                onClick={() => setSolarActive(!solarActive)}
                className={`w-full py-1.5 rounded-lg font-display text-[10px] font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                  solarActive ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-primary hover:bg-white text-black'
                }`}
              >
                <span className="material-symbols-outlined text-xs">
                  {solarActive ? 'power_off' : 'wb_sunny'}
                </span>
                {solarActive ? t.simToggleDark : t.simToggleActive}
              </button>

            </div>

          </div>
        </section>

        {/* Multi-tenant Subscriptions Dashboard */}
        <section className="bg-surface-base border border-border-base rounded-2xl p-6 space-y-6 shadow-sm">
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-base/50 pb-4 ${
            lang === 'ur' ? 'flex-row-reverse' : ''
          }`}>
            <h2 className="font-display font-bold text-white text-lg">{t.metricsHeader}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
              company.billing_status === 'Active' 
                ? 'bg-emerald-500/10 text-accent-emerald border-emerald-500/20' 
                : 'bg-amber-500/10 text-accent-amber border-amber-500/20 animate-pulse'
            }`}>
              {company.billing_status === 'Active' ? t.activeText : t.verifyingText}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">{t.tierLabel}</span>
              <div className="font-display text-xl font-bold text-white">{company.plan} Tier</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">{t.limitLabel}</span>
              <div className="font-mono text-xl font-bold text-white">{activeLimit} Proposals</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">{t.generatedLabel}</span>
              <div className="font-mono text-xl font-bold text-primary-container">{company.proposals_generated} Generated</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">Plan Cost</span>
              <div className="font-mono text-xl font-bold text-white">
                {company.plan === "Silver" ? "30,000" : company.plan === "Gold" ? "50,000" : "75,000"} {t.pkr}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-border-base/50">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <div className={`flex justify-between text-[10px] text-slate-500 font-mono ${
              lang === 'ur' ? 'flex-row-reverse' : ''
            }`}>
              <span>{usagePercentage}% Limit capacity consumed</span>
              <span>{company.proposals_generated} / {activeLimit} Proposals</span>
            </div>
          </div>
        </section>

        {/* Navigation Workspace launcher Grid */}
        <section className="space-y-6">
          <h2 className={`font-display font-bold text-white text-lg border-b border-border-base/40 pb-3 ${
            lang === 'ur' ? 'text-right' : 'text-left'
          }`}>{t.launcherHeader}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Agent Hub */}
            <Link href="/agent-hub" className="group block bg-[#161920] border border-slate-800/80 rounded-2xl p-6 hover:border-primary transition-all space-y-4 shadow-sm hover:-translate-y-1">
              <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                <span className="material-symbols-outlined">leaderboard</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-white text-base group-hover:text-primary transition-all">{t.agentHubTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.agentHubDesc}</p>
              </div>
            </Link>

            {/* Card 2: Configuration Matcher */}
            <Link href="/configuration" className="group block bg-[#161920] border border-slate-800/80 rounded-2xl p-6 hover:border-primary transition-all space-y-4 shadow-sm hover:-translate-y-1">
              <div className="size-11 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald group-hover:bg-accent-emerald group-hover:text-black transition-all">
                <span className="material-symbols-outlined">solar_power</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-white text-base group-hover:text-accent-emerald transition-all">{t.calcTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.calcDesc}</p>
              </div>
            </Link>

            {/* Card 3: Admin CMS */}
            <Link href="/admin-desk" className="group block bg-[#161920] border border-slate-800/80 rounded-2xl p-6 hover:border-primary transition-all space-y-4 shadow-sm hover:-translate-y-1">
              <div className="size-11 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-black transition-all">
                <span className="material-symbols-outlined">gavel</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-white text-base group-hover:text-primary-container transition-all">{t.adminTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.adminDesc}</p>
              </div>
            </Link>

            {/* Card 4: Settings & Payments */}
            <Link href="/team-settings" className="group block bg-[#161920] border border-slate-800/80 rounded-2xl p-6 hover:border-primary transition-all space-y-4 shadow-sm hover:-translate-y-1">
              <div className="size-11 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-black transition-all">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-white text-base group-hover:text-white transition-all">{t.teamTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.teamDesc}</p>
              </div>
            </Link>

            {/* Card 5: Public Customer View */}
            <Link href="/customer-view" className="group block bg-[#161920] border border-slate-800/80 rounded-2xl p-6 hover:border-primary transition-all space-y-4 shadow-sm hover:-translate-y-1">
              <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-accent-amber group-hover:bg-accent-amber group-hover:text-black transition-all">
                <span className="material-symbols-outlined">co_present</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-white text-base group-hover:text-accent-amber transition-all">{t.custTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.custDesc}</p>
              </div>
            </Link>

          </div>
        </section>

      </main>
    </PageShell>
  );
}

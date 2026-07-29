'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const { 
    signInDistributor, 
    signInSuperAdmin, 
    signInWithGoogle, 
    signUpDistributor, 
    bankDetails,
    lang, 
    toggleLang, 
    showToast 
  } = useApp();

  const [portalMode, setPortalMode] = useState('distributor'); // 'distributor' or 'admin'
  const [selectedDistributorAccount, setSelectedDistributorAccount] = useState('REGISTER_NEW'); 

  // Sign In Form State
  const [email, setEmail] = useState('kpkvolt@solaragent.pk');
  const [password, setPassword] = useState('••••••••');
  const [pendingError, setPendingError] = useState(null);

  // Dynamic Distributor Registration Form State
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regCity, setRegCity] = useState('Peshawar');
  const [regPlan, setRegPlan] = useState('Silver');

  // Registration Request & Payment Modal State
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regModalData, setRegModalData] = useState(null);
  const [copiedIban, setCopiedIban] = useState(false);

  const translations = {
    en: {
      brandSub: "B2B Solar SaaS & Engineering Platform",
      distributorPortalBtn: "Distributor Portal",
      adminPortalBtn: "Super Admin Portal",
      distributorTitle: "Distributor Partner Authorization",
      distributorSub: "Select an authorized distributor account or register a new EPC firm",
      googleSignIn: "Sign In with Google",
      orSelectAcc: "OR SELECT DISTRIBUTOR ACCOUNT",
      selectDistributorLabel: "SELECT AUTHORIZED DISTRIBUTOR ACCOUNT",
      registerNewOption: "➕ Register New Distributor...",
      provSectionHeader: "DISTRIBUTOR PROVISIONING & ACCOUNT DETAILS",
      companyNameLabel: "COMPANY NAME (E.G. KHYBER GREEN ENERGY)",
      companyNamePlaceholder: "e.g. Khyber Green Energy",
      workEmailLabel: "WORK EMAIL ID (E.G. INFO@KHYBERGREEN.PK)",
      workEmailPlaceholder: "e.g. info@khybergreen.pk",
      contactNumLabel: "CONTACT NUMBER",
      contactNumPlaceholder: "+92 300 9876543",
      locationCityLabel: "LOCATION / CITY",
      locationCityPlaceholder: "Peshawar / Karachi",
      subTierLabel: "SUBSCRIPTION TIER PLAN",
      silverPlanOpt: "Silver Plan (35 Proposals/mo - 35,000 PKR)",
      goldPlanOpt: "Gold Tier Plan (60 Proposals/mo - 55,000 PKR)",
      platPlanOpt: "Platinum Enterprise (100 Proposals/mo - 75,000 PKR)",
      distWorkEmailLabel: "DISTRIBUTOR WORK EMAIL",
      accountPassLabel: "ACCOUNT PASSWORD",
      provisionBtnText: "Submit Registration & View Payment Instructions",
      unlockWorkspaceBtnText: "Unlock Distributor Workspace",
      adminTitle: "Super Admin Governance Desk",
      adminSub: "Full system oversight, distributor approval & ledger management",
      adminEmailLabel: "SUPER ADMIN EMAIL",
      adminPassLabel: "GOVERNANCE PASSWORD",
      adminSubmitBtn: "Unlock Super Admin Governance Desk",
      adminNote: "👑 Super Admin has global rights to view all registered distributors, verify receipts, and manage catalog settings.",
      footerText: "© 2026 Solar Agent | B2B Solar SaaS Platform. Multi-Tenant Role Security Active."
    },
    ur: {
      brandSub: "بی ٹو بی سولر ساس اور انجینئرنگ پلیٹ فارم",
      distributorPortalBtn: "ڈسٹری بیوٹر پورٹل",
      adminPortalBtn: "سپر ایڈمن پورٹل",
      distributorTitle: "ڈسٹری بیوٹر پارٹنر لاگ ان و رجسٹریشن",
      distributorSub: "مجاز ڈسٹری بیوٹر اکاؤنٹ منتخب کریں یا نئی ای پی سی فرم کا اندراج کریں",
      googleSignIn: "گوگل کے ذریعے سائن ان کریں",
      orSelectAcc: "یا ڈسٹری بیوٹر اکاؤنٹ کا انتخاب کریں",
      selectDistributorLabel: "مجاز ڈسٹری بیوٹر اکاؤنٹ منتخب کریں",
      registerNewOption: "➕ نیا ڈسٹری بیوٹر رجسٹر کریں...",
      provSectionHeader: "ڈسٹری بیوٹر رجسٹریشن اور اکاؤنٹ کی تفصیلات",
      companyNameLabel: "کمپنی کا نام (مثلاً خیبر گرین انرجی)",
      companyNamePlaceholder: "مثلاً خیبر گرین انرجی",
      workEmailLabel: "کام کا ای میل (مثلاً info@khybergreen.pk)",
      workEmailPlaceholder: "مثلاً info@khybergreen.pk",
      contactNumLabel: "رابطہ نمبر",
      contactNumPlaceholder: "+92 300 9876543",
      locationCityLabel: "مقام / شہر",
      locationCityPlaceholder: "پشاور / کراچی",
      subTierLabel: "سبسکرپشن پلان کا انتخاب",
      silverPlanOpt: "سلور پلان (35 پروپوزلز ماہانہ - 35,000 روپے)",
      goldPlanOpt: "گولڈ ٹیر پلان (60 پروپوزلز ماہانہ - 55,000 روپے)",
      platPlanOpt: "پلیٹینم انٹرپرائز (100 پروپوزلز ماہانہ - 75,000 روپے)",
      distWorkEmailLabel: "ڈسٹری بیوٹر ورک ای میل",
      accountPassLabel: "اکاؤنٹ پاس ورڈ",
      provisionBtnText: "درخواست جمع کریں اور پیمنٹ کی ہدایات دیکھیں",
      unlockWorkspaceBtnText: "ڈسٹری بیوٹر ورک اسپیس کھولیں",
      adminTitle: "سپر ایڈمن گورننس ڈیسک",
      adminSub: "مکمل سسٹم کنٹرول، ڈسٹری بیوٹر منظوری اور لیجر مینجمنٹ",
      adminEmailLabel: "سپر ایڈمن ای میل",
      adminPassLabel: "گورننس پاس ورڈ",
      adminSubmitBtn: "سپر ایڈمن گورننس ڈیسک کھولیں",
      adminNote: "👑 سپر ایڈمن کو تمام رجسٹرڈ ڈسٹری بیوٹرز کا ڈیٹا دیکھنے، رسیدوں کی تصدیق کرنے اور کیٹلاگ سیٹنگز کا مکمل اختیار حاصل ہے۔",
      footerText: "© 2026 سولر ایجنٹ | بی ٹو بی سولر ساس پلیٹ فارم۔ ملٹی ٹیننٹ سیکورٹی فعال ہے۔"
    }
  };

  const t = translations[lang] || translations.en;

  const handleDropdownSelect = (val) => {
    setSelectedDistributorAccount(val);
    setPendingError(null);
    if (val === 'REGISTER_NEW') {
      setEmail('');
    } else {
      setEmail(val);
    }
  };

  const handleGoogleClick = () => {
    setPendingError(null);
    const res = signInWithGoogle('distributor');
    if (res && res.status === 'pending') {
      setRegModalData(res.distributor);
      setRegModalOpen(true);
      if (res.message) {
        setPendingError(res.message);
      }
    }
  };

  const handleSubmitDistributor = (e) => {
    e.preventDefault();
    setPendingError(null);

    if (selectedDistributorAccount === 'REGISTER_NEW') {
      if (!regCompany || !regEmail) {
        showToast(lang === 'ur' ? "⚠️ براہ کرم کمپنی کا نام اور ای میل درج کریں" : "⚠️ Please enter Company Name and Work Email", "error");
        return;
      }

      const res = signUpDistributor({
        companyName: regCompany,
        name: regCompany,
        email: regEmail,
        password: password || 'pass123',
        plan: regPlan,
        contact: regContact,
        city: regCity
      });

      if (res && res.status === 'pending') {
        setRegModalData(res.distributor);
        setRegModalOpen(true);
      }
    } else {
      if (!email) {
        showToast(lang === 'ur' ? "⚠️ براہ کرم درست ای میل درج کریں" : "⚠️ Please enter a valid email address", "error");
        return;
      }
      
      const res = signInDistributor(email, password);
      if (res && res.error === 'pending') {
        setPendingError(res.message);
      }
    }
  };

  const handleAdminSignIn = (e) => {
    e.preventDefault();
    signInSuperAdmin(email, password);
  };

  const handleCopyIban = () => {
    navigator.clipboard.writeText(bankDetails.iban);
    setCopiedIban(true);
    showToast("IBAN copied to clipboard!");
    setTimeout(() => setCopiedIban(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col justify-between p-4 sm:p-6 font-sans" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      
      {/* Top Header & Portal Selector */}
      <header className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto w-full gap-4">
        <div className="flex items-center gap-3">
          <span className="size-10 rounded-2xl bg-[#b45309] text-white flex items-center justify-center font-bold text-xl shadow-md">
            <span className="material-symbols-outlined">solar_power</span>
          </span>
          <div>
            <span className="font-display font-extrabold text-slate-900 text-xl block">Solar Agent</span>
            <span className="text-xs text-slate-500 font-medium">{t.brandSub}</span>
          </div>
        </div>

        {/* Portal Switcher Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1 text-xs font-bold font-display border border-slate-300/60 shadow-xs">
            <button 
              type="button"
              onClick={() => { setPortalMode('distributor'); setSelectedDistributorAccount('REGISTER_NEW'); setPendingError(null); }}
              className={`px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                portalMode === 'distributor' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">domain</span>
              <span>{t.distributorPortalBtn}</span>
            </button>

            <button 
              type="button"
              onClick={() => { setPortalMode('admin'); setEmail('superadmin@solaragent.pk'); setPendingError(null); }}
              className={`px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                portalMode === 'admin' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">shield_person</span>
              <span>{t.adminPortalBtn}</span>
            </button>
          </div>

          <button 
            onClick={toggleLang}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer shadow-xs"
          >
            {lang === 'en' ? 'اردو' : 'English'}
          </button>
        </div>
      </header>

      {/* Main Light Mode Card */}
      <main className="my-auto max-w-xl mx-auto w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        
        {/* DISTRIBUTOR PORTAL AUTHENTICATION & DYNAMIC REGISTRATION */}
        {portalMode === 'distributor' ? (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 space-y-1">
              <h2 className="font-display font-extrabold text-slate-900 text-2xl">{t.distributorTitle}</h2>
              <p className="text-slate-500 text-xs font-medium">{t.distributorSub}</p>
            </div>

            {/* Inline Warning Alert for Pending Distributor Login Block */}
            {pendingError && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium space-y-1 animate-bounce shadow-sm">
                <div className="font-extrabold font-display flex items-center gap-2 text-amber-800">
                  <span className="material-symbols-outlined text-base">hourglass_top</span>
                  <span>Approval Pending Verification</span>
                </div>
                <p>{pendingError}</p>
              </div>
            )}

            {/* Google Sign-In Option (Follows Super Admin Approval & Payment Verification Flow) */}
            <button 
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-display font-extrabold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-slate-300"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{t.googleSignIn}</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">{t.orSelectAcc}</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <form onSubmit={handleSubmitDistributor} className="space-y-5">
              
              {/* DISTRIBUTOR SELECT DROPDOWN (WITH ➕ REGISTER NEW DISTRIBUTOR AT TOP) */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#b45309] uppercase tracking-wide block">
                  {t.selectDistributorLabel}
                </label>
                <select 
                  value={selectedDistributorAccount}
                  onChange={(e) => handleDropdownSelect(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-[#b45309] focus:ring-2 focus:ring-[#b45309]/20 cursor-pointer shadow-xs"
                >
                  <option value="REGISTER_NEW">{t.registerNewOption}</option>
                  <option value="google.partner@solaragent.pk">⚡ Google Partner Solar EPC (google.partner@solaragent.pk - Pending Verification)</option>
                  <option value="kpkvolt@solaragent.pk">⚡ KPK Volt Tech (kpkvolt@solaragent.pk - Pending Verification)</option>
                  <option value="info@khybergreen.pk">⚡ Khyber Green Energy (info@khybergreen.pk - Pending Verification)</option>
                  <option value="info@indussolar.pk">⚡ Indus Solar Systems (info@indussolar.pk - Platinum Tier Verified)</option>
                  <option value="sales@punjabenergy.pk">⚡ Punjab Energy EPC (sales@punjabenergy.pk - Gold Tier Active)</option>
                </select>
              </div>

              {/* DYNAMIC REGISTRATION FIELDS (REVEALED WHEN REGISTER NEW DISTRIBUTOR IS SELECTED) */}
              {selectedDistributorAccount === 'REGISTER_NEW' ? (
                <div className="space-y-4 bg-[#fffbeb] p-5 rounded-2xl border border-[#fef08a] animate-fadeIn text-xs">
                  <div className="text-xs font-extrabold text-[#854d0e] font-display uppercase border-b border-[#fef08a] pb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">badge</span>
                    <span>{t.provSectionHeader}</span>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block font-sans">
                      {t.companyNameLabel}
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder={t.companyNamePlaceholder}
                      value={regCompany}
                      onChange={e => setRegCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#b45309] rounded-xl text-slate-900 font-mono focus:outline-none text-xs font-bold shadow-xs"
                    />
                  </div>

                  {/* Work Email ID */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block font-sans">
                      {t.workEmailLabel}
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder={t.workEmailPlaceholder}
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#b45309] rounded-xl text-slate-900 font-mono focus:outline-none text-xs shadow-xs"
                    />
                  </div>

                  {/* Contact Number & City */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block font-sans">
                        {t.contactNumLabel}
                      </label>
                      <input 
                        type="text" 
                        placeholder={t.contactNumPlaceholder}
                        value={regContact}
                        onChange={e => setRegContact(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#b45309] rounded-xl text-slate-900 font-mono focus:outline-none text-xs shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block font-sans">
                        {t.locationCityLabel}
                      </label>
                      <input 
                        type="text" 
                        placeholder={t.locationCityPlaceholder}
                        value={regCity}
                        onChange={e => setRegCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#b45309] rounded-xl text-slate-900 font-mono focus:outline-none text-xs shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Subscription Tier Plan Selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block font-sans">
                      {t.subTierLabel}
                    </label>
                    <select 
                      value={regPlan}
                      onChange={e => setRegPlan(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#b45309] rounded-xl text-[#b45309] font-mono font-bold focus:outline-none text-xs cursor-pointer shadow-xs"
                    >
                      <option value="Silver">{t.silverPlanOpt}</option>
                      <option value="Gold">{t.goldPlanOpt}</option>
                      <option value="Platinum">{t.platPlanOpt}</option>
                    </select>
                  </div>

                </div>
              ) : (
                /* EXISTING DISTRIBUTOR LOGIN FIELDS */
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.distWorkEmailLabel}
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 focus:border-[#b45309] rounded-xl text-slate-900 font-mono focus:outline-none shadow-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.accountPassLabel}
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 focus:border-[#b45309] rounded-xl text-slate-900 font-mono focus:outline-none shadow-xs"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Action */}
              <button 
                type="submit"
                className="w-full py-4 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold transition-all cursor-pointer shadow-md text-xs text-center flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-sm">
                  {selectedDistributorAccount === 'REGISTER_NEW' ? 'how_to_reg' : 'lock_open'}
                </span>
                <span>
                  {selectedDistributorAccount === 'REGISTER_NEW' 
                    ? t.provisionBtnText 
                    : t.unlockWorkspaceBtnText}
                </span>
              </button>
            </form>

          </div>
        ) : (
          /* SUPER ADMIN GOVERNANCE PORTAL */
          <div className="space-y-6">
            <div className="border-b border-amber-200 pb-4 text-center space-y-2">
              <span className="size-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold mx-auto shadow-md">
                <span className="material-symbols-outlined text-2xl">shield_person</span>
              </span>
              <h2 className="font-display font-extrabold text-slate-900 text-2xl">{t.adminTitle}</h2>
              <p className="text-slate-500 text-xs font-medium">{t.adminSub}</p>
            </div>

            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">{t.adminEmailLabel}</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl text-slate-900 font-mono font-bold focus:outline-none shadow-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">{t.adminPassLabel}</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl text-slate-900 font-mono focus:outline-none shadow-xs"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display font-extrabold transition-all cursor-pointer shadow-lg text-xs text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>{t.adminSubmitBtn}</span>
              </button>
            </form>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 text-center font-medium">
              {t.adminNote}
            </div>
          </div>
        )}

      </main>

      {/* REGISTRATION REQUEST & PAYMENT MODAL */}
      {regModalOpen && regModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-scaleUp text-slate-900">
            
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-amber-100 text-[#b45309] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">mark_email_read</span>
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 text-lg">Registration Request Submitted</h3>
                  <p className="text-xs text-slate-500 font-medium">Status: Pending Super Admin Approval & Verification</p>
                </div>
              </div>
              <button 
                onClick={() => setRegModalOpen(false)}
                className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Notification Policy Statement */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-2 font-medium">
              <div className="font-bold flex items-center gap-2 text-amber-950 font-display">
                <span className="material-symbols-outlined text-base">notifications_active</span>
                <span>Automated Email Notification Policy</span>
              </div>
              <p className="leading-relaxed">
                Once Super Admin receives your payment wire deposit and accepts the request, an automated email will be sent to your registered work email address (<strong className="font-mono text-slate-900">{regModalData.email}</strong>) stating:
              </p>
              <div className="p-3 bg-white border border-amber-300 rounded-xl font-mono text-amber-900 font-bold text-center">
                "Your Account Has Been Successfully Created You Should Login Now"
              </div>
            </div>

            {/* Meezan Bank Deposit Instructions Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 font-sans font-bold text-slate-900">
                <span>Meezan Bank Direct Deposit Wire</span>
                <button 
                  onClick={handleCopyIban}
                  className="px-3 py-1 rounded-lg bg-[#b45309] hover:bg-[#92400e] text-white text-[11px] font-mono cursor-pointer shadow-xs"
                >
                  {copiedIban ? 'Copied ✓' : 'Copy IBAN'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Bank Name</span>
                  <span className="font-bold text-slate-800">{bankDetails.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Account Title</span>
                  <span className="font-bold text-slate-800">{bankDetails.accountTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Account Number</span>
                  <span className="font-bold text-slate-800">{bankDetails.accountNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">IBAN Number</span>
                  <span className="font-bold text-emerald-600 truncate block">{bankDetails.iban}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setRegModalOpen(false)}
              className="w-full py-3.5 bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all text-center"
            >
              Understood — Close & Await Verification
            </button>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 font-mono max-w-7xl mx-auto w-full pt-4">
        {t.footerText}
      </footer>

    </div>
  );
}

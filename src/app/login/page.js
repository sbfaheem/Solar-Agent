'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const { 
    distributors,
    signInDistributor, 
    signInSuperAdmin, 
    signInWithGoogle, 
    signUpDistributor, 
    bankDetails,
    lang, 
    toggleLang, 
    showToast,
    formatPrice,
    currency,
    toggleCurrency
  } = useApp();

  const [portalMode, setPortalMode] = useState('distributor'); // 'distributor' or 'admin'
  const [selectedDistributorAccount, setSelectedDistributorAccount] = useState('REGISTER_NEW'); 

  // Sign In Form State: Blank defaults for strict security (no pre-filled admin credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Legal Modals State
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const translations = {
    en: {
      brandSub: "B2B Solar SaaS & Engineering Platform",
      distributorPortalBtn: "Distributor Portal",
      adminPortalBtn: "Super Admin Portal",
      distributorTitle: "Distributor Partner Authorization",
      distributorSub: "Register a new EPC firm or sign in with your authorized work email",
      googleSignIn: "Sign In with Google",
      orSelectAcc: "OR SELECT AUTHORIZATION ACTION",
      selectDistributorLabel: "SELECT AUTHORIZATION MODE",
      registerNewOption: "➕ Register New Distributor...",
      signInExistingOption: "🔑 Sign In with Existing Authorized Work Email...",
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
      silverPlanOpt: `Silver Plan (35 Proposals/mo - ${formatPrice(35000)})`,
      goldPlanOpt: `Gold Tier Plan (60 Proposals/mo - ${formatPrice(55000)})`,
      platPlanOpt: `Platinum Enterprise (100 Proposals/mo - ${formatPrice(75000)})`,
      distWorkEmailLabel: "DISTRIBUTOR WORK EMAIL",
      accountPassLabel: "ACCOUNT PASSWORD",
      provisionBtnText: "Submit Registration & View Wire Transfer Details",
      unlockWorkspaceBtnText: "Unlock Distributor Workspace",
      adminTitle: "Super Admin Governance Desk",
      adminSub: "Full system oversight, distributor approval & ledger management",
      adminEmailLabel: "SUPER ADMIN EMAIL",
      adminPassLabel: "GOVERNANCE PASSWORD",
      adminSubmitBtn: "Unlock Super Admin Governance Desk",
      adminNote: "👑 Super Admin authentication is required to access governance tools. Enter registered admin credentials.",
      footerText: "© 2026 Solar Agent | B2B Solar SaaS Platform. Multi-Tenant Role Security Active."
    },
    ur: {
      brandSub: "بی ٹو بی سولر ساس اور انجینئرنگ پلیٹ فارم",
      distributorPortalBtn: "ڈسٹری بیوٹر پورٹل",
      adminPortalBtn: "سپر ایڈمن پورٹل",
      distributorTitle: "ڈسٹری بیوٹر پارٹنر لاگ ان و رجسٹریشن",
      distributorSub: "نیا ڈسٹری بیوٹر رجسٹر کریں یا اپنے ورک ای میل کے ذریعے لاگ ان کریں",
      googleSignIn: "گوگل کے ذریعے سائن ان کریں",
      orSelectAcc: "یا پورٹل کا انتخاب کریں",
      selectDistributorLabel: "اختیار کا انتخاب کریں",
      registerNewOption: "➕ نیا ڈسٹری بیوٹر رجسٹر کریں...",
      signInExistingOption: "🔑 موجودہ ورک ای میل کے ذریعے لاگ ان کریں...",
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
      silverPlanOpt: `سلور پلان (35 پروپوزلز ماہانہ - ${formatPrice(35000)})`,
      goldPlanOpt: `گولڈ ٹیر پلان (60 پروپوزلز ماہانہ - ${formatPrice(55000)})`,
      platPlanOpt: `پلیٹینم انٹرپرائز (100 پروپوزلز ماہانہ - ${formatPrice(75000)})`,
      distWorkEmailLabel: "ڈسٹری بیوٹر ورک ای میل",
      accountPassLabel: "اکاؤنٹ پاس ورڈ",
      provisionBtnText: "درخواست جمع کریں اور وائر ٹرانسفر کی تفصیلات دیکھیں",
      unlockWorkspaceBtnText: "ڈسٹری بیوٹر ورک اسپیس کھولیں",
      adminTitle: "سپر ایڈمن گورننس ڈیسک",
      adminSub: "مکمل سسٹم کنٹرول، ڈسٹری بیوٹر منظوری اور لیجر مینجمنٹ",
      adminEmailLabel: "سپر ایڈمن ای میل",
      adminPassLabel: "گورننس پاس ورڈ",
      adminSubmitBtn: "سپر ایڈمن گورننس ڈیسک کھولیں",
      adminNote: "👑 ایڈمن ٹولز تک رسائی کے لیے سپر ایڈمن لاگ ان ضروری ہے۔ اپنے کریڈنشلز درج کریں۔",
      footerText: "© 2026 سولر ایجنٹ | بی ٹو بی سولر ساس پلیٹ فارم۔ ملٹی ٹیننٹ سیکورٹی فعال ہے۔"
    }
  };

  const t = translations[lang] || translations.en;

  const handleDropdownSelect = (val) => {
    setSelectedDistributorAccount(val);
    setPendingError(null);
    setEmail('');
    setPassword('');
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
    if (!email || !password) {
      showToast("⚠️ Please enter Super Admin Email and Password", "error");
      return;
    }
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

        {/* Portal Switcher & Controls Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1 text-xs font-bold font-display border border-slate-300/60 shadow-xs">
            <button 
              type="button"
              onClick={() => { setPortalMode('distributor'); setSelectedDistributorAccount('REGISTER_NEW'); setEmail(''); setPassword(''); setPendingError(null); }}
              className={`px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                portalMode === 'distributor' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">domain</span>
              <span>{t.distributorPortalBtn}</span>
            </button>

            <button 
              type="button"
              onClick={() => { setPortalMode('admin'); setEmail(''); setPassword(''); setPendingError(null); }}
              className={`px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                portalMode === 'admin' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">shield_person</span>
              <span>{t.adminPortalBtn}</span>
            </button>
          </div>

          <button 
            onClick={toggleCurrency}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-amber-800 hover:text-amber-950 cursor-pointer shadow-xs font-mono"
            title="Toggle Currency"
          >
            {currency} ⇄ {currency === 'PKR' ? 'USD' : 'PKR'}
          </button>

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

            {/* Google Sign-In Option */}
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
              
              {/* DISTRIBUTOR ACTION DROPDOWN (NO PRIVATE CLIENT LISTING) */}
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
                  <option value="SIGN_IN_EXISTING">{t.signInExistingOption}</option>
                </select>
              </div>

              {/* DYNAMIC REGISTRATION FIELDS */}
              {selectedDistributorAccount === 'REGISTER_NEW' ? (
                <div className="space-y-4 bg-[#fffbeb] p-5 rounded-2xl border border-[#fef08a] animate-fadeIn text-xs">
                  <div className="text-xs font-extrabold text-[#854d0e] font-display uppercase border-b border-[#fef08a] pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">badge</span>
                      <span>{t.provSectionHeader}</span>
                    </span>
                  </div>

                  {/* Explicit Payment Gateway Notice */}
                  <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300 text-amber-950 font-medium text-[11px] space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <span className="material-symbols-outlined text-sm">account_balance</span>
                      <span>B2B Direct Wire Transfer Mode Active</span>
                    </div>
                    <p>
                      Activations are currently verified via Direct Meezan Bank Wire Deposit. Digital card payment gateways are also supported inside Team Settings.
                    </p>
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

                  {/* Terms & Privacy Links */}
                  <div className="pt-2 text-[10px] text-slate-500 font-sans flex items-center justify-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => setPrivacyModalOpen(true)}
                      className="hover:underline text-[#b45309] font-bold cursor-pointer"
                    >
                      🔒 Privacy Policy
                    </button>
                    <span>•</span>
                    <button 
                      type="button" 
                      onClick={() => setTermsModalOpen(true)}
                      className="hover:underline text-[#b45309] font-bold cursor-pointer"
                    >
                      📄 Terms of Service
                    </button>
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
                      placeholder="e.g. distributor@solaragent.pk"
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
                      placeholder="Enter account password"
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
          /* SUPER ADMIN GOVERNANCE PORTAL (STRICT EMPTY CREDENTIAL DEFAULTS) */
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
                  placeholder="Enter super admin email"
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
                  placeholder="Enter governance password"
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
                  <p className="text-xs text-slate-500 font-medium">Status: Pending Super Admin Approval & Wire Verification</p>
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
                Once Super Admin receives your Meezan Bank wire deposit and accepts the request, an automated email will be sent to your registered work email address (<strong className="font-mono text-slate-900">{regModalData.email}</strong>) stating:
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

      {/* PRIVACY POLICY MODAL */}
      {privacyModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl animate-scaleUp text-slate-900 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-display font-extrabold text-lg">🔒 Solar Agent B2B Privacy Policy</h3>
              <button onClick={() => setPrivacyModalOpen(false)} className="size-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto leading-relaxed text-slate-600">
              <p><strong>1. Data Isolation & Confidentiality:</strong> Solar Agent enforces strict multi-tenant data isolation. Client proposals, project hardware specs, and pricing calculations generated by your distributor account are strictly isolated and never shared with other firms.</p>
              <p><strong>2. Contact & Organization Details:</strong> Information collected during registration (company name, work email, contact numbers) is solely used for account provisioning, payment verification, and automated notification services.</p>
              <p><strong>3. Security Standards:</strong> We implement encrypted communications and role-based access control (RBAC) to ensure unauthorized visitors cannot access distributor workspaces or administrative governance desks.</p>
            </div>
            <button onClick={() => setPrivacyModalOpen(false)} className="w-full py-3 bg-[#b45309] text-white font-extrabold rounded-xl text-xs">
              Close Privacy Policy
            </button>
          </div>
        </div>
      )}

      {/* TERMS OF SERVICE MODAL */}
      {termsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl animate-scaleUp text-slate-900 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-display font-extrabold text-lg">📄 Solar Agent Terms of Service</h3>
              <button onClick={() => setTermsModalOpen(false)} className="size-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto leading-relaxed text-slate-600">
              <p><strong>1. Distributor Subscription Terms:</strong> Distributors subscribe to monthly quota plans (Silver 35 proposals, Gold 60 proposals, Platinum 100 proposals). Account activation is subject to Super Admin wire deposit verification.</p>
              <p><strong>2. Authorized Usage:</strong> Each distributor account is granted access strictly for commercial solar engineering proposal generation and project lead management.</p>
              <p><strong>3. Super Admin Governance:</strong> Solar Agent reserves the right to review payment verification receipts and suspend unauthorized profiles violating terms.</p>
            </div>
            <button onClick={() => setTermsModalOpen(false)} className="w-full py-3 bg-[#b45309] text-white font-extrabold rounded-xl text-xs">
              Close Terms of Service
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 font-mono max-w-7xl mx-auto w-full pt-4 space-y-2">
        <div className="flex items-center justify-center gap-4 text-[11px] font-sans">
          <button onClick={() => setPrivacyModalOpen(true)} className="hover:underline text-slate-600 font-bold">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => setTermsModalOpen(true)} className="hover:underline text-slate-600 font-bold">Terms of Service</button>
        </div>
        <p>{t.footerText}</p>
      </footer>

    </div>
  );
}

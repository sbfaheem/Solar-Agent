'use client';

import React, { useState, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';
import { saveLivePresentation } from '../../lib/firebaseService';

export default function ConfigurationWizard() {
  const { 
    inverters, 
    solarPanels, 
    currentLead, 
    setCurrentLead, 
    calcParams, 
    setCalcParams, 
    updateLead, 
    addLead,
    lang,
    showToast 
  } = useApp();

  const [activeStep, setActiveStep] = useState(1); 
  const [profileMode, setProfileMode] = useState('ocr'); 
  const [ocrLoading, setOcrLoading] = useState(false);
  
  // Local Edit Modal copy
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    contact_number: '',
    installation_address: '',
    email_address: '',
    status: 'Draft',
    system_size_kw: 0.0,
    total_investment: 0
  });

  const openEditModal = () => {
    if (!currentLead) {
      showToast(lang === 'ur' ? "⚠️ براہ کرم پہلے ایک پروجیکٹ لیڈ کو منتخب کریں!" : "⚠️ Please select or create a project lead first!", "error");
      return;
    }
    setEditFormData({
      customer_name: currentLead.customer_name || '',
      contact_number: currentLead.contact_number || '',
      installation_address: currentLead.installation_address || '',
      email_address: currentLead.email_address || '',
      status: currentLead.status || 'Draft',
      system_size_kw: currentLead.system_size_kw || 0.0,
      total_investment: currentLead.total_investment || 0
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updated = await updateLead(currentLead.id, editFormData);
    if (updated) {
      setCurrentLead(updated);
      setEditModalOpen(false);
    }
  };

  // OCR Upload simulator
  const handleOcrUpload = (e) => {
    setOcrLoading(true);
    setTimeout(() => {
      setOcrLoading(false);
      setCalcParams(prev => ({
        ...prev,
        monthlyUnits: 580,
        utilityProvider: 'KE'
      }));
      showToast(lang === 'ur' ? "💾 بل کامیابی کے ساتھ اسکین ہو گیا! 580 یونٹس حاصل ہوئے۔" : "💾 Bill scanned successfully! Extracted 580 kWh average.");
    }, 2000);
  };

  // Auto match inverter and panel
  useEffect(() => {
    if (inverters.length > 0 && !calcParams.selectedInverter) {
      const standardInv = inverters.find(i => i.capacity_kw === 5.0 && i.type === 'Hybrid') || inverters[0];
      setCalcParams(prev => ({ ...prev, selectedInverter: standardInv }));
    }
    if (solarPanels.length > 0 && !calcParams.selectedPanel) {
      setCalcParams(prev => ({ ...prev, selectedPanel: solarPanels[0] }));
    }
  }, [inverters, solarPanels]);

  // Dynamic calculations
  const calculateSystemSize = () => {
    const units = profileMode === 'ocr' 
      ? calcParams.monthlyUnits 
      : calcParams.customUnits.reduce((sum, u) => sum + u, 0) / 12;
    return parseFloat((units / 120).toFixed(2));
  };

  const systemSize = calculateSystemSize();
  const panelCapacityW = calcParams.selectedPanel ? calcParams.selectedPanel.default_wattage : 580;
  const panelCount = Math.ceil((systemSize * 1000) / panelCapacityW);

  const calculateTotalCost = () => {
    const inverterCost = calcParams.selectedInverter ? calcParams.selectedInverter.estimated_base_price_pkr : 240000;
    const panelPricePerWatt = calcParams.selectedPanel ? calcParams.selectedPanel.price_per_watt_pkr : 40.0;
    const panelsCost = (systemSize * 1000) * panelPricePerWatt;
    const structureAndWiring = systemSize * 15000;
    const installationNet = 40000;
    return Math.round(inverterCost + panelsCost + structureAndWiring + installationNet);
  };

  const totalCost = calculateTotalCost();
  const annualSavings = Math.round(systemSize * 120 * 12 * 45); 
  const paybackYears = parseFloat((totalCost / annualSavings).toFixed(1));

  // Broadcasting Changes to Live Customer Sync Channel
  useEffect(() => {
    if (calcParams.selectedInverter && calcParams.selectedPanel) {
      saveLivePresentation({
        systemSize,
        panelCount,
        panelModel: calcParams.selectedPanel.model_name,
        inverterModel: calcParams.selectedInverter.model_name,
        totalCost,
        annualSavings,
        paybackYears,
        utilityProvider: calcParams.utilityProvider,
        connectionType: calcParams.connectionType
      });
    }
  }, [systemSize, panelCount, calcParams.selectedInverter, calcParams.selectedPanel, totalCost, annualSavings, paybackYears, calcParams.utilityProvider, calcParams.connectionType]);

  const handleSaveProposal = async () => {
    const specs = {
      system_size_kw: systemSize,
      total_investment: totalCost,
      status: 'Sent'
    };

    if (currentLead) {
      const updated = await updateLead(currentLead.id, specs);
      if (updated) {
        setCurrentLead(updated);
        showToast(lang === 'ur' ? "💾 پروپوزل ڈیٹا بیس میں محفوظ کر لیا گیا ہے!" : "💾 Hardware configuration updated on lead!");
      }
    } else {
      const name = prompt(lang === 'ur' ? "گاہک کا نام درج کریں:" : "Enter Customer Name for new lead:");
      if (!name) return;
      const contact = prompt(lang === 'ur' ? "رابطہ نمبر درج کریں:" : "Enter Contact Number:");
      if (!contact) return;
      const addr = prompt(lang === 'ur' ? "انسٹالیشن کا پتہ درج کریں:" : "Enter Installation Address:");
      if (!addr) return;
      
      const created = await addLead({
        customer_name: name,
        contact_number: contact,
        installation_address: addr,
        ...specs
      });
      if (created) {
        setCurrentLead(created);
      }
    }
  };

  // Translations
  const translations = {
    en: {
      editBanner: "System Engineering & Customization",
      noLead: "Configure specs (unlinked lead mode)",
      activeLead: "Editing specs for Customer:",
      step1: "1. Load Profile",
      step2: "2. Hardware Matching",
      step3: "3. Final Proposal",
      profileTitle: "Step 1: Energy Profiling",
      ocrMode: "OCR Scanner",
      flexMode: "Flexible History",
      averageLabel: "Average Monthly Consumption (kWh)",
      utilityPhase: "Utility Phase",
      utilityComp: "Utility Company",
      recommendedSize: "Recommended System Size",
      requiredPanels: "Required Panel Count",
      netMetering: "Utility Net Metering",
      continueBtn: "Continue to Hardware Selection",
      inverterTitle: "Step 2.1: Select Inverter Module",
      panelTitle: "Step 2.2: Select Solar Panel Module",
      currentSelections: "Current Selections",
      totalEstimate: "Total Cost Estimate",
      backBtn: "Back to Profile",
      reviewBtn: "Review Presentation",
      proposalTitle: "Proposal Summary",
      financialProjections: "Financial Projections",
      totalInvestment: "Total Investment",
      annualSavings: "Annual Energy Savings",
      paybackPeriod: "Payback Period",
      greenImpact: "Green Impact",
      co2: "CO2 Offset / Yr",
      trees: "Trees Planted",
      saveProposal: "Save Proposal to Database",
      backToHardware: "Back to Hardware Matcher",
      clientModal: "Edit Client Info",
      ocrPlaceholder: "Drop utility bill receipt here or click to browse",
      ocrSub: "Supports PDF, PNG, JPG. Automatically extracts 12-month average load.",
      pkr: "PKR",
      pkrSymbol: "Rs.",
      years: "Years",
      pills: "Modules"
    },
    ur: {
      editBanner: "سولر سسٹم انجینئرنگ اور کسٹمائزیشن",
      noLead: "تفصیلات کی تشکیل (غیر منسلک لیڈ موڈ)",
      activeLead: "تفصیلات تبدیل برائے صارف:",
      step1: "1۔ لوڈ پروفائل",
      step2: "2۔ ہارڈویئر میچنگ",
      step3: "3۔ فائنل پروپوزل",
      profileTitle: "پہلا مرحلہ: انرجی پروفائلنگ",
      ocrMode: "بل اسکینر (OCR)",
      flexMode: "ماہانہ یونٹس ہسٹری",
      averageLabel: "ماہانہ اوسط بجلی کا استعمال (یونٹس/kWh)",
      utilityPhase: "گرڈ کنکشن فیز",
      utilityComp: "بجلی فراہم کرنے والا گرڈ",
      recommendedSize: "تجویز کردہ سسٹم سائز",
      requiredPanels: "درکار سولر پینلز کی تعداد",
      netMetering: "نیٹ میٹرنگ کی اہلیت",
      continueBtn: "ہارڈویئر کے انتخاب پر جائیں",
      inverterTitle: "مرحلہ 2.1: انورٹر ماڈیول منتخب کریں",
      panelTitle: "مرحلہ 2.2: سولر پینل ماڈیول منتخب کریں",
      currentSelections: "منتخب کردہ ہارڈویئر",
      totalEstimate: "کل لاگت کا تخمینہ",
      backBtn: "لوڈ پروفائل پر جائیں",
      reviewBtn: "پروپوزل کا جائزہ لیں",
      proposalTitle: "پروپوزل کا خلاصہ",
      financialProjections: "مالیاتی تخمینہ",
      totalInvestment: "کل سرمایہ کاری",
      annualSavings: "سالانہ بجلی کی بچت",
      paybackPeriod: "سرمایہ کاری کی واپسی کا دورانیہ",
      greenImpact: "ماحولیاتی اثرات (سبز توانائی)",
      co2: "کاربن کی سالانہ بچت",
      trees: "درخت لگانے کے برابر",
      saveProposal: "پروپوزل ڈیٹا بیس میں محفوظ کریں",
      backToHardware: "ہارڈویئر میچر پر واپس جائیں",
      clientModal: "صارف کی معلومات تبدیل کریں",
      ocrPlaceholder: "بجلی کا بل یہاں ڈراپ کریں یا فائل منتخب کرنے کے لیے کلک کریں",
      ocrSub: "پی ڈی ایف، پی این جی، جے پی جی۔ لسٹ سے 12 ماہ کا اوسط لوڈ خودکار طریقے سے حاصل ہو جائے گا۔",
      pkr: "روپے",
      pkrSymbol: "روپے",
      years: "سال",
      pills: "پینلز"
    }
  };

  const t = translations[lang];

  return (
    <PageShell>
      {/* Configuration Header with Edit Trigger */}
      <div className={`bg-surface-base border-b border-border-base px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        lang === 'ur' ? 'flex-row-reverse' : ''
      }`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary font-mono text-sm">
            {activeStep}
          </div>
          <div className={lang === 'ur' ? 'text-right' : 'text-left'}>
            <h3 className="font-display font-bold text-white text-base">
              {t.editBanner}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentLead 
                ? `${t.activeLead} ${currentLead.customer_name}` 
                : t.noLead}
            </p>
          </div>
          {currentLead && (
            <button 
              onClick={openEditModal}
              className="size-7 rounded-lg bg-surface-container hover:bg-primary hover:text-black flex items-center justify-center border border-border-base/50 text-slate-400 cursor-pointer"
              title="Edit Client Info"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          )}
        </div>

        {/* Wizard segmented bar */}
        <div className="flex gap-2">
          {[
            { step: 1, label: t.step1 },
            { step: 2, label: s => t.step2 },
            { step: 3, label: s => t.step3 }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-display cursor-pointer transition-all border ${
                activeStep === s.step
                  ? 'bg-primary text-black border-primary'
                  : activeStep > s.step
                  ? 'bg-emerald-950/20 text-accent-emerald border-emerald-500/20'
                  : 'bg-surface-container border-border-base text-slate-400'
              }`}
            >
              {s.step === 1 ? t.step1 : s.step === 2 ? t.step2 : t.step3}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        
        {/* STEP 1: CONSUMPTION LOAD PROFILE */}
        {activeStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-base border border-border-base rounded-xl p-6 space-y-6">
                
                <div className={`flex justify-between items-center border-b border-border-base pb-4 ${
                  lang === 'ur' ? 'flex-row-reverse' : ''
                }`}>
                  <h3 className="font-display font-bold text-white text-lg">{t.profileTitle}</h3>
                  
                  {/* Profiling Toggles */}
                  <div className="flex bg-black/20 p-0.5 rounded-lg border border-border-base">
                    <button 
                      onClick={() => setProfileMode('ocr')}
                      className={`px-3 py-1 rounded-md text-xs font-bold font-display cursor-pointer transition-all ${
                        profileMode === 'ocr' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.ocrMode}
                    </button>
                    <button 
                      onClick={() => setProfileMode('flexible')}
                      className={`px-3 py-1 rounded-md text-xs font-bold font-display cursor-pointer transition-all ${
                        profileMode === 'flexible' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.flexMode}
                    </button>
                  </div>
                </div>

                {/* OCR MODE */}
                {profileMode === 'ocr' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">{t.averageLabel}</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          min="100" 
                          max="2000" 
                          step="50"
                          value={calcParams.monthlyUnits}
                          onChange={(e) => setCalcParams(prev => ({ ...prev, monthlyUnits: parseInt(e.target.value) }))}
                          className="flex-1 accent-primary h-2 bg-black/40 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono font-bold text-white text-lg bg-black/30 border border-border-base px-3 py-1 rounded-lg min-w-[90px] text-center">
                          {calcParams.monthlyUnits} <span className="text-xs text-slate-500">kWh</span>
                        </span>
                      </div>
                    </div>

                    {/* OCR Upload Area */}
                    <div className="border-2 border-dashed border-border-base/50 rounded-xl p-8 text-center bg-black/10 hover:bg-black/20 hover:border-primary/50 transition-all relative">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleOcrUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {ocrLoading ? (
                        <div className="space-y-3 py-4">
                          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                          <p className="text-sm font-semibold text-white">Analyzing utility bill with OCR scan...</p>
                        </div>
                      ) : (
                        <div className="space-y-3 py-4">
                          <span className="material-symbols-outlined text-4xl text-slate-500">upload_file</span>
                          <p className="text-sm font-semibold text-white">{t.ocrPlaceholder}</p>
                          <p className="text-xs text-slate-500">{t.ocrSub}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FLEXIBLE MODE */}
                {profileMode === 'flexible' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">Input your unit consumption history for each billing month:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                        <div key={month} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{month} (kWh)</label>
                          <input 
                            type="number" 
                            value={calcParams.customUnits[idx]}
                            onChange={(e) => {
                              const nextUnits = [...calcParams.customUnits];
                              nextUnits[idx] = parseInt(e.target.value) || 0;
                              setCalcParams(prev => ({ ...prev, customUnits: nextUnits }));
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-black/40 border border-border-base rounded-lg text-white font-mono text-center focus:outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shared controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border-base/50">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">{t.utilityPhase}</label>
                    <select 
                      value={calcParams.connectionType === 'On-Grid' ? 'Three' : 'Single'}
                      onChange={(e) => setCalcParams(prev => ({ ...prev, connectionType: e.target.value === 'Three' ? 'On-Grid' : 'Hybrid' }))}
                      className="w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="Three">Three Phase Connection</option>
                      <option value="Single">Single Phase Connection</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">{t.utilityComp}</label>
                    <select 
                      value={calcParams.utilityProvider}
                      onChange={(e) => setCalcParams(prev => ({ ...prev, utilityProvider: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="IESCO">IESCO (Islamabad)</option>
                      <option value="LESCO">LESCO (Lahore)</option>
                      <option value="KE">K-Electric (Karachi)</option>
                      <option value="FESCO">FESCO (Faisalabad)</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Calculations Quick Preview Sidebar */}
            <div className="space-y-6">
              <div className="bg-surface-base border border-border-base rounded-xl p-6 space-y-6">
                <h3 className="font-display font-bold text-white text-base border-b border-border-base pb-3">
                  {lang === 'ur' ? 'انجینئرنگ کے تخمینے' : 'Engineering Estimates'}
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400 font-semibold">{t.recommendedSize}</span>
                    <span className="font-mono text-sm font-bold text-white">{systemSize} kWp</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400 font-semibold">{t.requiredPanels}</span>
                    <span className="font-mono text-sm font-bold text-white">{panelCount} {t.pills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400 font-semibold">{t.netMetering}</span>
                    <span className="font-mono text-sm font-bold text-primary-container">
                      {calcParams.connectionType === 'On-Grid' ? 'Eligible (Three-Phase)' : 'Hybrid Inverter system'}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveStep(2)}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-white text-black font-display font-semibold transition-all cursor-pointer shadow-md text-sm text-center"
                >
                  {t.continueBtn}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: HARDWARE SEEDING CATALOG */}
        {activeStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Inverter Picker */}
              <div className="bg-surface-base border border-border-base rounded-xl p-6 space-y-4">
                <h3 className="font-display font-bold text-white text-lg border-b border-border-base pb-3">
                  {t.inverterTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inverters.map((inv) => (
                    <div 
                      key={inv.id} 
                      onClick={() => setCalcParams(prev => ({ ...prev, selectedInverter: inv }))}
                      className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                        calcParams.selectedInverter?.id === inv.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border-base/40 bg-black/20 hover:border-border-base'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-500 font-mono uppercase">{inv.brand_name}</span>
                          <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded border border-border-base text-slate-300 font-mono uppercase">{inv.type}</span>
                        </div>
                        <h4 className="font-display font-bold text-white text-sm mt-1">{inv.model_name}</h4>
                      </div>
                      <div className="flex justify-between items-end mt-4 pt-2 border-t border-border-base/30">
                        <span className="font-mono text-xs text-slate-400">{inv.capacity_kw} kW Capacity</span>
                        <span className="font-mono text-sm font-bold text-primary-container">
                          {lang === 'ur' ? `${inv.estimated_base_price_pkr?.toLocaleString()} روپے` : `${inv.estimated_base_price_pkr?.toLocaleString()} PKR`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solar Panel Picker */}
              <div className="bg-surface-base border border-border-base rounded-xl p-6 space-y-4">
                <h3 className="font-display font-bold text-white text-lg border-b border-border-base pb-3">
                  {t.panelTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {solarPanels.map((panel) => (
                    <div 
                      key={panel.id} 
                      onClick={() => setCalcParams(prev => ({ ...prev, selectedPanel: panel }))}
                      className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                        calcParams.selectedPanel?.id === panel.id
                          ? 'border-accent-emerald bg-accent-emerald/5 shadow-md'
                          : 'border-border-base/40 bg-black/20 hover:border-border-base'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-500 font-mono uppercase">{panel.manufacturer_name}</span>
                          <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded border border-border-base text-slate-300 font-mono uppercase">{panel.cell_type}</span>
                        </div>
                        <h4 className="font-display font-bold text-white text-sm mt-1">{panel.model_name}</h4>
                      </div>
                      <div className="flex justify-between items-end mt-4 pt-2 border-t border-border-base/30">
                        <span className="font-mono text-xs text-slate-400">{panel.default_wattage} W Output</span>
                        <span className="font-mono text-sm font-bold text-accent-emerald">
                          {lang === 'ur' ? `${panel.price_per_watt_pkr} روپے/واٹ` : `${panel.price_per_watt_pkr} PKR/W`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Calculations Preview */}
            <div className="space-y-6">
              <div className="bg-surface-base border border-border-base rounded-xl p-6 space-y-6">
                <h3 className="font-display font-bold text-white text-base border-b border-border-base pb-3">
                  {t.currentSelections}
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-semibold uppercase">Inverter Selected</div>
                    <div className="font-bold text-white">{calcParams.selectedInverter?.model_name || 'None'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-semibold uppercase">Solar Panels Selected</div>
                    <div className="font-bold text-white">{calcParams.selectedPanel?.model_name || 'None'}</div>
                  </div>
                  <div className="flex justify-between border-t border-border-base/50 pt-4">
                    <span className="text-xs text-slate-400 font-semibold">{t.totalEstimate}</span>
                    <span className="font-mono text-base font-extrabold text-primary-container">
                      {lang === 'ur' ? `${totalCost.toLocaleString()} روپے` : `${totalCost.toLocaleString()} PKR`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveStep(1)}
                    className="flex-1 py-2.5 rounded-lg bg-surface-container border border-border-base text-white font-display font-semibold transition-all cursor-pointer text-xs"
                  >
                    {t.backBtn}
                  </button>
                  <button 
                    onClick={() => setActiveStep(3)}
                    className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-white text-black font-display font-semibold transition-all cursor-pointer shadow-md text-xs text-center"
                  >
                    {t.reviewBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PROPOSAL PRESENTATION SLIDE SHOW */}
        {activeStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Proposal slide */}
              <div className="bg-surface-base border border-border-base rounded-xl overflow-hidden shadow-xl">
                
                {/* Proposal Top Banner */}
                <div className="bg-gradient-to-r from-primary/10 to-transparent px-8 py-6 border-b border-border-base flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-primary font-mono uppercase tracking-wider">{t.proposalTitle}</span>
                    <h2 className="font-display font-extrabold text-white text-xl mt-1">Solar System Proposal Estimate</h2>
                  </div>
                </div>

                {/* Slides content */}
                <div className="p-8 space-y-8">
                  {/* System Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-black/20 p-5 border border-border-base/50 rounded-xl space-y-2">
                      <div className="text-xs text-slate-500 font-semibold uppercase">{t.recommendedSize}</div>
                      <div className="font-mono text-2xl font-extrabold text-white">{systemSize} kWp</div>
                    </div>
                    <div className="bg-black/20 p-5 border border-border-base/50 rounded-xl space-y-2">
                      <div className="text-xs text-slate-500 font-semibold uppercase">{t.requiredPanels}</div>
                      <div className="font-mono text-2xl font-extrabold text-white">{panelCount} {t.pills}</div>
                    </div>
                    <div className="bg-black/20 p-5 border border-border-base/50 rounded-xl space-y-2">
                      <div className="text-xs text-slate-500 font-semibold uppercase">Inverter Selected</div>
                      <div className="font-display text-sm font-bold text-white max-w-[150px] truncate">{calcParams.selectedInverter?.model_name}</div>
                    </div>
                  </div>

                  {/* Financial projections */}
                  <div className="bg-black/10 border border-border-base/40 rounded-xl p-6 space-y-6">
                    <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider border-b border-border-base/30 pb-2">{t.financialProjections}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 font-semibold">{t.totalInvestment}</div>
                        <div className="font-mono text-lg font-bold text-primary-container">
                          {lang === 'ur' ? `${totalCost.toLocaleString()} روپے` : `${totalCost.toLocaleString()} PKR`}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 font-semibold">{t.annualSavings}</div>
                        <div className="font-mono text-lg font-bold text-accent-emerald">
                          {lang === 'ur' ? `${annualSavings.toLocaleString()} روپے` : `${annualSavings.toLocaleString()} PKR`}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 font-semibold">{t.paybackPeriod}</div>
                        <div className="font-mono text-lg font-bold text-white">{paybackYears} {t.years}</div>
                      </div>
                    </div>
                  </div>

                  {/* Environmental projection */}
                  <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-emerald-400 text-sm uppercase">{t.greenImpact}</h4>
                      <p className="text-xs text-slate-400">Estimated environmental offsets over 25-year system lifecycle.</p>
                    </div>
                    <div className="flex gap-6 font-mono text-sm">
                      <div className="text-center">
                        <div className="font-bold text-white">{(systemSize * 1.2).toFixed(1)} tons</div>
                        <div className="text-[10px] text-slate-500">{t.co2}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-white">{Math.round(systemSize * 18)} trees</div>
                        <div className="text-[10px] text-slate-500">{t.trees}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Sidebar actions */}
            <div className="space-y-6">
              <div className="bg-surface-base border border-border-base rounded-xl p-6 space-y-6">
                <h3 className="font-display font-bold text-white text-base border-b border-border-base pb-3">
                  Proposal Actions
                </h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleSaveProposal}
                    className="w-full py-2.5 rounded-lg bg-primary hover:bg-white text-black font-display font-semibold transition-all cursor-pointer shadow-md text-xs text-center flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    {t.saveProposal}
                  </button>
                  <button 
                    onClick={() => setActiveStep(2)}
                    className="w-full py-2.5 rounded-lg bg-surface-container border border-border-base text-white font-display font-semibold transition-all cursor-pointer text-xs"
                  >
                    {t.backToHardware}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lead Edit Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-high border border-border-base rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
              <div className={`px-6 py-4 border-b border-border-base flex justify-between items-center ${
                lang === 'ur' ? 'flex-row-reverse' : ''
              }`}>
                <h3 className="font-display font-bold text-white text-lg">{t.clientModal}</h3>
                <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Customer Name</label>
                  <input 
                    type="text" 
                    value={editFormData.customer_name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    className={`w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary ${
                      lang === 'ur' ? 'text-right' : 'text-left'
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Contact Number</label>
                  <input 
                    type="text" 
                    value={editFormData.contact_number}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary font-mono text-center"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Installation Address</label>
                  <textarea 
                    value={editFormData.installation_address}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, installation_address: e.target.value }))}
                    className={`w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary ${
                      lang === 'ur' ? 'text-right' : 'text-left'
                    }`}
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div className={`pt-4 border-t border-border-base flex justify-end gap-3 ${
                  lang === 'ur' ? 'flex-row-reverse' : ''
                }`}>
                  <button 
                    type="button" 
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-surface-container border border-border-base text-white text-xs font-bold font-display cursor-pointer hover:border-white/20"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-primary hover:bg-white text-black text-xs font-bold font-display cursor-pointer shadow-md"
                  >
                    Update Details ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </PageShell>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';
import { saveLivePresentation } from '../../lib/firebaseService';
import seedData from '../../../firebase/seed_data.json';

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
    formatPrice,
    showToast 
  } = useApp();

  // Fail-safe hardware catalog fallback if local storage holds old 6-item cache
  const activeInvertersList = (inverters && inverters.length >= 20) ? inverters : seedData.inverters;
  const activePanelsList = (solarPanels && solarPanels.length >= 20) ? solarPanels : seedData.solar_panels;

  const [activeStep, setActiveStep] = useState(1); 
  const [profileMode, setProfileMode] = useState('ocr'); 
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // Hardware Filter Chips
  const [inverterCategory, setInverterCategory] = useState('All'); // 'All', 'Hybrid', 'On-Grid', 'Off-Grid', 'Lithium Battery'
  const [panelCategory, setPanelCategory] = useState('All'); // 'All', '575W-585W', '600W-620W', '650W+', 'N-Type TOPCon'

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

  // Real Gemini Vision OCR upload handler
  const processBillFile = async (file) => {
    if (!file) return;
    setOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ocr-bill', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOcrResult(data);
        setCalcParams(prev => ({
          ...prev,
          monthlyUnits: data.monthlyUnits,
          utilityProvider: data.disco || prev.utilityProvider
        }));
        showToast(
          lang === 'ur' 
            ? `⚡ ${data.discoFullName} بل اسکین ہو گیا! (${data.monthlyUnits} یونٹس)`
            : `⚡ Parsed ${data.discoFullName}! Extracted ${data.monthlyUnits} kWh (${formatPrice(data.billAmount)})`
        );
      } else {
        showToast(data.error || "OCR Parsing failed", "error");
      }
    } catch (err) {
      console.error("OCR API error:", err);
      showToast("Error processing utility bill image via Gemini Vision", "error");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleOcrUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processBillFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processBillFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Auto match inverter and panel
  useEffect(() => {
    if (activeInvertersList.length > 0 && !calcParams.selectedInverter) {
      const standardInv = activeInvertersList.find(i => i.capacity_kw === 5.0 && (i.type === 'Hybrid' || i.type === 'On-Grid')) || activeInvertersList[0];
      setCalcParams(prev => ({ ...prev, selectedInverter: standardInv }));
    }
    if (activePanelsList.length > 0 && !calcParams.selectedPanel) {
      setCalcParams(prev => ({ ...prev, selectedPanel: activePanelsList[0] }));
    }
  }, [activeInvertersList, activePanelsList]);

  // Dynamic calculations
  const calculateSystemSize = () => {
    const units = profileMode === 'ocr' 
      ? calcParams.monthlyUnits 
      : calcParams.customUnits.reduce((sum, u) => sum + u, 0) / 12;
    return parseFloat((units / 120).toFixed(2));
  };

  const systemSize = calculateSystemSize();
  const panelCapacityW = calcParams.selectedPanel ? (calcParams.selectedPanel.default_wattage || calcParams.selectedPanel.wattage) : 580;
  const panelCount = Math.ceil((systemSize * 1000) / panelCapacityW);

  const calculateTotalCost = () => {
    const inverterCost = calcParams.selectedInverter ? (calcParams.selectedInverter.estimated_base_price_pkr || calcParams.selectedInverter.cost_pkr) : 240000;
    const panelPricePerWatt = calcParams.selectedPanel ? (calcParams.selectedPanel.price_per_watt_pkr || calcParams.selectedPanel.cost_per_watt) : 40.0;
    const panelsCost = (systemSize * 1000) * panelPricePerWatt;
    const structureAndWiring = systemSize * 15000;
    const installationNet = 40000;
    return Math.round(inverterCost + panelsCost + structureAndWiring + installationNet);
  };

  const totalCost = calculateTotalCost();
  const annualSavings = Math.round(systemSize * 120 * 12 * 45); 
  const paybackYears = parseFloat((totalCost / annualSavings).toFixed(1));

  // Filter Inverters & Batteries
  const filteredInverters = activeInvertersList.filter(inv => {
    if (inverterCategory === 'All') return true;
    if (inverterCategory === 'Hybrid') return inv.type === 'Hybrid';
    if (inverterCategory === 'On-Grid') return inv.type === 'On-Grid';
    if (inverterCategory === 'Off-Grid') return inv.type === 'Off-Grid';
    if (inverterCategory === 'Lithium Battery') return inv.type === 'Lithium Battery';
    return true;
  });

  // Filter Solar Panels
  const filteredPanels = activePanelsList.filter(p => {
    const w = p.default_wattage || p.wattage || 580;
    if (panelCategory === 'All') return true;
    if (panelCategory === '575W-585W') return w >= 575 && w <= 585;
    if (panelCategory === '600W-620W') return w >= 600 && w <= 620;
    if (panelCategory === '650W+') return w >= 650;
    if (panelCategory === 'N-Type TOPCon') return (p.cell_type || '').includes('N-Type');
    return true;
  });

  // Broadcasting Changes to Live Customer Sync Channel
  useEffect(() => {
    if (calcParams.selectedInverter && calcParams.selectedPanel) {
      saveLivePresentation({
        systemSize,
        panelCount,
        panelModel: calcParams.selectedPanel.model_name || calcParams.selectedPanel.model,
        inverterModel: calcParams.selectedInverter.model_name || calcParams.selectedInverter.model,
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
      editBanner: "Solar System Engineering & Customization",
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
      inverterTitle: "Step 2.1: Select Inverter / Battery Module",
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
      pills: "Panels"
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
      inverterTitle: "مرحلہ 2.1: انورٹر / بیٹری ماڈیول منتخب کریں",
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
      ocrSub: "پی ڈی ایف، پی این جی، جے پی جی۔ 12 ماہ کا اوسط لوڈ خودکار طریقے سے حاصل ہو جائے گا۔",
      pkr: "روپے",
      pkrSymbol: "روپے",
      years: "سال",
      pills: "پینلز"
    }
  };

  const t = translations[lang];

  return (
    <PageShell headerTitle="Solar Proposals Engineering">
      
      {/* Configuration Header */}
      <div className="bg-white dark:bg-[#181a1d] border-b border-[#e2e8f0] dark:border-[#2d3137] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-[#b45309] text-white flex items-center justify-center font-bold font-mono text-xs shadow-sm">
            {activeStep}
          </div>
          <div>
            <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">
              {t.editBanner}
            </h3>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] font-semibold mt-0.5">
              {currentLead 
                ? `${t.activeLead} ${currentLead.customer_name}` 
                : t.noLead}
            </p>
          </div>
          {currentLead && (
            <button 
              onClick={openEditModal}
              className="size-7 rounded-lg bg-slate-100 hover:bg-[#b45309] hover:text-white border border-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              title="Edit Client Info"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          )}
        </div>

        {/* Wizard Segmented Buttons */}
        <div className="flex gap-2">
          {[
            { step: 1, label: t.step1 },
            { step: 2, label: t.step2 },
            { step: 3, label: t.step3 }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-display cursor-pointer transition-all border ${
                activeStep === s.step
                  ? 'bg-[#b45309] text-white border-[#b45309] shadow-sm'
                  : activeStep > s.step
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-[#282a2d] border-[#cbd5e1] dark:border-[#3f474f] text-[#334155] dark:text-[#cbd5e1] hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        
        {/* STEP 1: CONSUMPTION LOAD PROFILE */}
        {activeStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-6 shadow-sm">
                
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">{t.profileTitle}</h3>
                  
                  {/* Mode Toggles */}
                  <div className="flex bg-slate-100 dark:bg-[#282a2d] p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => setProfileMode('ocr')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-display cursor-pointer transition-all ${
                        profileMode === 'ocr' ? 'bg-[#b45309] text-white shadow-sm' : 'text-[#64748b] dark:text-slate-400 hover:text-[#0f172a]'
                      }`}
                    >
                      {t.ocrMode}
                    </button>
                    <button 
                      onClick={() => setProfileMode('flexible')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-display cursor-pointer transition-all ${
                        profileMode === 'flexible' ? 'bg-[#b45309] text-white shadow-sm' : 'text-[#64748b] dark:text-slate-400 hover:text-[#0f172a]'
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
                      <label className="text-xs font-bold text-[#334155] dark:text-slate-300 uppercase tracking-wide">{t.averageLabel}</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          min="100" 
                          max="2000" 
                          step="50"
                          value={calcParams.monthlyUnits}
                          onChange={(e) => setCalcParams(prev => ({ ...prev, monthlyUnits: parseInt(e.target.value) }))}
                          className="flex-1 accent-[#b45309] h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono font-extrabold text-[#0f172a] dark:text-white text-lg bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] px-3.5 py-1.5 rounded-xl min-w-[100px] text-center shadow-xs">
                          {calcParams.monthlyUnits} <span className="text-xs text-[#64748b] dark:text-slate-400">kWh</span>
                        </span>
                      </div>
                    </div>

                    {/* OCR Upload Dropzone Area */}
                    <div 
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="border-2 border-dashed border-[#cbd5e1] dark:border-slate-700 hover:border-[#b45309] rounded-2xl p-8 text-center bg-[#f8fafc] dark:bg-slate-900/40 hover:bg-[#fefce8]/40 transition-all relative cursor-pointer"
                    >
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleOcrUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      {ocrLoading ? (
                        <div className="space-y-3 py-4">
                          <span className="material-symbols-outlined text-4xl text-[#b45309] animate-spin">sync</span>
                          <p className="text-sm font-extrabold text-[#0f172a] dark:text-white">Analyzing utility bill via Gemini 3.6 Vision OCR...</p>
                          <p className="text-xs text-[#64748b] dark:text-slate-400">Extracting DISCO, billed kWh, consumer name, reference number, and tariff rates</p>
                        </div>
                      ) : (
                        <div className="space-y-3 py-4">
                          <div className="size-12 rounded-2xl bg-[#fef3c7] dark:bg-amber-950/40 text-[#b45309] flex items-center justify-center mx-auto shadow-xs">
                            <span className="material-symbols-outlined text-2xl">file_upload</span>
                          </div>
                          <p className="text-sm font-extrabold text-[#0f172a] dark:text-white">{t.ocrPlaceholder}</p>
                          <p className="text-xs text-[#475569] dark:text-slate-400">{t.ocrSub}</p>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fefce8] dark:bg-amber-500/10 border border-[#fef08a] dark:border-amber-500/20 text-xs font-mono font-bold text-[#854d0e] dark:text-amber-300">
                            <span>✨ Powered by Gemini Vision OCR</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Extracted Bill Details Card */}
                    {ocrResult && (
                      <div className="bg-[#f0fdf4] dark:bg-emerald-950/20 border border-[#bbf7d0] dark:border-emerald-800 rounded-2xl p-5 space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-emerald-200 dark:border-emerald-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-700 text-base">verified</span>
                            <h4 className="font-display font-extrabold text-emerald-900 dark:text-emerald-300 text-sm">Extracted Bill Parameters</h4>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            Engine: {ocrResult.ocrEngine || 'Gemini Vision'}
                          </span>
                        </div>

                        {ocrResult.consumerName && (
                          <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 flex justify-between items-center text-xs">
                            <span className="text-slate-500 text-[10px] uppercase font-bold">Consumer Name</span>
                            <span className="font-extrabold text-[#0f172a] dark:text-white text-sm">{ocrResult.consumerName}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                          <div className="space-y-1 bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-xs">
                            <span className="text-slate-500 text-[10px] uppercase font-bold block">Utility DISCO</span>
                            <span className="font-extrabold text-[#b45309] text-sm">{ocrResult.discoFullName || ocrResult.disco}</span>
                          </div>
                          <div className="space-y-1 bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-xs">
                            <span className="text-slate-500 text-[10px] uppercase font-bold block">Monthly Consumption</span>
                            <span className="font-extrabold text-[#0f172a] dark:text-white text-sm">{ocrResult.monthlyUnits} kWh</span>
                          </div>
                          <div className="space-y-1 bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-xs">
                            <span className="text-slate-500 text-[10px] uppercase font-bold block">Bill Amount</span>
                            <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">{formatPrice(ocrResult.billAmount)}</span>
                          </div>
                          <div className="space-y-1 bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-xs">
                            <span className="text-slate-500 text-[10px] uppercase font-bold block">Reference / Account #</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{ocrResult.referenceNumber}</span>
                          </div>
                          <div className="space-y-1 bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-xs">
                            <span className="text-slate-500 text-[10px] uppercase font-bold block">Billing Cycle</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{ocrResult.billingMonth}</span>
                          </div>
                          <div className="space-y-1 bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-xs">
                            <span className="text-slate-500 text-[10px] uppercase font-bold block">Inferred Tariff</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{ocrResult.tariffRate} PKR/kWh</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FLEXIBLE MODE */}
                {profileMode === 'flexible' && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#475569] dark:text-slate-300 font-medium">Input your unit consumption history for each billing month:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                        <div key={month} className="space-y-1">
                          <label className="text-[10px] font-extrabold text-[#64748b] uppercase">{month} (kWh)</label>
                          <input 
                            type="number" 
                            value={calcParams.customUnits[idx]}
                            onChange={(e) => {
                              const nextUnits = [...calcParams.customUnits];
                              nextUnits[idx] = parseInt(e.target.value) || 0;
                              setCalcParams(prev => ({ ...prev, customUnits: nextUnits }));
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-[#f8fafc] dark:bg-black/40 border border-[#cbd5e1] dark:border-[#3f474f] rounded-lg text-[#0f172a] dark:text-white font-mono font-bold text-center focus:outline-none focus:border-[#b45309]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Select Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#334155] dark:text-slate-300 uppercase tracking-wide">{t.utilityPhase}</label>
                    <select 
                      value={calcParams.connectionType === 'On-Grid' ? 'Three' : 'Single'}
                      onChange={(e) => setCalcParams(prev => ({ ...prev, connectionType: e.target.value === 'Three' ? 'On-Grid' : 'Hybrid' }))}
                      className="w-full px-3.5 py-2.5 text-sm font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] text-[#0f172a] dark:text-white rounded-xl focus:outline-none focus:border-[#b45309] cursor-pointer shadow-xs"
                    >
                      <option value="Three">Three Phase Connection</option>
                      <option value="Single">Single Phase Connection</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#334155] dark:text-slate-300 uppercase tracking-wide">{t.utilityComp}</label>
                    <select 
                      value={calcParams.utilityProvider}
                      onChange={(e) => setCalcParams(prev => ({ ...prev, utilityProvider: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] text-[#0f172a] dark:text-white rounded-xl focus:outline-none focus:border-[#b45309] cursor-pointer shadow-xs"
                    >
                      <option value="KE">K-Electric (Karachi & Hub)</option>
                      <option value="LESCO">LESCO (Lahore)</option>
                      <option value="IESCO">IESCO (Islamabad)</option>
                      <option value="FESCO">FESCO (Faisalabad)</option>
                      <option value="GEPCO">GEPCO (Gujranwala)</option>
                      <option value="MEPCO">MEPCO (Multan)</option>
                      <option value="PESCO">PESCO (Peshawar)</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Calculations Quick Preview Sidebar */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-6 shadow-sm">
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base border-b border-slate-200 dark:border-slate-800 pb-3">
                  {lang === 'ur' ? 'انجینئرنگ کے تخمینے' : 'Engineering Estimates'}
                </h3>
                
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#475569] dark:text-slate-400 font-bold">{t.recommendedSize}</span>
                    <span className="font-mono text-base font-black text-[#0f172a] dark:text-white">{systemSize} kWp</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#475569] dark:text-slate-400 font-bold">{t.requiredPanels}</span>
                    <span className="font-mono text-base font-black text-[#0f172a] dark:text-white">{panelCount} {t.pills}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#475569] dark:text-slate-400 font-bold">{t.netMetering}</span>
                    <span className="font-mono text-xs font-extrabold text-[#b45309] dark:text-amber-300">
                      {calcParams.connectionType === 'On-Grid' ? 'Eligible (Three-Phase)' : 'Hybrid Inverter system'}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveStep(2)}
                  className="w-full py-3.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs shadow-md transition-all cursor-pointer text-center"
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
              
              {/* Step 2.1: Inverters & Lithium-Ion Batteries Picker */}
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-5 shadow-sm">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">
                      {t.inverterTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">On-Grid, Off-Grid, Hybrid Inverters & 48V Lithium-Ion Battery Storage</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Showing {filteredInverters.length} of {activeInvertersList.length} models
                  </span>
                </div>

                {/* Category Filter Chips for Inverters */}
                <div className="flex flex-wrap gap-1.5 text-xs font-bold font-display">
                  {['All', 'Hybrid', 'On-Grid', 'Off-Grid', 'Lithium Battery'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setInverterCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                        inverterCategory === cat 
                          ? 'bg-[#b45309] text-white shadow-sm ring-2 ring-[#b45309]/30' 
                          : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'All' ? 'All Equipment' : cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
                  {filteredInverters.map((inv) => {
                    const isSelected = calcParams.selectedInverter?.id === inv.id;
                    const brand = inv.brand_name || inv.brand;
                    const model = inv.model_name || inv.model;
                    const cap = inv.capacity_kw || inv.capacity;
                    const price = inv.estimated_base_price_pkr || inv.cost_pkr;

                    return (
                      <div 
                        key={inv.id} 
                        onClick={() => setCalcParams(prev => ({ ...prev, selectedInverter: inv }))}
                        className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'border-[#b45309] bg-[#fefce8] dark:bg-amber-500/10 shadow-md ring-2 ring-[#b45309]/30'
                            : 'border-slate-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-black/20 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-mono font-bold text-[#b45309] uppercase">{brand}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                              inv.type === 'Lithium Battery'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : inv.type === 'On-Grid'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : inv.type === 'Off-Grid'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {inv.type}
                            </span>
                          </div>
                          <h4 className="font-display font-extrabold text-[#0f172a] dark:text-white text-sm mt-1">{model}</h4>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-mono text-slate-500 font-bold">
                              {inv.type === 'Lithium Battery' ? `${cap} kWh Capacity` : `${cap} kW Capacity`}
                            </span>
                            <span className="font-mono text-sm font-black text-[#b45309]">
                              {formatPrice(price)}
                            </span>
                          </div>

                          {/* Official Website Link */}
                          {inv.official_url && (
                            <a 
                              href={inv.official_url} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline pt-1"
                            >
                              <span>🔗 Brand Website & Live Prices</span>
                              <span className="material-symbols-outlined text-xs">open_in_new</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2.2: Solar Panels Picker */}
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-5 shadow-sm">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">
                      {t.panelTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Longi, Jinko, Canadian, JA, Trina (575W, 580W, 600W, 620W, 650W, 700W, 720W)</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Showing {filteredPanels.length} of {activePanelsList.length} models
                  </span>
                </div>

                {/* Wattage & Tech Filter Chips */}
                <div className="flex flex-wrap gap-1.5 text-xs font-bold font-display">
                  {['All', '575W-585W', '600W-620W', '650W+', 'N-Type TOPCon'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setPanelCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                        panelCategory === cat 
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30' 
                          : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'All' ? 'All Wattages' : cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
                  {filteredPanels.map((panel) => {
                    const isSelected = calcParams.selectedPanel?.id === panel.id;
                    const mfg = panel.manufacturer_name || panel.mfg;
                    const model = panel.model_name || panel.model;
                    const watt = panel.default_wattage || panel.wattage;
                    const rateW = panel.price_per_watt_pkr || panel.cost_per_watt;
                    const panelPrice = Math.round(watt * rateW);

                    return (
                      <div 
                        key={panel.id} 
                        onClick={() => setCalcParams(prev => ({ ...prev, selectedPanel: panel }))}
                        className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-black/20 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">{mfg}</span>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-bold uppercase border border-emerald-300">
                              {panel.cell_type}
                            </span>
                          </div>
                          <h4 className="font-display font-extrabold text-[#0f172a] dark:text-white text-sm mt-1">{model}</h4>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-mono text-slate-500 font-bold">{watt} W Output</span>
                            <div className="text-right">
                              <span className="font-mono text-sm font-black text-emerald-700 dark:text-emerald-400 block">{rateW} PKR/W</span>
                              <span className="text-[10px] text-slate-400 font-mono font-semibold">({formatPrice(panelPrice)} / panel)</span>
                            </div>
                          </div>

                          {/* Official Website Link */}
                          {panel.official_url && (
                            <a 
                              href={panel.official_url} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline pt-1"
                            >
                              <span>🔗 Brand Website & Specifications</span>
                              <span className="material-symbols-outlined text-xs">open_in_new</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Hardware Selections Sidebar */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-6 shadow-sm text-slate-800 dark:text-white">
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base border-b border-slate-200 dark:border-slate-800 pb-3">
                  {t.currentSelections}
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Inverter / Storage</span>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {calcParams.selectedInverter ? (calcParams.selectedInverter.model_name || calcParams.selectedInverter.model) : 'None'}
                    </div>
                  </div>
                  <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Panel</span>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {calcParams.selectedPanel ? (calcParams.selectedPanel.model_name || calcParams.selectedPanel.model) : 'None'}
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-slate-500 font-bold block">{t.totalEstimate}</span>
                    <div className="font-display text-2xl font-black text-[#b45309] mt-0.5">
                      {formatPrice(totalCost)}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveStep(3)}
                  className="w-full py-3.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs shadow-md transition-all cursor-pointer text-center"
                >
                  {t.reviewBtn}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: PROPOSAL SUMMARY */}
        {activeStep === 3 && (
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-xl">{t.proposalTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">Complete commercial quote ready for client present mode</p>
              </div>
              <button 
                onClick={handleSaveProposal}
                className="px-6 py-3 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs shadow-md cursor-pointer transition-all"
              >
                {t.saveProposal}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">{t.totalInvestment}</span>
                <div className="font-display text-2xl font-black text-[#b45309]">{formatPrice(totalCost)}</div>
              </div>
              <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">{t.annualSavings}</span>
                <div className="font-display text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatPrice(annualSavings)}</div>
              </div>
              <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">{t.paybackPeriod}</span>
                <div className="font-display text-2xl font-black text-[#0f172a] dark:text-white">{paybackYears} {t.years}</div>
              </div>
            </div>
          </div>
        )}

      </main>
    </PageShell>
  );
}

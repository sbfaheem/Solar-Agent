'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';

export default function AdminDesk() {
  const { 
    company, 
    overrideRequests, 
    approveOverride, 
    clearPendingSubscription, 
    lang,
    showToast,
    inverters,
    solarPanels,
    addInverter,
    removeInverter,
    addSolarPanel,
    removeSolarPanel
  } = useApp();

  const [activeTab, setActiveTab] = useState('clearance');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlip, setActiveSlip] = useState(null);

  // Form states for new Inverter
  const [invBrand, setInvBrand] = useState('');
  const [invModel, setInvModel] = useState('');
  const [invCapacity, setInvCapacity] = useState(10);
  const [invType, setInvType] = useState('Hybrid');
  const [invPrice, setInvPrice] = useState(180000);

  // Form states for new Panel
  const [panelMfg, setPanelMfg] = useState('');
  const [panelModel, setPanelModel] = useState('');
  const [panelWattage, setPanelWattage] = useState(550);
  const [panelPriceWatt, setPanelPriceWatt] = useState(38);
  const [panelCell, setPanelCell] = useState('Monocrystalline');

  // Translations
  const translations = {
    en: {
      title: "Super User Admin Control CMS",
      subtitle: "Review offline transactions, manage quotas, and edit the master hardware database.",
      tabClearance: "Clearance Desk",
      tabOverrides: "Override Requests",
      tabCatalog: "Hardware CMS Catalog",
      clearanceHeader: "Pending Invoice Receipts Verification",
      noClearance: "No pending payments in verification queue.",
      agentName: "Agent / Company Details",
      tierName: "Upgrade Plan Tier",
      reference: "Transaction Reference",
      amount: "Amount",
      actions: "Actions",
      approveBtn: "Verify & Activate Quota",
      rejectBtn: "Reject Payout",
      overrideHeader: "Actionable Quota Extension Requests",
      noOverrides: "No active override requests submitted.",
      currentUsage: "Current Usage",
      currentLimit: "Current Limit",
      status: "Status",
      approveOverrideBtn: "Approve Quota +10",
      pkr: "PKR",
      pendingText: "Awaiting Verification",
      viewSlip: "View Receipt Screenshot",
      addInvHeader: "Add New Inverter Model",
      addPanelHeader: "Add New Solar Panel Model"
    },
    ur: {
      title: "سپر ایڈمنسٹریٹر کنٹرول پینل",
      subtitle: "آف لائن بینک ٹرانسفرز کی تصدیق کریں، سبسکرپشنز کو فعال کریں، اور ہارڈویئر کیٹلاگ منظم کریں۔",
      tabClearance: "پیمنٹ کلیئرنس ڈیسک",
      tabOverrides: "اضافی حد کی درخواستیں",
      tabCatalog: "ہارڈویئر کیٹلاگ CMS",
      clearanceHeader: "آف لائن پیمنٹ رسیدوں کی تصدیق",
      noClearance: "تصدیق کے لیے کوئی رسید پینڈنگ نہیں ہے۔",
      agentName: "کمپنی اور ایجنٹ کی تفصیلات",
      tierName: "مطلوبہ سبسکرپشن پلان",
      reference: "ٹرانزیکشن رسید نمبر",
      amount: "رقم",
      actions: "کارروائی",
      approveBtn: "رسید کی تصدیق اور کوٹہ بحال کریں",
      rejectBtn: "رسید مسترد کریں",
      overrideHeader: "کوٹہ میں اضافے کی فعال درخواستیں",
      noOverrides: "کوٹہ میں اضافے کی کوئی درخواست پینڈنگ نہیں ہے۔",
      currentUsage: "موجودہ استعمال",
      currentLimit: "موجودہ حد",
      status: "حیثیت",
      approveOverrideBtn: "پروپوزل کوٹہ +10 بڑھائیں",
      pkr: "روپے",
      pendingText: "تصدیق کے منتظر",
      viewSlip: "رسید کا اسکرین شاٹ دیکھیں",
      addInvHeader: "نیا انورٹر ماڈل شامل کریں",
      addPanelHeader: "نیا سولر پینل ماڈل شامل کریں"
    }
  };

  const t = translations[lang];

  const handleApprovePayment = async () => {
    const ok = await clearPendingSubscription();
    if (ok) {
      setModalOpen(false);
    }
  };

  const openSlipModal = (slipName) => {
    setActiveSlip(slipName);
    setModalOpen(true);
  };

  const handleAddInverterSubmit = async (e) => {
    e.preventDefault();
    if (!invBrand || !invModel) {
      showToast("⚠️ Brand and Model fields are required", "error");
      return;
    }
    const inv = {
      brand: invBrand,
      model: invModel,
      capacity_kw: Number(invCapacity),
      type: invType,
      cost_pkr: Number(invPrice)
    };
    const res = await addInverter(inv);
    if (res) {
      setInvBrand('');
      setInvModel('');
    }
  };

  const handleAddPanelSubmit = async (e) => {
    e.preventDefault();
    if (!panelMfg || !panelModel) {
      showToast("⚠️ Manufacturer and Model fields are required", "error");
      return;
    }
    const panel = {
      mfg: panelMfg,
      model: panelModel,
      wattage: Number(panelWattage),
      cost_per_watt: Number(panelPriceWatt),
      cell_type: panelCell
    };
    const res = await addSolarPanel(panel);
    if (res) {
      setPanelMfg('');
      setPanelModel('');
    }
  };

  return (
    <PageShell>
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        
        {/* Banner Headers */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          lang === 'ur' ? 'text-right' : 'text-left'
        }`}>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">{t.title}</h1>
            <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
          </div>
          
          {/* Dashboard Section Toggles */}
          <div className="flex bg-black/20 p-1 rounded-lg border border-border-base flex-wrap gap-1">
            <button 
              onClick={() => setActiveTab('clearance')}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-display cursor-pointer transition-all ${
                activeTab === 'clearance' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.tabClearance}
            </button>
            <button 
              onClick={() => setActiveTab('override')}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-display cursor-pointer transition-all ${
                activeTab === 'override' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.tabOverrides}
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-display cursor-pointer transition-all ${
                activeTab === 'catalog' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.tabCatalog}
            </button>
          </div>
        </div>

        {/* 1. CLEARANCE DESK VIEW */}
        {activeTab === 'clearance' && (
          <div className="space-y-6">
            <div className="bg-surface-base border border-border-base rounded-xl overflow-hidden shadow-sm">
              <div className={`px-6 py-4 bg-black/10 border-b border-border-base flex justify-between items-center ${
                lang === 'ur' ? 'flex-row-reverse' : ''
              }`}>
                <h3 className="font-display font-bold text-white text-base">{t.clearanceHeader}</h3>
                {company.billing_status === "Pending Verification" && (
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-accent-amber px-2.5 py-0.5 rounded-full font-bold uppercase">
                    1 {t.pendingText}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/5 border-b border-border-base text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.agentName}</th>
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.tierName}</th>
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.reference}</th>
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.amount}</th>
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-left' : 'text-right'}`}>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base/40 text-sm">
                    {company.billing_status !== "Pending Verification" ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">{t.noClearance}</td>
                      </tr>
                    ) : (
                      <tr className="hover:bg-white/5 transition-colors animate-pulse">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{company.name}</div>
                          <div className="text-xs text-slate-500">Owner Terminal</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-300">Upgrade to {company.plan} Plan</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => openSlipModal(company.receipt_uploaded)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/40 border border-border-base hover:border-primary text-xs text-slate-300 transition-all cursor-pointer font-mono"
                          >
                            <span className="material-symbols-outlined text-sm text-primary">receipt_long</span>
                            {company.receipt_uploaded}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-primary-container">
                          {company.plan === "Silver" ? "30,000" : company.plan === "Gold" ? "50,000" : "75,000"} {t.pkr}
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <button 
                            onClick={handleApprovePayment}
                            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-display text-xs font-bold transition-all cursor-pointer shadow-md"
                          >
                            {t.approveBtn}
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. OVERRIDES REQUEST DESK VIEW */}
        {activeTab === 'override' && (
          <div className="space-y-6">
            <div className="bg-surface-base border border-border-base rounded-xl overflow-hidden shadow-sm">
              <div className={`px-6 py-4 bg-black/10 border-b border-border-base flex justify-between items-center ${
                lang === 'ur' ? 'flex-row-reverse' : ''
              }`}>
                <h3 className="font-display font-bold text-white text-base">{t.overrideHeader}</h3>
                <span className="text-[10px] bg-slate-500/10 border border-border-base/50 text-slate-300 px-2 py-0.5 rounded font-bold uppercase">
                  {overrideRequests.filter(r => r.status === 'Pending').length} Pending
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/5 border-b border-border-base text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>Company Name</th>
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.currentUsage}</th>
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.currentLimit}</th>
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.status}</th>
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-left' : 'text-right'}`}>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base/40 text-sm">
                    {overrideRequests.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">{t.noOverrides}</td>
                      </tr>
                    ) : (
                      overrideRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{req.company_name}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-300">{req.current_usage} Proposals</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-300">{req.current_limit} limit</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              req.status === 'Approved'
                                ? 'bg-emerald-500/10 text-accent-emerald border-emerald-500/20'
                                : 'bg-amber-500/10 text-accent-amber border-amber-500/20 animate-pulse'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            {req.status === 'Pending' ? (
                              <button 
                                onClick={() => approveOverride(req.id)}
                                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-white text-black font-display text-xs font-bold transition-all cursor-pointer shadow-md"
                              >
                                {t.approveOverrideBtn}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500 font-semibold font-mono">Quota Added ✓</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. HARDWARE CATALOG CMS VIEW */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* INVERTERS SECTION (7 cols) */}
            <div className="xl:col-span-6 space-y-6">
              <div className="bg-surface-base border border-border-base rounded-xl overflow-hidden shadow-sm p-5 space-y-6">
                <div className="border-b border-border-base pb-3">
                  <h3 className="font-display font-bold text-white text-base">🔌 Inverters Database CMS</h3>
                </div>

                {/* Listing */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-black/20 border-b border-slate-800 text-slate-400 uppercase font-bold text-[9px] tracking-wider">
                        <th className="px-3 py-2.5">Model / Brand</th>
                        <th className="px-3 py-2.5">Spec</th>
                        <th className="px-3 py-2.5">Price</th>
                        <th className="px-3 py-2.5 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {inverters.map(inv => (
                        <tr key={inv.id} className="hover:bg-white/5">
                          <td className="px-3 py-3">
                            <span className="font-bold text-white">{inv.brand}</span>
                            <span className="block text-[10px] text-slate-500">{inv.model}</span>
                          </td>
                          <td className="px-3 py-3 font-mono text-slate-300">{inv.capacity_kw}kW ({inv.type})</td>
                          <td className="px-3 py-3 font-mono text-primary-container">{inv.cost_pkr.toLocaleString()} PKR</td>
                          <td className="px-3 py-3 text-right">
                            <button 
                              type="button" 
                              onClick={() => removeInverter(inv.id)}
                              className="size-7 rounded bg-red-950/20 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Delete model"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Form */}
                <form onSubmit={handleAddInverterSubmit} className="bg-black/30 border border-border-base/50 p-4 rounded-xl space-y-4">
                  <h4 className="font-display font-bold text-white text-xs">{t.addInvHeader}</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400">Brand Name</label>
                      <input 
                        type="text" 
                        value={invBrand} 
                        onChange={(e) => setInvBrand(e.target.value)}
                        placeholder="e.g. Solis" 
                        className="w-full bg-slate-900 border border-border-base/50 rounded-lg p-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Model Name</label>
                      <input 
                        type="text" 
                        value={invModel} 
                        onChange={(e) => setInvModel(e.target.value)}
                        placeholder="e.g. S5-GR3P10K" 
                        className="w-full bg-slate-900 border border-border-base/50 rounded-lg p-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400">Capacity (kW)</label>
                      <input 
                        type="number" 
                        value={invCapacity} 
                        onChange={(e) => setInvCapacity(e.target.value)}
                        className="w-full bg-slate-900 border border-border-base/50 rounded-lg p-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Type</label>
                      <select 
                        value={invType} 
                        onChange={(e) => setInvType(e.target.value)}
                        className="w-full bg-slate-900 border border-border-base/50 rounded-lg p-2 text-white focus:border-primary focus:outline-none cursor-pointer"
                      >
                        <option value="On-Grid">On-Grid</option>
                        <option value="Off-Grid">Off-Grid</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Base Price (PKR)</label>
                      <input 
                        type="number" 
                        value={invPrice} 
                        onChange={(e) => setInvPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-border-base/50 rounded-lg p-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 rounded-lg bg-primary hover:bg-white text-black font-display font-bold text-xs transition-all cursor-pointer shadow"
                  >
                    🚀 Save Inverter to Catalog
                  </button>
                </form>
              </div>
            </div>

            {/* SOLAR PANELS SECTION (6 cols) */}
            <div className="xl:col-span-6 space-y-6">
              <div className="bg-surface-base border border-border-base rounded-xl overflow-hidden shadow-sm p-5 space-y-6">
                <div className="border-b border-border-base pb-3">
                  <h3 className="font-display font-bold text-white text-base">☀️ Solar Panels Database CMS</h3>
                </div>

                {/* Listing */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-black/20 border-b border-slate-800 text-slate-400 uppercase font-bold text-[9px] tracking-wider">
                        <th className="px-3 py-2.5">Model / Mfg</th>
                        <th className="px-3 py-2.5">Spec</th>
                        <th className="px-3 py-2.5">Rate / Watt</th>
                        <th className="px-3 py-2.5 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {solarPanels.map(panel => (
                        <tr key={panel.id} className="hover:bg-white/5">
                          <td className="px-3 py-3">
                            <span className="font-bold text-white">{panel.mfg}</span>
                            <span className="block text-[10px] text-slate-500">{panel.model}</span>
                          </td>
                          <td className="px-3 py-3 font-mono text-slate-300">{panel.wattage}W ({panel.cell_type})</td>
                          <td className="px-3 py-3 font-mono text-primary-container">{panel.cost_per_watt} PKR/W</td>
                          <td className="px-3 py-3 text-right">
                            <button 
                              type="button" 
                              onClick={() => removeSolarPanel(panel.id)}
                              className="size-7 rounded bg-red-950/20 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Delete model"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Form */}
                <form onSubmit={handleAddPanelSubmit} className="bg-black/30 border border-border-base/50 p-4 rounded-xl space-y-4">
                  <h4 className="font-display font-bold text-white text-xs">{t.addPanelHeader}</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400">Manufacturer</label>
                      <input 
                        type="text" 
                        value={panelMfg} 
                        onChange={(e) => setPanelMfg(e.target.value)}
                        placeholder="e.g. Jinko Solar" 
                        className="w-full bg-slate-900 border border-border-base/50 rounded-lg p-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Model Name</label>
                      <input 
                        type="text" 
                        value={panelModel} 
                        onChange={(e) => setPanelModel(e.target.value)}
                        placeholder="e.g. Tiger Neo" 
                        className="w-full bg-slate-900 border border-border-base/50 rounded-lg p-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400">Wattage (W)</label>
                      <input 
                        type="number" 
                        value={panelWattage} 
                        onChange={(e) => setPanelWattage(e.target.value)}
                        className="w-full bg-slate-900 border border-border-base/50 rounded-lg p-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Cell Type</label>
                      <select 
                        value={panelCell} 
                        onChange={(e) => setPanelCell(e.target.value)}
                        className="w-full bg-slate-900 border border-border-base/50 rounded-lg p-2 text-white focus:border-primary focus:outline-none cursor-pointer"
                      >
                        <option value="Monocrystalline">Monocrystalline</option>
                        <option value="Polocrystalline">Polocrystalline</option>
                        <option value="Bifacial">Bifacial</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">PKR per Watt</label>
                      <input 
                        type="number" 
                        value={panelPriceWatt} 
                        onChange={(e) => setPanelPriceWatt(e.target.value)}
                        className="w-full bg-slate-900 border border-border-base/50 rounded-lg p-2 text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 rounded-lg bg-primary hover:bg-white text-black font-display font-bold text-xs transition-all cursor-pointer shadow"
                  >
                    🚀 Save Solar Panel to Catalog
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* MOCK RECEIPT MODAL PREVIEW */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-surface-container border border-border-base rounded-xl w-full max-w-md shadow-2xl p-6 text-center space-y-6">
              <div className="flex justify-between items-center border-b border-border-base pb-3">
                <h4 className="font-display font-bold text-white text-base">{t.viewSlip}</h4>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Receipt mockup card */}
              <div className="bg-white/5 border border-border-base/50 rounded-xl p-8 space-y-4">
                <span className="material-symbols-outlined text-5xl text-primary">receipt_long</span>
                <div className="space-y-1 font-mono">
                  <div className="text-xs text-slate-500">File Attachment</div>
                  <div className="text-sm font-bold text-white">{activeSlip}</div>
                </div>
                <div className="text-left border-t border-slate-800/80 pt-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Sender:</span>
                    <span className="text-white font-semibold">{company.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tier requested:</span>
                    <span className="text-white font-semibold">{company.plan}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Off-line Channel:</span>
                    <span className="text-white font-semibold">Bank Transfer</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleApprovePayment}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-display font-semibold transition-all cursor-pointer shadow-md text-xs"
              >
                {t.approveBtn}
              </button>
            </div>
          </div>
        )}

      </main>
    </PageShell>
  );
}

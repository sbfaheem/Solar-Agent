'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { 
  MONTH_KEYS, 
  MONTH_LABELS, 
  interpolateAnnualProfile 
} from '../lib/ocr/seasonalCurve';

// Pakistani DISCOs Database
const DISCO_DATA = [
  { code: 'KE', name: 'K-Electric (Karachi & Hub)', tariff: 46.95, city: 'Karachi' },
  { code: 'LESCO', name: 'LESCO (Lahore & Central Punjab)', tariff: 45.20, city: 'Lahore' },
  { code: 'IESCO', name: 'IESCO (Islamabad, Rawalpindi, Attock)', tariff: 44.80, city: 'Islamabad' },
  { code: 'FESCO', name: 'FESCO (Faisalabad, Sargodha, Jhang)', tariff: 44.50, city: 'Faisalabad' },
  { code: 'GEPCO', name: 'GEPCO (Gujranwala, Sialkot, Gujrat)', tariff: 45.00, city: 'Gujranwala' },
  { code: 'MEPCO', name: 'MEPCO (Multan, Sahiwal, Bahawalpur)', tariff: 44.90, city: 'Multan' },
  { code: 'PESCO', name: 'PESCO (Peshawar, Mardan, Swat)', tariff: 44.20, city: 'Peshawar' },
  { code: 'HESCO', name: 'HESCO (Hyderabad, Thatta, Badin)', tariff: 45.50, city: 'Hyderabad' },
  { code: 'SEPCO', name: 'SEPCO (Sukkur, Larkana, Khairpur)', tariff: 45.60, city: 'Sukkur' },
  { code: 'QESCO', name: 'QESCO (Quetta, Gwadar, Turbat)', tariff: 46.00, city: 'Quetta' },
  { code: 'TESCO', name: 'TESCO (Tribal Areas / Erstwhile FATA)', tariff: 43.50, city: 'Miranshah' },
  { code: 'AJKED', name: 'AJKED (Azad Jammu & Kashmir)', tariff: 42.00, city: 'Muzaffarabad' }
];

// Major Pakistani Cities with Peak Sun Hours (PSH)
const PAKISTAN_CITIES = [
  { city: 'Islamabad', psh: 5.3, province: 'ICT' },
  { city: 'Karachi', psh: 5.8, province: 'Sindh' },
  { city: 'Lahore', psh: 5.2, province: 'Punjab' },
  { city: 'Rawalpindi', psh: 5.3, province: 'Punjab' },
  { city: 'Peshawar', psh: 5.4, province: 'KPK' },
  { city: 'Quetta', psh: 6.4, province: 'Balochistan' },
  { city: 'Multan', psh: 5.6, province: 'Punjab' },
  { city: 'Faisalabad', psh: 5.3, province: 'Punjab' },
  { city: 'Gujranwala', psh: 5.2, province: 'Punjab' },
  { city: 'Sialkot', psh: 5.2, province: 'Punjab' },
  { city: 'Hyderabad', psh: 5.7, province: 'Sindh' },
  { city: 'Sukkur', psh: 5.9, province: 'Sindh' },
  { city: 'Gwadar', psh: 6.1, province: 'Balochistan' },
  { city: 'Abbottabad', psh: 5.1, province: 'KPK' },
  { city: 'Muzaffarabad', psh: 5.0, province: 'AJK' },
  { city: 'Skardu', psh: 5.8, province: 'Gilgit-Baltistan' }
];

// Default Empty Appliances
const INITIAL_APPLIANCES = [
  { id: 'app-1', name: 'LED Bulbs & Lights', category: 'Lights', watts: 12, qty: 0, hours: 0, icon: 'lightbulb' },
  { id: 'app-2', name: 'Ceiling Fans (Inverter/AC)', category: 'Fans', watts: 75, qty: 0, hours: 0, icon: 'mode_fan' },
  { id: 'app-3', name: 'Inverter AC (1.5 Ton)', category: 'Air Conditioning', watts: 1800, qty: 0, hours: 0, icon: 'ac_unit' },
  { id: 'app-4', name: 'Inverter AC (1 Ton)', category: 'Air Conditioning', watts: 1200, qty: 0, hours: 0, icon: 'ac_unit' },
  { id: 'app-5', name: 'Refrigerator / Freezer', category: 'Refrigeration', watts: 350, qty: 0, hours: 0, icon: 'kitchen' },
  { id: 'app-6', name: 'Water Pump / Motor (1.5 HP)', category: 'Pumps', watts: 1100, qty: 0, hours: 0, icon: 'water_drop' },
  { id: 'app-7', name: 'LED TV & Electronics', category: 'Electronics', watts: 120, qty: 0, hours: 0, icon: 'tv' },
  { id: 'app-8', name: 'Microwave & Kitchen Load', category: 'Kitchen', watts: 1500, qty: 0, hours: 0, icon: 'microwave' }
];

export default function SolarCalculatorModal({ isOpen, onClose }) {
  const router = useRouter();
  const { lang, calcParams, setCalcParams, showToast, formatPrice } = useApp();

  const [mode, setMode] = useState('ocr'); // 'ocr' or 'appliance'
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // 12-Month Annual Profile State
  const [monthlyProfile, setMonthlyProfile] = useState({
    jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
  });
  const [verifiedKeys, setVerifiedKeys] = useState([]);
  const [consumerName, setConsumerName] = useState('');
  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [selectedDisco, setSelectedDisco] = useState('LESCO');

  // Appliance Load Calculator State
  const [appliances, setAppliances] = useState(INITIAL_APPLIANCES);

  if (!isOpen) return null;

  // Calculate seasonal interpolation curve for missing months
  const annualData = interpolateAnnualProfile(monthlyProfile, verifiedKeys);

  // Multi-Bill OCR Processing (Auto-maps extracted month into Annual Grid)
  const processFile = async (file) => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/ocr-bill?t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const monthKey = data.monthKey || 'feb';
        const units = Number(data.monthlyUnits) || 0;

        if (data.consumerName) setConsumerName(data.consumerName);
        if (data.disco) setSelectedDisco(data.disco);

        // Update monthly profile & verified keys
        setMonthlyProfile(prev => ({
          ...prev,
          [monthKey]: units
        }));

        setVerifiedKeys(prev => Array.from(new Set([...prev, monthKey])));

        showToast(
          `⚡ Parsed ${MONTH_LABELS[monthKey]} Bill (${data.discoFullName || data.disco})! Extracted ${units} kWh for ${data.consumerName || 'Consumer'}.`
        );
      } else {
        showToast(data.error || "OCR Parsing failed", "error");
      }
    } catch (err) {
      console.error("OCR API error:", err);
      showToast("Error processing utility bill image via Gemini Vision", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => processFile(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => processFile(file));
    }
  };

  const handleMonthInputChange = (key, val) => {
    const units = Math.max(0, parseInt(val, 10) || 0);
    setMonthlyProfile(prev => ({ ...prev, [key]: units }));
    if (units > 0) {
      setVerifiedKeys(prev => Array.from(new Set([...prev, key])));
    } else {
      setVerifiedKeys(prev => prev.filter(k => k !== key));
    }
  };

  // Appliance Handlers
  const updateApplianceQty = (id, delta) => {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, qty: Math.max(0, a.qty + delta) } : a));
  };

  const setApplianceQtyDirect = (id, val) => {
    const qty = Math.max(0, parseInt(val, 10) || 0);
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, qty } : a));
  };

  const updateApplianceHours = (id, hours) => {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, hours: Math.max(0, Math.min(24, parseFloat(hours) || 0)) } : a));
  };

  const resetAllAppliances = () => {
    setAppliances(INITIAL_APPLIANCES);
    showToast("🧹 All appliance quantities reset to zero.");
  };

  // Appliance Load Computations
  const totalPeakWatts = appliances.reduce((sum, a) => sum + (a.qty * a.watts), 0);
  const totalDailyKwh = appliances.reduce((sum, a) => sum + ((a.qty * a.watts * a.hours) / 1000), 0);
  const applianceMonthlyKwh = Math.round(totalDailyKwh * 30);

  // Active units & calculation parameters
  const activeUnits = mode === 'ocr' ? annualData.averageMonthlyUnits : applianceMonthlyKwh;

  const currentCityObj = PAKISTAN_CITIES.find(c => c.city === selectedCity) || PAKISTAN_CITIES[2];
  const currentDiscoObj = DISCO_DATA.find(d => d.code === selectedDisco) || DISCO_DATA[1];

  // Solar Sizing Calculations from Annual Profile
  const psh = currentCityObj.psh;
  const systemSizeKw = activeUnits > 0 ? parseFloat((activeUnits / (psh * 30 * 0.85)).toFixed(2)) : 0.0;
  const panelCount = systemSizeKw > 0 ? Math.ceil((systemSizeKw * 1000) / 580) : 0;
  const estimatedCost = systemSizeKw > 0 ? Math.round((240000 + (systemSizeKw * 1000 * 40.0) + (systemSizeKw * 15000) + 40000)) : 0;
  const annualSavings = activeUnits > 0 ? Math.round((mode === 'ocr' ? annualData.annualUnits : activeUnits * 12) * (currentDiscoObj.tariff || 45.0)) : 0;
  const paybackYears = estimatedCost > 0 && annualSavings > 0 ? parseFloat((estimatedCost / annualSavings).toFixed(1)) : 0;

  const handleProceed = () => {
    if (activeUnits <= 0) {
      showToast("⚠️ Please upload at least one electricity bill or enter your appliance load!", "error");
      return;
    }
    setCalcParams(prev => ({
      ...prev,
      monthlyUnits: activeUnits,
      annualProfile: annualData.profile,
      verifiedMonths: annualData.verifiedKeys,
      estimatedMonths: annualData.estimatedKeys,
      annualUnits: mode === 'ocr' ? annualData.annualUnits : activeUnits * 12,
      averageMonthlyUnits: activeUnits,
      peakSummerUnits: annualData.peakSummerUnits,
      utilityProvider: selectedDisco,
      systemSizeKw
    }));
    onClose();
    router.push('/configuration');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-[#0f172a] dark:text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-black/30">
          <div className="flex items-center gap-3">
            <span className="size-9 rounded-xl bg-[#b45309] text-white flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-lg">solar_power</span>
            </span>
            <div>
              <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">Annual Energy Profiler & Solar Calculator</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Multi-Month Electricity Bills OCR & Seasonal Load Extrapolation Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="size-8 rounded-lg bg-slate-200 dark:bg-white/5 hover:bg-slate-300 text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Mode & Region Selector */}
        <div className="bg-slate-100 dark:bg-black/40 px-6 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2">
            <button 
              onClick={() => setMode('ocr')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-display cursor-pointer transition-all flex items-center gap-2 ${
                mode === 'ocr'
                  ? 'bg-[#b45309] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">document_scanner</span>
              <span>Calculate via Bills (OCR)</span>
            </button>
            <button 
              onClick={() => setMode('appliance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-display cursor-pointer transition-all flex items-center gap-2 ${
                mode === 'appliance'
                  ? 'bg-[#b45309] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">devices</span>
              <span>Calculate via Appliances</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select 
              value={selectedDisco} 
              onChange={e => setSelectedDisco(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
            >
              {DISCO_DATA.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
            <select 
              value={selectedCity} 
              onChange={e => setSelectedCity(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
            >
              {PAKISTAN_CITIES.map(c => (
                <option key={c.city} value={c.city}>{c.city} ({c.psh} PSH)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">

          {/* MODE 1: MULTI-MONTH OCR & ANNUAL CONSUMPTION BUILDER */}
          {mode === 'ocr' && (
            <div className="space-y-6">
              
              {/* Dropzone & OCR Upload */}
              <div 
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={e => { e.preventDefault(); setDragOver(false); }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative cursor-pointer ${
                  dragOver 
                    ? 'border-[#b45309] bg-[#fefce8] dark:bg-amber-950/20' 
                    : 'border-[#cbd5e1] dark:border-slate-700 bg-[#f8fafc] dark:bg-black/20 hover:border-[#b45309] hover:bg-[#fefce8]/40'
                }`}
              >
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                
                {loading ? (
                  <div className="space-y-2 py-4">
                    <span className="material-symbols-outlined text-4xl text-[#b45309] animate-spin">sync</span>
                    <p className="text-sm font-extrabold text-[#0f172a] dark:text-white">Processing utility bill images via Gemini Vision OCR...</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Detecting month, consumer name, billed units, and populating 12-Month Grid</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <div className="size-11 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center mx-auto shadow-sm">
                      <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                    </div>
                    <p className="text-sm font-extrabold text-[#0f172a] dark:text-white">Drag & Drop single or multiple electricity bills here</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Supports K-Electric, LESCO, IESCO, FESCO, GEPCO, MEPCO, PESCO, etc. across any month</p>
                  </div>
                )}
              </div>

              {/* Progress & Consumer Name Bar */}
              <div className="flex justify-between items-center bg-slate-100 dark:bg-black/30 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#0f172a] dark:text-white">
                    {consumerName ? `Consumer: ${consumerName}` : '12-Month Annual Energy Profile Builder'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-[#854d0e] dark:text-amber-300 font-mono font-bold text-[11px]">
                    {annualData.verifiedKeys.length}/12 Months Verified
                  </span>
                </div>
              </div>

              {/* 12-Month Annual Consumption Grid */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-display font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Monthly Consumption Grid (kWh Units)
                  </h4>
                  <span className="text-[11px] text-slate-400">Click any box to edit manually</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {MONTH_KEYS.map(key => {
                    const isVerified = annualData.verifiedKeys.includes(key);
                    const isEstimated = annualData.estimatedKeys.includes(key);
                    const val = annualData.profile[key] || 0;

                    return (
                      <div 
                        key={key}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 relative ${
                          isVerified 
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                            : isEstimated 
                              ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/60'
                              : 'bg-white dark:bg-black/30 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-600 dark:text-slate-300">{MONTH_LABELS[key]}</span>
                          {isVerified ? (
                            <span className="size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]" title="Verified via OCR">
                              ✓
                            </span>
                          ) : isEstimated ? (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300" title="Estimated via Seasonal Load Curve">
                              Est.
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1 font-mono">
                          <input 
                            type="number"
                            min="0"
                            value={val || ''}
                            placeholder="0"
                            onChange={e => handleMonthInputChange(key, e.target.value)}
                            className="w-full text-base font-extrabold text-[#0f172a] dark:text-white bg-transparent outline-none border-b border-transparent focus:border-amber-500"
                          />
                          <span className="text-[10px] text-slate-400 font-bold">kWh</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Annual Load Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-[#f8fafc] dark:bg-black/30 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Annual Energy</span>
                  <div className="font-display font-extrabold text-xl text-[#0f172a] dark:text-white">
                    {annualData.annualUnits.toLocaleString()} <span className="text-xs text-slate-500">kWh/year</span>
                  </div>
                </div>
                <div className="bg-[#f8fafc] dark:bg-black/30 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Average Monthly Units</span>
                  <div className="font-display font-extrabold text-xl text-[#b45309]">
                    {annualData.averageMonthlyUnits.toLocaleString()} <span className="text-xs text-slate-500">kWh/mo</span>
                  </div>
                </div>
                <div className="bg-[#f8fafc] dark:bg-black/30 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Peak Summer Load</span>
                  <div className="font-display font-extrabold text-xl text-emerald-700 dark:text-emerald-400">
                    {annualData.peakSummerUnits.toLocaleString()} <span className="text-xs text-slate-500">kWh/mo</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* MODE 2: APPLIANCE LOAD CALCULATOR */}
          {mode === 'appliance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#f8fafc] dark:bg-black/30 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Peak Running Load</span>
                  <div className="font-display font-extrabold text-xl text-[#0f172a] dark:text-white">
                    {(totalPeakWatts / 1000).toFixed(2)} <span className="text-xs text-slate-500 font-mono">kW</span>
                  </div>
                </div>
                <div className="bg-[#f8fafc] dark:bg-black/30 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Est. Daily Consumption</span>
                  <div className="font-display font-extrabold text-xl text-[#b45309]">
                    {totalDailyKwh.toFixed(1)} <span className="text-xs text-slate-500 font-mono">kWh/day</span>
                  </div>
                </div>
                <div className="bg-[#f8fafc] dark:bg-black/30 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Est. Monthly Load</span>
                  <div className="font-display font-extrabold text-xl text-emerald-700 dark:text-emerald-400">
                    {applianceMonthlyKwh} <span className="text-xs text-slate-500 font-mono">kWh/mo</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Configure Home & Office Appliances
                  </h4>
                  <button
                    onClick={resetAllAppliances}
                    className="text-[11px] text-slate-500 hover:text-rose-600 font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">restart_alt</span>
                    <span>Reset All to Zero</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {appliances.map(app => (
                    <div 
                      key={app.id}
                      className="bg-[#f8fafc] dark:bg-black/20 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="size-9 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-[#b45309] flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg">{app.icon}</span>
                        </span>
                        <div>
                          <div className="font-bold text-xs text-[#0f172a] dark:text-white">{app.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Rating: {app.watts}W each</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black/40">
                          <button 
                            onClick={() => updateApplianceQty(app.id, -1)}
                            className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-lg font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={app.qty || ''}
                            placeholder="0"
                            onChange={e => setApplianceQtyDirect(app.id, e.target.value)}
                            className="w-12 text-center text-xs font-mono font-bold text-[#0f172a] dark:text-white outline-none bg-transparent"
                          />
                          <button 
                            onClick={() => updateApplianceQty(app.id, 1)}
                            className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-lg font-bold text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <input 
                            type="number" 
                            min="0" 
                            max="24" 
                            step="0.5"
                            value={app.hours || ''}
                            placeholder="0"
                            onChange={e => updateApplianceHours(app.id, e.target.value)}
                            className="w-14 px-2 py-1 bg-white dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold text-xs outline-none"
                          />
                          <span className="text-slate-400 text-[10px]">hrs/day</span>
                        </div>

                        <div className="text-right min-w-[70px] font-mono text-xs font-bold text-[#b45309]">
                          {((app.qty * app.watts * app.hours) / 1000).toFixed(1)} kWh
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Synchronized System Sizing Display Banner */}
          {activeUnits > 0 ? (
            <div className="bg-[#fffbeb] dark:bg-amber-950/40 border border-[#fef08a] dark:border-amber-800 rounded-xl p-4 space-y-3 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="font-display font-extrabold text-[#854d0e] dark:text-amber-300 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">wb_sunny</span>
                  <span>Synchronized Solar System Sizing ({selectedCity} - {psh} Peak Sun Hours)</span>
                </h4>
                <span className="text-[10px] font-mono font-bold text-[#854d0e] dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                  DISCO: {currentDiscoObj.code} ({currentDiscoObj.tariff} PKR/kWh)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">Recommended System</span>
                  <span className="font-extrabold text-[#b45309] text-sm">{systemSizeKw} kWp</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Panel Count</span>
                  <span className="font-extrabold text-[#0f172a] dark:text-white text-sm">{panelCount} Panels (580W)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Est. System Cost</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">{formatPrice(estimatedCost)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ROI Payback</span>
                  <span className="font-extrabold text-[#b45309] text-sm">{paybackYears} Years</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 font-medium">
                ℹ️ Upload one or more electricity bills or configure your appliances above to auto-calculate annual energy consumption and recommended PV system capacity.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button 
            onClick={handleProceed}
            disabled={activeUnits <= 0}
            className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs transition-all flex items-center gap-2 ${
              activeUnits <= 0
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70'
                : 'bg-[#b45309] hover:bg-[#92400e] text-white shadow-md cursor-pointer'
            }`}
          >
            <span>{activeUnits > 0 ? `Proceed with ${systemSizeKw} kW Sizing` : 'Upload Bill to View Recommendation'}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
}

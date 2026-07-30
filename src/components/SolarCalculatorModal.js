'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';

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

// Default Appliances
const INITIAL_APPLIANCES = [
  { id: 'app-1', name: 'LED Bulbs & Lights', category: 'Lights', watts: 12, qty: 10, hours: 8, icon: 'lightbulb' },
  { id: 'app-2', name: 'Ceiling Fans (Inverter/AC)', category: 'Fans', watts: 75, qty: 6, hours: 14, icon: 'mode_fan' },
  { id: 'app-3', name: 'Inverter AC (1.5 Ton)', category: 'Air Conditioning', watts: 1800, qty: 2, hours: 8, icon: 'ac_unit' },
  { id: 'app-4', name: 'Inverter AC (1 Ton)', category: 'Air Conditioning', watts: 1200, qty: 1, hours: 6, icon: 'ac_unit' },
  { id: 'app-5', name: 'Refrigerator / Freezer', category: 'Refrigeration', watts: 350, qty: 1, hours: 24, icon: 'kitchen' },
  { id: 'app-6', name: 'Water Pump / Motor (1.5 HP)', category: 'Pumps', watts: 1100, qty: 1, hours: 1.5, icon: 'water_drop' },
  { id: 'app-7', name: 'LED TV & Electronics', category: 'Electronics', watts: 120, qty: 2, hours: 6, icon: 'tv' },
  { id: 'app-8', name: 'Microwave & Kitchen Load', category: 'Kitchen', watts: 1500, qty: 1, hours: 0.5, icon: 'microwave' }
];

export default function SolarCalculatorModal({ isOpen, onClose }) {
  const router = useRouter();
  const { lang, setCalcParams, showToast, formatPrice } = useApp();

  const [mode, setMode] = useState('ocr'); // 'ocr' or 'appliance'
  const [loading, setLoading] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Appliance Load Calculator State
  const [appliances, setAppliances] = useState(INITIAL_APPLIANCES);
  const [selectedCity, setSelectedCity] = useState('Karachi');
  const [selectedDisco, setSelectedDisco] = useState('KE');

  if (!isOpen) return null;

  // OCR Processing
  const processFile = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ocr-bill', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOcrData(data);
        setSelectedDisco(data.disco || 'KE');
        setCalcParams(prev => ({
          ...prev,
          monthlyUnits: data.monthlyUnits,
          utilityProvider: data.disco || prev.utilityProvider,
          billAmount: data.billAmount,
          tariffRate: data.tariffRate
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
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Appliance Quantity and Hours Handlers
  const updateApplianceQty = (id, delta) => {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, qty: Math.max(0, a.qty + delta) } : a));
  };

  const updateApplianceHours = (id, hours) => {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, hours: Math.max(0, Math.min(24, parseFloat(hours) || 0)) } : a));
  };

  // Appliance Load Computations
  const totalPeakWatts = appliances.reduce((sum, a) => sum + (a.qty * a.watts), 0);
  const totalDailyKwh = appliances.reduce((sum, a) => sum + ((a.qty * a.watts * a.hours) / 1000), 0);
  const applianceMonthlyKwh = Math.round(totalDailyKwh * 30);

  // Active Units based on mode (0 if no bill uploaded yet in OCR mode)
  const activeUnits = mode === 'ocr' ? (ocrData ? (ocrData.monthlyUnits || 0) : 0) : applianceMonthlyKwh;

  const currentCityObj = PAKISTAN_CITIES.find(c => c.city === selectedCity) || PAKISTAN_CITIES[1];
  const currentDiscoObj = DISCO_DATA.find(d => d.code === selectedDisco) || DISCO_DATA[0];

  // Solar Engineering System Sizing Calculations
  const psh = currentCityObj.psh;
  const systemSizeKw = activeUnits > 0 ? parseFloat((activeUnits / (psh * 30 * 0.85)).toFixed(2)) : 0.0;
  const panelCount = systemSizeKw > 0 ? Math.ceil((systemSizeKw * 1000) / 580) : 0;
  const estimatedCost = systemSizeKw > 0 ? Math.round((240000 + (systemSizeKw * 1000 * 40.0) + (systemSizeKw * 15000) + 40000)) : 0;
  const annualSavings = activeUnits > 0 ? Math.round(activeUnits * 12 * (currentDiscoObj.tariff || 45.0)) : 0;
  const paybackYears = estimatedCost > 0 && annualSavings > 0 ? parseFloat((estimatedCost / annualSavings).toFixed(1)) : 0;

  const handleProceed = () => {
    if (activeUnits <= 0) {
      showToast("⚠️ Please upload a bill or configure appliances first!", "error");
      return;
    }
    setCalcParams(prev => ({
      ...prev,
      monthlyUnits: activeUnits,
      utilityProvider: selectedDisco,
      systemSizeKw
    }));
    onClose();
    router.push('/configuration');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#0f172a] dark:text-white">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-black/30">
          <div className="flex items-center gap-3">
            <span className="size-9 rounded-xl bg-[#b45309] text-white flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-lg">solar_power</span>
            </span>
            <div>
              <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">Solar Engineering Calculator</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Pakistani Utility Bills OCR & Appliance Load Sizing Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="size-8 rounded-lg bg-slate-200 dark:bg-white/5 hover:bg-slate-300 text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Calculation Mode Switcher Tabs */}
        <div className="bg-slate-100 dark:bg-black/40 px-6 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
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

          {/* Regional DISCO & City Selectors */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
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

          {/* MODE 1: OCR BILL SCANNER */}
          {mode === 'ocr' && (
            <div className="space-y-6">
              {/* Drag and Drop Zone */}
              <div 
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={e => { e.preventDefault(); setDragOver(false); }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all relative cursor-pointer ${
                  dragOver 
                    ? 'border-[#b45309] bg-[#fefce8] dark:bg-amber-950/20' 
                    : 'border-[#cbd5e1] dark:border-slate-700 bg-[#f8fafc] dark:bg-black/20 hover:border-[#b45309] hover:bg-[#fefce8]/40'
                }`}
              >
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                
                {loading ? (
                  <div className="space-y-3 py-6">
                    <span className="material-symbols-outlined text-4xl text-[#b45309] animate-spin">sync</span>
                    <p className="text-sm font-extrabold text-[#0f172a] dark:text-white">Analyzing utility bill via Gemini 3.6 Vision OCR...</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Extracting DISCO, billed kWh, consumer name, reference number, and tariff rates</p>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="size-12 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center mx-auto shadow-sm">
                      <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                    </div>
                    <p className="text-sm font-extrabold text-[#0f172a] dark:text-white">Drag & Drop utility bill image here or click to browse</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Supports K-Electric, LESCO, IESCO, FESCO, GEPCO, MEPCO, PESCO, HESCO, SEPCO, QESCO, etc.</p>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fefce8] dark:bg-amber-950/40 border border-[#fef08a] dark:border-amber-800 text-xs font-mono font-bold text-[#854d0e] dark:text-amber-300">
                      <span>✨ Powered by Gemini Vision OCR</span>
                    </div>
                  </div>
                )}
              </div>

              {/* OCR Results Summary */}
              {ocrData && (
                <div className="bg-[#f0fdf4] dark:bg-emerald-950/20 border border-[#bbf7d0] dark:border-emerald-800 rounded-2xl p-5 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-emerald-200 dark:border-emerald-800 pb-3">
                    <span className="text-xs font-extrabold font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-emerald-700">check_circle</span>
                      Bill Extraction Completed
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300">
                      Engine: {ocrData.ocrEngine}
                    </span>
                  </div>

                  {ocrData.consumerName && (
                    <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 flex justify-between items-center text-xs">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Consumer Name</span>
                      <span className="font-extrabold text-[#0f172a] dark:text-white text-sm">{ocrData.consumerName}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">DISCO</span>
                      <div className="font-extrabold text-[#b45309] text-sm truncate">{ocrData.discoFullName || ocrData.disco}</div>
                    </div>
                    <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Billed Consumption</span>
                      <div className="font-extrabold text-[#0f172a] dark:text-white text-sm">{ocrData.monthlyUnits} kWh</div>
                    </div>
                    <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Payable Amount</span>
                      <div className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">{formatPrice(ocrData.billAmount)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: INTERACTIVE APPLIANCE LOAD CALCULATOR */}
          {mode === 'appliance' && (
            <div className="space-y-6">
              
              {/* Appliance Summary Header Bar */}
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

              {/* Interactive Appliances Manager List */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Configure Home & Office Appliances
                </h4>
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
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black/40">
                          <button 
                            onClick={() => updateApplianceQty(app.id, -1)}
                            className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-lg font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-mono font-bold text-[#0f172a] dark:text-white">{app.qty}</span>
                          <button 
                            onClick={() => updateApplianceQty(app.id, 1)}
                            className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-lg font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Hours Per Day Input */}
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <input 
                            type="number" 
                            min="0" 
                            max="24" 
                            step="0.5"
                            value={app.hours}
                            onChange={e => updateApplianceHours(app.id, e.target.value)}
                            className="w-14 px-2 py-1 bg-white dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold text-xs"
                          />
                          <span className="text-slate-400 text-[10px]">hrs/day</span>
                        </div>

                        {/* Total Appliance Load */}
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
                  <span>Synchronized Solar Sizing ({selectedCity} - {psh} Peak Sun Hours)</span>
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
                ℹ️ Upload a utility bill or configure appliances above to view recommended system size, panel count, and ROI calculation.
              </p>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
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

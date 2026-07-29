'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function SolarCalculatorModal({ isOpen, onClose }) {
  const router = useRouter();
  const { lang, setCalcParams, showToast, formatPrice } = useApp();

  const [loading, setLoading] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  // Calculations based on extracted units
  const units = ocrData ? ocrData.monthlyUnits : 256;
  const systemSizeKw = parseFloat((units / 120).toFixed(2));
  const panelCount = Math.ceil((systemSizeKw * 1000) / 580);
  const estimatedCost = Math.round((240000 + (systemSizeKw * 1000 * 40.0) + (systemSizeKw * 15000) + 40000));
  const annualSavings = Math.round(systemSizeKw * 120 * 12 * 45);
  const paybackYears = parseFloat((estimatedCost / (annualSavings || 1)).toFixed(1));

  const handleProceed = () => {
    onClose();
    router.push('/configuration');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#0f172a] dark:text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-black/30">
          <div className="flex items-center gap-3">
            <span className="size-9 rounded-xl bg-[#b45309] text-white flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-lg">document_scanner</span>
            </span>
            <div>
              <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">Gemini Vision Bill OCR Scanner</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Pakistani Utility Bills OCR (K-Electric, LESCO, IESCO, FESCO, GEPCO, etc.)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="size-8 rounded-lg bg-slate-200 dark:bg-white/5 hover:bg-slate-300 text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Drag and Drop Zone */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Supports K-Electric, LESCO, IESCO, FESCO, GEPCO, MEPCO, PESCO, etc. (JPG, PNG, PDF)</p>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fefce8] dark:bg-amber-950/40 border border-[#fef08a] dark:border-amber-800 text-xs font-mono font-bold text-[#854d0e] dark:text-amber-300">
                  <span>✨ Powered by Gemini Vision OCR</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
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

              {/* Consumer Info Bar */}
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
                <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Reference / Account #</span>
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate">{ocrData.referenceNumber}</div>
                </div>
                <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Billing Cycle</span>
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{ocrData.billingMonth}</div>
                </div>
                <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Inferred Tariff</span>
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{ocrData.tariffRate} PKR/kWh</div>
                </div>
              </div>

              {/* Synchronized System Sizing */}
              <div className="bg-[#fffbeb] dark:bg-amber-950/40 border border-[#fef08a] dark:border-amber-800 rounded-xl p-4 space-y-3">
                <h4 className="font-display font-extrabold text-[#854d0e] dark:text-amber-300 text-xs">☀️ Synchronized Solar System Sizing</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">System Capacity</span>
                    <span className="font-extrabold text-[#b45309] text-sm">{systemSizeKw} kWp</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Panel Count</span>
                    <span className="font-extrabold text-[#0f172a] dark:text-white text-sm">{panelCount} Panels (580W)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Est. Investment</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">{formatPrice(estimatedCost)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">ROI Payback</span>
                    <span className="font-extrabold text-[#b45309] text-sm">{paybackYears} Years</span>
                  </div>
                </div>
              </div>
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
            className="px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            <span>Proceed to Full Engineering Wizard</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
}

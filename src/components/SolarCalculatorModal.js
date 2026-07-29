'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function SolarCalculatorModal({ isOpen, onClose }) {
  const router = useRouter();
  const { lang, setCalcParams, showToast } = useApp();

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
            : `⚡ Parsed ${data.discoFullName}! Extracted ${data.monthlyUnits} kWh (PKR ${data.billAmount?.toLocaleString() || ''})`
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

  // Calculations
  const units = ocrData ? ocrData.monthlyUnits : 450;
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
      <div className="bg-surface-container border border-border-base rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-base flex justify-between items-center bg-black/30">
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-base">document_scanner</span>
            </span>
            <div>
              <h3 className="font-display font-bold text-white text-base">Gemini Vision Bill OCR Calculator</h3>
              <p className="text-slate-400 text-xs">Upload any Pakistani electricity bill (KE, LESCO, IESCO, FESCO, etc.)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="size-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
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
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all relative cursor-pointer ${
              dragOver 
                ? 'border-primary bg-primary/10' 
                : 'border-border-base/70 bg-black/20 hover:border-primary/50 hover:bg-black/30'
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
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                <p className="text-sm font-semibold text-white">Analyzing utility bill with Gemini 3.6 Vision OCR...</p>
                <p className="text-xs text-slate-400">Extracting DISCO, billed kWh, reference number, and tariff rates</p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <span className="material-symbols-outlined text-4xl text-primary/80">cloud_upload</span>
                <p className="text-sm font-semibold text-white">Drag & Drop utility bill image here or click to browse</p>
                <p className="text-xs text-slate-400">Supports K-Electric, LESCO, IESCO, FESCO, GEPCO, MEPCO, PESCO, etc. (JPG, PNG, PDF)</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary-container font-mono">
                  <span>✨ Powered by gemini-3.6-flash</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {ocrData && (
            <div className="bg-surface-base border border-emerald-500/30 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-border-base pb-3">
                <span className="text-xs font-bold font-mono text-accent-emerald flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Bill Extraction Completed
                </span>
                <span className="text-[10px] font-mono text-slate-400">Engine: {ocrData.ocrEngine}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-black/30 p-2.5 rounded-lg border border-border-base/40 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">DISCO</span>
                  <div className="font-bold text-primary truncate">{ocrData.discoFullName || ocrData.disco}</div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-border-base/40 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">Billed Consumption</span>
                  <div className="font-bold text-white">{ocrData.monthlyUnits} kWh</div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-border-base/40 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">Payable Amount</span>
                  <div className="font-bold text-accent-emerald">PKR {ocrData.billAmount?.toLocaleString()}</div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-border-base/40 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">Reference #</span>
                  <div className="font-bold text-slate-300 truncate">{ocrData.referenceNumber}</div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-border-base/40 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">Billing Cycle</span>
                  <div className="font-bold text-slate-300">{ocrData.billingMonth}</div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-border-base/40 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">Inferred Tariff</span>
                  <div className="font-bold text-slate-300">{ocrData.tariffRate} PKR/kWh</div>
                </div>
              </div>

              {/* Sizing calculation results */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
                <h4 className="font-display font-bold text-white text-xs">☀️ Synchronized Solar System Sizing</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">System Capacity</span>
                    <span className="font-bold text-primary text-sm">{systemSizeKw} kWp</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Panel Count</span>
                    <span className="font-bold text-white text-sm">{panelCount} Panels (580W)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Est. Investment</span>
                    <span className="font-bold text-accent-emerald text-sm">PKR {estimatedCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">ROI Payback</span>
                    <span className="font-bold text-amber-400 text-sm">{paybackYears} Years</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-base bg-black/30 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button 
            onClick={handleProceed}
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-white text-black font-display font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            <span>Proceed to Full Engineering Wizard</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
}

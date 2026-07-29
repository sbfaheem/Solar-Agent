'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';

export default function TeamSettings() {
  const { company, submitOfflinePayment, lang, showToast, formatPrice, theme } = useApp();
  
  const [selectedPlan, setSelectedPlan] = useState(company.plan || 'Gold');
  const [checkoutMethod, setCheckoutMethod] = useState('bank'); // 'bank' or 'cash'
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  const planPrices = {
    Silver: 30000,
    Gold: 50000,
    Platinum: 75000
  };

  const handleCopyIban = () => {
    navigator.clipboard.writeText("PK64MEZN001234567890");
    setCopiedIban(true);
    showToast("IBAN copied to clipboard!");
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setReceiptFile(file);
      showToast(`Selected receipt file: ${file.name}`);
    }
  };

  const handleSubmitReceipt = async () => {
    setSubmitting(true);
    const slipName = receiptFile ? receiptFile.name : "Meezan_Bank_Transfer_Slip.png";
    const ok = await submitOfflinePayment(selectedPlan, checkoutMethod, slipName);
    setSubmitting(false);
    if (ok) {
      setReceiptFile(null);
    }
  };

  return (
    <PageShell headerTitle="Subscription Payment">
      <main className="max-w-6xl mx-auto w-full p-4 lg:p-8 space-y-6 animate-fadeIn">
        
        {/* Top Warning Alert Banner matching Screenshot 1 */}
        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm text-slate-800">
          <div className="flex items-start sm:items-center gap-3">
            <div className="size-10 rounded-full bg-[#fde047]/30 text-[#b45309] flex items-center justify-center flex-shrink-0 font-bold">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-sm sm:text-base">
                Action Required: Payment Verification
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Your subscription is currently in <span className="font-bold text-slate-800">Pending Upload</span> state. Please provide receipt to activate service.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] border border-[#fde047] text-[#92400e] text-xs font-mono font-bold uppercase tracking-wider flex-shrink-0">
            <span className="size-2 rounded-full bg-[#b45309] animate-pulse"></span>
            <span>STATUS: {company.billing_status === 'Active' ? 'ACTIVE' : 'PENDING'}</span>
          </div>
        </div>

        {/* Two-Column Payment Layout matching Screenshot 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Selected Package Plan Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-6 text-slate-800">
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-extrabold tracking-widest text-slate-400 uppercase">
                  SELECTED PACKAGE
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#fefce8] border border-[#fef08a] text-[#854d0e] font-display font-bold text-xs">
                  Solar B2B
                </span>
              </div>

              {/* Plan Selector */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-3xl font-extrabold text-slate-900">
                    {selectedPlan} Plan
                  </h2>
                  <div className="flex gap-1 text-xs">
                    {['Silver', 'Gold', 'Platinum'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setSelectedPlan(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          selectedPlan === p 
                            ? 'bg-[#b45309] text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs font-medium">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Billing Cycle</span>
                  <span className="font-bold text-slate-800">Annual (12 Months)</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Next Renewal</span>
                  <span className="font-bold text-slate-800">May 24, 2025</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-1">
                <div className="text-xs text-slate-500 font-semibold">Total Payable</div>
                <div className="font-display text-3xl font-black text-slate-900 tracking-tight">
                  {formatPrice(planPrices[selectedPlan] || 50000)}
                </div>
              </div>

              {/* Info Note Callout */}
              <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4 flex gap-3 text-xs text-[#1e40af]">
                <span className="material-symbols-outlined text-lg text-[#3b82f6] flex-shrink-0">info</span>
                <p className="leading-relaxed">
                  Payments are usually verified within 24-48 business hours after submission. You will receive an email confirmation.
                </p>
              </div>

            </div>

            {/* Need Help Support Desk Box */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 text-slate-800">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">headset_mic</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm">Need help with payment?</h4>
                  <p className="text-[11px] text-slate-500">Contact our billing department</p>
                </div>
              </div>
              <button 
                onClick={() => alert("Direct Help Line: +92 301 3377675\nEmail: billing@solaragent.pk")}
                className="px-4 py-2 rounded-xl bg-[#fefce8] hover:bg-[#fef9c3] border border-[#fef08a] text-[#854d0e] font-display font-bold text-xs transition-all cursor-pointer"
              >
                Support Desk
              </button>
            </div>

          </div>

          {/* Right Column: Official Details & Upload Box (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm text-slate-800">
              
              {/* Payment Channel Tabs matching Screenshot 1 */}
              <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold font-display">
                <button 
                  onClick={() => setCheckoutMethod('bank')}
                  className={`flex-1 py-3.5 px-6 transition-all border-b-2 cursor-pointer ${
                    checkoutMethod === 'bank' 
                      ? 'border-[#b45309] text-[#b45309] bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Bank Transfer
                </button>
                <button 
                  onClick={() => setCheckoutMethod('cash')}
                  className={`flex-1 py-3.5 px-6 transition-all border-b-2 cursor-pointer ${
                    checkoutMethod === 'cash' 
                      ? 'border-[#b45309] text-[#b45309] bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Cash
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Official Account Details Card */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-display font-bold text-slate-900 text-sm">
                    <span className="material-symbols-outlined text-[#b45309]">account_balance</span>
                    <span>Official Account Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">BANK NAME</span>
                      <div className="font-display font-bold text-slate-900 text-base">Meezan Bank</div>
                    </div>
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">ACCOUNT TITLE</span>
                      <div className="font-display font-bold text-slate-900 text-base">Solar Agent PVT LTD</div>
                    </div>
                  </div>

                  {/* IBAN Box with Copy Button */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">IBAN NUMBER</span>
                      <div className="font-mono font-extrabold text-slate-900 text-sm sm:text-base tracking-wider">
                        PK64MEZN001234567890
                      </div>
                    </div>
                    <button 
                      onClick={handleCopyIban}
                      className="size-9 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
                      title="Copy IBAN"
                    >
                      <span className="material-symbols-outlined text-base">
                        {copiedIban ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Upload Payment Receipt Dropzone matching Screenshot 1 */}
                <div className="space-y-3 pt-2">
                  <label className="font-display font-bold text-slate-900 text-xs sm:text-sm block">
                    Upload Payment Receipt (Screenshot/Image)
                  </label>

                  <div className="border-2 border-dashed border-[#cbd5e1] hover:border-[#b45309] rounded-2xl p-8 text-center bg-[#f8fafc] hover:bg-[#fefce8]/50 transition-all relative cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="space-y-3 py-2">
                      <div className="size-12 rounded-xl bg-slate-200/80 text-slate-600 flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-2xl">file_upload</span>
                      </div>
                      <div>
                        <p className="font-display font-bold text-slate-900 text-sm">
                          {receiptFile ? receiptFile.name : 'Drag & drop receipt here'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          JPG, PNG, or PDF up to 10MB
                        </p>
                      </div>
                      <button 
                        type="button" 
                        className="px-5 py-2 rounded-xl bg-[#78350f] text-white font-display font-bold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button matching Screenshot 1 */}
                <button 
                  onClick={handleSubmitReceipt}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-[#cbd5e1] hover:bg-[#b45309] hover:text-white text-slate-700 font-display font-bold text-sm transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>{submitting ? 'Submitting Receipt...' : 'Submit Receipt for Verification'}</span>
                </button>

              </div>

            </div>

          </div>

        </div>

      </main>
    </PageShell>
  );
}

'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ProposalLimitModal({ isOpen, onClose }) {
  const { 
    company, 
    bankDetails, 
    submitUpgradeRequest, 
    requestOverrideQuota,
    formatPrice, 
    showToast,
    lang
  } = useApp();

  const [selectedPlan, setSelectedPlan] = useState('Gold'); // 'Gold', 'Platinum', 'Emergency'
  const [paymentChannel, setPaymentChannel] = useState('Bank Wire Transfer');
  const [referenceId, setReferenceId] = useState('');
  const [contactEmail, setContactEmail] = useState(company.email || 'bilalfaheem47@gmail.com');
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [copiedIban, setCopiedIban] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentQuota = company.proposals_generated || 35;
  const maxQuota = company.plan === 'Silver' ? 35 : (company.plan === 'Gold' ? 60 : 100);

  const handleCopyIban = () => {
    navigator.clipboard.writeText(bankDetails.iban);
    setCopiedIban(true);
    showToast("IBAN copied to clipboard!");
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const setReceiptFile = (file) => {
    setReceiptImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result);
    };
    reader.readAsDataURL(file);
    showToast(`Receipt attached: ${file.name}`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setReceiptFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPlan === 'Emergency') {
      const res = await requestOverrideQuota({
        company_name: company.name,
        contact_email: contactEmail,
        reason: 'Monthly proposal quota reached. Need emergency +10 buffer.'
      });
      if (res) {
        showToast("Emergency +10 quota request sent to Super Admin!");
        onClose();
      }
      return;
    }

    if (!referenceId && !receiptPreview) {
      showToast("Please enter bank reference ID or upload receipt image", "error");
      return;
    }

    setSubmitting(true);

    const price = selectedPlan === 'Gold' ? 55000 : 75000;
    const reqData = {
      company_id: company.id || 'comp-1',
      company_name: company.name,
      contact_email: contactEmail,
      current_plan: company.plan || 'Silver',
      target_plan: selectedPlan,
      amount_pkr: price,
      payment_channel: paymentChannel,
      reference_id: referenceId || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      receipt_preview: receiptPreview || '/sample_receipt.png',
      notification_sent_to: 'superadmin@solaragent.pk'
    };

    const success = await submitUpgradeRequest(reqData);
    setSubmitting(false);

    if (success) {
      showToast("⚡ Payment receipt submitted! Dispatched notification to superadmin@solaragent.pk");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#0f172a] dark:text-white">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-black/30">
          <div className="flex items-center gap-3">
            <span className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-lg">warning</span>
            </span>
            <div>
              <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">Monthly Quota Exceeded</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Distributor Plan Upgrade & Payment Verification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="size-8 rounded-lg bg-slate-200 dark:bg-white/5 hover:bg-slate-300 text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          
          {/* Quota Limit Warning Alert Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">report_problem</span>
              <div>
                <div className="font-extrabold text-amber-900 dark:text-amber-200 text-sm">
                  Quota Limit Reached: {currentQuota}/{maxQuota} Proposals Used ({company.plan || 'Silver'} Plan)
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Upgrade your plan to generate more customer quotes or request an emergency +10 buffer.
                </div>
              </div>
            </div>
            <span className="font-mono text-xs font-black px-2.5 py-1 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 rounded-lg">
              35,000 PKR/mo
            </span>
          </div>

          {/* Target Plan Selector Cards */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase text-slate-500 tracking-wide block">Select Upgrade Plan</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Gold Plan */}
              <div 
                onClick={() => setSelectedPlan('Gold')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  selectedPlan === 'Gold'
                    ? 'border-[#b45309] bg-[#fefce8] dark:bg-amber-950/30 shadow-md ring-2 ring-[#b45309]/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-[#b45309] uppercase">GOLD TIER</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">POPULAR</span>
                </div>
                <div className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">60 Proposals/mo</div>
                <div className="font-mono text-sm font-black text-emerald-700 dark:text-emerald-400">{formatPrice(55000)}</div>
              </div>

              {/* Platinum Plan */}
              <div 
                onClick={() => setSelectedPlan('Platinum')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  selectedPlan === 'Platinum'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-purple-600 uppercase">PLATINUM</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">UNLIMITED</span>
                </div>
                <div className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">100 Proposals/mo</div>
                <div className="font-mono text-sm font-black text-purple-700 dark:text-purple-400">{formatPrice(75000)}</div>
              </div>

              {/* Emergency Extension */}
              <div 
                onClick={() => setSelectedPlan('Emergency')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  selectedPlan === 'Emergency'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-blue-600 uppercase">EMERGENCY</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">BUFFER</span>
                </div>
                <div className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">+10 Quota Extension</div>
                <div className="font-mono text-xs font-bold text-blue-600">Temporary Override</div>
              </div>

            </div>
          </div>

          {selectedPlan !== 'Emergency' && (
            <>
              {/* Bank Wire Details Box */}
              <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#b45309]">account_balance</span>
                    Official Bank Wire Details
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyIban}
                    className="px-3 py-1 rounded-lg bg-[#b45309] hover:bg-[#92400e] text-white font-mono font-bold text-[11px] transition-all cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">{copiedIban ? 'check' : 'content_copy'}</span>
                    <span>{copiedIban ? 'Copied!' : 'Copy IBAN'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Bank Name</span>
                    <span className="font-extrabold text-[#0f172a] dark:text-white">{bankDetails.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Account Title</span>
                    <span className="font-extrabold text-[#0f172a] dark:text-white">{bankDetails.accountTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Account Number</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{bankDetails.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">IBAN Number</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 truncate block">{bankDetails.iban}</span>
                  </div>
                </div>
              </div>

              {/* Reference ID & Contact Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Bank Transaction / Ref ID</label>
                  <input 
                    type="text"
                    placeholder="e.g. MEZN-981273461"
                    value={referenceId}
                    onChange={e => setReferenceId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-[#0f172a] dark:text-white focus:outline-none focus:border-[#b45309]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Distributor Contact Email</label>
                  <input 
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-[#0f172a] dark:text-white focus:outline-none focus:border-[#b45309]"
                  />
                </div>
              </div>

              {/* Payment Receipt Image Drag and Drop */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Upload Bank Transfer Receipt Screenshot</label>
                <div 
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#b45309] rounded-2xl p-6 text-center bg-slate-50 dark:bg-black/20 relative cursor-pointer"
                >
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {receiptPreview ? (
                    <div className="space-y-2">
                      <img src={receiptPreview} alt="Receipt Preview" className="h-28 mx-auto rounded-xl border border-slate-300 shadow-sm object-cover" />
                      <p className="text-xs text-emerald-700 font-bold">✓ Screenshot Attached ({receiptImage?.name})</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="material-symbols-outlined text-3xl text-[#b45309]">cloud_upload</span>
                      <p className="text-xs font-extrabold text-[#0f172a] dark:text-white">Drag & drop bank receipt image here or click to select file</p>
                      <p className="text-[10px] text-slate-400">Supports JPG, PNG screenshots</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex justify-between items-center">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  <span>Submitting Verification...</span>
                </>
              ) : (
                <>
                  <span>Submit Payment for Super Admin Verification</span>
                  <span className="material-symbols-outlined text-sm">send</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import ProposalLimitModal from '../../components/ProposalLimitModal';
import { useApp } from '../../context/AppContext';

export default function TeamSettings() {
  const { company, bankDetails, recordPayment, lang, showToast, formatPrice, theme } = useApp();
  
  const [selectedPlan, setSelectedPlan] = useState(company.plan || 'Gold');
  const [paymentChannel, setPaymentChannel] = useState('easypaisa');
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  // Card Form State
  const [cardHolder, setCardHolder] = useState('Syed Bilal');
  const [cardNumber, setCardNumber] = useState('4214 9812 7741 0912');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('881');
  const [cardNetwork, setCardNetwork] = useState('PayPak');

  // Mobile Wallet State
  const [mobileNumber, setMobileNumber] = useState('0301-3377675');
  const [walletTitle, setWalletTitle] = useState('Syed Bilal');

  // Raast / Digital Handles
  const [raastId, setRaastId] = useState(bankDetails.iban || 'PK64MEZN001234567890');
  const [digitalHandle, setDigitalHandle] = useState('@solaragent');

  // OTC Cash State
  const [voucherNumber, setVoucherNumber] = useState('PK-OTC-99120');
  const [collectorCity, setCollectorCity] = useState('Islamabad');

  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  const planPrices = {
    Silver: 35000,
    Gold: 55000,
    Platinum: 75000
  };

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
      showToast(`Selected receipt file: ${file.name}`);
    }
  };

  const handleProcessPayment = async () => {
    setSubmitting(true);
    
    let accountId = "N/A";
    let channelName = "Bank Transfer";
    let channelType = "Digital";

    if (paymentChannel === 'cards') {
      channelName = `Cards (${cardNetwork})`;
      channelType = "Debit / Credit Card";
      accountId = `**** **** **** ${cardNumber.slice(-4)}`;
    } else if (paymentChannel === 'easypaisa') {
      channelName = "Easypaisa";
      channelType = "Mobile Wallet";
      accountId = mobileNumber;
    } else if (paymentChannel === 'jazzcash') {
      channelName = "JazzCash";
      channelType = "Mobile Wallet";
      accountId = mobileNumber;
    } else if (paymentChannel === 'raast') {
      channelName = "Raast / SBP";
      channelType = "Instant Raast Pay";
      accountId = raastId;
    } else if (paymentChannel === 'sadapay') {
      channelName = "SadaPay / NayaPay";
      channelType = "Digital Handle";
      accountId = digitalHandle;
    } else if (paymentChannel === 'cash') {
      channelName = "Cash";
      channelType = "Over-the-Counter";
      accountId = `Voucher #${voucherNumber}`;
    }

    const payload = {
      company_name: company.name,
      plan: selectedPlan,
      channel: channelName,
      channel_type: channelType,
      account_identifier: accountId,
      reference_id: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount_pkr: planPrices[selectedPlan] || 55000,
      collector_agent: paymentChannel === 'cash' ? `Field Agent (${collectorCity})` : `${channelName} Gateway API`
    };

    const res = await recordPayment(payload);
    setSubmitting(false);
    if (res) {
      setReceiptFile(null);
    }
  };

  return (
    <PageShell headerTitle="Subscription Payment & Multi-Channel Billing">
      <main className="max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8 animate-fadeIn text-[#0f172a] dark:text-[#f8fafc]">
        
        {/* Top Warning Alert Banner */}
        <div className="bg-[#fffbeb] dark:bg-amber-950/40 border border-[#fef3c7] dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm text-slate-800 dark:text-amber-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#fde047]/40 text-[#b45309] dark:text-amber-300 flex items-center justify-center flex-shrink-0 font-bold">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-sm sm:text-base">
                Pakistani Multi-Channel Payment Desk
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                Pay via Bank Wire, Cards, Easypaisa, JazzCash, SBP Raast, SadaPay or Cash OTC.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLimitModalOpen(true)}
              className="px-4 py-2 bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">upgrade</span>
              <span>Upgrade Plan & Upload Receipt</span>
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] dark:bg-amber-900/60 border border-[#fde047] dark:border-amber-700 text-[#92400e] dark:text-amber-200 text-xs font-mono font-bold uppercase tracking-wider flex-shrink-0">
              <span className="size-2 rounded-full bg-[#b45309] animate-pulse"></span>
              <span>STATUS: {company.billing_status === 'Active' ? 'ACTIVE' : 'PENDING VERIFICATION'}</span>
            </div>
          </div>
        </div>

        {/* Two-Column Payment Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Selected Package Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="font-display font-extrabold text-base text-[#0f172a] dark:text-white">
                  Package Details & Quota
                </h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                  {company.plan || 'Silver'} TIER
                </span>
              </div>

              {/* Plan Selection Radio Group */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wide block">Choose Target Tier Plan</span>
                {[
                  { plan: 'Silver', price: 35000, limit: 35, desc: 'Starter Tier (35 Quotes/mo)' },
                  { plan: 'Gold', price: 55000, limit: 60, desc: 'Professional Tier (60 Quotes/mo)' },
                  { plan: 'Platinum', price: 75000, limit: 100, desc: 'Enterprise Unlimited (100 Quotes/mo)' }
                ].map(p => (
                  <div
                    key={p.plan}
                    onClick={() => setSelectedPlan(p.plan)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                      selectedPlan === p.plan
                        ? 'border-[#b45309] bg-[#fefce8] dark:bg-amber-950/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[#0f172a] dark:text-white">{p.plan} Plan</div>
                      <div className="text-xs text-slate-500 font-medium">{p.desc}</div>
                    </div>
                    <div className="font-mono text-sm font-black text-[#b45309]">
                      {formatPrice(p.price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Meezan Bank Account Details Card */}
              <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 font-sans font-bold text-slate-900 dark:text-white">
                  <span>Meezan Bank Direct Wire Details</span>
                  <button 
                    onClick={handleCopyIban}
                    className="px-2.5 py-1 rounded bg-[#b45309] hover:bg-[#92400e] text-white font-mono text-[10px] cursor-pointer"
                  >
                    {copiedIban ? 'Copied ✓' : 'Copy IBAN'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Bank Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{bankDetails.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Account Title</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{bankDetails.accountTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Account Number</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{bankDetails.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">IBAN Number</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">{bankDetails.iban}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Multi-Channel Checkout Desk (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="font-display font-extrabold text-base text-[#0f172a] dark:text-white">
                  Select Payment Method Channel
                </h3>
                <p className="text-xs text-slate-500 font-medium">Record or process your installer subscription payment</p>
              </div>

              {/* Payment Channel Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold font-display">
                {[
                  { id: 'easypaisa', name: 'Easypaisa', icon: 'smartphone' },
                  { id: 'jazzcash', name: 'JazzCash', icon: 'smartphone' },
                  { id: 'cards', name: 'Debit/Credit Cards', icon: 'credit_card' },
                  { id: 'raast', name: 'SBP Raast Pay', icon: 'bolt' },
                  { id: 'sadapay', name: 'SadaPay / NayaPay', icon: 'wallet' },
                  { id: 'cash', name: 'OTC Cash Voucher', icon: 'payments' }
                ].map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setPaymentChannel(ch.id)}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      paymentChannel === ch.id
                        ? 'border-[#b45309] bg-[#fefce8] dark:bg-amber-950/30 text-[#b45309] dark:text-amber-300 font-extrabold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{ch.icon}</span>
                    <span className="truncate">{ch.name}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Payment Channel Form Inputs */}
              <div className="bg-slate-50 dark:bg-black/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                
                {paymentChannel === 'cards' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase">Card Details (PayPak, Visa, UnionPay)</span>
                      <div className="flex gap-1.5 text-[10px] font-mono font-bold">
                        {['PayPak', 'Visa', 'Mastercard'].map(net => (
                          <button 
                            key={net}
                            onClick={() => setCardNetwork(net)}
                            className={`px-2 py-0.5 rounded border ${cardNetwork === net ? 'bg-[#b45309] text-white border-[#b45309]' : 'bg-white border-slate-300 text-slate-700'}`}
                          >
                            {net}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Cardholder Name</label>
                      <input type="text" value={cardHolder} onChange={e=>setCardHolder(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-mono text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Card Number</label>
                      <input type="text" value={cardNumber} onChange={e=>setCardNumber(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-mono text-xs" />
                    </div>
                  </div>
                )}

                {(paymentChannel === 'easypaisa' || paymentChannel === 'jazzcash') && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-sans uppercase">
                      {paymentChannel === 'easypaisa' ? 'Easypaisa Mobile Account' : 'JazzCash Wallet'}
                    </div>
                    <div className="space-y-1 font-sans">
                      <label className="text-xs font-bold text-slate-500">Account Mobile Number</label>
                      <input type="text" value={mobileNumber} onChange={e=>setMobileNumber(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-mono text-xs font-bold" />
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                      ⚡ Prompt will be dispatched to mobile number {mobileNumber} to enter your 5-digit MPIN.
                    </div>
                  </div>
                )}

                {paymentChannel === 'raast' && (
                  <div className="space-y-3 text-xs font-mono">
                    <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-sans uppercase">SBP Instant Raast Pay</div>
                    <div className="space-y-1 font-sans">
                      <label className="text-xs font-bold text-slate-500">Raast Identifier / IBAN</label>
                      <input type="text" value={raastId} onChange={e=>setRaastId(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-mono text-xs font-bold" />
                    </div>
                  </div>
                )}

                {paymentChannel === 'sadapay' && (
                  <div className="space-y-3 text-xs font-mono">
                    <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-sans uppercase">SadaPay / NayaPay Handle</div>
                    <div className="space-y-1 font-sans">
                      <label className="text-xs font-bold text-slate-500">Account Handle</label>
                      <input type="text" value={digitalHandle} onChange={e=>setDigitalHandle(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-mono text-xs font-bold" />
                    </div>
                  </div>
                )}

                {paymentChannel === 'cash' && (
                  <div className="space-y-3 text-xs font-mono">
                    <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-sans uppercase">Over-the-Counter Cash Voucher</div>
                    <div className="grid grid-cols-2 gap-3 font-sans">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Voucher Number</label>
                        <input type="text" value={voucherNumber} onChange={e=>setVoucherNumber(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-mono text-xs font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Collection City</label>
                        <input type="text" value={collectorCity} onChange={e=>setCollectorCity(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-mono text-xs font-bold" />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Process Transaction Action */}
              <button
                onClick={handleProcessPayment}
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">sync</span>
                    <span>Processing Payment Transaction...</span>
                  </>
                ) : (
                  <>
                    <span>Process {formatPrice(planPrices[selectedPlan] || 55000)} Payment for {selectedPlan} Plan</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>

            </div>
          </div>

        </div>

      </main>

      {/* Plan Upgrade & Quota Limit Modal */}
      <ProposalLimitModal 
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
      />
    </PageShell>
  );
}

'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';

export default function TeamSettings() {
  const { company, recordPayment, lang, showToast, formatPrice, theme } = useApp();
  
  const [selectedPlan, setSelectedPlan] = useState(company.plan || 'Gold');
  const [paymentChannel, setPaymentChannel] = useState('easypaisa'); // 'cards', 'easypaisa', 'jazzcash', 'raast', 'cash'
  
  // Card Form State
  const [cardHolder, setCardHolder] = useState('Syed Bilal');
  const [cardNumber, setCardNumber] = useState('4214 9812 7741 0912');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('881');
  const [cardNetwork, setCardNetwork] = useState('PayPak'); // 'PayPak', 'Visa', 'Mastercard', 'UnionPay'

  // Mobile Wallet State
  const [mobileNumber, setMobileNumber] = useState('0301-3377675');
  const [walletTitle, setWalletTitle] = useState('Syed Bilal');

  // Raast / Digital Handles
  const [raastId, setRaastId] = useState('PK64MEZN001234567890');
  const [digitalHandle, setDigitalHandle] = useState('@solaragent');

  // OTC Cash State
  const [voucherNumber, setVoucherNumber] = useState('PK-OTC-99120');
  const [collectorCity, setCollectorCity] = useState('Islamabad');

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
      amount_pkr: planPrices[selectedPlan] || 50000,
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
                Pay via Debit Cards (PayPak/Visa), Easypaisa, JazzCash, SBP Raast, SadaPay or Cash OTC.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] dark:bg-amber-900/60 border border-[#fde047] dark:border-amber-700 text-[#92400e] dark:text-amber-200 text-xs font-mono font-bold uppercase tracking-wider flex-shrink-0">
            <span className="size-2 rounded-full bg-[#b45309] animate-pulse"></span>
            <span>STATUS: {company.billing_status === 'Active' ? 'ACTIVE' : 'PENDING VERIFICATION'}</span>
          </div>
        </div>

        {/* Two-Column Payment Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Selected Package Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  SELECTED PACKAGE
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#fefce8] dark:bg-amber-950/40 border border-[#fef08a] dark:border-amber-800 text-[#854d0e] dark:text-amber-300 font-display font-bold text-xs">
                  Solar B2B SaaS
                </span>
              </div>

              {/* Plan Selector */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-3xl font-black text-[#0f172a] dark:text-white">
                    {selectedPlan} Plan
                  </h2>
                  <div className="flex gap-1 text-xs">
                    {['Silver', 'Gold', 'Platinum'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setSelectedPlan(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedPlan === p 
                            ? 'bg-[#b45309] text-white shadow-sm' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Proposals Allowance</span>
                  <span className="font-bold text-[#0f172a] dark:text-white">
                    {selectedPlan === 'Silver' ? '30 / Mo' : selectedPlan === 'Gold' ? '50 / Mo' : '75 / Mo'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Billing Cycle</span>
                  <span className="font-bold text-[#0f172a] dark:text-white">Annual (12 Months)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Payable</div>
                <div className="font-display text-3xl font-black text-[#b45309] tracking-tight">
                  {formatPrice(planPrices[selectedPlan] || 50000)}
                </div>
              </div>

              {/* Info Note Callout */}
              <div className="bg-[#eff6ff] dark:bg-blue-950/30 border border-[#bfdbfe] dark:border-blue-900 rounded-xl p-4 flex gap-3 text-xs text-[#1e40af] dark:text-blue-300">
                <span className="material-symbols-outlined text-lg text-[#3b82f6] flex-shrink-0">verified_user</span>
                <p className="leading-relaxed font-medium">
                  Instant activation via Easypaisa, JazzCash, Cards, and SBP Raast. 3D-Secure encrypted transactions.
                </p>
              </div>

            </div>

            {/* Support Desk Box */}
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">headset_mic</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-[#0f172a] dark:text-white text-xs sm:text-sm">Need help with payment?</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Call Pakistani billing desk</p>
                </div>
              </div>
              <button 
                onClick={() => alert("Direct Help Line: +92 301 3377675\nEmail: billing@solaragent.pk")}
                className="px-4 py-2 rounded-xl bg-[#fefce8] dark:bg-amber-950/40 border border-[#fef08a] dark:border-amber-800 text-[#854d0e] dark:text-amber-300 font-display font-bold text-xs transition-all cursor-pointer"
              >
                Support Desk
              </button>
            </div>

          </div>

          {/* Right Column: Multi-Channel Pakistani Checkout Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm">
              
              {/* Payment Channel Chips Tabs */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 flex flex-wrap gap-2 text-xs font-bold font-display">
                {[
                  { id: 'easypaisa', label: '📱 Easypaisa' },
                  { id: 'jazzcash', label: '📱 JazzCash' },
                  { id: 'cards', label: '💳 Cards (PayPak/Visa)' },
                  { id: 'raast', label: '⚡ SBP Raast Pay' },
                  { id: 'sadapay', label: '📲 SadaPay / NayaPay' },
                  { id: 'cash', label: '💵 OTC Cash' }
                ].map(ch => (
                  <button 
                    key={ch.id}
                    onClick={() => setPaymentChannel(ch.id)}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      paymentChannel === ch.id 
                        ? 'bg-[#b45309] text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-6">
                
                {/* 1. EASYPAISA WALLET CHECKOUT */}
                {paymentChannel === 'easypaisa' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold font-mono">
                          EP
                        </div>
                        <div>
                          <h4 className="font-display font-extrabold text-emerald-900 dark:text-emerald-300 text-sm">Easypaisa Mobile Wallet</h4>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Telenor Microfinance Bank Gateway</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                        INSTANT USSD
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Easypaisa Mobile Number *</label>
                        <input 
                          type="text" 
                          value={mobileNumber}
                          onChange={e=>setMobileNumber(e.target.value)}
                          placeholder="0300-1234567"
                          className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Account Title Name *</label>
                        <input 
                          type="text" 
                          value={walletTitle}
                          onChange={e=>setWalletTitle(e.target.value)}
                          placeholder="Syed Bilal"
                          className="w-full px-3.5 py-2.5 text-sm font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      💡 <strong>USSD Prompt Info:</strong> After clicking Pay, you will receive an automatic MPIN push notification on your mobile phone to authorize payment of {formatPrice(planPrices[selectedPlan] || 50000)}.
                    </div>
                  </div>
                )}

                {/* 2. JAZZCASH WALLET CHECKOUT */}
                {paymentChannel === 'jazzcash' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold font-mono">
                          JC
                        </div>
                        <div>
                          <h4 className="font-display font-extrabold text-red-900 dark:text-red-300 text-sm">JazzCash Mobile Wallet</h4>
                          <p className="text-[11px] text-red-700 dark:text-red-400">Mobilink Microfinance Bank Gateway</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200">
                        *786# PUSH
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">JazzCash Mobile Number *</label>
                        <input 
                          type="text" 
                          value={mobileNumber}
                          onChange={e=>setMobileNumber(e.target.value)}
                          placeholder="0300-1234567"
                          className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">CNIC (Last 6 Digits) *</label>
                        <input 
                          type="text" 
                          defaultValue="849210"
                          placeholder="123456"
                          className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DEBIT / CREDIT CARDS CHECKOUT */}
                {paymentChannel === 'cards' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined">credit_card</span>
                        </div>
                        <div>
                          <h4 className="font-display font-extrabold text-blue-900 dark:text-blue-300 text-sm">Debit / Credit Cards</h4>
                          <p className="text-[11px] text-blue-700 dark:text-blue-400">PayPak, Visa, Mastercard & UnionPay 3D-Secure</p>
                        </div>
                      </div>
                      <select 
                        value={cardNetwork} 
                        onChange={e=>setCardNetwork(e.target.value)}
                        className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                      >
                        <option value="PayPak">PayPak (Local PKR)</option>
                        <option value="Visa">Visa Card</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="UnionPay">UnionPay</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Cardholder Full Name *</label>
                        <input 
                          type="text" 
                          value={cardHolder}
                          onChange={e=>setCardHolder(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">16-Digit Card Number *</label>
                        <input 
                          type="text" 
                          value={cardNumber}
                          onChange={e=>setCardNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Expiry (MM/YY) *</label>
                          <input 
                            type="text" 
                            value={cardExpiry}
                            onChange={e=>setCardExpiry(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">CVV / Security Code *</label>
                          <input 
                            type="password" 
                            value={cardCvv}
                            onChange={e=>setCardCvv(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SBP RAAST PAY */}
                {paymentChannel === 'raast' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold font-mono">
                          ⚡
                        </div>
                        <div>
                          <h4 className="font-display font-extrabold text-amber-900 dark:text-amber-300 text-sm">SBP Instant Raast Pay</h4>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400">State Bank of Pakistan Instant Settlement</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                        0% FEE
                      </span>
                    </div>

                    <div className="bg-[#f8fafc] dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Official Raast IBAN</span>
                        <button onClick={handleCopyIban} className="text-xs font-bold text-[#b45309] hover:underline flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                          <span>{copiedIban ? 'Copied' : 'Copy Raast IBAN'}</span>
                        </button>
                      </div>
                      <div className="font-mono font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-wider">
                        PK64MEZN001234567890
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Your Raast Reference ID / Transaction Number *</label>
                      <input 
                        type="text" 
                        value={raastId}
                        onChange={e=>setRaastId(e.target.value)}
                        placeholder="RAAST-99201481"
                        className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* 5. SADAPAY / NAYAPAY */}
                {paymentChannel === 'sadapay' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold font-mono">
                          📲
                        </div>
                        <div>
                          <h4 className="font-display font-extrabold text-teal-900 dark:text-teal-300 text-sm">SadaPay / NayaPay Digital Handle</h4>
                          <p className="text-[11px] text-teal-700 dark:text-teal-400">EMI Licensed Digital Account Transfer</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">SadaPay / NayaPay Handle ID *</label>
                      <input 
                        type="text" 
                        value={digitalHandle}
                        onChange={e=>setDigitalHandle(e.target.value)}
                        placeholder="@solaragent"
                        className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* 6. OVER-THE-COUNTER CASH */}
                {paymentChannel === 'cash' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                          <h4 className="font-display font-extrabold text-amber-900 dark:text-amber-300 text-sm">Over-the-Counter Cash</h4>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400">Physical receipt voucher & field agent log</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Receipt Voucher Number *</label>
                        <input 
                          type="text" 
                          value={voucherNumber}
                          onChange={e=>setVoucherNumber(e.target.value)}
                          placeholder="PK-OTC-99120"
                          className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Collection City / Branch *</label>
                        <select 
                          value={collectorCity}
                          onChange={e=>setCollectorCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white cursor-pointer"
                        >
                          <option value="Islamabad">Islamabad Head Office</option>
                          <option value="Lahore">Lahore Regional Branch</option>
                          <option value="Karachi">Karachi Commercial Desk</option>
                          <option value="Faisalabad">Faisalabad Station</option>
                          <option value="Peshawar">Peshawar Office</option>
                          <option value="Quetta">Quetta Desk</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Receipt Upload Dropzone */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="font-display font-bold text-[#0f172a] dark:text-white text-xs block">
                    Upload Payment Voucher / Receipt Image (Optional)
                  </label>

                  <div className="border-2 border-dashed border-[#cbd5e1] dark:border-slate-700 hover:border-[#b45309] rounded-2xl p-6 text-center bg-[#f8fafc] dark:bg-black/20 hover:bg-[#fefce8]/40 transition-all relative cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="space-y-2 py-1">
                      <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-xl">file_upload</span>
                      </div>
                      <p className="font-display font-bold text-[#0f172a] dark:text-white text-xs">
                        {receiptFile ? receiptFile.name : 'Drag & drop transaction receipt image'}
                      </p>
                      <span className="px-4 py-1.5 rounded-xl bg-[#78350f] text-white font-display font-bold text-[11px] inline-block">
                        Choose File
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Payment Action Button */}
                <button 
                  onClick={handleProcessPayment}
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>{submitting ? 'Processing Payment...' : `Complete Payment of ${formatPrice(planPrices[selectedPlan] || 50000)}`}</span>
                </button>

              </div>

            </div>

          </div>

        </div>

      </main>
    </PageShell>
  );
}

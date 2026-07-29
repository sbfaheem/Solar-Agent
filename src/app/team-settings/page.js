'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import ProposalLimitModal from '../../components/ProposalLimitModal';
import { useApp } from '../../context/AppContext';

export default function TeamSettings() {
  const { company, user, updateCompanyLogo, bankDetails, recordPayment, lang, showToast, formatPrice, theme } = useApp();
  
  const [activeTab, setActiveTab] = useState('checkout'); // 'checkout' or 'team'
  const [selectedPlan, setSelectedPlan] = useState(company.plan || 'Gold');
  const [paymentChannel, setPaymentChannel] = useState('easypaisa');
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  // Field Team Members State
  const [teamMembers, setTeamMembers] = useState([
    { id: 'tm-1', name: 'Engr. Haris Khan', role: 'Lead Solar Engineer', email: 'haris@indussolar.pk', phone: '0301-8899120', city: 'Karachi', status: 'Active' },
    { id: 'tm-2', name: 'Zubair Ahmed', role: 'Field Site Surveyor', email: 'zubair@indussolar.pk', phone: '0300-4411928', city: 'Lahore', status: 'Active' },
    { id: 'tm-3', name: 'Usman Ali', role: 'Sales Partner', email: 'usman@indussolar.pk', phone: '0333-5511092', city: 'Islamabad', status: 'Active' },
    { id: 'tm-4', name: 'Tariq Mehmood', role: 'DISCO Liaison Officer', email: 'tariq@indussolar.pk', phone: '0312-9900112', city: 'Multan', status: 'Active' }
  ]);

  // New Team Member Form State
  const [newMemName, setNewMemName] = useState('');
  const [newMemEmail, setNewMemEmail] = useState('');
  const [newMemRole, setNewMemRole] = useState('Lead Solar Engineer');
  const [newMemPhone, setNewMemPhone] = useState('');
  const [newMemCity, setNewMemCity] = useState('Karachi');

  // Card Form State
  const [cardHolder, setCardHolder] = useState('Syed Bilal');
  const [cardNumber, setCardNumber] = useState('4214 9812 7741 0912');
  const [cardNetwork, setCardNetwork] = useState('PayPak');

  // Mobile Wallet State
  const [mobileNumber, setMobileNumber] = useState('0301-3377675');

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

  const handleAddTeamMember = (e) => {
    e.preventDefault();
    if (!newMemName || !newMemEmail) {
      showToast("Please enter member name and email", "error");
      return;
    }
    const created = {
      id: `tm-${Date.now()}`,
      name: newMemName,
      email: newMemEmail,
      role: newMemRole,
      phone: newMemPhone || '0300-0000000',
      city: newMemCity,
      status: 'Active'
    };
    setTeamMembers(prev => [...prev, created]);
    setNewMemName('');
    setNewMemEmail('');
    showToast(`⚡ Added ${newMemName} to Field Team!`);
  };

  const handleRemoveTeamMember = (id) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    showToast("Team member removed");
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
    <PageShell headerTitle="Distributor Subscription & Sales Engineers Team">
      <main className="max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8 animate-fadeIn text-[#0f172a] dark:text-[#f8fafc]">
        
        {/* Top Header Banner & Mode Switcher */}
        <div className="bg-[#fffbeb] dark:bg-amber-950/40 border border-[#fef3c7] dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm text-slate-800 dark:text-amber-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#fde047]/40 text-[#b45309] dark:text-amber-300 flex items-center justify-center flex-shrink-0 font-bold">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-sm sm:text-base">
                Distributor Workspace Management
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                Manage your subscription tier, logo profile photo, Meezan Bank transfers, and local sales field engineering team.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white dark:bg-black/40 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold font-display">
              <button 
                onClick={() => setActiveTab('checkout')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'checkout' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                💳 Multi-Channel Billing
              </button>
              <button 
                onClick={() => setActiveTab('team')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'team' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                👷 Field Sales Team ({teamMembers.length})
              </button>
            </div>

            <button 
              onClick={() => setLimitModalOpen(true)}
              className="px-3.5 py-2 bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">upgrade</span>
              <span>Upload Receipt</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MULTI-CHANNEL CHECKOUT & UPGRADE */}
        {activeTab === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Selected Package Summary & Profile Logo Card (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Profile Photo & Company Logo Upload Card */}
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-display font-extrabold text-base text-[#0f172a] dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#b45309]">photo_camera</span>
                    <span>Distributor Profile Photo & Logo</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Upload custom company logo to appear on top header & proposals</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-2xl bg-[#b45309] text-white flex items-center justify-center font-bold text-xl font-mono shadow-md overflow-hidden ring-4 ring-[#b45309]/20 flex-shrink-0">
                    {(company?.logo_url || user?.logo_url) ? (
                      <img src={company?.logo_url || user?.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(company.name || user?.name || 'DS').slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-display">{company.name || user?.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{user?.email || 'distributor@solaragent.pk'}</p>
                    
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold font-display cursor-pointer shadow-xs transition-all">
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      <span>Upload Logo Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target.result) updateCompanyLogo(evt.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Package Details & Quota Card */}
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
                        <div className="font-bold text-sm text-slate-900 dark:text-white font-display">{p.plan} Tier</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{p.desc}</div>
                      </div>
                      <span className="font-mono font-black text-[#b45309] text-sm">
                        {formatPrice(p.price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Meezan Bank Account Reference Box */}
                <div className="bg-slate-50 dark:bg-[#282a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-900 dark:text-white font-sans">Official Wire Details</span>
                    <button 
                      onClick={handleCopyIban}
                      className="px-2.5 py-1 rounded bg-[#b45309] text-white text-[10px] font-mono cursor-pointer"
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

            {/* Right Column: Checkout Desk (7 cols) */}
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
                    { id: 'jazzcash', name: 'JazzCash', icon: 'payments' },
                    { id: 'cards', name: 'Debit/Credit Card', icon: 'credit_card' },
                    { id: 'raast', name: 'Raast / SBP', icon: 'account_balance' },
                    { id: 'sadapay', name: 'SadaPay / NayaPay', icon: 'account_balance_wallet' },
                    { id: 'cash', name: 'Over-the-Counter Cash', icon: 'local_atm' }
                  ].map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => setPaymentChannel(ch.id)}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        paymentChannel === ch.id
                          ? 'border-[#b45309] bg-[#fefce8] dark:bg-amber-950/30 text-[#b45309] shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{ch.icon}</span>
                      <span className="text-[11px] font-extrabold">{ch.name}</span>
                    </button>
                  ))}
                </div>

                {/* Dynamic Inputs Based on Payment Channel */}
                <div className="space-y-4 pt-2">
                  
                  {paymentChannel === 'cards' && (
                    <div className="space-y-4 bg-slate-50 dark:bg-[#282a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold font-display text-slate-900 dark:text-white">PayPak / UnionPay / Visa / MasterCard</span>
                        <select 
                          value={cardNetwork} 
                          onChange={e => setCardNetwork(e.target.value)}
                          className="bg-white dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded p-1 font-bold text-xs"
                        >
                          <option value="PayPak">PayPak (Local PKR)</option>
                          <option value="UnionPay">UnionPay 1LINK</option>
                          <option value="Visa">Visa</option>
                          <option value="MasterCard">MasterCard</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">CARDHOLDER NAME</label>
                        <input 
                          type="text" 
                          value={cardHolder} 
                          onChange={e => setCardHolder(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">CARD NUMBER</label>
                        <input 
                          type="text" 
                          value={cardNumber} 
                          onChange={e => setCardNumber(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {(paymentChannel === 'easypaisa' || paymentChannel === 'jazzcash') && (
                    <div className="space-y-3 bg-slate-50 dark:bg-[#282a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
                      <span className="font-extrabold font-display text-slate-900 dark:text-white block">
                        {paymentChannel === 'easypaisa' ? 'Easypaisa Mobile Account' : 'JazzCash Wallet Direct'}
                      </span>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">ACCOUNT NUMBER (03XX-XXXXXXX)</label>
                        <input 
                          type="text" 
                          value={mobileNumber} 
                          onChange={e => setMobileNumber(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {paymentChannel === 'raast' && (
                    <div className="space-y-3 bg-slate-50 dark:bg-[#282a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
                      <span className="font-extrabold font-display text-slate-900 dark:text-white block">SBP Raast Instant Gateway</span>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">RAAST ID / IBAN</label>
                        <input 
                          type="text" 
                          value={raastId} 
                          onChange={e => setRaastId(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {paymentChannel === 'sadapay' && (
                    <div className="space-y-3 bg-slate-50 dark:bg-[#282a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
                      <span className="font-extrabold font-display text-slate-900 dark:text-white block">SadaPay / NayaPay Digital Handle</span>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">HANDLE / USERNAME</label>
                        <input 
                          type="text" 
                          value={digitalHandle} 
                          onChange={e => setDigitalHandle(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {paymentChannel === 'cash' && (
                    <div className="space-y-3 bg-slate-50 dark:bg-[#282a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
                      <span className="font-extrabold font-display text-slate-900 dark:text-white block">Over-the-Counter Cash Voucher Collection</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">VOUCHER #</label>
                          <input 
                            type="text" 
                            value={voucherNumber} 
                            onChange={e => setVoucherNumber(e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">COLLECTION CITY</label>
                          <input 
                            type="text" 
                            value={collectorCity} 
                            onChange={e => setCollectorCity(e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Confirm Payment Action */}
                <button 
                  onClick={handleProcessPayment}
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">payments</span>
                  <span>
                    {submitting 
                      ? 'Processing Payment...' 
                      : `Confirm & Record ${selectedPlan} Plan Payment (${formatPrice(planPrices[selectedPlan] || 55000)})`}
                  </span>
                </button>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: FIELD SALES TEAM ROSTER */}
        {activeTab === 'team' && (
          <div className="space-y-8">
            
            {/* Add Team Member Form */}
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="font-display font-extrabold text-base text-[#0f172a] dark:text-white">
                  Add Sales Engineer / Field Officer
                </h3>
                <p className="text-xs text-slate-500 font-medium">Grant local field team members access to customer proposals and calculations</p>
              </div>

              <form onSubmit={handleAddTeamMember} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">FULL NAME *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Engr. Bilal Khan" 
                    value={newMemName}
                    onChange={e => setNewMemName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">WORK EMAIL *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="bilal@indussolar.pk" 
                    value={newMemEmail}
                    onChange={e => setNewMemEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">ROLE</label>
                  <select 
                    value={newMemRole}
                    onChange={e => setNewMemRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-sans font-bold cursor-pointer"
                  >
                    <option value="Lead Solar Engineer">Lead Solar Engineer</option>
                    <option value="Field Site Surveyor">Field Site Surveyor</option>
                    <option value="Sales Partner">Sales Partner</option>
                    <option value="DISCO Liaison Officer">DISCO Liaison Officer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">CONTACT PHONE</label>
                  <input 
                    type="text" 
                    placeholder="0300-1234567" 
                    value={newMemPhone}
                    onChange={e => setNewMemPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-3 lg:col-span-1 flex items-end">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    <span>Add Member</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Team Roster Grid */}
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="font-display font-extrabold text-base text-[#0f172a] dark:text-white">
                  Active Field Team Roster ({teamMembers.length} Members)
                </h3>
                <span className="text-xs text-slate-500 font-mono">{company.name} Authorized Staff</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teamMembers.map(m => (
                  <div key={m.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="size-8 rounded-full bg-[#b45309]/20 text-[#b45309] dark:text-amber-300 font-extrabold font-mono text-xs flex items-center justify-center">
                          {m.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {m.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white pt-1">{m.name}</h4>
                      <p className="text-xs text-[#b45309] font-semibold font-mono">{m.role}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{m.email}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{m.phone} | {m.city}</p>
                    </div>

                    <button 
                      onClick={() => handleRemoveTeamMember(m.id)}
                      className="w-full py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-[10px] font-bold transition-all cursor-pointer text-center"
                    >
                      Remove Access
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Upgrade Proposal Quota Modal */}
      <ProposalLimitModal 
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
      />
    </PageShell>
  );
}

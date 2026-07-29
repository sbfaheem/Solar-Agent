'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import ProposalLimitModal from '../../components/ProposalLimitModal';
import { useApp } from '../../context/AppContext';

export default function TeamSettings() {
  const { company, bankDetails, recordPayment, lang, showToast, formatPrice, theme } = useApp();
  
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
                Manage your subscription tier, Meezan Bank transfers, and local sales field engineering team.
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

                {/* Dynamic Inputs */}
                <div className="bg-slate-50 dark:bg-black/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  {(paymentChannel === 'easypaisa' || paymentChannel === 'jazzcash') && (
                    <div className="space-y-3 font-mono text-xs">
                      <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-sans uppercase">
                        {paymentChannel === 'easypaisa' ? 'Easypaisa Mobile Account' : 'JazzCash Wallet'}
                      </div>
                      <div className="space-y-1 font-sans">
                        <label className="text-xs font-bold text-slate-500">Account Mobile Number</label>
                        <input type="text" value={mobileNumber} onChange={e=>setMobileNumber(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-mono text-xs font-bold" />
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
                </div>

                <button
                  onClick={handleProcessPayment}
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Process {formatPrice(planPrices[selectedPlan] || 55000)} Payment for {selectedPlan} Plan</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SALES ENGINEERS & FIELD TEAM MANAGEMENT */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Add Team Member Form (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                <span className="size-8 rounded-lg bg-[#b45309] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-base">person_add</span>
                </span>
                <h3 className="font-display font-bold text-[#0f172a] dark:text-white text-base">Add Field Team Member</h3>
              </div>

              <form onSubmit={handleAddTeamMember} className="space-y-3 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Engr. Bilal Faheem"
                    value={newMemName}
                    onChange={e => setNewMemName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="bilal@indussolar.pk"
                    value={newMemEmail}
                    onChange={e => setNewMemEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Assigned Role</label>
                    <select 
                      value={newMemRole}
                      onChange={e => setNewMemRole(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white cursor-pointer font-sans"
                    >
                      <option value="Lead Solar Engineer">Lead Solar Engineer</option>
                      <option value="Field Site Surveyor">Field Site Surveyor</option>
                      <option value="Sales Partner">Sales Partner</option>
                      <option value="DISCO Liaison Officer">DISCO Liaison Officer</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Base City</label>
                    <input 
                      type="text" 
                      placeholder="Karachi / Lahore"
                      value={newMemCity}
                      onChange={e => setNewMemCity(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span className="material-symbols-outlined text-sm">group_add</span>
                  <span>Register Field Officer</span>
                </button>
              </form>
            </div>

            {/* Right Column: Active Field Team Members List (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm space-y-4">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-display font-bold text-[#0f172a] dark:text-white text-base">Active Field Team Roster</h3>
                <span className="text-xs font-mono font-bold text-[#b45309] bg-amber-100 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg">
                  {teamMembers.length} Active Officers
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-black/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                      <th className="px-6 py-3.5">MEMBER NAME</th>
                      <th className="px-6 py-3.5">ASSIGNED ROLE</th>
                      <th className="px-6 py-3.5">CITY</th>
                      <th className="px-6 py-3.5 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {teamMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-black/20">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{m.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{m.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                            {m.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {m.city}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleRemoveTeamMember(m.id)}
                            className="size-7 rounded bg-red-50 hover:bg-red-500 hover:text-white text-red-600 flex items-center justify-center ml-auto cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      <ProposalLimitModal 
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
      />
    </PageShell>
  );
}

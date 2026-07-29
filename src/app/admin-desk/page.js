'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';

export default function AdminDesk() {
  const { 
    company, 
    bankDetails,
    updateBankDetails,
    pendingUpgradeRequests,
    approveUpgradeRequestAndAutoUpgrade,
    overrideRequests, 
    approveOverride, 
    clearPendingSubscription, 
    transactions,
    recordPayment,
    lang,
    showToast,
    inverters,
    solarPanels,
    addInverter,
    removeInverter,
    addSolarPanel,
    removeSolarPanel,
    formatPrice
  } = useApp();

  const [activeTab, setActiveTab] = useState('verification'); // 'verification', 'ledger', 'overview', 'bank', 'override', 'catalog'
  const [channelFilter, setChannelFilter] = useState('All');

  // Record Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [newPayComp, setNewPayComp] = useState('Indus Solar Solutions');
  const [newPayPlan, setNewPayPlan] = useState('Gold');
  const [newPayChannel, setNewPayChannel] = useState('Easypaisa');
  const [newPayAmount, setNewPayAmount] = useState(55000);
  const [newPayRef, setNewPayRef] = useState(`REF-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [newPayId, setNewPayId] = useState('0301-3377675');

  // Receipt Zoom Modal State
  const [zoomReceipt, setZoomReceipt] = useState(null);

  // Bank Form State
  const [bankForm, setBankForm] = useState({
    bankName: bankDetails.bankName,
    accountTitle: bankDetails.accountTitle,
    iban: bankDetails.iban,
    accountNumber: bankDetails.accountNumber
  });

  // Form states for new Inverter
  const [invBrand, setInvBrand] = useState('');
  const [invModel, setInvModel] = useState('');
  const [invCapacity, setInvCapacity] = useState(10);
  const [invType, setInvType] = useState('Hybrid');
  const [invPrice, setInvPrice] = useState(180000);

  // Form states for new Panel
  const [panelMfg, setPanelMfg] = useState('');
  const [panelModel, setPanelModel] = useState('');
  const [panelWattage, setPanelWattage] = useState(580);
  const [panelPriceWatt, setPanelPriceWatt] = useState(40);
  const [panelCell, setPanelCell] = useState('N-Type TOPCon');

  // Mock companies list
  const mockCompanies = [
    { id: 1, initials: 'IS', name: 'Indus Solar Solutions', tier: 'Platinum', used: 450, limit: 500, pct: 90, status: 'Verified' },
    { id: 2, initials: 'PE', name: 'Punjab Energy Systems', tier: 'Gold', used: 120, limit: 250, pct: 48, status: 'Pending Verification' },
    { id: 3, initials: 'KV', name: 'KPK Volt Tech', tier: 'Silver', used: 35, limit: 35, pct: 100, status: 'Limit Reached' },
    { id: 4, initials: 'SK', name: 'Sindh Kar Solar', tier: 'Gold', used: 210, limit: 250, pct: 84, status: 'Verified' }
  ];

  const calculateChannelTotal = (chName) => {
    return transactions
      .filter(t => chName === 'All' || t.channel.toLowerCase().includes(chName.toLowerCase()))
      .reduce((sum, t) => sum + (t.amount_pkr || 0), 0);
  };

  const filteredTransactions = transactions.filter(t => {
    if (channelFilter === 'All') return true;
    return t.channel.toLowerCase().includes(channelFilter.toLowerCase());
  });

  const handleCreatePaymentRecord = async (e) => {
    e.preventDefault();
    const res = await recordPayment({
      company_name: newPayComp,
      plan: newPayPlan,
      channel: newPayChannel,
      account_identifier: newPayId,
      reference_id: newPayRef,
      amount_pkr: Number(newPayAmount),
      collector_agent: "Super Admin Desk"
    });
    if (res) {
      setPaymentModalOpen(false);
    }
  };

  const handleSaveBankForm = (e) => {
    e.preventDefault();
    updateBankDetails(bankForm);
  };

  const handleAddInverterSubmit = async (e) => {
    e.preventDefault();
    if (!invBrand || !invModel) return;
    await addInverter({
      brand_name: invBrand,
      model_name: invModel,
      capacity_kw: Number(invCapacity),
      type: invType,
      estimated_base_price_pkr: Number(invPrice)
    });
    setInvBrand('');
    setInvModel('');
  };

  const handleAddPanelSubmit = async (e) => {
    e.preventDefault();
    if (!panelMfg || !panelModel) return;
    await addSolarPanel({
      manufacturer_name: panelMfg,
      model_name: panelModel,
      default_wattage: Number(panelWattage),
      price_per_watt_pkr: Number(panelPriceWatt),
      cell_type: panelCell
    });
    setPanelMfg('');
    setPanelModel('');
  };

  return (
    <PageShell headerTitle="Super Admin Verification & CMS Desk">
      <main className="max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8 animate-fadeIn text-[#0f172a] dark:text-[#f8fafc]">
        
        {/* Top Header Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPaymentModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add_card</span>
              <span>+ Record Installer Payment</span>
            </button>
          </div>

          {/* Main Tab Selector */}
          <div className="flex flex-wrap bg-slate-100 dark:bg-[#282a2d] p-1 rounded-xl gap-1 text-xs font-bold font-display border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setActiveTab('verification')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'verification' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[#0f172a]'
              }`}
            >
              ⚡ Verification Desk ({pendingUpgradeRequests.length})
            </button>
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'ledger' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[#0f172a]'
              }`}
            >
              🇵🇰 Payment Ledger ({transactions.length})
            </button>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'overview' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[#0f172a]'
              }`}
            >
              Registered Companies
            </button>
            <button 
              onClick={() => setActiveTab('bank')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'bank' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[#0f172a]'
              }`}
            >
              🏦 Bank Details CMS
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'catalog' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[#0f172a]'
              }`}
            >
              Hardware CMS
            </button>
          </div>
        </div>

        {/* 1. DISTRIBUTOR PLAN UPGRADE & PAYMENT VERIFICATION DESK */}
        {activeTab === 'verification' && (
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm space-y-4">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-amber-500/5">
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-lg bg-[#b45309] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-base">verified</span>
                </span>
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">Pending Payment Receipts & Plan Upgrades</h3>
                  <p className="text-xs text-slate-500 font-medium">Verify bank receipts, auto-upgrade distributor plans, and expand proposal quotas</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 rounded-lg">
                {pendingUpgradeRequests.length} Pending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-black/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-3.5">DISTRIBUTOR COMPANY</th>
                    <th className="px-6 py-3.5">UPGRADE TARGET</th>
                    <th className="px-6 py-3.5">AMOUNT (PKR)</th>
                    <th className="px-6 py-3.5">TRANSACTION REF</th>
                    <th className="px-6 py-3.5">RECEIPT PROOF</th>
                    <th className="px-6 py-3.5 text-right">AUTO-UPGRADE ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingUpgradeRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-medium">
                        No pending distributor plan upgrade verification requests right now.
                      </td>
                    </tr>
                  ) : (
                    pendingUpgradeRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-black/20">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{req.company_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{req.contact_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                            req.target_plan === 'Platinum' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.current_plan} ➔ {req.target_plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                          {formatPrice(req.amount_pkr)}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {req.reference_id}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            type="button"
                            onClick={() => setZoomReceipt(req.receipt_preview)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm text-[#b45309]">zoom_in</span>
                            <span>View Receipt Screenshot</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => approveUpgradeRequestAndAutoUpgrade(req.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span>Accept & Auto-Upgrade Company</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. PAKISTANI PAYMENT LEDGER VIEW */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            
            {/* Bento Bar Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span>📱 Easypaisa</span>
                </div>
                <div className="font-display font-extrabold text-base text-[#0f172a] dark:text-white">
                  {formatPrice(calculateChannelTotal('Easypaisa'))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 dark:text-red-400">
                  <span>📱 JazzCash</span>
                </div>
                <div className="font-display font-extrabold text-base text-[#0f172a] dark:text-white">
                  {formatPrice(calculateChannelTotal('JazzCash'))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-400">
                  <span>💳 Cards</span>
                </div>
                <div className="font-display font-extrabold text-base text-[#0f172a] dark:text-white">
                  {formatPrice(calculateChannelTotal('Cards'))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  <span>⚡ SBP Raast</span>
                </div>
                <div className="font-display font-extrabold text-base text-[#0f172a] dark:text-white">
                  {formatPrice(calculateChannelTotal('Raast'))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-700 dark:text-teal-400">
                  <span>📲 SadaPay / NayaPay</span>
                </div>
                <div className="font-display font-extrabold text-base text-[#0f172a] dark:text-white">
                  {formatPrice(calculateChannelTotal('SadaPay'))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span>💵 Cash OTC</span>
                </div>
                <div className="font-display font-extrabold text-base text-[#0f172a] dark:text-white">
                  {formatPrice(calculateChannelTotal('Cash'))}
                </div>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2 font-display font-extrabold text-[#0f172a] dark:text-white text-xs">
                <span className="material-symbols-outlined text-[#b45309]">filter_alt</span>
                <span>Filter Channel:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                {['All', 'Easypaisa', 'JazzCash', 'Cards', 'Raast', 'SadaPay', 'Cash'].map(ch => (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                      channelFilter === ch
                        ? 'bg-[#b45309] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {ch === 'All' ? 'All Channels' : ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Transaction Ledger Table */}
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">Transaction History Ledger</h3>
                <span className="text-xs font-mono font-bold text-slate-400">Showing {filteredTransactions.length} records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-black/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                      <th className="px-6 py-3.5">TXN ID</th>
                      <th className="px-6 py-3.5">COMPANY NAME</th>
                      <th className="px-6 py-3.5">PAYMENT CHANNEL</th>
                      <th className="px-6 py-3.5">ACCOUNT / IDENTIFIER</th>
                      <th className="px-6 py-3.5">REFERENCE ID</th>
                      <th className="px-6 py-3.5">AMOUNT (PKR)</th>
                      <th className="px-6 py-3.5">TIMESTAMP</th>
                      <th className="px-6 py-3.5 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-black/20">
                        <td className="px-6 py-4 font-bold text-[#b45309]">{txn.id}</td>
                        <td className="px-6 py-4 font-bold font-sans text-slate-900 dark:text-white">{txn.company_name}</td>
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{txn.channel}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{txn.account_identifier}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{txn.reference_id}</td>
                        <td className="px-6 py-4 font-extrabold text-emerald-700 dark:text-emerald-400">{formatPrice(txn.amount_pkr)}</td>
                        <td className="px-6 py-4 text-slate-400 text-[11px]">{txn.date}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 3. REGISTERED COMPANIES OVERVIEW VIEW */}
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm space-y-4">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Distributor Partner Companies</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#eff4ff] dark:bg-black/40 border-b border-slate-200 dark:border-slate-800 text-[#475569] dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-3.5">COMPANY</th>
                    <th className="px-6 py-3.5">TIER PLAN</th>
                    <th className="px-6 py-3.5">PROPOSALS GENERATED</th>
                    <th className="px-6 py-3.5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockCompanies.map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <span className="size-8 rounded-lg bg-[#b45309] text-white flex items-center justify-center font-bold text-xs font-mono">
                          {comp.initials}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{comp.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                          comp.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {comp.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {comp.used} / {comp.limit} ({comp.pct}%)
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#dcfce7] text-[#15803d]">
                          {comp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. EDITABLE BANK DETAILS CMS VIEW */}
        {activeTab === 'bank' && (
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-6 shadow-sm max-w-2xl">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-3">
              <span className="size-9 rounded-xl bg-[#b45309] text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-lg">account_balance</span>
              </span>
              <div>
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">Edit Official Bank Wire Details</h3>
                <p className="text-xs text-slate-500">Update bank account details displayed to distributors during payment upload</p>
              </div>
            </div>

            <form onSubmit={handleSaveBankForm} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">Bank Name</label>
                <input 
                  type="text"
                  value={bankForm.bankName}
                  onChange={e => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#b45309]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">Account Title</label>
                <input 
                  type="text"
                  value={bankForm.accountTitle}
                  onChange={e => setBankForm(prev => ({ ...prev, accountTitle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#b45309]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">Account Number</label>
                <input 
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={e => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#b45309]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">IBAN Number</label>
                <input 
                  type="text"
                  value={bankForm.iban}
                  onChange={e => setBankForm(prev => ({ ...prev, iban: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:border-[#b45309]"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>Save Bank Wire Details to CMS</span>
              </button>
            </form>
          </div>
        )}

        {/* 5. HARDWARE CATALOG CMS VIEW */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-6 bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base border-b pb-3">Inverters Catalog CMS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-black/30 border-b text-slate-500 font-bold uppercase text-[9px]">
                      <th className="p-2.5">Brand / Model</th>
                      <th className="p-2.5">Capacity</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {inverters.map(inv => (
                      <tr key={inv.id}>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900 dark:text-white">{inv.brand_name || inv.brand}</div>
                          <div className="text-[10px] text-slate-500">{inv.model_name || inv.model}</div>
                        </td>
                        <td className="p-2.5 font-mono">{inv.capacity_kw}kW ({inv.type})</td>
                        <td className="p-2.5 font-mono font-bold text-[#b45309]">{formatPrice(inv.estimated_base_price_pkr || inv.cost_pkr)}</td>
                        <td className="p-2.5 text-right">
                          <button 
                            onClick={() => removeInverter(inv.id)}
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

            <div className="xl:col-span-6 bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base border-b pb-3">Solar Panels Catalog CMS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-black/30 border-b text-slate-500 font-bold uppercase text-[9px]">
                      <th className="p-2.5">Manufacturer</th>
                      <th className="p-2.5">Wattage</th>
                      <th className="p-2.5">Price/W</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {solarPanels.map(panel => (
                      <tr key={panel.id}>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900 dark:text-white">{panel.manufacturer_name || panel.mfg}</div>
                          <div className="text-[10px] text-slate-500">{panel.model_name || panel.model}</div>
                        </td>
                        <td className="p-2.5 font-mono">{panel.default_wattage || panel.wattage}W</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">{panel.price_per_watt_pkr || panel.cost_per_watt} PKR/W</td>
                        <td className="p-2.5 text-right">
                          <button 
                            onClick={() => removeSolarPanel(panel.id)}
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

      {/* RECEIPT ZOOM HIGH-RES MODAL */}
      {zoomReceipt && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-white dark:bg-[#181a1d] rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">Bank Transfer Receipt Screenshot Preview</h4>
              <button 
                onClick={() => setZoomReceipt(null)}
                className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <img src={zoomReceipt} alt="Receipt High Res" className="max-h-[75vh] mx-auto rounded-xl shadow-md object-contain" />
          </div>
        </div>
      )}

    </PageShell>
  );
}

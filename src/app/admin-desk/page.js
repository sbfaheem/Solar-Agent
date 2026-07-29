'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';

export default function AdminDesk() {
  const { 
    company, 
    distributors,
    approveDistributorRegistration,
    adminLogs,
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

  const [activeTab, setActiveTab] = useState('verification'); // 'verification', 'distributors', 'ledger', 'bank', 'catalog'
  const [channelFilter, setChannelFilter] = useState('All');

  // Record Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [newPayComp, setNewPayComp] = useState('Indus Solar Systems');
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

  const pendingDistributorsCount = distributors.filter(d => d.status === 'Pending Verification' || d.status === 'Pending').length;

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

  const handleBankSubmit = (e) => {
    e.preventDefault();
    updateBankDetails(bankForm);
  };

  const handleAddInverterSubmit = async (e) => {
    e.preventDefault();
    if (!invBrand || !invModel) return;
    await addInverter({
      brand_name: invBrand,
      model_name: invModel,
      rated_kw: Number(invCapacity),
      type: invType,
      estimated_price_pkr: Number(invPrice)
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
    <PageShell headerTitle="Super Admin Verification & Governance Desk">
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
              onClick={() => setActiveTab('distributors')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'distributors' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[#0f172a]'
              }`}
            >
              🏢 Distributor Approvals ({pendingDistributorsCount})
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

        {/* SYSTEM NOTIFICATIONS LOG BANNER */}
        {adminLogs && adminLogs.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-2 text-xs text-amber-900 dark:text-amber-200">
            <div className="font-bold flex items-center gap-2 font-display uppercase tracking-wider text-amber-950 dark:text-amber-100">
              <span className="material-symbols-outlined text-base">notifications</span>
              <span>Super Admin Automated Notification & System Log Dispatch</span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              {adminLogs.slice(0, 3).map((log, idx) => (
                <div key={idx} className="bg-white/80 dark:bg-black/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900/60 font-bold truncate">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1. DISTRIBUTOR PLAN UPGRADE VERIFICATION DESK */}
        {activeTab === 'verification' && (
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm space-y-4">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-amber-500/5">
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-lg bg-[#b45309] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-base">verified</span>
                </span>
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">Pending Payment Receipts & Tier Upgrades</h3>
                  <p className="text-xs text-slate-500 font-medium">Verify bank receipts, auto-upgrade distributor plans, and trigger automated approval emails</p>
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
                            <span className="material-symbols-outlined text-sm">mark_email_read</span>
                            <span>Accept & Dispatch Approval Email</span>
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

        {/* 2. DISTRIBUTOR APPROVALS & REGISTRATION DESK */}
        {activeTab === 'distributors' && (
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm space-y-4">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">Registered Distributor Accounts & Pending Requests</h3>
                <p className="text-xs text-slate-500 font-medium">Accept pending registrations, verify payment deposits, and send confirmation emails</p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 rounded-lg">
                {distributors.length} Total Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-black/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-3.5">DISTRIBUTOR FIRM</th>
                    <th className="px-6 py-3.5">WORK EMAIL</th>
                    <th className="px-6 py-3.5">TIER PLAN</th>
                    <th className="px-6 py-3.5">LOCATION</th>
                    <th className="px-6 py-3.5">STATUS</th>
                    <th className="px-6 py-3.5 text-right">SUPER ADMIN APPROVAL ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {distributors.map((d) => {
                    const isPending = d.status === 'Pending Verification' || d.status === 'Pending';
                    return (
                      <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-black/20">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <span className="size-9 rounded-xl bg-[#b45309] text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                            {d.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{d.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{d.contact || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {d.email}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                            {d.plan} Plan ({d.limit} Quotes/mo)
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                          {d.city || 'Peshawar'}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isPending ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 animate-pulse' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPending ? (
                            <button 
                              onClick={() => approveDistributorRegistration(d.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                            >
                              <span className="material-symbols-outlined text-sm">mark_email_read</span>
                              <span>Accept & Dispatch Approval Email</span>
                            </button>
                          ) : (
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>Account Verified & Active</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. PAKISTANI PAYMENT LEDGER VIEW */}
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

        {/* 4. BANK WIRE DETAILS CMS */}
        {activeTab === 'bank' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">Meezan Bank Direct Wire Account CMS</h3>
              <p className="text-xs text-slate-500 font-medium">Update official bank transfer details displayed across distributor payment modals</p>
            </div>

            <form onSubmit={handleBankSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Bank Name</label>
                <input 
                  type="text" 
                  value={bankForm.bankName} 
                  onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Account Title</label>
                <input 
                  type="text" 
                  value={bankForm.accountTitle} 
                  onChange={e => setBankForm({ ...bankForm, accountTitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Account Number</label>
                  <input 
                    type="text" 
                    value={bankForm.accountNumber} 
                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">IBAN Number</label>
                  <input 
                    type="text" 
                    value={bankForm.iban} 
                    onChange={e => setBankForm({ ...bankForm, iban: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>Save Bank Account Details in CMS</span>
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Receipt Screenshot Zoom Modal */}
      {zoomReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#181a1d] border border-[#2d3137] rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-white text-sm">Payment Receipt Transfer Screenshot</h3>
              <button 
                onClick={() => setZoomReceipt(null)}
                className="size-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-700 max-h-96">
              <img src={zoomReceipt} alt="Bank Deposit Receipt" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => setZoomReceipt(null)}
              className="w-full py-2.5 bg-[#b45309] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close Receipt Zoom
            </button>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">Record Installer Offline Payment</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePaymentRecord} className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 font-sans uppercase">Installer Company Name</label>
                <input type="text" value={newPayComp} onChange={e=>setNewPayComp(e.target.value)} required className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border rounded-xl font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 font-sans uppercase">Selected Plan</label>
                  <select value={newPayPlan} onChange={e=>setNewPayPlan(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border rounded-xl font-bold font-sans">
                    <option value="Silver">Silver Plan</option>
                    <option value="Gold">Gold Tier</option>
                    <option value="Platinum">Platinum Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 font-sans uppercase">Payment Channel</label>
                  <select value={newPayChannel} onChange={e=>setNewPayChannel(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border rounded-xl font-bold font-sans">
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Cards (PayPak)">Cards (PayPak)</option>
                    <option value="SBP Raast">SBP Raast</option>
                    <option value="Sadapay/Nayapay">SadaPay / NayaPay</option>
                    <option value="Cash Voucher">OTC Cash</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 font-sans uppercase">Amount (PKR)</label>
                  <input type="number" value={newPayAmount} onChange={e=>setNewPayAmount(e.target.value)} required className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border rounded-xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 font-sans uppercase">Reference ID</label>
                  <input type="text" value={newPayRef} onChange={e=>setNewPayRef(e.target.value)} required className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border rounded-xl font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2">
                Record Payment Entry
              </button>
            </form>
          </div>
        </div>
      )}

    </PageShell>
  );
}

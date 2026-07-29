'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';

export default function AdminDesk() {
  const { 
    company, 
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

  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger', 'overview', 'clearance', 'override', 'catalog'
  const [channelFilter, setChannelFilter] = useState('All'); // 'All', 'Easypaisa', 'JazzCash', 'Cards', 'Raast', 'Cash', 'SadaPay'

  // Record Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [newPayComp, setNewPayComp] = useState('Indus Solar Solutions');
  const [newPayPlan, setNewPayPlan] = useState('Gold');
  const [newPayChannel, setNewPayChannel] = useState('Easypaisa');
  const [newPayAmount, setNewPayAmount] = useState(50000);
  const [newPayRef, setNewPayRef] = useState(`REF-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [newPayId, setNewPayId] = useState('0301-3377675');

  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlip, setActiveSlip] = useState(null);

  // Form states for new Inverter
  const [invBrand, setInvBrand] = useState('');
  const [invModel, setInvModel] = useState('');
  const [invCapacity, setInvCapacity] = useState(10);
  const [invType, setInvType] = useState('Hybrid');
  const [invPrice, setInvPrice] = useState(180000);

  // Form states for new Panel
  const [panelMfg, setPanelMfg] = useState('');
  const [panelModel, setPanelModel] = useState('');
  const [panelWattage, setPanelWattage] = useState(550);
  const [panelPriceWatt, setPanelPriceWatt] = useState(38);
  const [panelCell, setPanelCell] = useState('Monocrystalline');

  // Mock companies list matching Screenshot 2
  const mockCompanies = [
    { id: 1, initials: 'IS', name: 'Indus Solar Solutions', tier: 'Platinum', used: 450, limit: 500, pct: 98, status: 'Verified' },
    { id: 2, initials: 'PE', name: 'Punjab Energy Systems', tier: 'Gold', used: 120, limit: 250, pct: 48, status: 'Pending' },
    { id: 3, initials: 'KV', name: 'KPK Volt Tech', tier: 'Silver', used: 15, limit: 100, pct: 15, status: 'Verified' },
    { id: 4, initials: 'SK', name: 'Sindh Kar Solar', tier: 'Gold', used: 210, limit: 250, pct: 84, status: 'Pending' }
  ];

  // Bento Channel Revenue Calculations
  const calculateChannelTotal = (chName) => {
    return transactions
      .filter(t => chName === 'All' || t.channel.toLowerCase().includes(chName.toLowerCase()))
      .reduce((sum, t) => sum + (t.amount_pkr || 0), 0);
  };

  const totalCollectedRevenue = transactions.reduce((sum, t) => sum + (t.amount_pkr || 0), 0);

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

  const handleApprovePayment = async () => {
    const ok = await clearPendingSubscription();
    if (ok) {
      setModalOpen(false);
    }
  };

  const openSlipModal = (slipName) => {
    setActiveSlip(slipName);
    setModalOpen(true);
  };

  const handleAddInverterSubmit = async (e) => {
    e.preventDefault();
    if (!invBrand || !invModel) {
      showToast("⚠️ Brand and Model fields are required", "error");
      return;
    }
    const inv = {
      brand: invBrand,
      model: invModel,
      capacity_kw: Number(invCapacity),
      type: invType,
      cost_pkr: Number(invPrice)
    };
    const res = await addInverter(inv);
    if (res) {
      setInvBrand('');
      setInvModel('');
    }
  };

  const handleAddPanelSubmit = async (e) => {
    e.preventDefault();
    if (!panelMfg || !panelModel) {
      showToast("⚠️ Manufacturer and Model fields are required", "error");
      return;
    }
    const panel = {
      mfg: panelMfg,
      model: panelModel,
      wattage: Number(panelWattage),
      cost_per_watt: Number(panelPriceWatt),
      cell_type: panelCell
    };
    const res = await addSolarPanel(panel);
    if (res) {
      setPanelMfg('');
      setPanelModel('');
    }
  };

  return (
    <PageShell headerTitle="Super Admin Overview & Payment Desk">
      <main className="max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8 animate-fadeIn text-[#0f172a] dark:text-[#f8fafc]">
        
        {/* Top Summary Stat Cards matching Screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stat Card 1: Registered Companies */}
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Registered Companies</span>
              <div className="font-display font-extrabold text-3xl text-[#0f172a] dark:text-white">1,248</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+12% vs last month</span>
              </div>
            </div>
            <div className="size-12 rounded-2xl bg-[#fef3c7] dark:bg-amber-950/40 text-[#b45309] dark:text-amber-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">domain</span>
            </div>
          </div>

          {/* Stat Card 2: Total Monthly Revenue */}
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Collected Revenue</span>
              <div className="font-display font-extrabold text-3xl text-[#0f172a] dark:text-white">{formatPrice(totalCollectedRevenue)}</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+8.2% via Pakistani Channels</span>
              </div>
            </div>
            <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
          </div>

          {/* Stat Card 3: Pending Verifications */}
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Pending Verifications</span>
              <div className="font-display font-extrabold text-3xl text-[#0f172a] dark:text-white">42</div>
              <div className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">priority_high</span>
                <span>Requires attention</span>
              </div>
            </div>
            <div className="size-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
          </div>

        </div>

        {/* Action Bar & Main Navigation Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPaymentModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add_card</span>
              <span>+ Record Installer Payment</span>
            </button>

            <button 
              onClick={() => setActiveTab('clearance')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-display font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">assignment</span>
              <span>Manual Clearance Desk</span>
            </button>
          </div>

          {/* Main Tab Selector */}
          <div className="flex bg-slate-100 dark:bg-[#282a2d] p-1 rounded-xl gap-1 text-xs font-bold font-display border border-slate-200 dark:border-slate-700">
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
              onClick={() => setActiveTab('clearance')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'clearance' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[#0f172a]'
              }`}
            >
              Clearance ({company.billing_status === 'Pending Verification' ? 1 : 0})
            </button>
            <button 
              onClick={() => setActiveTab('override')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'override' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[#0f172a]'
              }`}
            >
              Quota Requests ({overrideRequests.filter(r => r.status === 'Pending').length})
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'catalog' ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[#0f172a]'
              }`}
            >
              Hardware Catalog CMS
            </button>
          </div>
        </div>

        {/* 1. PAKISTANI PAYMENT LEDGER & BENTO ANALYTICS VIEW */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            
            {/* Bento Bar Breakdown: Revenue Collected per Payment Channel */}
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
                  <span>💳 Cards (PayPak)</span>
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
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">Pakistani Transaction Ledger History</h3>
                <span className="text-xs font-mono font-bold text-slate-500">Showing {filteredTransactions.length} records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#eff4ff] dark:bg-black/40 border-b border-slate-200 dark:border-slate-800 text-[#475569] dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                      <th className="px-6 py-3.5">TXN ID</th>
                      <th className="px-6 py-3.5">INSTALLER COMPANY</th>
                      <th className="px-6 py-3.5">PAYMENT CHANNEL</th>
                      <th className="px-6 py-3.5">ACCOUNT IDENTIFIER</th>
                      <th className="px-6 py-3.5">REFERENCE / TXN REF</th>
                      <th className="px-6 py-3.5">AMOUNT</th>
                      <th className="px-6 py-3.5">STATUS</th>
                      <th className="px-6 py-3.5 text-right">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{t.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">{t.company_name}</div>
                          <div className="text-[10px] font-bold text-[#b45309]">{t.plan} Plan</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-[#b45309] border border-amber-200">
                            {t.channel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">{t.account_identifier}</td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900 dark:text-slate-200">{t.reference_id}</td>
                        <td className="px-6 py-4 font-mono font-extrabold text-[#b45309] text-sm">{formatPrice(t.amount_pkr)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            ✓ {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-500">{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 2. REGISTERED COMPANIES TABLE VIEW */}
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm space-y-4">
            
            <div className="p-6 pb-2 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Registered Installer Companies</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] dark:bg-black/40 border-b border-slate-200 dark:border-slate-800 text-[#475569] dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-3.5">COMPANY NAME</th>
                    <th className="px-6 py-3.5">CURRENT TIER</th>
                    <th className="px-6 py-3.5">PROPOSALS USED/LIMIT</th>
                    <th className="px-6 py-3.5">SUBSCRIPTION STATUS</th>
                    <th className="px-6 py-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {mockCompanies.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-[#dbeafe] text-[#1e40af] flex items-center justify-center font-mono font-bold text-xs">
                            {c.initials}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde047]">
                          {c.tier}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 max-w-xs">
                          <div className="flex justify-between font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300">
                            <span>{c.used} / {c.limit}</span>
                            <span>{c.pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#b45309] rounded-full" style={{ width: `${c.pct}%` }}></div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#15803d]">
                          <span>● Verified</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button className="size-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center ml-auto cursor-pointer">
                          <span className="material-symbols-outlined text-base">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 3. MANUAL CLEARANCE DESK VIEW */}
        {activeTab === 'clearance' && (
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm space-y-4">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Pending Offline Receipts Verification</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#eff4ff] dark:bg-black/40 border-b border-slate-200 dark:border-slate-800 text-[#475569] dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-3.5">COMPANY NAME</th>
                    <th className="px-6 py-3.5">TARGET TIER</th>
                    <th className="px-6 py-3.5">SLIP ATTACHMENT</th>
                    <th className="px-6 py-3.5">AMOUNT PAYABLE</th>
                    <th className="px-6 py-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {company.billing_status !== "Pending Verification" ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                        No pending offline payment receipts requiring manual clearance.
                      </td>
                    </tr>
                  ) : (
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{company.name}</td>
                      <td className="px-6 py-4 font-bold text-[#b45309]">{company.plan} Plan</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => openSlipModal(company.receipt_uploaded)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm text-[#b45309]">receipt_long</span>
                          <span>{company.receipt_uploaded}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        {formatPrice(company.plan === "Silver" ? 30000 : company.plan === "Gold" ? 50000 : 75000)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={handleApprovePayment}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs shadow-sm cursor-pointer"
                        >
                          Verify & Activate Quota
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. OVERRIDE QUOTA REQUESTS VIEW */}
        {activeTab === 'override' && (
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm space-y-4">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Actionable Quota Override Requests</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#eff4ff] dark:bg-black/40 border-b border-slate-200 dark:border-slate-800 text-[#475569] dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-3.5">COMPANY NAME</th>
                    <th className="px-6 py-3.5">CURRENT USAGE</th>
                    <th className="px-6 py-3.5">ACTIVE LIMIT</th>
                    <th className="px-6 py-3.5">STATUS</th>
                    <th className="px-6 py-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {overrideRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                        No active quota override extension requests submitted.
                      </td>
                    </tr>
                  ) : (
                    overrideRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{req.company_name}</td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{req.current_usage} Proposals</td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{req.current_limit} limit</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            req.status === 'Approved' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fef9c3] text-[#854d0e]'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {req.status === 'Pending' ? (
                            <button 
                              onClick={() => approveOverride(req.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs cursor-pointer"
                            >
                              Approve Quota +10
                            </button>
                          ) : (
                            <span className="font-mono text-emerald-600 font-bold">Quota Added ✓</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. HARDWARE CATALOG CMS VIEW */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Inverters (6 cols) */}
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
                          <div className="font-bold text-slate-900 dark:text-white">{inv.brand}</div>
                          <div className="text-[10px] text-slate-500">{inv.model}</div>
                        </td>
                        <td className="p-2.5 font-mono">{inv.capacity_kw}kW ({inv.type})</td>
                        <td className="p-2.5 font-mono font-bold text-[#b45309]">{formatPrice(inv.cost_pkr)}</td>
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

              {/* Form */}
              <form onSubmit={handleAddInverterSubmit} className="bg-slate-50 dark:bg-black/30 p-4 rounded-xl space-y-3 text-xs border">
                <h4 className="font-bold text-slate-800 dark:text-white">Add Inverter Model</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={invBrand} onChange={e=>setInvBrand(e.target.value)} placeholder="Brand" className="p-2 bg-white dark:bg-slate-800 border rounded" />
                  <input type="text" value={invModel} onChange={e=>setInvModel(e.target.value)} placeholder="Model" className="p-2 bg-white dark:bg-slate-800 border rounded" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={invCapacity} onChange={e=>setInvCapacity(e.target.value)} placeholder="Capacity kW" className="p-2 bg-white dark:bg-slate-800 border rounded" />
                  <select value={invType} onChange={e=>setInvType(e.target.value)} className="p-2 bg-white dark:bg-slate-800 border rounded">
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-Grid">On-Grid</option>
                  </select>
                  <input type="number" value={invPrice} onChange={e=>setInvPrice(e.target.value)} placeholder="PKR Price" className="p-2 bg-white dark:bg-slate-800 border rounded" />
                </div>
                <button type="submit" className="w-full py-2 bg-[#b45309] text-white font-bold rounded-lg cursor-pointer">
                  Save Inverter
                </button>
              </form>
            </div>

            {/* Panels (6 cols) */}
            <div className="xl:col-span-6 bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base border-b pb-3">Solar Panels Catalog CMS</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-black/30 border-b text-slate-500 font-bold uppercase text-[9px]">
                      <th className="p-2.5">Mfg / Model</th>
                      <th className="p-2.5">Wattage</th>
                      <th className="p-2.5">Rate / Watt</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {solarPanels.map(panel => (
                      <tr key={panel.id}>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900 dark:text-white">{panel.mfg}</div>
                          <div className="text-[10px] text-slate-500">{panel.model}</div>
                        </td>
                        <td className="p-2.5 font-mono">{panel.wattage}W</td>
                        <td className="p-2.5 font-mono font-bold text-[#b45309]">{panel.cost_per_watt} PKR/W</td>
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

              {/* Form */}
              <form onSubmit={handleAddPanelSubmit} className="bg-slate-50 dark:bg-black/30 p-4 rounded-xl space-y-3 text-xs border">
                <h4 className="font-bold text-slate-800 dark:text-white">Add Solar Panel Model</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={panelMfg} onChange={e=>setPanelMfg(e.target.value)} placeholder="Manufacturer" className="p-2 bg-white dark:bg-slate-800 border rounded" />
                  <input type="text" value={panelModel} onChange={e=>setPanelModel(e.target.value)} placeholder="Model" className="p-2 bg-white dark:bg-slate-800 border rounded" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={panelWattage} onChange={e=>setPanelWattage(e.target.value)} placeholder="Wattage W" className="p-2 bg-white dark:bg-slate-800 border rounded" />
                  <select value={panelCell} onChange={e=>setPanelCell(e.target.value)} className="p-2 bg-white dark:bg-slate-800 border rounded">
                    <option value="Monocrystalline">Monocrystalline</option>
                    <option value="Bifacial">Bifacial</option>
                  </select>
                  <input type="number" value={panelPriceWatt} onChange={e=>setPanelPriceWatt(e.target.value)} placeholder="Rate PKR/W" className="p-2 bg-white dark:bg-slate-800 border rounded" />
                </div>
                <button type="submit" className="w-full py-2 bg-[#b45309] text-white font-bold rounded-lg cursor-pointer">
                  Save Solar Panel
                </button>
              </form>
            </div>

          </div>
        )}

        {/* INTERACTIVE RECORD PAYMENT MODAL FOR SUPER ADMIN */}
        {paymentModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn text-[#0f172a] dark:text-white">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">
                  💳 Record Installer Partner Payment
                </h3>
                <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreatePaymentRecord} className="p-6 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 uppercase">Installer Company Name *</label>
                  <input 
                    type="text" 
                    value={newPayComp} 
                    onChange={e=>setNewPayComp(e.target.value)}
                    className="w-full px-3.5 py-2.5 font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] rounded-xl text-slate-900 dark:text-white text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 uppercase">Subscription Tier *</label>
                    <select 
                      value={newPayPlan} 
                      onChange={e=>{
                        setNewPayPlan(e.target.value);
                        setNewPayAmount(e.target.value === 'Silver' ? 30000 : e.target.value === 'Gold' ? 50000 : 75000);
                      }}
                      className="w-full px-3.5 py-2.5 font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] rounded-xl text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Silver">Silver Plan (30,000 PKR)</option>
                      <option value="Gold">Gold Plan (50,000 PKR)</option>
                      <option value="Platinum">Platinum Plan (75,000 PKR)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 uppercase">Payment Channel *</label>
                    <select 
                      value={newPayChannel} 
                      onChange={e=>setNewPayChannel(e.target.value)}
                      className="w-full px-3.5 py-2.5 font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] rounded-xl text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Easypaisa">📱 Easypaisa Wallet</option>
                      <option value="JazzCash">📱 JazzCash Wallet</option>
                      <option value="Cards (PayPak)">💳 Debit / Credit Cards (PayPak)</option>
                      <option value="Raast / SBP">⚡ SBP Instant Raast</option>
                      <option value="SadaPay / NayaPay">📲 SadaPay / NayaPay Handle</option>
                      <option value="Cash">💵 Over-the-Counter Cash</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 uppercase">Account / Mobile ID *</label>
                    <input 
                      type="text" 
                      value={newPayId} 
                      onChange={e=>setNewPayId(e.target.value)}
                      placeholder="0300-1234567 / @handle"
                      className="w-full px-3.5 py-2.5 font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] rounded-xl text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 uppercase">Amount (PKR) *</label>
                    <input 
                      type="number" 
                      value={newPayAmount} 
                      onChange={e=>setNewPayAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] rounded-xl text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 uppercase">Transaction Reference ID *</label>
                  <input 
                    type="text" 
                    value={newPayRef} 
                    onChange={e=>setNewPayRef(e.target.value)}
                    className="w-full px-3.5 py-2.5 font-mono font-bold bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setPaymentModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-display font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold shadow-md cursor-pointer"
                  >
                    Log & Verify Payment ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </PageShell>
  );
}

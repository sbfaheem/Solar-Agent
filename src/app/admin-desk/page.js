'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';

export default function AdminDesk() {
  const router = useRouter();
  const { 
    user,
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

  // Role-Based Auth Protection Guard
  useEffect(() => {
    if (!user || user.role !== 'super_admin') {
      showToast("🔒 Restricted Area: Super Admin Authorization Required", "error");
      router.push('/login');
    }
  }, [user, router, showToast]);

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

  const pendingDistributors = distributors.filter(d => d.status === 'Pending Verification' || d.status === 'Pending');
  const pendingDistributorsCount = pendingDistributors.length;

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
      collector_agent: `Manual Admin Verification Entry`
    });
    if (res) {
      setPaymentModalOpen(false);
    }
  };

  const handleUpdateBankSubmit = (e) => {
    e.preventDefault();
    updateBankDetails(bankForm);
  };

  const handleAddInverterSubmit = async (e) => {
    e.preventDefault();
    if (!invBrand || !invModel) {
      showToast("Please fill in inverter brand and model", "error");
      return;
    }
    await addInverter({
      brand_name: invBrand,
      model_name: invModel,
      rated_kw: Number(invCapacity),
      type: invType,
      estimated_base_price_pkr: Number(invPrice)
    });
    setInvBrand('');
    setInvModel('');
  };

  const handleAddPanelSubmit = async (e) => {
    e.preventDefault();
    if (!panelMfg || !panelModel) {
      showToast("Please fill in panel manufacturer and model", "error");
      return;
    }
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

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <PageShell headerTitle="Super Admin Governance & Verification Desk">
      <main className="max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8 animate-fadeIn text-[#0f172a] dark:text-[#f8fafc]">
        
        {/* Governance Banner & Tab Switcher */}
        <div className="bg-[#fffbeb] dark:bg-amber-950/40 border border-[#fef3c7] dark:border-amber-800 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm text-slate-800 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <span className="material-symbols-outlined">shield_person</span>
            </div>
            <div>
              <h2 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">
                Super Admin Master Control & Verification
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                Verify wire deposits, approve distributor accounts, manage hardware catalogs, and oversee transactions ledger.
              </p>
            </div>
          </div>

          <div className="flex bg-white dark:bg-black/40 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold font-display overflow-x-auto max-w-full">
            <button 
              onClick={() => setActiveTab('verification')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'verification' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">mark_email_unread</span>
              <span>Pending Approvals ({pendingDistributorsCount + pendingUpgradeRequests.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('distributors')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'distributors' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">domain</span>
              <span>Distributors ({distributors.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'ledger' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              <span>Transactions Ledger</span>
            </button>
            <button 
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'bank' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">account_balance</span>
              <span>Bank Settings</span>
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'catalog' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
              <span>Hardware CMS</span>
            </button>
          </div>
        </div>

        {/* System Logs Banner */}
        {adminLogs.length > 0 && (
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-[#b45309] font-bold font-sans">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">terminal</span>
                <span>Super Admin Audit Stream</span>
              </span>
              <span className="text-[10px] text-slate-400">Live System Log Entries</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {adminLogs.slice(0, 4).map((log, i) => (
                <div key={i} className="text-[11px] text-slate-300">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: PENDING REGISTRATIONS & UPGRADE APPROVALS */}
        {activeTab === 'verification' && (
          <div className="space-y-8">
            
            {/* PENDING NEW DISTRIBUTOR REGISTRATIONS CARD */}
            <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">
                    Pending Distributor Registration Requests ({pendingDistributorsCount})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Verify Meezan Bank wire deposits before dispatching automated approval email</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Approval Queue
                </span>
              </div>

              {pendingDistributors.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  ✓ No pending registration requests. All distributors are verified!
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingDistributors.map(d => (
                    <div key={d.id} className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="size-8 rounded-full bg-[#b45309] text-white flex items-center justify-center font-bold text-xs font-mono">
                            {d.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm font-display">{d.name}</h4>
                            <p className="text-xs text-slate-500 font-mono">{d.contact} | {d.city}</p>
                          </div>
                        </div>
                        <div className="pt-1 flex items-center gap-2 font-mono text-xs">
                          <span className="text-slate-600 dark:text-slate-400 font-bold">{d.email}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold text-[10px]">
                            {d.plan} Plan ({d.limit} Quotes/mo)
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => approveDistributorRegistration(d.id)}
                        className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-base">mark_email_read</span>
                        <span>Accept & Dispatch Approval Email</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PENDING TIER UPGRADE REQUESTS CARD */}
            <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">
                    Pending Plan Upgrades & Payment Receipts ({pendingUpgradeRequests.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Verify attached payment receipts and expand distributor proposal quota</p>
                </div>
              </div>

              {pendingUpgradeRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  ✓ No pending plan upgrade requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUpgradeRequests.map(req => (
                    <div key={req.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white font-display">{req.company_name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900">
                            {req.current_plan} ➔ {req.target_plan}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          Amount: {formatPrice(req.amount_pkr)} | Ref: {req.reference_id} | Channel: {req.payment_channel}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {req.receipt_preview && (
                          <button 
                            onClick={() => setZoomReceipt(req.receipt_preview)}
                            className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            <span>View Receipt</span>
                          </button>
                        )}
                        
                        <button 
                          onClick={() => approveUpgradeRequestAndAutoUpgrade(req.id)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer"
                        >
                          Accept & Upgrade Quota
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: DISTRIBUTORS ROSTER */}
        {activeTab === 'distributors' && (
          <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">
                All Registered Solar EPC Distributors ({distributors.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {distributors.map(d => (
                <div key={d.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {d.logo_url ? (
                        <img src={d.logo_url} alt="Logo" className="size-8 rounded-full object-cover border border-[#b45309]" />
                      ) : (
                        <span className="size-8 rounded-full bg-[#b45309] text-white flex items-center justify-center font-bold text-xs font-mono">
                          {d.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white font-display">{d.name}</h4>
                        <p className="text-[11px] text-slate-500 font-mono">{d.email}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                      d.status === 'Verified' || d.status === 'Active'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-slate-600 dark:text-slate-400">{d.plan} Tier ({d.limit} Quotes/mo)</span>
                    <span className="font-bold text-[#b45309]">{d.used} Used</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTIONS LEDGER */}
        {activeTab === 'ledger' && (
          <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">
                  Distributor Payments Ledger ({transactions.length} Records)
                </h3>
                <p className="text-xs text-slate-500 font-medium">Recorded subscription wire deposits and payment gateway receipts</p>
              </div>

              <button 
                onClick={() => setPaymentModalOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-display font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Record Manual Payment</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-3 px-4">TXN ID</th>
                    <th className="py-3 px-4">DISTRIBUTOR</th>
                    <th className="py-3 px-4">PLAN</th>
                    <th className="py-3 px-4">CHANNEL</th>
                    <th className="py-3 px-4">AMOUNT</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-black/20">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{t.id}</td>
                      <td className="py-3.5 px-4 font-bold font-sans">{t.company_name}</td>
                      <td className="py-3.5 px-4">{t.plan}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{t.channel}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(t.amount_pkr)}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">{t.date}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BANK SETTINGS */}
        {activeTab === 'bank' && (
          <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">
                Official Bank Wire Deposit Settings (Meezan Bank)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Update account numbers and IBAN displayed to distributors during registration</p>
            </div>

            <form onSubmit={handleUpdateBankSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">BANK NAME</label>
                <input 
                  type="text" 
                  value={bankForm.bankName}
                  onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">ACCOUNT TITLE</label>
                <input 
                  type="text" 
                  value={bankForm.accountTitle}
                  onChange={e => setBankForm({ ...bankForm, accountTitle: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">ACCOUNT NUMBER</label>
                  <input 
                    type="text" 
                    value={bankForm.accountNumber}
                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">IBAN NUMBER</label>
                  <input 
                    type="text" 
                    value={bankForm.iban}
                    onChange={e => setBankForm({ ...bankForm, iban: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Official Wire Account Details
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: HARDWARE CMS */}
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            
            {/* Add Inverter & Panel Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Add Inverter Form */}
              <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                  ➕ Add Solar Inverter / Battery Model
                </h3>
                <form onSubmit={handleAddInverterSubmit} className="space-y-3 text-xs font-mono">
                  <input 
                    type="text" 
                    required 
                    placeholder="Brand (e.g. Inverex, Growatt, Solis)"
                    value={invBrand}
                    onChange={e => setInvBrand(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <input 
                    type="text" 
                    required 
                    placeholder="Model Name (e.g. Nitrox 12kW Hybrid)"
                    value={invModel}
                    onChange={e => setInvModel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder="Rated kW"
                      value={invCapacity}
                      onChange={e => setInvCapacity(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                    <select 
                      value={invType}
                      onChange={e => setInvType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-sans"
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-Grid">On-Grid</option>
                      <option value="Off-Grid">Off-Grid</option>
                      <option value="Lithium Battery">Lithium Battery</option>
                    </select>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Estimated Base Price PKR"
                    value={invPrice}
                    onChange={e => setInvPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <button 
                    type="submit"
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-display font-extrabold rounded-xl shadow-md text-xs"
                  >
                    Add Inverter to Catalog
                  </button>
                </form>
              </div>

              {/* Add Solar Panel Form */}
              <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                  ➕ Add Solar Panel Model
                </h3>
                <form onSubmit={handleAddPanelSubmit} className="space-y-3 text-xs font-mono">
                  <input 
                    type="text" 
                    required 
                    placeholder="Manufacturer (e.g. Jinko, Longi, JA)"
                    value={panelMfg}
                    onChange={e => setPanelMfg(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <input 
                    type="text" 
                    required 
                    placeholder="Model Name (e.g. Tiger Neo 585W)"
                    value={panelModel}
                    onChange={e => setPanelModel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder="Wattage (W)"
                      value={panelWattage}
                      onChange={e => setPanelWattage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                    <input 
                      type="number" 
                      placeholder="Price / Watt PKR"
                      value={panelPriceWatt}
                      onChange={e => setPanelPriceWatt(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Cell Tech (e.g. N-Type TOPCon)"
                    value={panelCell}
                    onChange={e => setPanelCell(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <button 
                    type="submit"
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-display font-extrabold rounded-xl shadow-md text-xs"
                  >
                    Add Solar Panel to Catalog
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Manual Payment Record Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-scaleUp text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-display font-extrabold text-base">Record Payment Entry</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePaymentRecord} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">DISTRIBUTOR NAME</label>
                <input 
                  type="text" 
                  value={newPayComp} 
                  onChange={e => setNewPayComp(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">PLAN</label>
                  <select 
                    value={newPayPlan} 
                    onChange={e => setNewPayPlan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-sans"
                  >
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">AMOUNT PKR</label>
                  <input 
                    type="number" 
                    value={newPayAmount} 
                    onChange={e => setNewPayAmount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">CHANNEL</label>
                <input 
                  type="text" 
                  value={newPayChannel} 
                  onChange={e => setNewPayChannel(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <button type="submit" className="w-full py-3.5 bg-amber-600 text-white font-display font-extrabold rounded-xl shadow-md text-xs">
                Save Record to Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Zoom Receipt Modal */}
      {zoomReceipt && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-4 text-right">
            <button onClick={() => setZoomReceipt(null)} className="px-4 py-2 bg-white rounded-xl text-slate-900 font-bold text-xs">
              Close Preview ✕
            </button>
            <img src={zoomReceipt} alt="Receipt Preview" className="w-full max-h-[80vh] object-contain rounded-2xl border" />
          </div>
        </div>
      )}

    </PageShell>
  );
}

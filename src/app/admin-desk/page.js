'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';

export default function AdminDesk() {
  const { 
    user,
    signInSuperAdmin,
    distributors,
    approveDistributorRegistration,
    updateDistributorStatus,
    requestPasswordReset,
    adminLogs,
    bankDetails,
    updateBankDetails,
    pendingUpgradeRequests,
    transactions,
    recordPayment,
    showToast,
    inverters,
    solarPanels,
    addInverter,
    addSolarPanel,
    formatPrice
  } = useApp();

  // Super Admin Login Form State for unauthenticated access
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const [activeTab, setActiveTab] = useState('verification');
  const [channelFilter, setChannelFilter] = useState('All');

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

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError(null);

    if (!adminEmail || !adminPassword) {
      showToast("⚠️ Please enter Admin Work Email and Governance Password", "error");
      return;
    }

    const res = signInSuperAdmin(adminEmail, adminPassword);
    if (!res.success) {
      setLoginError("❌ Invalid Super Admin Credentials! Access Denied.");
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
    if (addInverter) {
      await addInverter({
        brand_name: invBrand,
        model_name: invModel,
        rated_kw: Number(invCapacity),
        type: invType,
        estimated_base_price_pkr: Number(invPrice)
      });
    }
    setInvBrand('');
    setInvModel('');
  };

  const handleAddPanelSubmit = async (e) => {
    e.preventDefault();
    if (!panelMfg || !panelModel) {
      showToast("Please fill in panel manufacturer and model", "error");
      return;
    }
    if (addSolarPanel) {
      await addSolarPanel({
        manufacturer_name: panelMfg,
        model_name: panelModel,
        default_wattage: Number(panelWattage),
        price_per_watt_pkr: Number(panelPriceWatt),
        cell_type: panelCell
      });
    }
    setPanelMfg('');
    setPanelModel('');
  };

  // If user is not authenticated as Super Admin, render unexposed Super Admin Login Form
  if (!user || user.role !== 'super_admin') {
    return (
      <PageShell headerTitle="Super Admin Governance Desk">
        <main className="max-w-md mx-auto w-full p-4 lg:p-8 my-12 animate-fadeIn text-[#0f172a] dark:text-[#f8fafc]">
          <div className="bg-white dark:bg-[#181a1d] border border-amber-300 dark:border-amber-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5 text-center">
              <div className="size-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-md">
                <span className="material-symbols-outlined text-2xl">shield_person</span>
              </div>
              <h2 className="text-xl font-display font-black text-[#0f172a] dark:text-white tracking-wide">
                Governance Desk Security
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Enter your administrative credentials to unlock system governance
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5 font-sans">
                  Super Admin Work Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter Admin Work Email"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 focus:border-amber-600 text-slate-900 dark:text-white text-xs font-mono transition-all outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5 font-sans">
                  Governance Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 focus:border-amber-600 text-slate-900 dark:text-white text-xs font-mono transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-display font-black text-sm tracking-wide shadow-lg shadow-amber-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>Unlock Super Admin Desk</span>
              </button>
            </form>
          </div>
        </main>
      </PageShell>
    );
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
                Approve distributor registrations, dispatch 24-hr activation emails, manage account statuses, and oversee platform ledger.
              </p>
            </div>
          </div>

          <div className="flex bg-white dark:bg-black/40 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold font-display overflow-x-auto max-w-full">
            <button 
              onClick={() => setActiveTab('verification')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'verification' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">mark_email_unread</span>
              <span>Pending Approvals ({pendingDistributorsCount + (pendingUpgradeRequests ? pendingUpgradeRequests.length : 0)})</span>
            </button>
            <button 
              onClick={() => setActiveTab('distributors')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'distributors' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">domain</span>
              <span>All Distributors ({distributors.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'ledger' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              <span>Transactions Ledger</span>
            </button>
            <button 
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'bank' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">account_balance</span>
              <span>Bank Settings</span>
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'catalog' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
              <span>Hardware CMS</span>
            </button>
          </div>
        </div>

        {/* System Logs Banner */}
        {adminLogs && adminLogs.length > 0 && (
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-[#b45309] font-bold font-sans">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">terminal</span>
                <span>Super Admin Audit Stream & Email Logs</span>
              </span>
              <span className="text-[10px] text-slate-400">Live Audit Log</span>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {adminLogs.slice(0, 5).map((log, i) => (
                <div key={i} className="text-[11px] text-slate-300">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: PENDING REGISTRATIONS */}
        {activeTab === 'verification' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">
                    Pending Distributor Registration Requests ({pendingDistributorsCount})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Click Accept & Dispatch Email to send 24-hr activation token link</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Approval Queue
                </span>
              </div>

              {pendingDistributors.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  ✓ No pending registration requests. All distributors have been reviewed!
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

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => approveDistributorRegistration(d.id)}
                          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-base">mark_email_read</span>
                          <span>Approve & Send Activation Email</span>
                        </button>

                        <button 
                          onClick={() => updateDistributorStatus(d.id, 'Rejected')}
                          className="px-3 py-3 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200 font-bold text-xs transition-all cursor-pointer"
                        >
                          Reject
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
              <div>
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">
                  All Registered Solar EPC Distributors ({distributors.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium">Manage status, resend activation emails, and reset passwords</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {distributors.map(d => (
                <div key={d.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      {d.logo_url ? (
                        <img src={d.logo_url} alt="Logo" className="size-9 rounded-full object-cover border border-amber-500" />
                      ) : (
                        <span className="size-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                          {d.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-display">{d.name}</h4>
                        <p className="text-[11px] text-slate-500 font-mono">{d.email}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono ${
                      d.status === 'Active'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : d.status === 'Approved'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        : d.status === 'Suspended'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {d.status === 'Approved' ? 'Approved (No Pwd)' : d.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>Plan: <strong className="text-slate-900 dark:text-white">{d.plan} Tier ({d.limit} Quotes/mo)</strong></div>
                    <div>City/Contact: <strong className="text-slate-900 dark:text-white">{d.city} ({d.contact})</strong></div>
                    {d.activation_token && (
                      <div className="text-amber-600 dark:text-amber-400 font-bold truncate">Token: {d.activation_token}</div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    {d.status === 'Pending' && (
                      <button 
                        onClick={() => approveDistributorRegistration(d.id)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">mark_email_read</span>
                        <span>Approve</span>
                      </button>
                    )}

                    {(d.status === 'Approved' || d.status === 'Pending') && (
                      <button 
                        onClick={() => approveDistributorRegistration(d.id)}
                        className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">forward_to_inbox</span>
                        <span>Resend Email</span>
                      </button>
                    )}

                    {d.status === 'Active' && (
                      <button 
                        onClick={() => updateDistributorStatus(d.id, 'Suspended')}
                        className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}

                    {d.status === 'Suspended' && (
                      <button 
                        onClick={() => updateDistributorStatus(d.id, 'Active')}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Reactivate
                      </button>
                    )}

                    <button 
                      onClick={() => requestPasswordReset(d.email)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">lock_reset</span>
                      <span>Reset Pwd</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </PageShell>
  );
}

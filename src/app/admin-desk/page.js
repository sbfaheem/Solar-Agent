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

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'clearance', 'override', 'catalog'
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
    <PageShell headerTitle="Super Admin Overview">
      <main className="max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8 animate-fadeIn text-slate-800">
        
        {/* Top Summary Stat Cards matching Screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stat Card 1: Registered Companies */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">Registered Companies</span>
              <div className="font-display font-extrabold text-3xl text-slate-900">1,248</div>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+12% vs last month</span>
              </div>
            </div>
            <div className="size-12 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">domain</span>
            </div>
          </div>

          {/* Stat Card 2: Total Monthly Revenue */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">Total Monthly Revenue</span>
              <div className="font-display font-extrabold text-3xl text-slate-900">PKR 18.4M</div>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+8.2% vs last month</span>
              </div>
            </div>
            <div className="size-12 rounded-2xl bg-[#dcfce7] text-[#166534] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
          </div>

          {/* Stat Card 3: Pending Verifications */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">Pending Verifications</span>
              <div className="font-display font-extrabold text-3xl text-slate-900">42</div>
              <div className="text-xs font-semibold text-red-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">priority_high</span>
                <span>Requires attention</span>
              </div>
            </div>
            <div className="size-12 rounded-2xl bg-[#fee2e2] text-[#991b1b] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
          </div>

        </div>

        {/* Sub-header Action Buttons & Tab Switcher matching Screenshot 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('clearance')}
              className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs shadow-sm cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'clearance'
                  ? 'bg-[#78350f] text-white'
                  : 'bg-[#78350f] text-white hover:bg-[#92400e]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">assignment</span>
              <span>Manual Verification Desk</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('catalog')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-display font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">settings</span>
              <span>Global Settings</span>
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1 text-xs font-bold font-display">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registered Companies
            </button>
            <button 
              onClick={() => setActiveTab('clearance')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'clearance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clearance Desk ({company.billing_status === 'Pending Verification' ? 1 : 0})
            </button>
            <button 
              onClick={() => setActiveTab('override')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'override' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quota Requests ({overrideRequests.filter(r => r.status === 'Pending').length})
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hardware CMS Catalog
            </button>
          </div>
        </div>

        {/* 1. REGISTERED COMPANIES TABLE VIEW matching Screenshot 2 */}
        {activeTab === 'overview' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm space-y-4">
            
            <div className="p-6 pb-2 flex justify-between items-center border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-900 text-base">Registered Companies</h3>
              <button 
                onClick={() => setActiveTab('clearance')}
                className="text-xs font-bold text-[#b45309] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-slate-200 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-3.5">COMPANY NAME</th>
                    <th className="px-6 py-3.5">CURRENT TIER</th>
                    <th className="px-6 py-3.5">PROPOSALS USED/LIMIT</th>
                    <th className="px-6 py-3.5">SUBSCRIPTION STATUS</th>
                    <th className="px-6 py-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {mockCompanies.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-[#dbeafe] text-[#1e40af] flex items-center justify-center font-mono font-bold text-xs">
                            {c.initials}
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          c.tier === 'Platinum' 
                            ? 'bg-[#fef3c7] text-[#92400e] border border-[#fde047]'
                            : c.tier === 'Gold'
                            ? 'bg-[#fef9c3] text-[#854d0e] border border-[#fef08a]'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {c.tier}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 max-w-xs">
                          <div className="flex justify-between font-mono font-bold text-[11px] text-slate-700">
                            <span>{c.used} / {c.limit}</span>
                            <span className={c.pct > 90 ? 'text-red-600' : 'text-slate-500'}>{c.pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                c.pct > 90 ? 'bg-red-500' : c.pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${c.pct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          c.status === 'Verified' 
                            ? 'bg-[#dcfce7] text-[#15803d]' 
                            : 'bg-[#fee2e2] text-[#b91c1c]'
                        }`}>
                          <span className={`size-1.5 rounded-full ${c.status === 'Verified' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                          <span>{c.status}</span>
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

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Showing 4 of 1,248 companies</span>
              <div className="flex gap-2">
                <button className="size-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 cursor-not-allowed">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="size-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 2. MANUAL CLEARANCE DESK VIEW */}
        {activeTab === 'clearance' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm space-y-4">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-display font-bold text-slate-900 text-base">Pending Offline Receipts Verification</h3>
              {company.billing_status === "Pending Verification" && (
                <span className="text-[10px] bg-[#fef3c7] text-[#92400e] px-2.5 py-1 rounded-full font-bold uppercase">
                  1 Awaiting Action
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-slate-200 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-3.5">COMPANY NAME</th>
                    <th className="px-6 py-3.5">TARGET TIER</th>
                    <th className="px-6 py-3.5">SLIP ATTACHMENT</th>
                    <th className="px-6 py-3.5">AMOUNT PAYABLE</th>
                    <th className="px-6 py-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {company.billing_status !== "Pending Verification" ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                        No pending offline payment receipts requiring manual clearance.
                      </td>
                    </tr>
                  ) : (
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">{company.name}</td>
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
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
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

        {/* 3. OVERRIDE QUOTA REQUESTS VIEW */}
        {activeTab === 'override' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm space-y-4">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-display font-bold text-slate-900 text-base">Actionable Quota Override Requests</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-slate-200 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-3.5">COMPANY NAME</th>
                    <th className="px-6 py-3.5">CURRENT USAGE</th>
                    <th className="px-6 py-3.5">ACTIVE LIMIT</th>
                    <th className="px-6 py-3.5">STATUS</th>
                    <th className="px-6 py-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overrideRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                        No active quota override extension requests submitted.
                      </td>
                    </tr>
                  ) : (
                    overrideRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900">{req.company_name}</td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-700">{req.current_usage} Proposals</td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-700">{req.current_limit} limit</td>
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

        {/* 4. HARDWARE CATALOG CMS VIEW */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Inverters (6 cols) */}
            <div className="xl:col-span-6 bg-white border border-[#e2e8f0] rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 text-base border-b pb-3">Inverters Catalog CMS</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[9px]">
                      <th className="p-2.5">Brand / Model</th>
                      <th className="p-2.5">Capacity</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inverters.map(inv => (
                      <tr key={inv.id}>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{inv.brand}</div>
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
              <form onSubmit={handleAddInverterSubmit} className="bg-slate-50 p-4 rounded-xl space-y-3 text-xs border">
                <h4 className="font-bold text-slate-800">Add Inverter Model</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={invBrand} onChange={e=>setInvBrand(e.target.value)} placeholder="Brand" className="p-2 bg-white border rounded" />
                  <input type="text" value={invModel} onChange={e=>setInvModel(e.target.value)} placeholder="Model" className="p-2 bg-white border rounded" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={invCapacity} onChange={e=>setInvCapacity(e.target.value)} placeholder="Capacity kW" className="p-2 bg-white border rounded" />
                  <select value={invType} onChange={e=>setInvType(e.target.value)} className="p-2 bg-white border rounded">
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-Grid">On-Grid</option>
                  </select>
                  <input type="number" value={invPrice} onChange={e=>setInvPrice(e.target.value)} placeholder="PKR Price" className="p-2 bg-white border rounded" />
                </div>
                <button type="submit" className="w-full py-2 bg-[#b45309] text-white font-bold rounded-lg cursor-pointer">
                  Save Inverter
                </button>
              </form>
            </div>

            {/* Panels (6 cols) */}
            <div className="xl:col-span-6 bg-white border border-[#e2e8f0] rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 text-base border-b pb-3">Solar Panels Catalog CMS</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[9px]">
                      <th className="p-2.5">Mfg / Model</th>
                      <th className="p-2.5">Wattage</th>
                      <th className="p-2.5">Rate / Watt</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {solarPanels.map(panel => (
                      <tr key={panel.id}>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{panel.mfg}</div>
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
              <form onSubmit={handleAddPanelSubmit} className="bg-slate-50 p-4 rounded-xl space-y-3 text-xs border">
                <h4 className="font-bold text-slate-800">Add Solar Panel Model</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={panelMfg} onChange={e=>setPanelMfg(e.target.value)} placeholder="Manufacturer" className="p-2 bg-white border rounded" />
                  <input type="text" value={panelModel} onChange={e=>setPanelModel(e.target.value)} placeholder="Model" className="p-2 bg-white border rounded" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={panelWattage} onChange={e=>setPanelWattage(e.target.value)} placeholder="Wattage W" className="p-2 bg-white border rounded" />
                  <select value={panelCell} onChange={e=>setPanelCell(e.target.value)} className="p-2 bg-white border rounded">
                    <option value="Monocrystalline">Monocrystalline</option>
                    <option value="Bifacial">Bifacial</option>
                  </select>
                  <input type="number" value={panelPriceWatt} onChange={e=>setPanelPriceWatt(e.target.value)} placeholder="Rate PKR/W" className="p-2 bg-white border rounded" />
                </div>
                <button type="submit" className="w-full py-2 bg-[#b45309] text-white font-bold rounded-lg cursor-pointer">
                  Save Solar Panel
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Bottom Sustainable Infrastructure Management Banner matching Screenshot 2 */}
        <div className="bg-[#fffbeb] border border-[#fef08a] rounded-2xl p-8 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center mx-auto font-bold shadow-sm">
            <span className="material-symbols-outlined text-2xl">solar_power</span>
          </div>
          <h3 className="font-display font-extrabold text-[#854d0e] text-lg">
            Sustainable Infrastructure Management
          </h3>
          <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
            Multi-tenant B2B SaaS architecture for Pakistani solar installers. Manage company subscriptions, manual offline payment verification, and proposal quotas.
          </p>
        </div>

      </main>
    </PageShell>
  );
}

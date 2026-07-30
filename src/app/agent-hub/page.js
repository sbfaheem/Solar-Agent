'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import AIProposalModal from '../../components/AIProposalModal';
import { useApp } from '../../context/AppContext';

export default function AgentHub() {
  const { 
    proposals, 
    loading, 
    company,
    lang, 
    formatPrice,
    addLead, 
    updateLead, 
    removeLead, 
    getActiveLimit,
    requestOverrideQuota,
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [aiProposalModalOpen, setAiProposalModalOpen] = useState(false);
  const [activePdfProposal, setActivePdfProposal] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_number: '',
    installation_address: '',
    email_address: '',
    status: 'Draft',
    system_size_kw: 0.0,
    total_investment: 0
  });

  // Localizations translations dictionary
  const translations = {
    en: {
      title: "Project Hub & Companies Workspace",
      subtitle: "Review pipeline leads, update client specifications, and initiate calculations.",
      newCalc: "New Calculation",
      totalLeads: "Total Leads",
      sysSize: "Total System Size",
      pipeline: "Estimated Pipeline",
      searchPlaceholder: "Search leads by customer or location...",
      customerName: "Customer Name",
      location: "Site Location",
      contact: "Contact",
      specs: "Specs",
      investment: "Investment",
      status: "Status",
      actions: "Actions",
      limitText: "Proposal Limit",
      loading: "Loading database proposals...",
      noLeads: "No matching proposals found in database.",
      cancel: "Cancel",
      createBtn: "Create Lead Calculation ✓",
      updateBtn: "Update Details ✓",
      limitTitle: "⚠️ Proposal Limit Reached",
      limitBody: "Your company has hit the monthly quota limit for your active tier. To generate more proposals, click below to request a temporary extension from the Super Administrator or upgrade your current subscription plan.",
      requestOverride: "Request Overrides",
      upgradePlan: "Upgrade Plan Settings"
    },
    ur: {
      title: "پراجیکٹ ہب اور انسٹالر ورک اسپیس",
      subtitle: "پراجیکٹ لیڈز کا جائزہ لیں، گاہک کی تفصیلات تبدیل کریں اور نیا حساب کتاب شروع کریں۔",
      newCalc: "نیا حساب کتاب",
      totalLeads: "کل پراجیکٹ لیڈز",
      sysSize: "سسٹم کا کل سائز",
      pipeline: "منصوبوں کی متوقع مالیت",
      searchPlaceholder: "لیڈز تلاش کریں...",
      customerName: "صارف کا نام",
      location: "سائٹ کا پتہ",
      contact: "رابطہ نمبر",
      specs: "تفصیلات",
      investment: "سرمایہ کاری",
      status: "حیثیت",
      actions: "کارروائی",
      limitText: "پروپوزل کی حد",
      loading: "ڈیٹا بیس سے پروپوزل لوڈ کیے جا رہے ہیں...",
      noLeads: "ڈیٹا بیس میں کوئی پروپوزل نہیں ملا۔",
      cancel: "منسوخ کریں",
      createBtn: "نیا پروپوزل بنائیں ✓",
      updateBtn: "تفصیلات اپ ڈیٹ کریں ✓",
      limitTitle: "⚠️ پروپوزل کی حد ختم ہو چکی ہے",
      limitBody: "آپ کی کمپنی اپنے فعال پلان کی ماہانہ پروپوزل کی حد تک پہنچ چکی ہے۔ مزید پروپوزل بنانے کے لیے، سپر ایڈمنسٹریٹر سے اضافی حد کی درخواست کریں یا اپنا سبسکرپشن پلان اپ گریڈ کریں۔",
      requestOverride: "اضافی حد کی درخواست کریں",
      upgradePlan: "پلان اپ گریڈ کریں"
    }
  };

  const t = translations[lang];

  // Subscription Enforcement check before opening create modal
  const handleOpenCreateModal = () => {
    const limit = getActiveLimit();
    if (company.proposals_generated >= limit) {
      setLimitModalOpen(true);
      return;
    }

    setModalMode('create');
    setFormData({
      customer_name: '',
      contact_number: '',
      installation_address: '',
      email_address: '',
      status: 'Draft',
      system_size_kw: 5.0,
      total_investment: 300000
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (proposal) => {
    setModalMode('edit');
    setActiveLeadId(proposal.id);
    setFormData({
      customer_name: proposal.customer_name || '',
      contact_number: proposal.contact_number || '',
      installation_address: proposal.installation_address || '',
      email_address: proposal.email_address || '',
      status: proposal.status || 'Draft',
      system_size_kw: proposal.system_size_kw || 0.0,
      total_investment: proposal.total_investment || 0
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'system_size_kw' ? parseFloat(value) || 0 : name === 'total_investment' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.contact_number || !formData.installation_address) {
      showToast("⚠️ Please fill in all required fields", "error");
      return;
    }

    if (modalMode === 'create') {
      await addLead(formData);
    } else {
      await updateLead(activeLeadId, formData);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (confirm(lang === 'ur' ? "کیا آپ اس لیڈ کو حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this lead?")) {
      await removeLead(id);
    }
  };

  const handleRequestOverride = async () => {
    const ok = await requestOverrideQuota();
    if (ok) {
      setLimitModalOpen(false);
    }
  };

  // Search and status filters
  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.installation_address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalLeads = proposals.length;
  const totalKw = proposals.reduce((sum, p) => sum + (p.system_size_kw || 0), 0);
  const totalPkr = proposals.reduce((sum, p) => sum + (p.total_investment || 0), 0);
  const activeLimit = getActiveLimit();
  const usagePercentage = Math.min(100, Math.round((company.proposals_generated / activeLimit) * 100));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Closed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700';
      case 'Sent':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <PageShell headerTitle="Companies Project Hub">
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8 text-[#0f172a] dark:text-[#f8fafc]" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        
        {/* Banner Headers */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          lang === 'ur' ? 'text-right' : 'text-left'
        }`}>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#0f172a] dark:text-white">{t.title}</h1>
            <p className="text-[#475569] dark:text-slate-400 text-sm mt-1 font-medium">{t.subtitle}</p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs transition-all cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>{t.newCalc}</span>
          </button>
        </div>

        {/* Multi-Tenant Quota Monitor Tracker */}
        <section className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-xs font-bold text-[#475569] dark:text-slate-400 uppercase tracking-wider">{t.limitText} Monitor</span>
              <div className="text-sm font-extrabold text-[#0f172a] dark:text-white mt-0.5">
                {company.name} ({company.plan} Plan)
              </div>
            </div>
            <div className="font-mono text-sm font-black text-[#0f172a] dark:text-white">
              {company.proposals_generated} / {activeLimit} <span className="text-xs text-[#64748b] dark:text-slate-400 font-bold">Proposals</span>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden border border-[#cbd5e1] dark:border-slate-800">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                usagePercentage >= 90 ? 'bg-red-600' : usagePercentage >= 70 ? 'bg-[#b45309]' : 'bg-[#b45309]'
              }`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
        </section>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[#475569] dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t.totalLeads}</span>
              <div className="text-3xl font-black font-mono mt-1 text-[#0f172a] dark:text-white">{loading ? '...' : totalLeads}</div>
            </div>
            <div className="size-12 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">leaderboard</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[#475569] dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t.sysSize}</span>
              <div className="text-3xl font-black font-mono mt-1 text-[#0f172a] dark:text-white">
                {loading ? '...' : totalKw.toFixed(1)} <span className="text-xs text-[#64748b] dark:text-slate-400 font-bold">kWp</span>
              </div>
            </div>
            <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">solar_power</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[#475569] dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t.pipeline}</span>
              <div className="text-3xl font-black font-mono mt-1 text-[#b45309] dark:text-amber-400">
                {formatPrice(totalPkr)}
              </div>
            </div>
            <div className="size-12 rounded-2xl bg-[#fef3c7] text-[#b45309] dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
          </div>
        </div>

        {/* Filters and Table List */}
        <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl overflow-hidden shadow-sm">
          
          <div className={`p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 ${
            lang === 'ur' ? 'flex-row-reverse' : ''
          }`}>
            {/* Search Input */}
            <div className="relative w-full sm:max-w-sm">
              <span className={`absolute inset-y-0 flex items-center pointer-events-none text-slate-400 ${
                lang === 'ur' ? 'right-3' : 'left-3'
              }`}>
                <span className="material-symbols-outlined text-lg">search</span>
              </span>
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2.5 text-xs font-medium bg-[#f8fafc] dark:bg-[#282a2d] border border-[#cbd5e1] dark:border-[#3f474f] rounded-xl text-[#0f172a] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#b45309] transition-all ${
                  lang === 'ur' ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'
                }`}
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-[#282a2d] p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {['All', 'Draft', 'Sent', 'Closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-display transition-all cursor-pointer ${
                    statusFilter === status 
                      ? 'bg-[#b45309] text-white shadow-sm' 
                      : 'text-[#475569] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white'
                  }`}
                >
                  {status === 'All' && lang === 'ur' ? 'تمام' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#eff4ff] dark:bg-black/40 border-b border-slate-200 dark:border-slate-800 text-[#475569] dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.customerName}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.location}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.contact}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.specs}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.investment}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.status}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-left' : 'text-right'}`}>{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500 font-medium">{t.loading}</td>
                  </tr>
                ) : filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500 font-medium">{t.noLeads}</td>
                  </tr>
                ) : (
                  filteredProposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className={`px-6 py-4 font-bold text-[#0f172a] dark:text-white text-sm ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
                        {proposal.customer_name}
                      </td>
                      <td className={`px-6 py-4 text-[#475569] dark:text-slate-400 max-w-[200px] truncate font-medium ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
                        {proposal.installation_address}
                      </td>
                      <td className={`px-6 py-4 font-mono text-xs font-semibold text-[#475569] dark:text-slate-400 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
                        {proposal.contact_number}
                      </td>
                      <td className={`px-6 py-4 font-mono text-xs font-bold text-[#0f172a] dark:text-white ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
                        {proposal.system_size_kw} kWp
                      </td>
                      <td className={`px-6 py-4 font-mono font-bold text-[#0f172a] dark:text-white ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
                        {formatPrice(proposal.total_investment)}
                      </td>
                      <td className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(proposal.status)}`}>
                          {proposal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setActivePdfProposal(proposal);
                            setAiProposalModalOpen(true);
                          }}
                          className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-600 hover:text-white flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 transition-all cursor-pointer"
                          title="Generate AI PDF Proposal"
                        >
                          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(proposal)}
                          className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#b45309] hover:text-white flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                          title="Edit Customer Info"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(proposal.id)}
                          className="size-8 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-600 hover:text-white flex items-center justify-center border border-red-200 dark:border-red-500/20 text-red-600 transition-all cursor-pointer"
                          title="Delete Lead"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn text-[#0f172a] dark:text-white" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
              <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center ${
                lang === 'ur' ? 'flex-row-reverse' : ''
              }`}>
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">
                  {modalMode === 'create' ? `⚡ ${t.newCalc}` : `🖊️ ${t.updateBtn}`}
                </h3>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.customerName} *</label>
                  <input 
                    type="text" 
                    name="customer_name" 
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder={lang === 'ur' ? 'صارف کا نام درج کریں' : 'Enter customer name'}
                    className={`w-full px-3.5 py-2.5 text-sm bg-[#f8fafc] dark:bg-black/40 border border-[#cbd5e1] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white focus:outline-none focus:border-[#b45309] font-medium ${
                      lang === 'ur' ? 'text-right' : 'text-left'
                    }`}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.contact} *</label>
                    <input 
                      type="text" 
                      name="contact_number" 
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      placeholder="0300-1234567"
                      className={`w-full px-3.5 py-2.5 text-sm bg-[#f8fafc] dark:bg-black/40 border border-[#cbd5e1] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white focus:outline-none focus:border-[#b45309] font-mono ${
                        lang === 'ur' ? 'text-right' : 'text-left'
                      }`}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Email</label>
                    <input 
                      type="email" 
                      name="email_address" 
                      value={formData.email_address}
                      onChange={handleInputChange}
                      placeholder="client@example.com"
                      className={`w-full px-3.5 py-2.5 text-sm bg-[#f8fafc] dark:bg-black/40 border border-[#cbd5e1] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white focus:outline-none focus:border-[#b45309] ${
                        lang === 'ur' ? 'text-right' : 'text-left'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.location} *</label>
                  <input 
                    type="text" 
                    name="installation_address" 
                    value={formData.installation_address}
                    onChange={handleInputChange}
                    placeholder={lang === 'ur' ? 'انسٹالیشن کا پتہ درج کریں' : 'House/Sector, City'}
                    className={`w-full px-3.5 py-2.5 text-sm bg-[#f8fafc] dark:bg-black/40 border border-[#cbd5e1] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white focus:outline-none focus:border-[#b45309] font-medium ${
                      lang === 'ur' ? 'text-right' : 'text-left'
                    }`}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.specs} (kWp)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      name="system_size_kw" 
                      value={formData.system_size_kw}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#f8fafc] dark:bg-black/40 border border-[#cbd5e1] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white font-mono font-bold text-center"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.investment}</label>
                    <input 
                      type="number" 
                      name="total_investment" 
                      value={formData.total_investment}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#f8fafc] dark:bg-black/40 border border-[#cbd5e1] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white font-mono font-bold text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.status}</label>
                    <select 
                      name="status" 
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#f8fafc] dark:bg-black/40 border border-[#cbd5e1] dark:border-slate-700 rounded-xl text-[#0f172a] dark:text-white font-bold cursor-pointer"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-display font-bold text-xs hover:bg-slate-100 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-bold text-xs shadow-md cursor-pointer transition-all"
                  >
                    {modalMode === 'create' ? t.createBtn : t.updateBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Proposal PDF Generator Modal */}
        <AIProposalModal 
          isOpen={aiProposalModalOpen}
          onClose={() => {
            setAiProposalModalOpen(false);
            setActivePdfProposal(null);
          }}
          initialData={{
            customerName: activePdfProposal?.customer_name || '',
            customerContact: activePdfProposal?.contact_number || '',
            customerEmail: activePdfProposal?.email_address || '',
            siteLocation: activePdfProposal?.installation_address || '',
            systemKw: activePdfProposal?.system_size_kw || 10,
            monthlyUnits: Math.round((activePdfProposal?.system_size_kw || 10) * 120)
          }}
        />
      </main>
    </PageShell>
  );
}

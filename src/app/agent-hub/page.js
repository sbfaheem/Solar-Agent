'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';

export default function AgentHub() {
  const { 
    proposals, 
    loading, 
    company,
    lang, 
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
      title: "Solar Agent | Project Hub",
      subtitle: "Review pipeline leads, update client specifications, and initiate calculations.",
      newCalc: "New Calculation",
      totalLeads: "Total Leads",
      sysSize: "Total System Size",
      pipeline: "Estimated Pipeline",
      searchPlaceholder: "Search leads...",
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
      title: "سولر ایجنٹ | پراجیکٹ ہب",
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
        return 'bg-emerald-500/10 text-accent-emerald border-emerald-500/20';
      case 'Sent':
        return 'bg-amber-500/10 text-accent-amber border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <PageShell>
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        
        {/* Banner Headers */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          lang === 'ur' ? 'text-right' : 'text-left'
        }`}>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">{t.title}</h1>
            <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-white text-black font-display font-semibold transition-all cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined">add_circle</span>
            {t.newCalc}
          </button>
        </div>

        {/* Multi-Tenant Quota Monitor Tracker */}
        <section className="bg-surface-base border border-border-base rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.limitText} Monitor</span>
              <div className="text-sm font-semibold text-white mt-1">
                {company.name} ({company.plan} Plan)
              </div>
            </div>
            <div className="font-mono text-sm font-extrabold text-white">
              {company.proposals_generated} / {activeLimit} <span className="text-xs text-slate-500">Proposals</span>
            </div>
          </div>
          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-border-base/50">
            <div 
              className={`h-full transition-all duration-500 ${
                usagePercentage >= 90 ? 'bg-accent-red' : usagePercentage >= 70 ? 'bg-accent-amber' : 'bg-primary'
              }`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
        </section>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-base border border-border-base p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.totalLeads}</span>
              <div className="text-2xl font-extrabold font-mono mt-1 text-white">{loading ? '...' : totalLeads}</div>
            </div>
            <span className="material-symbols-outlined text-slate-500 text-3xl">leaderboard</span>
          </div>
          <div className="bg-surface-base border border-border-base p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.sysSize}</span>
              <div className="text-2xl font-extrabold font-mono mt-1 text-white">
                {loading ? '...' : totalKw.toFixed(1)} <span className="text-xs text-slate-500">kWp</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-accent-emerald text-3xl">solar_power</span>
          </div>
          <div className="bg-surface-base border border-border-base p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.pipeline}</span>
              <div className="text-2xl font-extrabold font-mono mt-1 text-white">
                {lang === 'ur' ? `${totalPkr.toLocaleString()} ${translations.ur.pkr}` : `${translations.en.pkr} ${totalPkr.toLocaleString()}`}
              </div>
            </div>
            <span className="material-symbols-outlined text-primary-container text-3xl">payments</span>
          </div>
        </div>

        {/* Filters and List */}
        <div className="bg-surface-base border border-border-base rounded-xl overflow-hidden shadow-sm">
          <div className={`p-5 border-b border-border-base flex flex-col sm:flex-row items-center justify-between gap-4 ${
            lang === 'ur' ? 'flex-row-reverse' : ''
          }`}>
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <span className={`absolute inset-y-0 flex items-center pointer-events-none text-slate-500 ${
                lang === 'ur' ? 'right-3' : 'left-3'
              }`}>
                <span className="material-symbols-outlined text-lg">search</span>
              </span>
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 text-sm bg-black/30 border border-border-base rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all ${
                  lang === 'ur' ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'
                }`}
              />
            </div>

            {/* Status Pills */}
            <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-border-base">
              {['All', 'Draft', 'Sent', 'Closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold font-display transition-all cursor-pointer ${
                    statusFilter === status 
                      ? 'bg-primary text-black' 
                      : 'text-slate-400 hover:text-white'
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
                <tr className="bg-black/10 border-b border-border-base text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.customerName}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.location}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.contact}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.specs}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.investment}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{t.status}</th>
                  <th className={`px-6 py-4 ${lang === 'ur' ? 'text-left' : 'text-right'}`}>{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base/40 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400">{t.loading}</td>
                  </tr>
                ) : filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">{t.noLeads}</td>
                  </tr>
                ) : (
                  filteredProposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-white/5 transition-colors">
                      <td className={`px-6 py-4 font-bold text-white ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{proposal.customer_name}</td>
                      <td className={`px-6 py-4 text-slate-400 max-w-[200px] truncate ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{proposal.installation_address}</td>
                      <td className={`px-6 py-4 font-mono text-xs text-slate-400 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{proposal.contact_number}</td>
                      <td className={`px-6 py-4 font-mono text-xs text-slate-300 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>{proposal.system_size_kw} kWp</td>
                      <td className={`px-6 py-4 font-mono text-white ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
                        {lang === 'ur' ? `${proposal.total_investment?.toLocaleString()} روپے` : `${proposal.total_investment?.toLocaleString()} PKR`}
                      </td>
                      <td className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(proposal.status)}`}>
                          {proposal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(proposal)}
                          className="size-8 rounded-lg bg-surface-container hover:bg-primary hover:text-black flex items-center justify-center border border-border-base/50 text-slate-400 transition-all cursor-pointer"
                          title="Edit Customer Info"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(proposal.id)}
                          className="size-8 rounded-lg bg-red-950/20 hover:bg-red-500 hover:text-white flex items-center justify-center border border-red-500/20 text-red-400 transition-all cursor-pointer"
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
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-high border border-border-base rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
              <div className={`px-6 py-4 border-b border-border-base flex justify-between items-center ${
                lang === 'ur' ? 'flex-row-reverse' : ''
              }`}>
                <h3 className="font-display font-bold text-white text-lg">
                  {modalMode === 'create' ? `⚡ ${t.newCalc}` : `🖊️ ${t.updateBtn}`}
                </h3>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t.customerName} *</label>
                  <input 
                    type="text" 
                    name="customer_name" 
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder={lang === 'ur' ? 'صارف کا نام درج کریں' : 'Enter customer name'}
                    className={`w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary ${
                      lang === 'ur' ? 'text-right' : 'text-left'
                    }`}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">{t.contact} *</label>
                    <input 
                      type="text" 
                      name="contact_number" 
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      placeholder="e.g. 0300-1234567"
                      className={`w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary ${
                        lang === 'ur' ? 'text-right' : 'text-left'
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Email Address (Optional)</label>
                    <input 
                      type="email" 
                      name="email_address" 
                      value={formData.email_address}
                      onChange={handleInputChange}
                      placeholder="e.g. email@example.com"
                      className="w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t.location} *</label>
                  <textarea 
                    name="installation_address" 
                    value={formData.installation_address}
                    onChange={handleInputChange}
                    placeholder={lang === 'ur' ? 'انسٹالیشن کا پتہ درج کریں' : 'Enter site location address'}
                    rows="2"
                    className={`w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary ${
                      lang === 'ur' ? 'text-right' : 'text-left'
                    }`}
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">System (kWp)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      name="system_size_kw" 
                      value={formData.system_size_kw}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Investment (PKR)</label>
                    <input 
                      type="number" 
                      name="total_investment" 
                      value={formData.total_investment}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Pipeline Status</label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className={`pt-4 border-t border-border-base flex justify-end gap-3 ${
                  lang === 'ur' ? 'flex-row-reverse' : ''
                }`}>
                  <button 
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-surface-container border border-border-base text-white text-xs font-bold font-display cursor-pointer hover:border-white/20"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-primary hover:bg-white text-black text-xs font-bold font-display cursor-pointer shadow-md"
                  >
                    {modalMode === 'create' ? t.createBtn : t.updateBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lockout Quota Hard Block Modal */}
        {limitModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[#1c1f26] border-2 border-red-500/30 rounded-xl w-full max-w-md shadow-2xl p-6 text-center space-y-6 animate-bounce">
              <div className="size-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-500">
                <span className="material-symbols-outlined text-3xl">gavel</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display font-extrabold text-white text-xl">{t.limitTitle}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.limitBody}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleRequestOverride}
                  className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-white text-black font-display font-semibold transition-all cursor-pointer shadow-md text-xs"
                >
                  {t.requestOverride}
                </button>
                <button 
                  onClick={() => setLimitModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-surface-container border border-border-base text-white font-display font-semibold transition-all cursor-pointer text-xs"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </PageShell>
  );
}

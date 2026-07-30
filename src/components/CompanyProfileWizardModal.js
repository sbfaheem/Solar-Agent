'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function CompanyProfileWizardModal({ isOpen, onClose }) {
  const { company, setCompany, updateCompanyState, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('info'); // 'info', 'branding', 'documents', 'bank'

  const [formData, setFormData] = useState({
    companyName: company.companyName || company.name || 'SolarTech Pakistan',
    companyEmail: company.companyEmail || company.email || 'sales@solartech.pk',
    companyPhone: company.companyPhone || company.phone || company.contact || '+92 300 1234567',
    whatsapp: company.whatsapp || '+92 300 1234567',
    website: company.website || 'www.solartech.pk',
    address: company.address || 'Suite 104, Shahrah-e-Faisal',
    city: company.city || 'Karachi',
    country: company.country || 'Pakistan',
    taxNumber: company.taxNumber || 'NTN-9841203',
    brandColor: company.brandColor || '#b45309',
    secondaryColor: company.secondaryColor || '#0f172a',
    tagline: company.tagline || 'Authorized Solar EPC & Engineering Partner',
    footerText: company.footerText || `Thank you for choosing ${company.name || 'SolarTech Pakistan'}`,
    emailSignature: company.emailSignature || `${company.name || 'SolarTech Pakistan'} - B2B Solar Engineering Partner`,
    proposalPrefix: company.proposalPrefix || 'STP',
    bankName: company.bankName || 'Meezan Bank',
    accountTitle: company.accountTitle || company.name || 'SolarTech Pakistan',
    accountNumber: company.accountNumber || '010203040506',
    iban: company.iban || 'PK64MEZN00010203040506',
    companyLogo: company.companyLogo || company.logo_url || null
  });

  if (!isOpen) return null;

  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, companyLogo: reader.result }));
        showToast("📸 Company Logo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.companyEmail || !formData.companyPhone) {
      showToast("⚠️ Please enter Company Name, Email, and Phone Number.", "error");
      return;
    }

    const updatedCompany = {
      ...company,
      name: formData.companyName,
      companyName: formData.companyName,
      email: formData.companyEmail,
      companyEmail: formData.companyEmail,
      phone: formData.companyPhone,
      companyPhone: formData.companyPhone,
      whatsapp: formData.whatsapp,
      website: formData.website,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      taxNumber: formData.taxNumber,
      brandColor: formData.brandColor,
      secondaryColor: formData.secondaryColor,
      tagline: formData.tagline,
      footerText: formData.footerText,
      emailSignature: formData.emailSignature,
      proposalPrefix: (formData.proposalPrefix || 'SOL').toUpperCase(),
      bankName: formData.bankName,
      accountTitle: formData.accountTitle,
      accountNumber: formData.accountNumber,
      iban: formData.iban,
      companyLogo: formData.companyLogo,
      logo_url: formData.companyLogo,
      isProfileConfigured: true
    };

    setCompany(updatedCompany);
    if (updateCompanyState) {
      await updateCompanyState(updatedCompany);
    }

    showToast("✅ White-Label Distributor Profile Saved & Applied!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp text-slate-900 dark:text-white">
        
        {/* Wizard Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-[#b45309] text-white flex items-center justify-center font-bold text-xl shadow-md">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-lg">
                White-Label Company Profile Wizard
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Configure your company branding, logo, contact details, and document prefix for all customer proposals
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 dark:bg-[#282a2d] p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-display">
          <button 
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 rounded-lg transition-all ${activeTab === 'info' ? 'bg-[#b45309] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            🏢 Company Info
          </button>
          <button 
            onClick={() => setActiveTab('branding')}
            className={`flex-1 py-2 rounded-lg transition-all ${activeTab === 'branding' ? 'bg-[#b45309] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            🎨 Branding & Logo
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-2 rounded-lg transition-all ${activeTab === 'documents' ? 'bg-[#b45309] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            📄 Prefix & Docs
          </button>
          <button 
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-2 rounded-lg transition-all ${activeTab === 'bank' ? 'bg-[#b45309] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            🏦 Bank Wire
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          
          {/* TAB 1: COMPANY INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">COMPANY NAME *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. SolarTech Pakistan"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">OFFICIAL EMAIL *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.companyEmail}
                    onChange={e => setFormData({ ...formData, companyEmail: e.target.value })}
                    placeholder="sales@solartech.pk"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">PHONE NUMBER *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.companyPhone}
                    onChange={e => setFormData({ ...formData, companyPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">WHATSAPP NUMBER</label>
                  <input 
                    type="text" 
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">WEBSITE</label>
                  <input 
                    type="text" 
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="www.solartech.pk"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">OFFICE ADDRESS</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Suite 104, Shahrah-e-Faisal"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">CITY</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Karachi"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING & LOGO */}
          {activeTab === 'branding' && (
            <div className="space-y-4">
              
              {/* Logo Upload Box */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-700 rounded-2xl">
                <div className="size-16 rounded-2xl bg-[#b45309] text-white flex items-center justify-center font-bold text-xl overflow-hidden ring-4 ring-[#b45309]/20 flex-shrink-0">
                  {formData.companyLogo ? (
                    <img src={formData.companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span>{formData.companyName.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <label className="font-bold text-slate-900 dark:text-white block font-sans text-xs">Distributor Company Logo</label>
                  <p className="text-[11px] text-slate-500 font-sans">Upload your official high-res PNG logo for PDF proposal letterheads & emails</p>
                  
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#b45309] text-white text-xs font-bold cursor-pointer font-sans shadow-xs">
                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    <span>Upload Logo Image</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">PRIMARY BRAND COLOR</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={formData.brandColor}
                      onChange={e => setFormData({ ...formData, brandColor: e.target.value })}
                      className="size-10 rounded-xl cursor-pointer border-none bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={formData.brandColor}
                      onChange={e => setFormData({ ...formData, brandColor: e.target.value })}
                      className="flex-1 p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">COMPANY TAGLINE</label>
                  <input 
                    type="text" 
                    value={formData.tagline}
                    onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Authorized B2B Solar Engineering Partner"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">PROPOSAL FOOTER TEXT</label>
                <input 
                  type="text" 
                  value={formData.footerText}
                  onChange={e => setFormData({ ...formData, footerText: e.target.value })}
                  placeholder="Thank you for choosing SolarTech Pakistan"
                  className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PREFIX & DOCS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-1">
                <span className="font-bold text-[#b45309] block font-sans text-xs">Custom Proposal Numbering Format</span>
                <p className="text-[11px] text-amber-900 dark:text-amber-300 font-sans">
                  Set your custom prefix. All generated proposals and PDFs will automatically follow your format (e.g. <strong>{formData.proposalPrefix || 'SOL'}-2026-4891</strong>).
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">PROPOSAL PREFIX (e.g. SOL, SUN, STP, ABC)</label>
                <input 
                  type="text" 
                  value={formData.proposalPrefix}
                  onChange={e => setFormData({ ...formData, proposalPrefix: e.target.value.toUpperCase() })}
                  placeholder="STP"
                  maxLength={6}
                  className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-[#b45309] dark:text-amber-400 text-sm tracking-wider uppercase"
                />
              </div>
            </div>
          )}

          {/* TAB 4: BANK DETAILS */}
          {activeTab === 'bank' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">BANK NAME</label>
                  <input 
                    type="text" 
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Meezan Bank"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">ACCOUNT TITLE</label>
                  <input 
                    type="text" 
                    value={formData.accountTitle}
                    onChange={e => setFormData({ ...formData, accountTitle: e.target.value })}
                    placeholder="SolarTech Pakistan"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">ACCOUNT NUMBER</label>
                  <input 
                    type="text" 
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="010203040506"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-sans">IBAN</label>
                  <input 
                    type="text" 
                    value={formData.iban}
                    onChange={e => setFormData({ ...formData, iban: e.target.value })}
                    placeholder="PK64MEZN00010203040506"
                    className="w-full p-2.5 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="pt-4 flex items-center gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-display font-bold text-xs cursor-pointer text-center"
            >
              Cancel
            </button>
            
            <button 
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Save & Apply White-Label Profile</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

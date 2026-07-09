'use client';

import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import { useApp } from '../../context/AppContext';

export default function TeamSettings() {
  const { company, submitOfflinePayment, lang, showToast } = useApp();

  // Active Team members
  const [members, setMembers] = useState([
    { id: 1, name: 'Syed Bilal Faheem', email: 'bilalfaheem47@gmail.com', role: 'Super Admin', status: 'Active' },
    { id: 2, name: 'Majeed Shb', email: 'majeed@solarpak.com', role: 'Admin / Editor', status: 'Active' },
    { id: 3, name: 'Fahad Rizwan', email: 'fahad@rizwan.com', role: 'Field Installer', status: 'Active' }
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Field Installer');
  
  // Local billing form states
  const [selectedPlan, setSelectedPlan] = useState('Silver');
  const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' or 'cash'
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // API Integration configurations
  const [apiKeys, setApiKeys] = useState({
    googleMaps: 'AIzaSyA412...0912',
    ocrScanner: 'OCR_Stitch_9912...4412',
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) {
      showToast("⚠️ Please enter a valid email", "error");
      return;
    }
    const newMember = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending Invite'
    };
    setMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    showToast(`📩 Invitation email sent to ${inviteEmail}!`);
  };

  const handleOfflinePaymentSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'bank' && !uploadedFile) {
      showToast("⚠️ Please upload a payment transfer receipt screenshot!", "error");
      return;
    }
    const fileName = uploadedFile ? uploadedFile.name : `Cash_Ticket_${Date.now()}.png`;
    const ok = await submitOfflinePayment(selectedPlan, paymentMethod, fileName);
    if (ok) {
      setUploadedFile(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      showToast("📎 Payment receipt attached successfully!");
    }
  };

  // Translations
  const translations = {
    en: {
      teamHeader: "Workspace Members",
      inviteHeader: "Invite Collaborator",
      billingHeader: "Company Billing Portal",
      selectPlan: "Select Upgrade Plan Tier",
      bankDetails: "Corporate Banking Details",
      bankName: "Bank Name",
      accountTitle: "Account Title",
      accountNo: "Account Number",
      cashDetails: "Cash Branch Collection Instructions",
      cashInstructions: "Submit payments directly to our Islamabad Office or LESCO Region collection offices. Contact representative:",
      uploadLabel: "Upload Payment Receipt / Screenshot *",
      submitCheckout: "Submit offline checkout receipt",
      apiHeader: "API Integration Settings",
      pkr: "PKR",
      pkrSymbol: "Rs.",
      statusActive: "Active",
      statusPending: "Pending Verification",
      membersCount: "Users Total"
    },
    ur: {
      teamHeader: "ورک اسپیس ممبران",
      inviteHeader: "ٹیم ممبر کو مدعو کریں",
      billingHeader: "کمپنی بلنگ پورٹل",
      selectPlan: "اپ گریڈ سبسکرپشن پلان منتخب کریں",
      bankDetails: "کارپوریٹ بینک اکاؤنٹ کی تفصیلات",
      bankName: "بینک کا نام",
      accountTitle: "اکاؤنٹ ٹائٹل",
      accountNo: "اکاؤنٹ نمبر",
      cashDetails: "نقدی (کیش) کی ادائیگی کی ہدایات",
      cashInstructions: "ادائیگی براہ راست ہمارے اسلام آباد ہیڈ آفس یا ریجنل برانچ آفسز میں جمع کروائیں۔ نمائندے کا نمبر:",
      uploadLabel: "ادائیگی کی رسید / اسکرین شاٹ اپ لوڈ کریں *",
      submitCheckout: "رسید جمع کروائیں",
      apiHeader: "API انٹیگریشنز",
      pkr: "روپے",
      pkrSymbol: "روپے",
      statusActive: "فعال",
      statusPending: "پینڈنگ رسید تصدیق",
      membersCount: "کل ممبران"
    }
  };

  const t = translations[lang];

  return (
    <PageShell>
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        
        {/* Banner Headers */}
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
            {lang === 'ur' ? 'ورک اسپیس ترتیبات اور بلنگ' : 'Workspace Billing & Settings'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'ur' ? 'سبسکرپشنز اپ گریڈ کریں، رسیدیں اپ لوڈ کریں اور ٹیم انٹیگریشنز منظم کریں۔' : 'Configure workspace integrations, invite field installers, and audit subscription layers.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Billing Portal Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Plan Selector */}
            <div className="bg-surface-base border border-border-base rounded-xl p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="font-display font-bold text-white text-base">{t.billingHeader}</h3>
                <p className="text-xs text-slate-400 mt-1">Current Active Status: <span className="text-primary-container font-semibold">{company.plan} Plan ({company.billing_status})</span></p>
              </div>

              {/* Subscriptions Matrix Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { tier: 'Silver', quota: '30 Proposals', price: '30,000' },
                  { tier: 'Gold', quota: '50 Proposals', price: '50,000' },
                  { tier: 'Platinum', quota: '75 Proposals', price: '75,000' }
                ].map((plan) => (
                  <div 
                    key={plan.tier}
                    onClick={() => setSelectedPlan(plan.tier)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      selectedPlan === plan.tier
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border-base/40 bg-black/20 hover:border-border-base'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded border border-border-base text-slate-300 font-mono font-bold uppercase">{plan.quota}</span>
                      <h4 className="font-display font-extrabold text-white text-base mt-2">{plan.tier} Plan</h4>
                    </div>
                    <div className="font-mono text-sm font-extrabold text-primary-container mt-4 pt-2 border-t border-border-base/30">
                      {plan.price} {t.pkr} <span className="text-[10px] text-slate-500 font-medium font-sans">/mo</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Offline Manual Payments Gateway Forms */}
              <div className="border border-border-base/50 rounded-xl overflow-hidden bg-black/10">
                {/* Method Toggles */}
                <div className="flex border-b border-border-base bg-black/20 p-1">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex-1 py-2 text-center text-xs font-bold font-display cursor-pointer transition-all rounded-lg ${
                      paymentMethod === 'bank' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bank Transfer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex-1 py-2 text-center text-xs font-bold font-display cursor-pointer transition-all rounded-lg ${
                      paymentMethod === 'cash' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cash Payment
                  </button>
                </div>

                <form onSubmit={handleOfflinePaymentSubmit} className="p-5 space-y-4">
                  {/* Bank transfer content */}
                  {paymentMethod === 'bank' && (
                    <div className="space-y-4">
                      <div className="bg-black/30 border border-border-base rounded-lg p-4 space-y-2 text-xs font-mono">
                        <h4 className="text-white font-bold text-sm font-display mb-1">{t.bankDetails}</h4>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.bankName}:</span>
                          <span className="text-white font-bold">Bank Alfalah Pakistan</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.accountTitle}:</span>
                          <span className="text-white font-bold">Solar Agent Pvt Ltd</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t.accountNo}:</span>
                          <span className="text-white font-bold">0192-887162541</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">IBAN:</span>
                          <span className="text-white font-bold">PK82ALFA0192887162541</span>
                        </div>
                      </div>

                      {/* File Uploader Screenshot */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">{t.uploadLabel}</label>
                        <div className="relative border border-dashed border-border-base/50 rounded-lg p-4 text-center hover:border-primary transition-all bg-black/20 cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <span className="material-symbols-outlined text-xl text-slate-500">upload_file</span>
                          <div className="text-xs text-slate-300 font-semibold mt-1">
                            {uploadedFile ? uploadedFile.name : "Attach receipt photo"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash content */}
                  {paymentMethod === 'cash' && (
                    <div className="bg-black/30 border border-border-base rounded-lg p-4 text-xs space-y-2">
                      <h4 className="text-white font-bold text-sm font-display mb-1">{t.cashDetails}</h4>
                      <p className="text-slate-400 leading-relaxed font-sans">{t.cashInstructions}</p>
                      <div className="font-mono text-white font-bold text-sm pt-2">
                        +92 301 3377675 (Majeed Shb)
                      </div>
                    </div>
                  )}

                  {/* Submit checkout receipt */}
                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-primary hover:bg-white text-black font-display font-semibold transition-all cursor-pointer shadow-md text-xs text-center flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">payment</span>
                    {t.submitCheckout} ({selectedPlan} Plan)
                  </button>

                </form>
              </div>

            </div>

            {/* Team Members List */}
            <div className="bg-surface-base border border-border-base rounded-xl overflow-hidden shadow-sm">
              <div className={`px-6 py-4 bg-black/10 border-b border-border-base flex justify-between items-center ${
                lang === 'ur' ? 'flex-row-reverse' : ''
              }`}>
                <h3 className="font-display font-bold text-white text-base">{t.teamHeader}</h3>
                <span className="text-[10px] bg-slate-500/10 border border-border-base/50 text-slate-300 px-2 py-0.5 rounded font-bold uppercase">
                  {members.length} {t.membersCount}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/5 border-b border-border-base text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>Member Name</th>
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>Access Role</th>
                      <th className={`px-6 py-4 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base/40 text-sm">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{member.name}</div>
                          <div className="text-xs text-slate-500">{member.email}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-300">{member.role}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-accent-emerald border border-emerald-500/20`}>
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column - Invites and APIs */}
          <div className="space-y-6">
            
            {/* Invite box */}
            <div className="bg-surface-base border border-border-base rounded-xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-white text-base border-b border-border-base pb-3">
                {t.inviteHeader}
              </h3>
              <form onSubmit={handleInvite} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className={`w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary ${
                      lang === 'ur' ? 'text-right' : 'text-left'
                    }`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Role</label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-border-base rounded-lg text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Admin / Editor">Admin / Editor</option>
                    <option value="Field Installer">Field Installer</option>
                    <option value="Viewer Only">Viewer Only</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 rounded-lg bg-primary hover:bg-white text-black font-display font-semibold transition-all cursor-pointer shadow-md text-xs"
                >
                  Send Invite Link
                </button>
              </form>
            </div>

            {/* API Settings Box */}
            <div className="bg-surface-base border border-border-base rounded-xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-white text-base border-b border-border-base pb-3">
                {t.apiHeader}
              </h3>
              
              <div className="space-y-4 pt-4 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-slate-500">Google Maps Geocoding:</span>
                  <div className="font-bold text-white">{apiKeys.googleMaps}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500">OCR Scanner Token:</span>
                  <div className="font-bold text-white">{apiKeys.ocrScanner}</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </PageShell>
  );
}

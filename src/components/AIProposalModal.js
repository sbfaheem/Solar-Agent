'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateProposalMetrics } from '../lib/proposalEngine';

export default function AIProposalModal({ isOpen, onClose, initialData = {} }) {
  const { company, user, formatPrice, showToast, addLead } = useApp();

  const [customerName, setCustomerName] = useState(initialData.customerName || initialData.client_name || '');
  const [customerContact, setCustomerContact] = useState(initialData.customerContact || initialData.contact || '');
  const [customerEmail, setCustomerEmail] = useState(initialData.customerEmail || initialData.email || '');
  const [siteLocation, setSiteLocation] = useState(initialData.siteLocation || initialData.location || 'Peshawar, KPK');

  const [systemKw, setSystemKw] = useState(initialData.systemKw || initialData.capacity_kw || 10);
  const [panelCount, setPanelCount] = useState(initialData.panelCount || 18);
  const [panelWattage, setPanelWattage] = useState(initialData.panelWattage || 585);
  const [panelModel, setPanelModel] = useState(initialData.panelModel || 'Jinko Tiger Neo 585W TOPCon');
  const [inverterModel, setInverterModel] = useState(initialData.inverterModel || 'Inverex Nitrox 12kW Hybrid');
  const [monthlyUnits, setMonthlyUnits] = useState(initialData.monthlyUnits || 600);
  const [utilityProvider, setUtilityProvider] = useState(initialData.utilityProvider || 'IESCO');

  React.useEffect(() => {
    if (initialData) {
      if (initialData.customerName || initialData.client_name) setCustomerName(initialData.customerName || initialData.client_name);
      if (initialData.customerContact || initialData.contact) setCustomerContact(initialData.customerContact || initialData.contact);
      if (initialData.customerEmail || initialData.email) setCustomerEmail(initialData.customerEmail || initialData.email);
      if (initialData.siteLocation || initialData.location) setSiteLocation(initialData.siteLocation || initialData.location);
      if (initialData.systemKw || initialData.capacity_kw) setSystemKw(initialData.systemKw || initialData.capacity_kw);
      if (initialData.panelCount) setPanelCount(initialData.panelCount);
      if (initialData.panelWattage) setPanelWattage(initialData.panelWattage);
      if (initialData.panelModel) setPanelModel(initialData.panelModel);
      if (initialData.inverterModel) setInverterModel(initialData.inverterModel);
      if (initialData.monthlyUnits) setMonthlyUnits(initialData.monthlyUnits);
      if (initialData.utilityProvider) setUtilityProvider(initialData.utilityProvider);
    }
  }, [initialData]);

  const metrics = calculateProposalMetrics({
    systemCapacityKw: Number(systemKw),
    panelModel,
    panelWattage: Number(panelWattage),
    panelCount: Number(panelCount),
    inverterModel,
    batteryModel: initialData.batteryModel || null,
    totalInvestmentPkrOverride: initialData.totalInvestmentPkrOverride || null,
    annualSavingsOverride: initialData.annualSavingsOverride || null,
    monthlyUnits: Number(monthlyUnits),
    tariffRatePkr: 45,
    utilityProvider,
    customerName: customerName || 'Valued Client',
    customerContact: customerContact || '+92 300 1234567',
    customerEmail: customerEmail || 'client@solaragent.pk',
    siteLocation: siteLocation || 'Peshawar, Pakistan',
    companyName: company.name || user?.name || 'Solar Solutions Ltd',
    companyLogo: company.logo_url || user?.logo_url || null,
    companyEmail: user?.email || 'sales@solaragent.pk',
    companyPhone: '+92 300 9876543'
  });

  if (!isOpen) return null;

  const saveProposalLead = async () => {
    const leadData = {
      customer_name: customerName || 'Valued Client',
      contact_number: customerContact || '+92 300 1234567',
      email_address: customerEmail || 'client@example.com',
      installation_address: siteLocation || 'Pakistan',
      system_size_kw: Number(systemKw),
      total_investment: metrics.financials.totalInvestmentPkr,
      monthly_savings: metrics.financials.monthlySavingsPkr,
      inverter_model: inverterModel,
      panel_model: panelModel,
      panel_count: Number(panelCount),
      battery_model: initialData.batteryModel || null,
      monthly_units: Number(monthlyUnits),
      utility_provider: utilityProvider,
      status: 'Quoted',
      created_at: new Date().toISOString()
    };
    return await addLead(leadData);
  };

  const handlePrintPdf = async () => {
    await saveProposalLead();
    showToast("📄 Preparing PDF Document for Download & Print...");
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleSaveToDatabase = async () => {
    const created = await saveProposalLead();
    if (created) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
      
      <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-scaleUp overflow-hidden print:border-none print:shadow-none print:max-h-none print:rounded-none">
        
        {/* Modal Top Bar (Hidden during PDF Printing) */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 dark:bg-black/40 print:hidden">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#b45309] text-white flex items-center justify-center font-bold text-xl shadow-md">
              <span className="material-symbols-outlined">picture_as_pdf</span>
            </div>
            <div>
              <h2 className="font-display font-extrabold text-slate-900 dark:text-white text-base">
                AI Solar Proposal Generator (30-Sec PDF)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Automated engineering calculations, financial ROI payback, and distributor letterhead
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={handlePrintPdf}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Print / Save as PDF</span>
            </button>

            <button 
              onClick={handleSaveToDatabase}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>Save to CRM</span>
            </button>

            <button 
              onClick={onClose}
              className="size-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center cursor-pointer hover:bg-slate-300"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Editable Input Parameters Bar */}
        <div className="p-4 bg-[#fffbeb] dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900 grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs print:hidden">
          <div>
            <label className="text-[10px] font-bold text-amber-900 dark:text-amber-300 block">CUSTOMER NAME</label>
            <input 
              type="text" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)}
              placeholder="e.g. Habib Textile Mills"
              className="w-full p-2 bg-white dark:bg-black/40 border border-amber-300 rounded-lg text-slate-900 dark:text-white font-bold text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-amber-900 dark:text-amber-300 block">EMAIL ADDRESS</label>
            <input 
              type="email" 
              value={customerEmail} 
              onChange={e => setCustomerEmail(e.target.value)}
              placeholder="e.g. client@example.com"
              className="w-full p-2 bg-white dark:bg-black/40 border border-amber-300 rounded-lg text-slate-900 dark:text-white font-bold text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-amber-900 dark:text-amber-300 block">CONTACT NUMBER</label>
            <input 
              type="text" 
              value={customerContact} 
              onChange={e => setCustomerContact(e.target.value)}
              placeholder="e.g. 0300-9876543"
              className="w-full p-2 bg-white dark:bg-black/40 border border-amber-300 rounded-lg text-slate-900 dark:text-white font-bold text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-amber-900 dark:text-amber-300 block">SYSTEM CAPACITY (kW)</label>
            <input 
              type="number" 
              value={systemKw} 
              onChange={e => setSystemKw(e.target.value)}
              className="w-full p-2 bg-white dark:bg-black/40 border border-amber-300 rounded-lg text-slate-900 dark:text-white font-bold text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-amber-900 dark:text-amber-300 block">MONTHLY UNITS (kWh)</label>
            <input 
              type="number" 
              value={monthlyUnits} 
              onChange={e => setMonthlyUnits(e.target.value)}
              className="w-full p-2 bg-white dark:bg-black/40 border border-amber-300 rounded-lg text-slate-900 dark:text-white font-bold text-xs"
            />
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-ai-proposal, #printable-ai-proposal * {
              visibility: visible !important;
            }
            #printable-ai-proposal {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 20px !important;
              background: #ffffff !important;
              color: #000000 !important;
              box-shadow: none !important;
              border: none !important;
              overflow: visible !important;
            }
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
          }
        ` }} />

        {/* PRINTABLE PDF DOCUMENT LAYOUT CANVAS */}
        <div id="printable-ai-proposal" className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-8 bg-white text-slate-900 print:p-0 print:overflow-visible font-sans">
          
          {/* Document Header Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {metrics.company.logo ? (
                  <img src={metrics.company.logo} alt="Company Logo" className="h-12 w-auto object-contain rounded-lg border border-slate-300" />
                ) : (
                  <span className="size-12 rounded-2xl bg-[#b45309] text-white flex items-center justify-center font-bold text-xl font-mono shadow-md">
                    {metrics.company.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div>
                  <h1 className="font-display font-extrabold text-2xl text-slate-900 leading-tight">{metrics.company.name}</h1>
                  <p className="text-xs text-slate-500 font-mono">B2B Authorized Solar EPC & Engineering Partner</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-mono">
                Email: {metrics.company.email} | Tel: {metrics.company.phone}
              </p>
            </div>

            <div className="text-right space-y-1 font-mono text-xs">
              <div className="inline-block px-3 py-1 bg-amber-100 text-[#b45309] font-bold rounded-lg uppercase tracking-wider text-[11px]">
                SOLAR ENGINEERING PROPOSAL
              </div>
              <div className="font-bold text-slate-900 text-sm">{metrics.proposalId}</div>
              <div className="text-slate-500">Date: {metrics.issueDate}</div>
              <div className="text-slate-500">Valid Until: {metrics.expiryDate}</div>
            </div>
          </div>

          {/* Section 1: Customer & Site Details Grid */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs font-mono">
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#b45309] uppercase tracking-wider font-sans text-xs border-b border-slate-200 pb-1">
                CLIENT INFORMATION
              </h3>
              <div><strong className="text-slate-500 font-sans">CLIENT NAME:</strong> <span className="font-bold text-slate-900">{metrics.customer.name}</span></div>
              <div><strong className="text-slate-500 font-sans">CONTACT:</strong> <span className="font-bold text-slate-900">{metrics.customer.contact}</span></div>
              <div><strong className="text-slate-500 font-sans">EMAIL:</strong> <span className="font-bold text-slate-900">{metrics.customer.email}</span></div>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-[#b45309] uppercase tracking-wider font-sans text-xs border-b border-slate-200 pb-1">
                SITE LOCATION & UTILITY
              </h3>
              <div><strong className="text-slate-500 font-sans">SITE LOCATION:</strong> <span className="font-bold text-slate-900">{metrics.customer.location}</span></div>
              <div><strong className="text-slate-500 font-sans">UTILITY DISCO:</strong> <span className="font-bold text-slate-900">{metrics.customer.utility} (Net Metering Eligible)</span></div>
              <div><strong className="text-slate-500 font-sans">BASELINE TARIFF:</strong> <span className="font-bold text-slate-900">{metrics.financials.tariffRatePkr} PKR / kWh</span></div>
            </div>
          </div>

          {/* Section 2: Bill Analysis & Recommended System Specs */}
          <div className="space-y-3">
            <h3 className="font-display font-extrabold text-base text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>⚡ Technical & Engineering System Specifications</span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {metrics.engineering.systemCapacityKw} kW System Size
              </span>
            </h3>

            <div className={`grid grid-cols-1 ${metrics.engineering.batteryModel ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 text-xs font-mono`}>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Solar Inverter</span>
                <div className="font-extrabold text-slate-900 text-sm font-sans">{metrics.engineering.inverterModel}</div>
                <p className="text-[11px] text-amber-800">Smart Dual MPPT / Grid-Tie & Battery Ready</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Solar PV Modules</span>
                <div className="font-extrabold text-slate-900 text-sm font-sans">{metrics.engineering.panelCount}x {metrics.engineering.panelModel}</div>
                <p className="text-[11px] text-blue-800">Total DC Capacity: {(metrics.engineering.totalDcCapacityW / 1000).toFixed(2)} kWp</p>
              </div>

              {metrics.engineering.batteryModel && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Lithium Energy Storage</span>
                  <div className="font-extrabold text-slate-900 text-sm font-sans">{metrics.engineering.batteryModel}</div>
                  <p className="text-[11px] text-purple-800">High-Density LiFePO4 Energy Bank</p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Annual Energy Production</span>
                <div className="font-extrabold text-emerald-900 text-sm font-sans">{metrics.engineering.annualEnergyKwh.toLocaleString()} kWh / Year</div>
                <p className="text-[11px] text-emerald-800">~{metrics.engineering.monthlyEnergyKwh} kWh Estimated Monthly</p>
              </div>
            </div>
          </div>

          {/* Section 3: Financial ROI, Monthly Savings & Payback Period */}
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-base text-slate-900 border-b border-slate-200 pb-2">
              📊 Financial ROI & Payback Analysis
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Estimated Investment</span>
                <div className="font-display font-black text-xl text-slate-900">{formatPrice(metrics.financials.totalInvestmentPkr)}</div>
                <span className="text-[10px] text-slate-400 font-mono">Turnkey Turnkey EPC</span>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-center space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-mono">Est. Monthly Savings</span>
                <div className="font-display font-black text-xl text-emerald-700">{formatPrice(metrics.financials.monthlySavingsPkr)}</div>
                <span className="text-[10px] text-emerald-600 font-mono">Direct Bill Reduction</span>
              </div>

              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-center space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono">Payback Period</span>
                <div className="font-display font-black text-xl text-[#b45309]">{metrics.financials.paybackFormatted}</div>
                <span className="text-[10px] text-amber-700 font-mono">Fast Investment Recovery</span>
              </div>

              <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50 text-center space-y-1">
                <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider font-mono">Annual ROI %</span>
                <div className="font-display font-black text-xl text-purple-700">{metrics.financials.roiPercentage}% / Year</div>
                <span className="text-[10px] text-purple-600 font-mono">Internal Return Rate</span>
              </div>
            </div>

            {/* 25-Year Cumulative Savings Table */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-800 font-display uppercase tracking-wider">
                📈 25-Year Cumulative Savings Projection (Factoring 8% Annual Grid Tariff Inflation)
              </h4>
              <div className="grid grid-cols-6 gap-2 text-center font-mono text-xs">
                {metrics.financials.savingsChartData.map((d, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">{d.year}</span>
                    <span className="font-bold text-emerald-700 text-xs">{formatPrice(d.savings)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Environmental Impact Badges */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase font-mono">
                <span className="material-symbols-outlined text-sm">eco</span>
                <span>Environmental Clean Energy Footprint</span>
              </div>
              <h4 className="font-display font-black text-lg">Clean Solar Energy Impact</h4>
            </div>

            <div className="flex items-center gap-6 font-mono text-center">
              <div>
                <span className="text-2xl font-black text-emerald-300 block">{metrics.environment.annualCo2ReductionTons}</span>
                <span className="text-[10px] text-emerald-100 uppercase">Tons CO₂ Saved / Yr</span>
              </div>
              <div className="h-8 w-px bg-emerald-700"></div>
              <div>
                <span className="text-2xl font-black text-amber-300 block">{metrics.environment.equivalentTreesPlanted}</span>
                <span className="text-[10px] text-amber-100 uppercase">Trees Planted Equivalent</span>
              </div>
            </div>
          </div>

          {/* Section 5: Signature & Terms Footer */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs font-mono text-slate-500">
            <div className="space-y-1">
              <h5 className="font-bold text-slate-900 uppercase font-sans">Warranty & Quality Assurance</h5>
              <p className="text-[11px] leading-relaxed">
                PV Modules feature 12-Year Workmanship & 25-Year Linear Power Output Warranty. Inverter carries 5-Year Standard Warranty.
              </p>
            </div>

            <div className="text-right space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">AUTHORIZATION & SIGNATURE</span>
              <div className="h-10 border-b border-slate-400 w-48 ml-auto"></div>
              <p className="font-bold text-slate-900">{metrics.company.name} Engineering Desk</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

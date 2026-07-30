'use client';

import React, { useState, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import SolarCalculatorModal from '../../components/SolarCalculatorModal';
import AIProposalModal from '../../components/AIProposalModal';
import { useApp } from '../../context/AppContext';
import { saveLivePresentation } from '../../lib/firebaseService';

export default function Configuration() {
  const { 
    calcParams, 
    setCalcParams, 
    currentLead, 
    setCurrentLead, 
    addLead, 
    updateLead, 
    inverters,
    solarPanels,
    lang, 
    showToast,
    formatPrice
  } = useApp();

  const [activeStep, setActiveStep] = useState(1); 
  const [inverterCategory, setInverterCategory] = useState('All'); 
  const [panelCategory, setPanelCategory] = useState('All'); 
  
  // OCR simulator state inside step 1
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // Modal State for Calculator
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [aiProposalModalOpen, setAiProposalModalOpen] = useState(false);

  // Edit Lead Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    contact_number: '',
    installation_address: '',
    email_address: '',
    status: 'Draft',
    system_size_kw: 0.0,
    total_investment: 0
  });

  // Client Details Modal State (triggered when clicking "Save Proposal to Database")
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    contact: '',
    email: '',
    location: ''
  });
  const [savingProposal, setSavingProposal] = useState(false);

  // Complete Pakistani Solar Inverters & Storage Hardware Catalog
  const defaultInvertersList = [
    { id: 'inv-1', brand_name: 'Inverex', model_name: 'Nitrox 12kW 3P Hybrid', rated_kw: 12.0, type: 'Hybrid', estimated_base_price_pkr: 480000, official_url: 'https://inverex.com.pk' },
    { id: 'inv-2', brand_name: 'Inverex', model_name: 'Nitrox 8kW 3P Hybrid', rated_kw: 8.0, type: 'Hybrid', estimated_base_price_pkr: 375000, official_url: 'https://inverex.com.pk' },
    { id: 'inv-3', brand_name: 'Inverex', model_name: 'Veyron 5.2kW On-Grid', rated_kw: 5.2, type: 'On-Grid', estimated_base_price_pkr: 195000, official_url: 'https://inverex.com.pk' },
    { id: 'inv-4', brand_name: 'Inverex', model_name: 'Aerox 3.2kW Off-Grid', rated_kw: 3.2, type: 'Off-Grid', estimated_base_price_pkr: 145000, official_url: 'https://inverex.com.pk' },
    { id: 'inv-5', brand_name: 'Growatt', model_name: 'MIN 6000TL-X 6kW On-Grid', rated_kw: 6.0, type: 'On-Grid', estimated_base_price_pkr: 220000, official_url: 'https://www.ginverter.com' },
    { id: 'inv-6', brand_name: 'Growatt', model_name: 'SPH 10000TL3 10kW Hybrid', rated_kw: 10.0, type: 'Hybrid', estimated_base_price_pkr: 520000, official_url: 'https://www.ginverter.com' },
    { id: 'inv-7', brand_name: 'Growatt', model_name: 'SPF 5000ES 5kW Off-Grid', rated_kw: 5.0, type: 'Off-Grid', estimated_base_price_pkr: 185000, official_url: 'https://www.ginverter.com' },
    { id: 'inv-8', brand_name: 'Solis', model_name: 'S6 10kW 3P On-Grid', rated_kw: 10.0, type: 'On-Grid', estimated_base_price_pkr: 320000, official_url: 'https://www.solisinverters.com' },
    { id: 'inv-9', brand_name: 'Solis', model_name: 'RAI 3K 3kW Hybrid', rated_kw: 3.0, type: 'Hybrid', estimated_base_price_pkr: 210000, official_url: 'https://www.solisinverters.com' },
    { id: 'inv-10', brand_name: 'Crown Micro', model_name: 'Elego 6kW Off-Grid', rated_kw: 6.0, type: 'Off-Grid', estimated_base_price_pkr: 165000, official_url: 'https://crownmicro.com.pk' },
    { id: 'inv-11', brand_name: 'Crown Micro', model_name: 'IP65 15kW Hybrid', rated_kw: 15.0, type: 'Hybrid', estimated_base_price_pkr: 640000, official_url: 'https://crownmicro.com.pk' },
    { id: 'inv-12', brand_name: 'Huawei', model_name: 'SUN2000-10KTL-M1 10kW On-Grid', rated_kw: 10.0, type: 'On-Grid', estimated_base_price_pkr: 410000, official_url: 'https://solar.huawei.com' },
    { id: 'inv-13', brand_name: 'Huawei', model_name: 'LUNA2000 10kWh Lithium Battery', rated_kw: 10.0, type: 'Lithium Battery', estimated_base_price_pkr: 890000, official_url: 'https://solar.huawei.com' },
    { id: 'inv-14', brand_name: 'GoodWe', model_name: 'GW10K-ET 10kW Hybrid 3P', rated_kw: 10.0, type: 'Hybrid', estimated_base_price_pkr: 495000, official_url: 'https://www.goodwe.com' },
    { id: 'inv-15', brand_name: 'Pylontech', model_name: 'US3000C 3.5kWh Lithium Battery', rated_kw: 3.5, type: 'Lithium Battery', estimated_base_price_pkr: 340000, official_url: 'https://www.pylontech.com.cn' }
  ];

  // Complete Pakistani Solar Panels Catalog
  const defaultPanelsList = [
    { id: 'pnl-1', manufacturer_name: 'Jinko Solar', model_name: 'Tiger Neo N-Type 585W', default_wattage: 585, price_per_watt_pkr: 41.5, cell_type: 'N-Type TOPCon', official_url: 'https://www.jinkosolar.com' },
    { id: 'pnl-2', manufacturer_name: 'Jinko Solar', model_name: 'Tiger Neo N-Type 615W', default_wattage: 615, price_per_watt_pkr: 42.0, cell_type: 'N-Type TOPCon', official_url: 'https://www.jinkosolar.com' },
    { id: 'pnl-3', manufacturer_name: 'Longi Solar', model_name: 'Hi-MO 6 Explorer 580W', default_wattage: 580, price_per_watt_pkr: 40.0, cell_type: 'HPBC Monofacial', official_url: 'https://www.longi.com' },
    { id: 'pnl-4', manufacturer_name: 'Longi Solar', model_name: 'Hi-MO 7 Bifacial 610W', default_wattage: 610, price_per_watt_pkr: 42.5, cell_type: 'N-Type Bifacial', official_url: 'https://www.longi.com' },
    { id: 'pnl-5', manufacturer_name: 'JA Solar', model_name: 'JAM72D40 580W N-Type', default_wattage: 580, price_per_watt_pkr: 39.5, cell_type: 'N-Type TOPCon', official_url: 'https://www.jasolar.com' },
    { id: 'pnl-6', manufacturer_name: 'JA Solar', model_name: 'DeepBlue 4.0 Pro 605W', default_wattage: 605, price_per_watt_pkr: 41.0, cell_type: 'N-Type TOPCon', official_url: 'https://www.jasolar.com' },
    { id: 'pnl-7', manufacturer_name: 'Canadian Solar', model_name: 'HiKu7 Mono PERC 655W', default_wattage: 655, price_per_watt_pkr: 43.0, cell_type: 'Mono PERC', official_url: 'https://www.canadiansolar.com' },
    { id: 'pnl-8', manufacturer_name: 'Canadian Solar', model_name: 'TOPBiHiKu7 690W', default_wattage: 690, price_per_watt_pkr: 44.5, cell_type: 'N-Type Bifacial', official_url: 'https://www.canadiansolar.com' },
    { id: 'pnl-9', manufacturer_name: 'Trina Solar', model_name: 'Vertex N 700W+', default_wattage: 700, price_per_watt_pkr: 45.0, cell_type: 'N-Type TOPCon', official_url: 'https://www.trinasolar.com' }
  ];

  // Complete Pakistani Lithium-Ion Batteries Catalog (5kW to 16kW)
  const defaultBatteriesList = [
    { id: 'bat-1', brand_name: 'Pylontech', model_name: 'US3000C 3.5kWh Lithium Storage', capacity_kwh: 3.5, type: 'Lithium LiFePO4', estimated_price_pkr: 340000 },
    { id: 'bat-2', brand_name: 'Inverex', model_name: 'Powerwall 5.12kWh 48V LiFePO4', capacity_kwh: 5.12, type: 'Wall Mount LiFePO4', estimated_price_pkr: 320000 },
    { id: 'bat-3', brand_name: 'Pylontech', model_name: 'US5000 4.8kWh Lithium Bank', capacity_kwh: 4.8, type: 'Rackmount LiFePO4', estimated_price_pkr: 460000 },
    { id: 'bat-4', brand_name: 'Huawei', model_name: 'LUNA2000 5.0kWh Lithium Module', capacity_kwh: 5.0, type: 'High Voltage LUNA', estimated_price_pkr: 490000 },
    { id: 'bat-5', brand_name: 'Felicity Solar', model_name: 'LPBF48175 8.7kWh LiFePO4', capacity_kwh: 8.7, type: 'Deep Cycle LiFePO4', estimated_price_pkr: 620000 },
    { id: 'bat-6', brand_name: 'Huawei', model_name: 'LUNA2000 10.0kWh High Voltage System', capacity_kwh: 10.0, type: 'High Voltage LUNA', estimated_price_pkr: 890000 },
    { id: 'bat-7', brand_name: 'Felicity Solar', model_name: 'Lux-E 12.5kWh Powerwall', capacity_kwh: 12.5, type: 'Smart Wall Mount', estimated_price_pkr: 880000 },
    { id: 'bat-8', brand_name: 'Huawei', model_name: 'LUNA2000 15.0kWh High Voltage System', capacity_kwh: 15.0, type: 'High Voltage LUNA', estimated_price_pkr: 1280000 },
    { id: 'bat-9', brand_name: 'Crown Micro', model_name: 'IP65 16.0kWh Powerwall System', capacity_kwh: 16.0, type: 'Heavy Duty Powerwall', estimated_price_pkr: 1120000 }
  ];

  const activeInvertersList = (inverters && inverters.length > 0) ? inverters : defaultInvertersList;
  const activePanelsList = (solarPanels && solarPanels.length > 0) ? solarPanels : defaultPanelsList;

  // Auto-Select Default Hardware if missing
  useEffect(() => {
    if (!calcParams.selectedInverter && activeInvertersList.length > 0) {
      setCalcParams(prev => ({ ...prev, selectedInverter: activeInvertersList[0] }));
    }
    if (!calcParams.selectedPanel && activePanelsList.length > 0) {
      setCalcParams(prev => ({ ...prev, selectedPanel: activePanelsList[0] }));
    }
  }, [activeInvertersList, activePanelsList]);

  // Load Lead details into state when lead is active
  useEffect(() => {
    if (currentLead) {
      if (currentLead.system_size_kw) {
        const units = Math.round(currentLead.system_size_kw * 120);
        setCalcParams(prev => ({ ...prev, monthlyUnits: units }));
      }
    }
  }, [currentLead]);

  const handleOpenEditModal = () => {
    if (!currentLead) {
      showToast(lang === 'ur' ? "⚠️ پہلے ایک پروجیکٹ لیڈ کو منتخب کریں!" : "⚠️ Please select or create a project lead first!", "error");
      return;
    }
    setEditFormData({
      customer_name: currentLead.customer_name || '',
      contact_number: currentLead.contact_number || '',
      installation_address: currentLead.installation_address || '',
      email_address: currentLead.email_address || currentLead.email || '',
      status: currentLead.status || 'Draft',
      system_size_kw: currentLead.system_size_kw || 0.0,
      total_investment: currentLead.total_investment || 0
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updated = await updateLead(currentLead.id, editFormData);
    if (updated) {
      setCurrentLead(updated);
      setEditModalOpen(false);
    }
  };

  // Real Gemini Vision OCR upload handler
  const processBillFile = async (file) => {
    if (!file) return;
    setOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ocr-bill', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const units = Number(data.monthlyUnits || data.monthly_units || 256);
        const discoName = data.disco || 'KE';
        setOcrResult({
          ...data,
          monthlyUnits: units,
          monthly_units: units
        });
        setCalcParams(prev => ({ 
          ...prev, 
          monthlyUnits: units,
          utilityProvider: discoName === 'KE' ? 'K-Electric' : discoName
        }));
        showToast(
          lang === 'ur' 
            ? `⚡ ${discoName} بل سے ${units} یونٹس خود بخود حاصل کر لیے گئے!` 
            : `⚡ Parsed ${units} kWh units from ${discoName} bill!`
        );
      } else {
        showToast("⚠️ Could not parse bill details. Using default units.", "error");
      }
    } catch (err) {
      showToast("⚠️ OCR processing error", "error");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    processBillFile(file);
  };

  // Step Validation & Navigation Handler
  const handleGoToStep = (targetStep) => {
    if (targetStep === 2) {
      if (!calcParams.monthlyUnits || Number(calcParams.monthlyUnits) <= 0) {
        showToast(
          lang === 'ur'
            ? "⚠️ آگے بڑھنے کے لیے پہلے اپنے بل کی تصویر اپلوڈ کریں یا ماہانہ یونٹس درج کریں!"
            : "⚠️ Please upload an electricity bill or enter monthly units (kWh) to proceed to Step 2!",
          "error"
        );
        return false;
      }
    } else if (targetStep === 3) {
      if (!calcParams.monthlyUnits || Number(calcParams.monthlyUnits) <= 0) {
        showToast(
          lang === 'ur'
            ? "⚠️ آگے بڑھنے کے لیے پہلے اپنے بل کی تصویر اپلوڈ کریں یا ماہانہ یونٹس درج کریں!"
            : "⚠️ Please upload an electricity bill or enter monthly units (kWh) to proceed!",
          "error"
        );
        setActiveStep(1);
        return false;
      }
      if (!calcParams.selectedInverter || !calcParams.selectedPanel) {
        showToast(
          lang === 'ur'
            ? "⚠️ آگے بڑھنے کے لیے ایک انورٹر اور ایک سولر پینل منتخب کریں!"
            : "⚠️ Please select both an Inverter and a Solar Panel model from the catalog to proceed to Step 3!",
          "error"
        );
        setActiveStep(2);
        return false;
      }
    }

    setActiveStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  };

  // Engineering Calculations
  const calculateSystemSize = () => {
    const units = Number(calcParams.monthlyUnits) || 0;
    if (units <= 0) return 0.0;
    const dailyKwh = units / 30;
    const psh = 5.2; 
    const kw = (dailyKwh / psh) * 1.25; 
    return parseFloat(kw.toFixed(2));
  };

  const systemSize = calculateSystemSize();
  const panelCapacityW = calcParams.selectedPanel ? (calcParams.selectedPanel.default_wattage || calcParams.selectedPanel.wattage) : 580;
  const panelCount = systemSize > 0 ? Math.ceil((systemSize * 1000) / panelCapacityW) : 0;

  const calculateTotalCost = () => {
    if (systemSize <= 0) return 0;
    const inverterCost = calcParams.selectedInverter ? (calcParams.selectedInverter.estimated_base_price_pkr || calcParams.selectedInverter.cost_pkr || 240000) : 0;
    const panelPricePerWatt = calcParams.selectedPanel ? (calcParams.selectedPanel.price_per_watt_pkr || calcParams.selectedPanel.cost_per_watt || 40.0) : 0;
    const batteryCost = (calcParams.connectionType === 'Hybrid' || calcParams.connectionType === 'Off-Grid') && calcParams.selectedBattery 
      ? (calcParams.selectedBattery.estimated_price_pkr || calcParams.selectedBattery.cost_pkr || 0) 
      : 0;
    const panelsCost = (systemSize * 1000) * panelPricePerWatt;
    const structureAndWiring = systemSize * 15000;
    const installationNet = 40000;
    return Math.round(inverterCost + panelsCost + batteryCost + structureAndWiring + installationNet);
  };

  const totalCost = calculateTotalCost();
  const annualSavings = systemSize > 0 ? Math.round(systemSize * 120 * 12 * 45) : 0; 
  const paybackYears = annualSavings > 0 ? parseFloat((totalCost / annualSavings).toFixed(1)) : 0;

  // Filter Inverters & Batteries
  const filteredInverters = activeInvertersList.filter(inv => {
    if (inverterCategory === 'All') return true;
    if (inverterCategory === 'Hybrid') return inv.type === 'Hybrid';
    if (inverterCategory === 'On-Grid') return inv.type === 'On-Grid';
    if (inverterCategory === 'Off-Grid') return inv.type === 'Off-Grid';
    if (inverterCategory === 'Lithium Battery') return inv.type === 'Lithium Battery';
    return true;
  });

  // Filter Solar Panels
  const filteredPanels = activePanelsList.filter(p => {
    const w = p.default_wattage || p.wattage || 580;
    if (panelCategory === 'All') return true;
    if (panelCategory === '575W-585W') return w >= 575 && w <= 585;
    if (panelCategory === '600W-620W') return w >= 600 && w <= 620;
    if (panelCategory === '650W+') return w >= 650;
    if (panelCategory === 'N-Type TOPCon') return (p.cell_type || '').includes('N-Type');
    return true;
  });

  // Broadcasting Changes to Live Customer Sync Channel
  useEffect(() => {
    if (calcParams.selectedInverter && calcParams.selectedPanel) {
      saveLivePresentation({
        systemSize,
        panelCount,
        panelModel: calcParams.selectedPanel.model_name || calcParams.selectedPanel.model,
        inverterModel: calcParams.selectedInverter.model_name || calcParams.selectedInverter.model,
        totalCost,
        annualSavings,
        paybackYears,
        utilityProvider: calcParams.utilityProvider,
        connectionType: calcParams.connectionType
      });
    }
  }, [systemSize, panelCount, calcParams.selectedInverter, calcParams.selectedPanel, totalCost, annualSavings, paybackYears, calcParams.utilityProvider, calcParams.connectionType]);

  // Open Client Details Modal when clicking "Save Proposal to Database"
  const handleSaveProposal = () => {
    if (currentLead) {
      setClientForm({
        name: currentLead.customer_name || '',
        contact: currentLead.contact_number || '',
        email: currentLead.email_address || currentLead.email || '',
        location: currentLead.installation_address || ''
      });
    } else {
      setClientForm({
        name: '',
        contact: '',
        email: '',
        location: ''
      });
    }
    setClientModalOpen(true);
  };

  // Submit Client Details Modal & Link Proposal to Database
  const handleConfirmSaveProposal = async (e) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.contact || !clientForm.location) {
      showToast(lang === 'ur' ? "⚠️ براہ کرم تمام ضروری خانے پر کریں!" : "⚠️ Please fill all required fields", "error");
      return;
    }

    setSavingProposal(true);

    const specs = {
      customer_name: clientForm.name,
      contact_number: clientForm.contact,
      email_address: clientForm.email,
      email: clientForm.email,
      installation_address: clientForm.location,
      system_size_kw: systemSize,
      total_investment: totalCost,
      annual_savings_pkr: annualSavings,
      payback_years: paybackYears,
      status: 'Sent'
    };

    if (currentLead) {
      const updated = await updateLead(currentLead.id, specs);
      if (updated) {
        setCurrentLead(updated);
        showToast(lang === 'ur' ? `⚡ ${clientForm.name} کا پروپوزل اپ ڈیٹ ہو گیا!` : `⚡ Proposal updated for ${clientForm.name}!`);
      }
    } else {
      const created = await addLead(specs);
      if (created) {
        setCurrentLead(created);
        showToast(lang === 'ur' ? `⚡ ${clientForm.name} کا پروپوزل ڈیٹا بیس میں محفوظ کر لیا گیا!` : `⚡ Proposal saved to database for ${clientForm.name}!`);
      }
    }

    setSavingProposal(false);
    setClientModalOpen(false);
  };

  // Translations
  const translations = {
    en: {
      editBanner: "Solar System Engineering & Customization",
      noLead: "Configure specs (unlinked lead mode)",
      activeLead: "Editing specs for Customer:",
      step1: "1. Load Profile",
      step2: "2. Hardware Matching",
      step3: "3. Final Proposal",
      profileTitle: "Step 1: Energy Profiling",
      ocrMode: "OCR Scanner",
      flexMode: "Flexible History",
      ocrHeading: "K-Electric / DISCO Bill OCR Parser",
      ocrSub: "Drag and drop K-Electric bill screenshot to auto-extract units",
      monthlyUnitsLabel: "Monthly Bill Consumption (kWh Units)",
      connectionTypeLabel: "Grid Connection Standard",
      hardwareTitle: "Step 2: Solar Panels & Inverters Matching",
      nextHardware: "Next Step: Select Hardware ➔",
      reviewBtn: "Review Final Proposal ➔",
      proposalTitle: "Proposal Summary",
      totalInvestment: "TOTAL INVESTMENT",
      annualSavingsLabel: "ANNUAL ENERGY SAVINGS",
      paybackLabel: "PAYBACK PERIOD",
      saveProposal: "Save Proposal to Database",
      currentSelections: "Selected Hardware Overview",
      totalEstimate: "ESTIMATED TOTAL INVESTMENT"
    },
    ur: {
      editBanner: "سولر سسٹم انجینئرنگ اور کسٹمائزیشن",
      noLead: "ترتیبات ایڈجسٹ کریں",
      activeLead: "کسٹمر پروپوزل ترمیم:",
      step1: "1. لوڈ پروفائل",
      step2: "2. ہارڈویئر میچنگ",
      step3: "3. حتمی پروپوزل",
      profileTitle: "مرحلہ 1: بجلی کے استعمال کا جائزہ",
      ocrMode: "او سی آر سکینر",
      flexMode: "ماہانہ ریکارڈ",
      ocrHeading: "کے الیکٹرک / ڈسکو بل او سی آر ہینڈلر",
      ocrSub: "کے الیکٹرک بل کی تصویر اپلوڈ کریں تا کہ یونٹس خود بخود حاصل ہوں",
      monthlyUnitsLabel: "ماہانہ بجلی کے یونٹس (kWh)",
      connectionTypeLabel: "کنکشن کی قسم",
      hardwareTitle: "مرحلہ 2: سولر پینل اور انورٹر کا انتخاب",
      nextHardware: "اگلا مرحلہ: ہارڈویئر منتخب کریں ➔",
      reviewBtn: "حتمی پروپوزل کا جائزہ لیں ➔",
      proposalTitle: "پروپوزل کا خلاصہ",
      totalInvestment: "کل سرمایہ کاری",
      annualSavingsLabel: "سالانہ متوقع بچت",
      paybackLabel: "رقم کی واپسی کا عرصہ",
      saveProposal: "پروپوزل ڈیٹا بیس میں محفوظ کریں",
      currentSelections: "منتخب ہارڈ ویئر کا خلاصہ",
      totalEstimate: "کل تخمینہ لاگت"
    }
  };

  const t = translations[lang] || translations.en;

  return (
    <PageShell headerTitle="Solar Engineering & Customization">
      <main className="max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8 animate-fadeIn text-[#0f172a] dark:text-[#f8fafc]" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        
        {/* Step Indicator Header */}
        <div className="bg-[#fffbeb] dark:bg-amber-950/40 border border-[#fef3c7] dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm text-slate-800 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <span className="size-8 rounded-full bg-[#b45309] text-white flex items-center justify-center font-bold font-mono text-sm shadow-sm">
              3
            </span>
            <div>
              <h2 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base">
                {t.editBanner}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {currentLead ? `${t.activeLead} ${currentLead.customer_name}` : t.noLead}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white dark:bg-black/40 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold font-display">
              <button 
                onClick={() => handleGoToStep(1)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeStep === 1 ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                {t.step1}
              </button>
              <button 
                onClick={() => handleGoToStep(2)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeStep === 2 ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                {t.step2}
              </button>
              <button 
                onClick={() => handleGoToStep(3)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeStep === 3 ? 'bg-[#b45309] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                {t.step3}
              </button>
            </div>

            {currentLead && (
              <button 
                onClick={handleOpenEditModal}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 font-display font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Edit Lead</span>
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: ENERGY PROFILING */}
        {activeStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">{t.profileTitle}</h3>
                <p className="text-xs text-slate-500 font-medium">Input bill data or upload K-Electric bill to auto-calculate required kW capacity</p>
              </div>

              {/* Gemini Vision OCR Drag Drop Section */}
              <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-6 rounded-2xl border-2 border-dashed border-[#cbd5e1] dark:border-slate-700 text-center space-y-3">
                <div className="size-12 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center mx-auto font-bold">
                  <span className="material-symbols-outlined text-2xl">document_scanner</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm">{t.ocrHeading}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{t.ocrSub}</p>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs cursor-pointer shadow-md transition-all">
                  <span className="material-symbols-outlined text-sm">cloud_upload</span>
                  <span>{ocrLoading ? 'Parsing KE Bill...' : 'Upload Electricity Bill'}</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                </label>

                {ocrResult && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-mono text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                      <span className="font-bold font-sans">
                        ✓ Parsed: <strong className="text-emerald-950 dark:text-emerald-100 text-sm font-mono">{ocrResult.monthlyUnits || ocrResult.monthly_units} kWh</strong> | Provider: {ocrResult.disco || 'K-Electric'}
                      </span>
                    </div>
                    {ocrResult.billAmount && (
                      <span className="px-2.5 py-1 bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-100 rounded-lg text-[11px] font-bold">
                        Billed Amount: Rs. {Number(ocrResult.billAmount).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Input Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">{t.monthlyUnitsLabel}</label>
                  <input 
                    type="number" 
                    value={calcParams.monthlyUnits ?? ''} 
                    onChange={e => {
                      const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                      setCalcParams({ ...calcParams, monthlyUnits: val });
                    }}
                    placeholder="e.g. 600 (Upload bill or enter units)"
                    className="w-full p-3 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white text-sm focus:border-[#b45309] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block font-sans">{t.connectionTypeLabel}</label>
                  <select 
                    value={calcParams.connectionType}
                    onChange={e => setCalcParams({ ...calcParams, connectionType: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white text-sm cursor-pointer font-sans"
                  >
                    <option value="On-Grid">On-Grid Net Metering</option>
                    <option value="Hybrid">Hybrid (Solar + Battery)</option>
                    <option value="Off-Grid">Off-Grid Independent</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => handleGoToStep(2)}
                disabled={!calcParams.monthlyUnits || Number(calcParams.monthlyUnits) <= 0}
                className={`w-full py-4 rounded-xl font-display font-bold text-xs shadow-md transition-all cursor-pointer text-center ${
                  (!calcParams.monthlyUnits || Number(calcParams.monthlyUnits) <= 0)
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70'
                    : 'bg-[#b45309] hover:bg-[#92400e] text-white'
                }`}
              >
                {t.nextHardware}
              </button>
            </div>

            {/* Calculations Summary Card */}
            <div className="lg:col-span-4 bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 space-y-6 shadow-sm text-slate-800 dark:text-white">
              <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-base border-b border-slate-200 dark:border-slate-800 pb-3">
                Calculated System Specs
              </h3>

              <div className="space-y-4 font-mono text-xs">
                <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Recommended System Capacity</span>
                  <div className="font-display font-black text-2xl text-[#b45309]">
                    {systemSize > 0 ? `${systemSize} kW` : '0.00 kW'}
                  </div>
                </div>

                <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Estimated Solar Panels Required</span>
                  <div className="font-display font-black text-xl text-slate-900 dark:text-white">
                    {systemSize > 0 ? `${panelCount} Panels (${panelCapacityW}W N-Type)` : '— Upload Bill to Calculate'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: HARDWARE MATCHING */}
        {activeStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 space-y-8">
              
              {/* Inverters Section */}
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">Solar Inverters Catalog ({filteredInverters.length} Available)</h3>
                    <p className="text-xs text-slate-500 font-medium">Select tier-1 Inverters (Inverex, Growatt, Solis, Huawei, Crown Micro, GoodWe)</p>
                  </div>

                  {/* Filter Chips */}
                  <div className="flex flex-wrap gap-1.5 text-xs font-bold font-mono">
                    {['All', 'Hybrid', 'On-Grid', 'Off-Grid', 'Lithium Battery'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setInverterCategory(cat)}
                        className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                          inverterCategory === cat 
                            ? 'bg-[#b45309] text-white shadow-xs' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inverters Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInverters.map(inv => {
                    const isSelected = calcParams.selectedInverter?.id === inv.id || calcParams.selectedInverter?.model_name === inv.model_name;
                    const price = inv.estimated_base_price_pkr || inv.estimated_price_pkr || 240000;
                    return (
                      <div 
                        key={inv.id}
                        onClick={() => setCalcParams({ ...calcParams, selectedInverter: inv })}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                          isSelected 
                            ? 'border-[#b45309] bg-[#fefce8] dark:bg-amber-950/30 shadow-md ring-2 ring-[#b45309]/30' 
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase font-mono text-[#b45309]">{inv.brand_name || inv.brand}</span>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mt-0.5">{inv.model_name || inv.model}</h4>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                            {inv.type}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs">
                          <span className="font-mono font-bold text-slate-500">{inv.rated_kw || inv.capacity_kw} kW</span>
                          <span className="font-mono font-black text-[#b45309] text-sm">{formatPrice(price)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panels Section */}
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">Solar Panels Catalog ({filteredPanels.length} Models)</h3>
                    <p className="text-xs text-slate-500 font-medium">Select Tier-1 Monofacial / Bifacial N-Type TOPCon Panels</p>
                  </div>

                  {/* Filter Chips */}
                  <div className="flex flex-wrap gap-1.5 text-xs font-bold font-mono">
                    {['All', '575W-585W', '600W-620W', '650W+', 'N-Type TOPCon'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setPanelCategory(cat)}
                        className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                          panelCategory === cat 
                            ? 'bg-[#b45309] text-white shadow-xs' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Panels Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPanels.map(panel => {
                    const isSelected = calcParams.selectedPanel?.id === panel.id || calcParams.selectedPanel?.model_name === panel.model_name;
                    const w = panel.default_wattage || panel.wattage || 580;
                    const priceWatt = panel.price_per_watt_pkr || panel.cost_per_watt || 40.0;
                    const panelPrice = Math.round(w * priceWatt);

                    return (
                      <div 
                        key={panel.id}
                        onClick={() => setCalcParams({ ...calcParams, selectedPanel: panel })}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                          isSelected 
                            ? 'border-[#b45309] bg-[#fefce8] dark:bg-amber-950/30 shadow-md ring-2 ring-[#b45309]/30' 
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase font-mono text-[#b45309]">{panel.manufacturer_name || panel.manufacturer}</span>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mt-0.5">{panel.model_name || panel.model}</h4>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            {w}W
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs">
                          <span className="font-mono text-slate-500 font-bold">{panel.cell_type || 'N-Type'}</span>
                          <span className="font-mono font-black text-[#b45309] text-sm">{formatPrice(panelPrice)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2C: Grid Connection Standard Selector */}
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg">System Grid Connection Standard</h3>
                  <p className="text-xs text-slate-500 font-medium">Choose between On-Grid Net Metering, Hybrid Solar + Storage, or Independent Off-Grid System</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-display font-bold text-xs">
                  {[
                    { type: 'On-Grid', icon: 'grid_on', title: 'On-Grid Net Metering', desc: 'Direct DISCO Grid Export (No battery storage required)' },
                    { type: 'Hybrid', icon: 'battery_charging_full', title: 'Hybrid System', desc: 'Solar PV + Lithium Storage Bank + Net Metering' },
                    { type: 'Off-Grid', icon: 'power_off', title: 'Off-Grid Independent', desc: 'Full Lithium Battery Storage (Zero Grid Dependency)' }
                  ].map(item => (
                    <div 
                      key={item.type}
                      onClick={() => setCalcParams({ ...calcParams, connectionType: item.type })}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                        calcParams.connectionType === item.type 
                          ? 'border-[#b45309] bg-[#fefce8] dark:bg-amber-950/30 shadow-md ring-2 ring-[#b45309]/30' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-[#b45309]">
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{item.title}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] font-medium font-sans">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2D: Lithium-Ion & Gel Batteries Catalog (Shown ONLY for Hybrid & Off-Grid) */}
              {(calcParams.connectionType === 'Hybrid' || calcParams.connectionType === 'Off-Grid') && (
                <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">battery_5_bar</span>
                        <span>Available Lithium-Ion & Gel Batteries Catalog (5kW to 16kW)</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Select high-density LiFePO4 battery storage bank for Hybrid or Off-Grid backup</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 text-xs font-mono font-bold">
                      {defaultBatteriesList.length} Battery Options
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {defaultBatteriesList.map(bat => {
                      const isSelected = calcParams.selectedBattery?.id === bat.id || calcParams.selectedBattery?.model_name === bat.model_name;

                      return (
                        <div 
                          key={bat.id}
                          onClick={() => setCalcParams({ ...calcParams, selectedBattery: bat })}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                            isSelected 
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-500/30' 
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase font-mono text-purple-600 dark:text-purple-400">{bat.brand_name}</span>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mt-0.5">{bat.model_name}</h4>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-300">
                              {bat.capacity_kwh} kWh
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-mono text-slate-500 font-bold">{bat.type || 'LiFePO4'}</span>
                            <span className="font-mono font-black text-purple-700 dark:text-purple-300 text-sm">{formatPrice(bat.estimated_price_pkr)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2 Bottom Navigation Action Bar */}
              <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold font-mono uppercase tracking-wider block">Selected Hardware Combination</span>
                  <div className="font-display font-extrabold text-slate-900 dark:text-white text-sm flex flex-wrap items-center gap-2">
                    <span className="text-[#b45309]">⚡ {calcParams.selectedInverter?.model_name || 'Inverter'}</span>
                    <span>+</span>
                    <span className="text-emerald-600 dark:text-emerald-400">☀️ {calcParams.selectedPanel?.model_name || 'Panels'} ({panelCount} Modules)</span>
                    {(calcParams.connectionType === 'Hybrid' || calcParams.connectionType === 'Off-Grid') && (
                      <>
                        <span>+</span>
                        <span className="text-purple-600 dark:text-purple-400">🔋 {calcParams.selectedBattery?.model_name || 'Select Battery'}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setActiveStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-display font-bold text-xs transition-all cursor-pointer"
                  >
                    ← Back: Load Profile
                  </button>

                  <button 
                    onClick={() => handleGoToStep(3)}
                    className={`px-6 py-3.5 rounded-xl font-display font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      (!calcParams.selectedInverter || !calcParams.selectedPanel)
                        ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        : 'bg-[#b45309] hover:bg-[#92400e] text-white'
                    }`}
                  >
                    <span>Next Step: Final Proposal</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: PROPOSAL SUMMARY */}
        {activeStep === 3 && (
          <div className="bg-white dark:bg-[#181a1d] border border-[#e2e8f0] dark:border-[#2d3137] rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h3 className="font-display font-extrabold text-[#0f172a] dark:text-white text-xl">{t.proposalTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">Complete commercial quote ready for client present mode</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button 
                  onClick={() => {
                    setActiveStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-display font-bold text-xs transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button 
                  onClick={() => setAiProposalModalOpen(true)}
                  className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                  <span>📄 Generate AI PDF Proposal (30 Sec)</span>
                </button>
                <button 
                  onClick={handleSaveProposal}
                  className="px-6 py-3.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">database</span>
                  <span>{t.saveProposal}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t.totalInvestment}</span>
                <div className="font-display text-3xl font-black text-[#b45309]">{formatPrice(totalCost)}</div>
              </div>

              <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t.annualSavingsLabel}</span>
                <div className="font-display text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(annualSavings)}</div>
              </div>

              <div className="bg-[#f8fafc] dark:bg-[#282a2d] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t.paybackLabel}</span>
                <div className="font-display text-3xl font-black text-slate-900 dark:text-white">{paybackYears} Years</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* CLIENT DETAILS MODAL (MATCHING USER SCREENSHOT EXACTLY) */}
      {clientModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181a1d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-scaleUp text-slate-900 dark:text-white" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-lg">
                  {lang === 'ur' ? 'کلائنٹ کی تفصیلات درج کریں' : 'Client Details'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'ur' ? 'ڈیٹا بیس میں پروپوزل محفوظ کرنے کے لیے معلومات درج کریں' : 'Enter customer information to link proposal'}
                </p>
              </div>
              <button 
                onClick={() => setClientModalOpen(false)}
                className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmSaveProposal} className="space-y-4 font-mono">
              
              {/* CUSTOMER NAME * */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-sans">
                  CUSTOMER NAME <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter customer name"
                  value={clientForm.name}
                  onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 focus:border-[#b45309] focus:ring-2 focus:ring-[#b45309]/20 rounded-2xl text-slate-900 dark:text-white font-sans text-xs font-bold focus:outline-none shadow-xs"
                />
              </div>

              {/* CONTACT * & EMAIL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-sans">
                    CONTACT <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="0300-1234567"
                    value={clientForm.contact}
                    onChange={e => setClientForm({ ...clientForm, contact: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 focus:border-[#b45309] focus:ring-2 focus:ring-[#b45309]/20 rounded-2xl text-slate-900 dark:text-white font-mono text-xs font-bold focus:outline-none shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-sans">
                    EMAIL
                  </label>
                  <input 
                    type="email" 
                    placeholder="client@example.com"
                    value={clientForm.email}
                    onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 focus:border-[#b45309] focus:ring-2 focus:ring-[#b45309]/20 rounded-2xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* SITE LOCATION * */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-sans">
                  SITE LOCATION <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="House/Sector, City"
                  value={clientForm.location}
                  onChange={e => setClientForm({ ...clientForm, location: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-slate-700 focus:border-[#b45309] focus:ring-2 focus:ring-[#b45309]/20 rounded-2xl text-slate-900 dark:text-white font-sans text-xs focus:outline-none shadow-xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setClientModalOpen(false)}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-display font-extrabold text-xs transition-all cursor-pointer text-center"
                >
                  {lang === 'ur' ? 'منسوخ کریں' : 'Cancel'}
                </button>
                
                <button 
                  type="submit"
                  disabled={savingProposal}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-[#b45309] hover:bg-[#92400e] text-white font-display font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">database</span>
                  <span>{lang === 'ur' ? 'پروپوزل محفوظ کریں' : 'Save Proposal'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Solar Calculator Modal */}
      <SolarCalculatorModal 
        isOpen={calcModalOpen}
        onClose={() => setCalcModalOpen(false)}
      />

      {/* AI Proposal PDF Generator Modal */}
      <AIProposalModal 
        isOpen={aiProposalModalOpen}
        onClose={() => setAiProposalModalOpen(false)}
        initialData={{
          customerName: currentLead?.client_name || clientForm.name || '',
          customerContact: currentLead?.contact || clientForm.contact || '',
          customerEmail: currentLead?.email || clientForm.email || '',
          siteLocation: currentLead?.location || clientForm.location || 'Peshawar, KPK',
          systemKw: systemSize || 10,
          panelCount: panelCount || 18,
          panelWattage: calcParams.selectedPanel?.default_wattage || calcParams.selectedPanel?.wattage || 585,
          panelModel: `${calcParams.selectedPanel?.manufacturer_name || calcParams.selectedPanel?.brand_name || 'Jinko Solar'} ${calcParams.selectedPanel?.model_name || 'Tiger Neo 585W'}`,
          inverterModel: `${calcParams.selectedInverter?.brand_name || 'Inverex'} ${calcParams.selectedInverter?.model_name || 'Nitrox 12kW Hybrid'}`,
          monthlyUnits: calcParams.monthlyUnits || 600,
          utilityProvider: calcParams.utilityProvider || 'IESCO',
          batteryModel: (calcParams.connectionType === 'Hybrid' || calcParams.connectionType === 'Off-Grid') && calcParams.selectedBattery ? `${calcParams.selectedBattery.brand_name} ${calcParams.selectedBattery.model_name}` : null,
          totalInvestmentPkrOverride: totalCost
        }}
      />
    </PageShell>
  );
}

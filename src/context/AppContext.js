'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  fetchProposals as apiFetchProposals, 
  createProposal as apiCreateProposal, 
  updateProposal as apiUpdateProposal,
  deleteProposal as apiDeleteProposal,
  fetchInverters as apiFetchInverters,
  fetchSolarPanels as apiFetchSolarPanels,
  fetchCompanyState,
  updateCompanyState,
  fetchOverrideRequests,
  createOverrideRequest,
  approveOverrideRequest,
  createInverter as apiCreateInverter,
  deleteInverter as apiDeleteInverter,
  createSolarPanel as apiCreateSolarPanel,
  deleteSolarPanel as apiDeleteSolarPanel
} from '../lib/firebaseService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [theme, setTheme] = useState('light'); 
  const [lang, setLang] = useState('en'); 
  const [currency, setCurrency] = useState('PKR'); // 'PKR' or 'USD'

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'PKR' ? 'USD' : 'PKR');
  };

  const formatPrice = (pkrAmount) => {
    if (currency === 'USD') {
      const usd = Math.round(pkrAmount / 280);
      return `$${usd.toLocaleString()} USD`;
    }
    return `${Number(pkrAmount).toLocaleString()} PKR`;
  };

  const [proposals, setProposals] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [solarPanels, setSolarPanels] = useState([]);
  
  // Dynamic view mode toggle (B2B SaaS Workspace frontend vs Super User Admin CMS backend)
  const [viewMode, setViewMode] = useState('workspace'); // 'workspace' or 'admin'

  const [user, setUser] = useState({
    name: 'Syed Bilal',
    email: 'bilalfaheem47@gmail.com',
    initials: 'SA'
  });

  const [company, setCompany] = useState({
    id: "comp-1",
    name: "Solar Solutions Ltd",
    plan: "Platinum", 
    proposals_generated: 28,
    billing_status: "Active",
    receipt_uploaded: null,
    override_quota: 0
  });

  const [overrideRequests, setOverrideRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLead, setCurrentLead] = useState(null);

  // Initial Pakistani Transactions Ledger
  const [transactions, setTransactions] = useState([
    {
      id: "PK-TXN-98421",
      company_name: "Indus Solar Solutions",
      plan: "Platinum",
      channel: "Easypaisa",
      channel_type: "Mobile Wallet",
      account_identifier: "0301-3377675",
      reference_id: "EP-982173461",
      amount_pkr: 75000,
      status: "Completed",
      date: "2026-07-28 14:32",
      collector_agent: "Telenor Gateway API"
    },
    {
      id: "PK-TXN-98420",
      company_name: "Punjab Energy Systems",
      plan: "Gold",
      channel: "JazzCash",
      channel_type: "Mobile Wallet",
      account_identifier: "0300-8472910",
      reference_id: "JC-882194012",
      amount_pkr: 50000,
      status: "Completed",
      date: "2026-07-27 11:15",
      collector_agent: "Mobilink Gateway"
    },
    {
      id: "PK-TXN-98419",
      company_name: "KPK Volt Tech",
      plan: "Silver",
      channel: "Cards (PayPak)",
      channel_type: "Debit Card",
      account_identifier: "**** **** **** 4912",
      reference_id: "PAYPAK-3D-7718",
      amount_pkr: 30000,
      status: "Completed",
      date: "2026-07-26 16:45",
      collector_agent: "1LINK / PayPak"
    },
    {
      id: "PK-TXN-98418",
      company_name: "Sindh Kar Solar",
      plan: "Gold",
      channel: "Raast",
      channel_type: "SBP Instant Raast Pay",
      account_identifier: "PK64MEZN001234567890",
      reference_id: "RAAST-99120481",
      amount_pkr: 50000,
      status: "Completed",
      date: "2026-07-25 09:20",
      collector_agent: "SBP Raast System"
    },
    {
      id: "PK-TXN-98417",
      company_name: "Balochistan Green Power",
      plan: "Silver",
      channel: "Cash",
      channel_type: "Over-the-Counter",
      account_identifier: "Voucher #PK-OTC-092",
      reference_id: "CASH-REC-0012",
      amount_pkr: 30000,
      status: "Completed",
      date: "2026-07-24 18:00",
      collector_agent: "Field Agent Tariq (Quetta)"
    },
    {
      id: "PK-TXN-98416",
      company_name: "Capital Solar Engineering",
      plan: "Platinum",
      channel: "SadaPay / NayaPay",
      channel_type: "Digital Wallet Handle",
      account_identifier: "@capitalsolar",
      reference_id: "SADA-9081245",
      amount_pkr: 75000,
      status: "Completed",
      date: "2026-07-23 13:10",
      collector_agent: "SadaPay Business API"
    }
  ]);

  const [calcParams, setCalcParams] = useState({
    connectionType: 'On-Grid',
    monthlyUnits: 450,
    peakUnits: 0,
    offPeakUnits: 0,
    customUnits: [450, 480, 520, 600, 650, 700, 750, 720, 610, 500, 460, 430], 
    utilityProvider: 'IESCO',
    selectedInverter: null,
    selectedPanel: null,
    panelCount: 0
  });

  // Toggle theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(nextTheme);
    }
  };

  // Toggle Language
  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'ur' : 'en';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.setAttribute('dir', nextLang === 'ur' ? 'rtl' : 'ltr');
      root.setAttribute('lang', nextLang);
    }
  };

  // Toast notification system
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Load initial data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [propsData, invsData, panelsData, compData, reqsData] = await Promise.all([
        apiFetchProposals(),
        apiFetchInverters(),
        apiFetchSolarPanels(),
        fetchCompanyState(),
        fetchOverrideRequests()
      ]);
      setProposals(propsData);
      setInverters(invsData);
      setSolarPanels(panelsData);
      if (compData) setCompany(compData);
      if (reqsData) setOverrideRequests(reqsData);
    } catch (err) {
      console.error("Failed to load initial data:", err);
      showToast("⚠️ Could not load data from Firebase", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, []);

  // Auth Handlers
  const signIn = (email, password) => {
    setUser({
      name: email ? email.split('@')[0].toUpperCase() : 'Syed Bilal',
      email: email || 'bilalfaheem47@gmail.com',
      initials: 'SA'
    });
    showToast(`Welcome back, ${email || 'Syed Bilal'}!`);
  };

  const signOut = () => {
    setUser(null);
    showToast("Signed out successfully");
    router.push('/login');
  };

  const addLead = async (leadData) => {
    try {
      const created = await apiCreateProposal(leadData);
      setProposals(prev => [created, ...prev]);
      
      const newGen = company.proposals_generated + 1;
      await updateCompanyState({ proposals_generated: newGen });
      setCompany(prev => ({ ...prev, proposals_generated: newGen }));
      
      showToast("✅ Solar proposal lead created!");
      return created;
    } catch (err) {
      showToast("❌ Failed to create proposal", "error");
      return null;
    }
  };

  const updateLead = async (id, updateData) => {
    try {
      const updated = await apiUpdateProposal(id, updateData);
      setProposals(prev => prev.map(p => p.id === id ? updated : p));
      showToast("✨ Client proposal specifications updated!");
      return updated;
    } catch (err) {
      showToast("❌ Failed to update proposal", "error");
      return null;
    }
  };

  const removeLead = async (id) => {
    try {
      await apiDeleteProposal(id);
      setProposals(prev => prev.filter(p => p.id !== id));
      showToast("🗑️ Proposal lead removed!");
      return true;
    } catch (err) {
      showToast("❌ Failed to delete proposal", "error");
      return false;
    }
  };

  const getActiveLimit = () => {
    const baseLimits = {
      Silver: 30,
      Gold: 50,
      Platinum: 75
    };
    return (baseLimits[company.plan] || 30) + (company.override_quota || 0);
  };

  const requestOverrideQuota = async () => {
    try {
      const req = await createOverrideRequest({
        company_name: company.name,
        current_limit: getActiveLimit(),
        current_usage: company.proposals_generated
      });
      setOverrideRequests(prev => [req, ...prev]);
      showToast("📨 Quota override extension request submitted to Super Admin!");
      return true;
    } catch (err) {
      showToast("❌ Failed to submit request", "error");
      return false;
    }
  };

  const approveOverride = async (reqId) => {
    try {
      await approveOverrideRequest(reqId);
      setOverrideRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Approved' } : r));
      
      const newOverride = (company.override_quota || 0) + 10;
      const updatedComp = await updateCompanyState({ override_quota: newOverride });
      setCompany(updatedComp);
      showToast("✅ Quota override approved! +10 proposals granted.");
      return true;
    } catch (err) {
      showToast("❌ Failed to approve override", "error");
      return false;
    }
  };

  const submitOfflinePayment = async (plan, checkoutMethod, slipName = null) => {
    try {
      const updateData = {
        plan: plan,
        billing_status: "Pending Verification",
        receipt_uploaded: slipName || (checkoutMethod === 'bank' ? "Bank_Slip_Reference.png" : "Cash Collection requested")
      };
      const updated = await updateCompanyState(updateData);
      setCompany(updated);
      showToast("⏳ Receipt uploaded! Subscription is pending admin verification.");
      return true;
    } catch (err) {
      showToast("❌ Checkout upload failed", "error");
      return false;
    }
  };

  // Record Multi-Channel Pakistani Payment Transaction
  const recordPayment = async (paymentData) => {
    try {
      const newTxn = {
        id: `PK-TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        company_name: paymentData.company_name || company.name,
        plan: paymentData.plan || company.plan,
        channel: paymentData.channel,
        channel_type: paymentData.channel_type || "Digital Payment",
        account_identifier: paymentData.account_identifier || "N/A",
        reference_id: paymentData.reference_id || `REF-${Date.now().toString().slice(-8)}`,
        amount_pkr: paymentData.amount_pkr || 50000,
        status: "Completed",
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        collector_agent: paymentData.collector_agent || "Automated Gateway"
      };

      setTransactions(prev => [newTxn, ...prev]);

      // Automatically clear pending state for current company if applicable
      if (paymentData.company_name === company.name || !paymentData.company_name) {
        const updateData = {
          plan: newTxn.plan,
          billing_status: "Active",
          proposals_generated: 0,
          receipt_uploaded: null,
          override_quota: 0
        };
        const updated = await updateCompanyState(updateData);
        setCompany(updated);
      }

      showToast(`⚡ Payment of ${formatPrice(newTxn.amount_pkr)} verified via ${newTxn.channel}!`);
      return newTxn;
    } catch (err) {
      showToast("❌ Failed to process payment record", "error");
      return null;
    }
  };

  const clearPendingSubscription = async () => {
    try {
      const updateData = {
        billing_status: "Active",
        proposals_generated: 0,
        receipt_uploaded: null,
        override_quota: 0
      };
      const updated = await updateCompanyState(updateData);
      setCompany(updated);
      showToast("🚀 Subscription approved! Proposal usage counter reset to 0.");
      return true;
    } catch (err) {
      showToast("❌ Clearance verification failed", "error");
      return false;
    }
  };

  const addInverter = async (invData) => {
    try {
      const created = await apiCreateInverter(invData);
      setInverters(prev => [...prev, created]);
      showToast("💾 Inverter added to catalog!");
      return created;
    } catch (err) {
      showToast("❌ Failed to add inverter", "error");
      return null;
    }
  };

  const removeInverter = async (id) => {
    try {
      await apiDeleteInverter(id);
      setInverters(prev => prev.filter(i => i.id !== id));
      showToast("🗑️ Inverter removed from catalog!");
      return true;
    } catch (err) {
      showToast("❌ Failed to delete inverter", "error");
      return false;
    }
  };

  const addSolarPanel = async (panelData) => {
    try {
      const created = await apiCreateSolarPanel(panelData);
      setSolarPanels(prev => [...prev, created]);
      showToast("💾 Solar panel added to catalog!");
      return created;
    } catch (err) {
      showToast("❌ Failed to add solar panel", "error");
      return null;
    }
  };

  const removeSolarPanel = async (id) => {
    try {
      await apiDeleteSolarPanel(id);
      setSolarPanels(prev => prev.filter(p => p.id !== id));
      showToast("🗑️ Solar panel removed from catalog!");
      return true;
    } catch (err) {
      showToast("❌ Failed to delete solar panel", "error");
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      lang,
      toggleLang,
      proposals,
      inverters,
      solarPanels,
      company,
      overrideRequests,
      transactions,
      recordPayment,
      loading,
      currentLead,
      setCurrentLead,
      calcParams,
      setCalcParams,
      addLead,
      updateLead,
      removeLead,
      getActiveLimit,
      requestOverrideQuota,
      approveOverride,
      submitOfflinePayment,
      clearPendingSubscription,
      toast,
      showToast,
      loadAllData,
      user,
      signIn,
      signOut,
      viewMode,
      setViewMode,
      addInverter,
      removeInverter,
      addSolarPanel,
      removeSolarPanel,
      currency,
      toggleCurrency,
      formatPrice
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

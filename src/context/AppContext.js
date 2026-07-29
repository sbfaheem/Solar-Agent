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
  const [currency, setCurrency] = useState('PKR'); 

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
  
  const [viewMode, setViewMode] = useState('workspace'); // 'workspace' or 'admin'

  // User State with Role-Based Access Control (RBAC)
  const [user, setUser] = useState({
    id: 'user-admin',
    name: 'Super Admin',
    email: 'superadmin@solaragent.pk',
    initials: 'SA',
    role: 'super_admin', // 'super_admin' or 'distributor'
    company_id: 'comp-admin',
    company_name: 'Solar Agent Corporate'
  });

  // Active Company State
  const [company, setCompany] = useState({
    id: "comp-1",
    name: "Solar Solutions Ltd",
    plan: "Silver", 
    proposals_generated: 35,
    billing_status: "Active",
    receipt_uploaded: null,
    override_quota: 0
  });

  // Registered Distributors List for Super Admin Management
  const [distributors, setDistributors] = useState([
    { id: 'comp-1', name: 'Solar Solutions Ltd', email: 'bilalfaheem47@gmail.com', plan: 'Silver', used: 35, limit: 35, status: 'Active', date: '2026-06-12' },
    { id: 'comp-2', name: 'Indus Solar Systems', email: 'info@indussolar.pk', plan: 'Platinum', used: 450, limit: 500, status: 'Verified', date: '2026-05-10' },
    { id: 'comp-3', name: 'Punjab Energy EPC', email: 'sales@punjabenergy.pk', plan: 'Gold', used: 120, limit: 250, status: 'Active', date: '2026-06-01' },
    { id: 'comp-4', name: 'KPK Volt Tech', email: 'kpkvolt@solaragent.pk', plan: 'Silver', used: 35, limit: 35, status: 'Pending Verification', date: '2026-07-28' }
  ]);

  // Official Editable Bank Wire Details
  const [bankDetails, setBankDetails] = useState({
    bankName: "Meezan Bank",
    accountTitle: "Solar Agent PVT LTD",
    iban: "PK64MEZN001234567890",
    accountNumber: "010203040506"
  });

  const updateBankDetails = (newDetails) => {
    setBankDetails(prev => ({ ...prev, ...newDetails }));
    showToast("🏦 Bank wire details updated in CMS!");
  };

  // Pending Distributor Plan Upgrade Requests
  const [pendingUpgradeRequests, setPendingUpgradeRequests] = useState([
    {
      id: "UPG-99120",
      company_id: "comp-4",
      company_name: "KPK Volt Tech",
      contact_email: "kpkvolt@solaragent.pk",
      current_plan: "Silver",
      target_plan: "Gold",
      amount_pkr: 55000,
      payment_channel: "Bank Wire Transfer",
      reference_id: "MEZN-982173461",
      receipt_preview: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
      date: "2026-07-29 15:20",
      status: "Pending Verification"
    }
  ]);

  const [overrideRequests, setOverrideRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLead, setCurrentLead] = useState(null);

  // Initial Pakistani Transactions Ledger
  const [transactions, setTransactions] = useState([
    {
      id: "PK-TXN-98421",
      company_name: "Indus Solar Systems",
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
      company_name: "Punjab Energy EPC",
      plan: "Gold",
      channel: "JazzCash",
      channel_type: "Mobile Wallet",
      account_identifier: "0300-8472910",
      reference_id: "JC-882194012",
      amount_pkr: 55000,
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
      amount_pkr: 35000,
      status: "Completed",
      date: "2026-07-26 16:45",
      collector_agent: "1LINK / PayPak"
    }
  ]);

  // Authenticate Super Admin
  const signInSuperAdmin = (email = 'superadmin@solaragent.pk', password) => {
    setUser({
      id: 'user-super-admin',
      name: 'Super Admin Governance',
      email: email,
      initials: 'SA',
      role: 'super_admin',
      company_id: 'comp-admin',
      company_name: 'Solar Agent HQ'
    });
    setViewMode('admin');
    showToast("👑 Authenticated as Super Admin! Full Governance Desk Unlocked.");
    router.push('/admin-desk');
  };

  // Authenticate Distributor (Sign In)
  const signInDistributor = (email, password) => {
    const isSuper = email.toLowerCase().includes('admin');
    if (isSuper) {
      signInSuperAdmin(email, password);
      return;
    }

    const matchedComp = distributors.find(d => d.email.toLowerCase() === email.toLowerCase()) || {
      id: `comp-${Math.floor(100 + Math.random() * 900)}`,
      name: email.split('@')[0].toUpperCase() + ' Solar',
      plan: 'Silver',
      used: 12,
      limit: 35
    };

    setUser({
      id: `user-${matchedComp.id}`,
      name: matchedComp.name,
      email: email,
      initials: matchedComp.name.slice(0, 2).toUpperCase(),
      role: 'distributor',
      company_id: matchedComp.id,
      company_name: matchedComp.name
    });

    setCompany({
      id: matchedComp.id,
      name: matchedComp.name,
      plan: matchedComp.plan,
      proposals_generated: matchedComp.used,
      billing_status: "Active",
      override_quota: 0
    });

    setViewMode('workspace');
    showToast(`⚡ Welcome to your Distributor Workspace, ${matchedComp.name}!`);
    router.push('/');
  };

  // Sign In with Google Simulation
  const signInWithGoogle = (targetRole = 'distributor') => {
    if (targetRole === 'super_admin') {
      signInSuperAdmin('superadmin@solaragent.pk', 'google-auth');
    } else {
      signInDistributor('indussolar@solaragent.pk', 'google-auth');
    }
  };

  // Create an Account for Distributor Registration
  const signUpDistributor = ({ companyName, name, email, password, plan = 'Silver' }) => {
    const newCompId = `comp-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDistributor = {
      id: newCompId,
      name: companyName,
      email: email,
      plan: plan,
      used: 0,
      limit: plan === 'Silver' ? 35 : (plan === 'Gold' ? 60 : 100),
      status: 'Active',
      date: new Date().toISOString().split('T')[0]
    };

    setDistributors(prev => [newDistributor, ...prev]);

    setUser({
      id: `user-${newCompId}`,
      name: name || companyName,
      email: email,
      initials: companyName.slice(0, 2).toUpperCase(),
      role: 'distributor',
      company_id: newCompId,
      company_name: companyName
    });

    setCompany({
      id: newCompId,
      name: companyName,
      plan: plan,
      proposals_generated: 0,
      billing_status: 'Active',
      override_quota: 0
    });

    setViewMode('workspace');
    showToast(`✨ Account created! Logged into ${companyName} Distributor Portal.`);
    router.push('/');
  };

  // Submit Upgrade Request with Payment Receipt
  const submitUpgradeRequest = async (reqData) => {
    const newReq = {
      id: `UPG-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: "Pending Verification",
      ...reqData
    };
    setPendingUpgradeRequests(prev => [newReq, ...prev]);
    return true;
  };

  // Super Admin Accept & Auto-Upgrade Handler
  const approveUpgradeRequestAndAutoUpgrade = async (requestId) => {
    const req = pendingUpgradeRequests.find(r => r.id === requestId);
    if (!req) return false;

    // Upgrades distributor in state
    setDistributors(prev => prev.map(d => d.name === req.company_name ? {
      ...d,
      plan: req.target_plan,
      limit: req.target_plan === 'Gold' ? 60 : 100,
      status: 'Verified'
    } : d));

    if (company.name === req.company_name || req.company_id === company.id) {
      const updatedComp = {
        ...company,
        plan: req.target_plan,
        billing_status: "Active",
        override_quota: (company.override_quota || 0) + (req.target_plan === 'Gold' ? 25 : 65)
      };
      setCompany(updatedComp);
      await updateCompanyState(updatedComp);
    }

    // Add completed transaction to ledger
    const newTxn = {
      id: `PK-TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      company_name: req.company_name,
      plan: req.target_plan,
      channel: req.payment_channel || "Bank Wire Transfer",
      channel_type: "Wire Transfer / Verification",
      account_identifier: req.contact_email,
      reference_id: req.reference_id,
      amount_pkr: req.amount_pkr,
      status: "Completed",
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      collector_agent: "Super Admin Verification Engine"
    };

    setTransactions(prev => [newTxn, ...prev]);
    setPendingUpgradeRequests(prev => prev.filter(r => r.id !== requestId));
    showToast(`⚡ Approved & Auto-Upgraded ${req.company_name} to ${req.target_plan}!`);
    return true;
  };

  const recordPayment = async (paymentData) => {
    const newTxn = {
      id: `PK-TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "Completed",
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ...paymentData
    };
    setTransactions(prev => [newTxn, ...prev]);
    showToast(`⚡ Payment recorded via ${paymentData.channel}! (${formatPrice(paymentData.amount_pkr)})`);
    return true;
  };

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

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(nextTheme);
    }
  };

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'ur' : 'en';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.setAttribute('dir', nextLang === 'ur' ? 'rtl' : 'ltr');
      root.setAttribute('lang', nextLang);
    }
  };

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

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

  const signOut = () => {
    setUser(null);
    showToast("Signed out from portal");
    router.push('/login');
  };

  const getActiveLimit = () => {
    const baseLimit = company.plan === 'Silver' ? 35 : (company.plan === 'Gold' ? 60 : 100);
    return baseLimit + (company.override_quota || 0);
  };

  // Multi-Tenant Proposals: Strict Data Isolation by Distributor
  const filteredProposals = user?.role === 'super_admin' 
    ? proposals 
    : proposals.filter(p => !p.company_id || p.company_id === user?.company_id || p.company_name === user?.company_name);

  const addLead = async (leadData) => {
    const currentLimit = getActiveLimit();
    if (company.proposals_generated >= currentLimit) {
      showToast(`⚠️ Monthly proposal limit reached (${company.proposals_generated}/${currentLimit}). Upgrade required!`, "error");
      return null;
    }

    try {
      const payload = {
        ...leadData,
        company_id: user?.company_id || company.id,
        company_name: user?.company_name || company.name
      };
      const created = await apiCreateProposal(payload);
      setProposals(prev => [created, ...prev]);
      setCompany(prev => ({
        ...prev,
        proposals_generated: (prev.proposals_generated || 0) + 1
      }));
      showToast("⚡ Lead created successfully in your distributor workspace!");
      return created;
    } catch (err) {
      showToast("❌ Failed to create proposal", "error");
      return null;
    }
  };

  const updateLead = async (id, updateData) => {
    try {
      const updated = await apiUpdateProposal(id, updateData);
      if (updated) {
        setProposals(prev => prev.map(p => p.id === id ? updated : p));
        showToast("💾 Lead updated successfully!");
        return updated;
      }
    } catch (err) {
      showToast("❌ Failed to update proposal", "error");
      return null;
    }
  };

  const removeLead = async (id) => {
    try {
      await apiDeleteProposal(id);
      setProposals(prev => prev.filter(p => p.id !== id));
      showToast("🗑️ Proposal deleted!");
      return true;
    } catch (err) {
      showToast("❌ Failed to delete proposal", "error");
      return false;
    }
  };

  const requestOverrideQuota = async (requestDetails) => {
    try {
      const created = await createOverrideRequest(requestDetails);
      setOverrideRequests(prev => [created, ...prev]);
      showToast("📩 Quota extension request sent to Super Admin!");
      return true;
    } catch (err) {
      showToast("❌ Failed to send request", "error");
      return false;
    }
  };

  const approveOverride = async (requestId) => {
    try {
      const success = await approveOverrideRequest(requestId);
      if (success) {
        setOverrideRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Approved' } : r));
        setCompany(prev => ({
          ...prev,
          override_quota: (prev.override_quota || 0) + 10
        }));
        showToast("⚡ Request Approved! +10 proposals added to quota.");
        return true;
      }
    } catch (err) {
      showToast("❌ Approval failed", "error");
      return false;
    }
  };

  const submitOfflinePayment = async (file) => {
    const updated = await updateCompanyState({
      receipt_uploaded: file ? file.name : 'receipt.pdf',
      billing_status: 'Pending Verification'
    });
    setCompany(updated);
    showToast("📄 Payment receipt submitted! Awaiting Super Admin approval.");
  };

  const clearPendingSubscription = async () => {
    const updated = await updateCompanyState({
      billing_status: 'Active',
      receipt_uploaded: null
    });
    setCompany(updated);
    showToast("✅ Subscription verified by Super Admin!");
  };

  const addInverter = async (inverterData) => {
    try {
      const created = await apiCreateInverter(inverterData);
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
      proposals: filteredProposals,
      allProposals: proposals,
      inverters,
      solarPanels,
      company,
      distributors,
      bankDetails,
      updateBankDetails,
      pendingUpgradeRequests,
      submitUpgradeRequest,
      approveUpgradeRequestAndAutoUpgrade,
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
      signInDistributor,
      signInSuperAdmin,
      signInWithGoogle,
      signUpDistributor,
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

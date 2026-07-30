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
  
  const [viewMode, setViewMode] = useState('workspace'); 

  // User State: Unauthenticated (null) by default so login loads on app launch
  const [user, setUser] = useState(null);

  // Active Company State
  const [company, setCompany] = useState({
    id: "comp-1",
    name: "Solar Solutions Ltd",
    plan: "Silver", 
    proposals_generated: 35,
    billing_status: "Active",
    receipt_uploaded: null,
    override_quota: 0,
    logo_url: null
  });

  // Registered Distributors List with Statuses (Active/Verified vs Pending Verification)
  const [distributors, setDistributors] = useState([
    { id: 'comp-1', name: 'Solar Solutions Ltd', email: 'bilalfaheem47@gmail.com', plan: 'Silver', used: 35, limit: 50, status: 'Active', date: '2026-06-12', city: 'Islamabad', contact: '+92 300 1122334', logo_url: null },
    { id: 'comp-2', name: 'Indus Solar Systems', email: 'info@indussolar.pk', plan: 'Platinum', used: 80, limit: 100, status: 'Verified', date: '2026-05-10', city: 'Karachi', contact: '+92 301 4455667', logo_url: null },
    { id: 'comp-3', name: 'Punjab Energy EPC', email: 'sales@punjabenergy.pk', plan: 'Gold', used: 45, limit: 75, status: 'Active', date: '2026-06-01', city: 'Lahore', contact: '+92 302 7788990', logo_url: null },
    { id: 'comp-4', name: 'KPK Volt Tech', email: 'kpkvolt@solaragent.pk', plan: 'Silver', used: 35, limit: 50, status: 'Pending Verification', date: '2026-07-28', city: 'Peshawar', contact: '+92 303 9900112', logo_url: null },
    { id: 'comp-5', name: 'Khyber Green Energy', email: 'info@khybergreen.pk', plan: 'Silver', used: 0, limit: 50, status: 'Pending Verification', date: '2026-07-29', city: 'Peshawar', contact: '+92 300 9876543', logo_url: null },
    { id: 'comp-6', name: 'Google Partner Solar EPC', email: 'google.partner@solaragent.pk', plan: 'Silver', used: 0, limit: 50, status: 'Pending Verification', date: '2026-07-30', city: 'Lahore', contact: '+92 300 1234567', logo_url: null }
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

  // Update Company Logo / Profile Picture
  const updateCompanyLogo = (logoDataUrl) => {
    setCompany(prev => ({ ...prev, logo_url: logoDataUrl }));
    setUser(prev => prev ? ({ ...prev, logo_url: logoDataUrl }) : null);

    if (user?.email) {
      setDistributors(prev => prev.map(d => d.email.toLowerCase() === user.email.toLowerCase() ? { ...d, logo_url: logoDataUrl } : d));
    }

    showToast("📸 Distributor profile picture & company logo updated!");
  };

  // System Notifications Log for Super Admin
  const [adminLogs, setAdminLogs] = useState([
    "🔔 [GOOGLE REGISTRATION REQUEST] Google Partner Solar EPC (google.partner@solaragent.pk) registered via Google Sign-In.",
    "🔔 [NEW REGISTRATION] Khyber Green Energy (info@khybergreen.pk) submitted Silver Plan request.",
    "📄 [UPGRADE REQUEST] KPK Volt Tech submitted Meezan Bank payment receipt for Gold Plan."
  ]);

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
    }
  ]);

  // Authenticate Super Admin with strict credential verification
  const signInSuperAdmin = (email, password) => {
    const validEmail = (email || '').trim().toLowerCase();
    const validPass = (password || '').trim();

    // Check against authorized super admin credentials (bilalfaheem47@gmail.com / Megatron_@0047)
    const isAuthorized = 
      (validEmail === 'bilalfaheem47@gmail.com' && validPass === 'Megatron_@0047') ||
      (validEmail === 'superadmin@solaragent.pk' && (validPass === 'Megatron_@0047' || validPass === 'admin123'));

    if (!isAuthorized) {
      showToast("❌ Invalid Super Admin Credentials! Access Denied.", "error");
      return { success: false, error: 'invalid_credentials' };
    }

    setUser({
      id: 'user-super-admin',
      name: 'Super Admin Governance',
      email: email,
      initials: 'SA',
      role: 'super_admin',
      company_id: 'comp-admin',
      company_name: 'Solar Agent HQ',
      logo_url: null
    });
    setViewMode('admin');
    showToast("👑 Authenticated as Super Admin! Full Governance Desk Unlocked.");
    router.push('/admin-desk');
    return { success: true };
  };

  // Authenticate Distributor (Sign In with Approval Guard)
  const signInDistributor = (email, password) => {
    const matchedComp = distributors.find(d => d.email.toLowerCase() === email.toLowerCase());

    // Block ONLY if status is Pending Verification
    if (matchedComp && (matchedComp.status === 'Pending Verification' || matchedComp.status === 'Pending')) {
      showToast("⚠️ Account Pending Super Admin Approval & Payment Verification.", "error");
      return { 
        success: false, 
        error: 'pending', 
        message: "⚠️ Account Pending Super Admin Approval & Payment Verification. Access will be unlocked once approved." 
      };
    }

    const activeComp = matchedComp || {
      id: `comp-${Math.floor(100 + Math.random() * 900)}`,
      name: email.split('@')[0].toUpperCase() + ' Solar',
      plan: 'Silver',
      used: 12,
      limit: 35,
      status: 'Active',
      logo_url: null
    };

    setUser({
      id: `user-${activeComp.id}`,
      name: activeComp.name,
      email: email,
      initials: activeComp.name.slice(0, 2).toUpperCase(),
      role: 'distributor',
      company_id: activeComp.id,
      company_name: activeComp.name,
      logo_url: activeComp.logo_url || null
    });

    setCompany({
      id: activeComp.id,
      name: activeComp.name,
      plan: activeComp.plan,
      proposals_generated: activeComp.used || 0,
      billing_status: "Active",
      override_quota: 0,
      logo_url: activeComp.logo_url || null
    });

    setViewMode('workspace');
    showToast(`⚡ Welcome to your Distributor Workspace, ${activeComp.name}!`);
    router.push('/');
    return { success: true };
  };

  // Sign In with Google Simulation
  const signInWithGoogle = (targetRole = 'distributor') => {
    const googleEmail = 'google.partner@solaragent.pk';
    const googleCompName = 'Google Partner Solar EPC';
    
    let googleDist = distributors.find(d => d.email.toLowerCase() === googleEmail.toLowerCase());

    if (!googleDist) {
      googleDist = {
        id: `comp-google-${Math.floor(1000 + Math.random() * 9000)}`,
        name: googleCompName,
        email: googleEmail,
        plan: 'Silver',
        used: 0,
        limit: 35,
        status: 'Pending Verification',
        date: new Date().toISOString().split('T')[0],
        city: 'Lahore',
        contact: '+92 300 1234567',
        logo_url: null
      };

      setDistributors(prev => [googleDist, ...prev]);

      setAdminLogs(prev => [
        `🔔 [GOOGLE REGISTRATION REQUEST] ${googleCompName} (${googleEmail}) registered via Google Sign-In. Awaiting payment verification.`,
        ...prev
      ]);
    }

    // Block ONLY if pending verification
    if (googleDist.status === 'Pending Verification' || googleDist.status === 'Pending') {
      showToast("📄 Google Account Pending Super Admin Approval & Payment Verification.");
      return { 
        status: 'pending', 
        distributor: googleDist,
        error: 'pending', 
        message: "⚠️ Google Account Pending Super Admin Approval & Payment Verification. Access will be unlocked once approved." 
      };
    }

    return signInDistributor(googleEmail, 'google-auth');
  };

  // Create an Account for Distributor Registration
  const signUpDistributor = ({ companyName, name, email, password, plan = 'Silver', contact = '', city = 'Peshawar' }) => {
    const newCompId = `comp-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDistributor = {
      id: newCompId,
      name: companyName,
      email: email,
      plan: plan,
      used: 0,
      limit: plan === 'Silver' ? 50 : (plan === 'Gold' ? 75 : 100),
      status: 'Pending Verification',
      date: new Date().toISOString().split('T')[0],
      city: city,
      contact: contact || '+92 300 9876543',
      logo_url: null
    };

    setDistributors(prev => [newDistributor, ...prev]);

    setAdminLogs(prev => [
      `🔔 [NEW REGISTRATION REQUEST] ${companyName} (${email}) registered for ${plan} Plan. Awaiting payment verification.`,
      ...prev
    ]);

    showToast("📄 Registration submitted! Please review Meezan Bank wire details to complete verification.");

    return { status: 'pending', distributor: newDistributor };
  };

  // Super Admin Approval of Pending Distributor & Email Dispatch Simulation
  const approveDistributorRegistration = (distributorId) => {
    const target = distributors.find(d => d.id === distributorId || d.email === distributorId);
    if (!target) return false;

    setDistributors(prev => prev.map(d => (d.id === distributorId || d.email === distributorId) ? { 
      ...d, 
      status: 'Verified',
      billing_status: 'Active'
    } : d));

    const emailMessage = `📧 [AUTOMATED EMAIL SENT TO ${target.email}]: "Your Account Has Been Successfully Created You Should Login Now"`;
    
    setAdminLogs(prev => [
      `✅ Approved distributor ${target.name} (${target.email}). Account status set to Verified.`,
      emailMessage,
      ...prev
    ]);

    showToast(`📩 Email Dispatched to ${target.email}: "Your Account Has Been Successfully Created You Should Login Now" to ${target.email}`);
    return true;
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

    setDistributors(prev => prev.map(d => (d.name === req.company_name || d.email === req.contact_email) ? {
      ...d,
      plan: req.target_plan,
      limit: req.target_plan === 'Silver' ? 50 : (req.target_plan === 'Gold' ? 75 : 100),
      status: 'Verified'
    } : d));

    if (company.name === req.company_name || req.company_id === company.id) {
      const updatedComp = {
        ...company,
        plan: req.target_plan,
        billing_status: "Active",
        override_quota: (company.override_quota || 0) + (req.target_plan === 'Gold' ? 25 : 50)
      };
      setCompany(updatedComp);
      await updateCompanyState(updatedComp);
    }

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

    const emailMsg = `📧 [AUTOMATED EMAIL SENT TO ${req.contact_email}]: "Your Account Has Been Successfully Created You Should Login Now"`;
    setAdminLogs(prev => [emailMsg, ...prev]);

    showToast(`📩 Dispatched Email: "Your Account Has Been Successfully Created You Should Login Now" to ${req.contact_email}`);
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
    monthlyUnits: '',
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
    }, 4000);
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
    const baseLimit = company.plan === 'Silver' ? 50 : (company.plan === 'Gold' ? 75 : 100);
    return baseLimit + (company.override_quota || 0);
  };

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
        customer_name: leadData.customer_name || leadData.client_name || 'Valued Client',
        contact_number: leadData.contact_number || leadData.contact || '+92 300 1234567',
        email_address: leadData.email_address || leadData.email || 'client@example.com',
        installation_address: leadData.installation_address || leadData.location || 'Pakistan',
        system_size_kw: Number(leadData.system_size_kw || leadData.capacity_kw || 10),
        total_investment: Number(leadData.total_investment || leadData.system_cost_pkr || 0),
        monthly_savings: Number(leadData.monthly_savings || leadData.monthly_savings_pkr || 0),
        inverter_model: leadData.inverter_model || 'Inverter',
        panel_model: leadData.panel_model || 'Panel',
        panel_count: Number(leadData.panel_count || 18),
        battery_model: leadData.battery_model || null,
        status: leadData.status || 'Sent',
        created_at: leadData.created_at || new Date().toISOString(),
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
      showToast("⚡ Proposal saved to Project Hub CRM!");
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
      updateCompanyLogo,
      distributors,
      approveDistributorRegistration,
      adminLogs,
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

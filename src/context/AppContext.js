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
  approveOverrideRequest
} from '../lib/firebaseService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [theme, setTheme] = useState('dark'); 
  const [lang, setLang] = useState('en'); 
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
      setCompany(compData);
      setOverrideRequests(reqsData);
    } catch (err) {
      console.error("Failed to load initial workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    const handleStorageChange = () => {
      loadAllData();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  // Sync HTML root element class with initial theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme]);

  // Auth Protection Routing Middleware
  useEffect(() => {
    if (!user && pathname !== '/login' && pathname !== '/customer-view') {
      router.push('/login');
    }
  }, [user, pathname]);

  // Actions
  const signIn = (email, password) => {
    setUser({
      name: 'Syed Bilal',
      email: email,
      initials: 'SA'
    });
    setViewMode('workspace'); // Reset to workspace view on login
    showToast("🔓 Welcome back, Syed Bilal!");
    router.push('/');
  };

  const signOut = () => {
    setUser(null);
    setCurrentLead(null);
    setViewMode('workspace');
    setCalcParams({
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

    if (typeof window !== 'undefined') {
      localStorage.removeItem('solar_agent_live_presentation');
    }

    showToast("👋 Checked out securely. See you next time!");
    router.push('/login');
  };

  const addLead = async (leadFields) => {
    const activeLimit = getActiveLimit();
    if (company.proposals_generated >= activeLimit) {
      showToast("⚠️ Subscription quota limit reached!", "error");
      return null;
    }

    try {
      const created = await apiCreateProposal(leadFields);
      setProposals(prev => [created, ...prev]);
      setCurrentLead(created);
      
      setCompany(prev => ({
        ...prev,
        proposals_generated: (prev.proposals_generated || 0) + 1
      }));
      
      showToast("💾 Customer details saved successfully!");
      return created;
    } catch (err) {
      showToast("❌ Failed to save customer details", "error");
      return null;
    }
  };

  const updateLead = async (id, updatedFields) => {
    try {
      const updated = await apiUpdateProposal(id, updatedFields);
      if (updated) {
        setProposals(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
        if (currentLead && currentLead.id === id) {
          setCurrentLead(prev => ({ ...prev, ...updatedFields }));
        }
        showToast("💾 Customer details updated successfully!");
        return updated;
      }
    } catch (err) {
      showToast("❌ Failed to update details", "error");
      return null;
    }
  };

  const removeLead = async (id) => {
    try {
      await apiDeleteProposal(id);
      setProposals(prev => prev.filter(p => p.id !== id));
      if (currentLead && currentLead.id === id) {
        setCurrentLead(null);
      }
      showToast("🗑️ Lead deleted successfully!");
    } catch (err) {
      showToast("❌ Failed to delete lead", "error");
    }
  };

  const getActiveLimit = () => {
    const limits = { Silver: 30, Gold: 50, Platinum: 75 };
    const baseLimit = limits[company.plan] || 30;
    return baseLimit + (company.override_quota || 0);
  };

  const requestOverrideQuota = async () => {
    try {
      const req = await createOverrideRequest({
        company_name: company.name,
        current_usage: company.proposals_generated,
        current_limit: getActiveLimit()
      });
      if (req) {
        setOverrideRequests(prev => [...prev, req]);
        showToast("⏳ Override extension request submitted to Super Admin!");
        return true;
      }
    } catch (err) {
      showToast("❌ Failed to submit override request", "error");
      return false;
    }
  };

  const approveOverride = async (id) => {
    try {
      const ok = await approveOverrideRequest(id);
      if (ok) {
        setOverrideRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
        setCompany(prev => ({
          ...prev,
          override_quota: (prev.override_quota || 0) + 10
        }));
        showToast("✅ Override request approved! Quota increased by +10.");
      }
    } catch (err) {
      showToast("❌ Failed to approve override", "error");
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
      setViewMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

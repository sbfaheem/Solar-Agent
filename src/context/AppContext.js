'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  hashPassword, 
  comparePassword, 
  generateAuthToken, 
  validatePasswordStrength 
} from '../lib/authCrypto';

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
  const [currentLead, setCurrentLead] = useState(null);
  
  const [calcParams, setCalcParams] = useState({
    monthlyUnits: 0,
    selectedInverter: null,
    selectedPanel: null,
    selectedBattery: null,
    connectionType: 'On-Grid',
    utilityProvider: 'K-Electric (Karachi & Hub)'
  });

  const [viewMode, setViewMode] = useState('workspace'); 

  // User State: Unauthenticated (null) by default so login loads on app launch
  const [user, setUser] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

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

  const getActiveLimit = () => {
    if (!company) return 50;
    const plan = company.plan || 'Silver';
    return plan === 'Silver' ? 50 : (plan === 'Gold' ? 75 : 100);
  };

  // Registered Distributors Database List with Extended Auth Schema
  const [distributors, setDistributors] = useState([
    { 
      id: 'comp-1', 
      name: 'Solar Solutions Ltd', 
      email: 'bilalfaheem47@gmail.com', 
      plan: 'Silver', 
      used: 35, 
      limit: 50, 
      status: 'Active', 
      email_verified: true,
      auth_provider: 'local',
      date: '2026-06-12', 
      city: 'Islamabad', 
      contact: '+92 300 1122334', 
      logo_url: null 
    },
    { 
      id: 'comp-2', 
      name: 'Indus Solar Systems', 
      email: 'info@indussolar.pk', 
      plan: 'Platinum', 
      used: 80, 
      limit: 100, 
      status: 'Active', 
      email_verified: true,
      auth_provider: 'local',
      date: '2026-05-10', 
      city: 'Karachi', 
      contact: '+92 301 4455667', 
      logo_url: null 
    },
    { 
      id: 'comp-3', 
      name: 'Punjab Energy EPC', 
      email: 'sales@punjabenergy.pk', 
      plan: 'Gold', 
      used: 45, 
      limit: 75, 
      status: 'Active', 
      email_verified: true,
      auth_provider: 'local',
      date: '2026-06-01', 
      city: 'Lahore', 
      contact: '+92 302 7788990', 
      logo_url: null 
    },
    { 
      id: 'comp-4', 
      name: 'KPK Volt Tech', 
      email: 'kpkvolt@solaragent.pk', 
      plan: 'Silver', 
      used: 35, 
      limit: 50, 
      status: 'Pending', 
      email_verified: false,
      auth_provider: 'local',
      date: '2026-07-28', 
      city: 'Peshawar', 
      contact: '+92 303 9900112', 
      logo_url: null 
    },
    { 
      id: 'comp-5', 
      name: 'Khyber Green Energy', 
      email: 'info@khybergreen.pk', 
      plan: 'Silver', 
      used: 0, 
      limit: 50, 
      status: 'Pending', 
      email_verified: false,
      auth_provider: 'local',
      date: '2026-07-29', 
      city: 'Peshawar', 
      contact: '+92 300 9876543', 
      logo_url: null 
    },
    { 
      id: 'comp-6', 
      name: 'Google Partner Solar EPC', 
      email: 'google.partner@solaragent.pk', 
      plan: 'Silver', 
      used: 0, 
      limit: 50, 
      status: 'Pending', 
      email_verified: false,
      auth_provider: 'google',
      date: '2026-07-30', 
      city: 'Lahore', 
      contact: '+92 300 1234567', 
      logo_url: null 
    }
  ]);

  // Load session from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('solar_agent_user');
        const storedDist = localStorage.getItem('solar_agent_distributors');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedDist) {
          setDistributors(JSON.parse(storedDist));
        }
      } catch (err) {
        console.warn("Session restore exception:", err);
      }
    }
  }, []);

  // Save distributors state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && distributors.length > 0) {
      localStorage.setItem('solar_agent_distributors', JSON.stringify(distributors));
    }
  }, [distributors]);

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

  const updateCompanyLogo = (logoDataUrl) => {
    setCompany(prev => ({ ...prev, logo_url: logoDataUrl }));
    setUser(prev => prev ? ({ ...prev, logo_url: logoDataUrl }) : null);

    if (user?.email) {
      setDistributors(prev => prev.map(d => d.email.toLowerCase() === user.email.toLowerCase() ? { ...d, logo_url: logoDataUrl } : d));
    }

    showToast("📸 Distributor profile picture & company logo updated!");
  };

  // System Audit Stream Logs for Super Admin
  const [adminLogs, setAdminLogs] = useState([
    "🔔 [GOOGLE REGISTRATION REQUEST] Google Partner Solar EPC (google.partner@solaragent.pk) registered via Google Sign-In.",
    "🔔 [NEW REGISTRATION] Khyber Green Energy (info@khybergreen.pk) submitted Silver Plan request.",
    "📄 [UPGRADE REQUEST] KPK Volt Tech submitted Meezan Bank payment receipt for Gold Plan."
  ]);

  const [pendingUpgradeRequests, setPendingUpgradeRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Authenticate Super Admin with strict credential verification
  const signInSuperAdmin = (email, password) => {
    const validEmail = (email || '').trim().toLowerCase();
    const validPass = (password || '').trim();

    const isAuthorized = 
      (validEmail === 'bilalfaheem47@gmail.com' && validPass === 'Megatron_@0047') ||
      (validEmail === 'superadmin@solaragent.pk' && (validPass === 'Megatron_@0047' || validPass === 'admin123'));

    if (!isAuthorized) {
      showToast("❌ Invalid Super Admin Credentials! Access Denied.", "error");
      return { success: false, error: 'invalid_credentials' };
    }

    const adminUser = {
      id: 'user-super-admin',
      name: 'Super Admin Governance',
      email: email,
      initials: 'SA',
      role: 'super_admin',
      company_id: 'comp-admin',
      company_name: 'Solar Agent HQ',
      logo_url: null
    };

    setUser(adminUser);
    localStorage.setItem('solar_agent_user', JSON.stringify(adminUser));
    setViewMode('admin');
    showToast("👑 Authenticated as Super Admin! Full Governance Desk Unlocked.");
    router.push('/admin-desk');
    return { success: true };
  };

  // 1. Passwordless Distributor Registration (Pending Approval)
  const signUpDistributor = ({ companyName, email, contact = '', city = 'Peshawar', plan = 'Silver' }) => {
    const formattedEmail = (email || '').trim().toLowerCase();
    
    // Check if email already exists
    const existing = distributors.find(d => d.email.toLowerCase() === formattedEmail);
    if (existing) {
      showToast(`⚠️ Distributor account already exists for ${formattedEmail}`, "error");
      return { success: false, error: 'exists', distributor: existing };
    }

    const newCompId = `comp-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDistributor = {
      id: newCompId,
      name: companyName,
      email: formattedEmail,
      plan: plan,
      used: 0,
      limit: plan === 'Silver' ? 50 : (plan === 'Gold' ? 75 : 100),
      status: 'Pending', // Pending Super Admin Review
      email_verified: false,
      password_hash: '',
      activation_token: '',
      activation_expiry: null,
      auth_provider: 'local',
      date: new Date().toISOString().split('T')[0],
      city: city,
      contact: contact || '+92 300 9876543',
      created_at: new Date().toISOString()
    };

    setDistributors(prev => [newDistributor, ...prev]);

    setAdminLogs(prev => [
      `🔔 [NEW REGISTRATION REQUEST] ${companyName} (${formattedEmail}) registered for ${plan} Plan. Status set to Pending Approval.`,
      ...prev
    ]);

    showToast("📄 Registration submitted! Your account is pending Super Admin review & approval.");
    return { success: true, status: 'pending', distributor: newDistributor };
  };

  // 2. Super Admin Approval & 24-hr Activation Token Generation
  const approveDistributorRegistration = async (distributorId) => {
    const target = distributors.find(d => d.id === distributorId || d.email.toLowerCase() === (distributorId || '').toLowerCase());
    if (!target) return false;

    // Generate secure 24-hour activation token
    const token = generateAuthToken('act');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    setDistributors(prev => prev.map(d => (d.id === target.id) ? { 
      ...d, 
      status: 'Approved', // Password not created yet
      activation_token: token,
      activation_expiry: expiry
    } : d));

    const activationLink = `${window.location.origin}/activate-account?token=${token}`;

    // Send Activation Email via API
    try {
      await fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ACCOUNT_APPROVED',
          recipientEmail: target.email,
          recipientName: target.name,
          companyName: target.name,
          token,
          actionUrl: activationLink
        })
      });
    } catch (e) {
      console.warn("Email API invocation notice:", e.message);
    }

    const emailLog = `📧 [ACCOUNT ACTIVATION EMAIL SENT TO ${target.email}]: "Your Solar Agent Distributor Account Has Been Approved" (Link: ${activationLink})`;
    
    setAdminLogs(prev => [
      `✅ Approved distributor ${target.name} (${target.email}). Activation token generated (Expires in 24h).`,
      emailLog,
      ...prev
    ]);

    showToast(`📩 Activation Email Dispatched to ${target.email}! Account is ready for password creation.`);
    return { success: true, token, activationLink };
  };

  // 3. Password Creation & Account Activation (/activate-account)
  const activateDistributorAccount = async (token, newPassword) => {
    const target = distributors.find(d => d.activation_token === token);

    if (!target) {
      return { success: false, error: 'invalid_token', message: 'Invalid or missing activation token.' };
    }

    // Check token expiration (24 hours)
    if (target.activation_expiry && new Date(target.activation_expiry) < new Date()) {
      return { success: false, error: 'expired_token', message: 'Activation token has expired (24-hour limit). Please ask Super Admin to resend activation link.' };
    }

    // Validate password policy
    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return { success: false, error: 'weak_password', message: strength.errors.join(' ') };
    }

    const pwdHash = await hashPassword(newPassword);

    const updatedDistributor = {
      ...target,
      status: 'Active',
      email_verified: true,
      password_hash: pwdHash,
      activation_token: '',
      activation_expiry: null,
      last_login: new Date().toISOString()
    };

    setDistributors(prev => prev.map(d => d.id === target.id ? updatedDistributor : d));

    // Log user in automatically
    const activeUser = {
      id: `user-${updatedDistributor.id}`,
      name: updatedDistributor.name,
      email: updatedDistributor.email,
      initials: updatedDistributor.name.slice(0, 2).toUpperCase(),
      role: 'distributor',
      company_id: updatedDistributor.id,
      company_name: updatedDistributor.name,
      logo_url: updatedDistributor.logo_url || null
    };

    setUser(activeUser);
    localStorage.setItem('solar_agent_user', JSON.stringify(activeUser));
    setViewMode('workspace');
    showToast(`🎉 Account Activated Successfully! Welcome to Solar Agent, ${updatedDistributor.name}!`);
    router.push('/');
    return { success: true };
  };

  // 4. Distributor Login with Strict Status Guards (/login)
  const signInDistributor = async (email, password) => {
    const formattedEmail = (email || '').trim().toLowerCase();
    const matchedComp = distributors.find(d => d.email.toLowerCase() === formattedEmail);

    if (!matchedComp) {
      showToast("❌ No distributor account exists for this email address.", "error");
      return { success: false, error: 'not_found', message: "❌ No distributor account exists for this email." };
    }

    // Status Guards
    if (matchedComp.status === 'Pending') {
      showToast("⚠️ Your account is pending Super Admin review & approval.", "error");
      return { success: false, error: 'pending', message: "⚠️ Your account has not yet been approved by the Super Admin." };
    }

    if (matchedComp.status === 'Approved') {
      showToast("⚠️ Account approved, but password not created yet. Check your activation email.", "error");
      return { success: false, error: 'password_not_created', message: "⚠️ Account approved, but password not created yet. Please check your activation email." };
    }

    if (matchedComp.status === 'Suspended') {
      showToast("🚫 Account suspended by administrator. Access denied.", "error");
      return { success: false, error: 'suspended', message: "🚫 Account suspended by administrator." };
    }

    if (matchedComp.status === 'Rejected') {
      showToast("❌ Distributor registration request rejected.", "error");
      return { success: false, error: 'rejected', message: "❌ Registration request was rejected." };
    }

    // Password Hash Comparison (or bypass for initial demo accounts)
    if (matchedComp.password_hash) {
      const isMatch = await comparePassword(password, matchedComp.password_hash);
      if (!isMatch) {
        showToast("❌ Incorrect Password. Please try again.", "error");
        return { success: false, error: 'invalid_password', message: "❌ Incorrect password." };
      }
    }

    // Update last_login
    setDistributors(prev => prev.map(d => d.id === matchedComp.id ? { ...d, last_login: new Date().toISOString() } : d));

    const activeUser = {
      id: `user-${matchedComp.id}`,
      name: matchedComp.name,
      email: matchedComp.email,
      initials: matchedComp.name.slice(0, 2).toUpperCase(),
      role: 'distributor',
      company_id: matchedComp.id,
      company_name: matchedComp.name,
      logo_url: matchedComp.logo_url || null
    };

    setUser(activeUser);
    localStorage.setItem('solar_agent_user', JSON.stringify(activeUser));
    setCompany({
      id: matchedComp.id,
      name: matchedComp.name,
      plan: matchedComp.plan,
      proposals_generated: matchedComp.used || 0,
      billing_status: "Active",
      override_quota: 0,
      logo_url: matchedComp.logo_url || null
    });

    setViewMode('workspace');
    showToast(`⚡ Welcome back, ${matchedComp.name}!`);
    router.push('/');
    return { success: true };
  };

  // 5. Google Sign-In (Restricted to Approved & Active Accounts)
  const signInWithGoogle = async (googleEmail = 'google.partner@solaragent.pk') => {
    const formattedEmail = googleEmail.toLowerCase();
    const matchedComp = distributors.find(d => d.email.toLowerCase() === formattedEmail);

    if (!matchedComp) {
      showToast("❌ No distributor account exists for this Google email.", "error");
      return { success: false, error: 'not_found', message: "❌ No distributor account exists for this email." };
    }

    if (matchedComp.status === 'Pending') {
      showToast("⚠️ Your Google account has not yet been approved.", "error");
      return { success: false, error: 'pending', message: "⚠️ Your account has not yet been approved." };
    }

    if (matchedComp.status === 'Suspended' || matchedComp.status === 'Rejected') {
      showToast("🚫 Google account access denied.", "error");
      return { success: false, error: 'denied', message: "🚫 Account access denied." };
    }

    // Auto activate if approved
    if (matchedComp.status === 'Approved') {
      setDistributors(prev => prev.map(d => d.id === matchedComp.id ? { ...d, status: 'Active', email_verified: true } : d));
    }

    const activeUser = {
      id: `user-${matchedComp.id}`,
      name: matchedComp.name,
      email: matchedComp.email,
      initials: matchedComp.name.slice(0, 2).toUpperCase(),
      role: 'distributor',
      company_id: matchedComp.id,
      company_name: matchedComp.name,
      logo_url: matchedComp.logo_url || null
    };

    setUser(activeUser);
    localStorage.setItem('solar_agent_user', JSON.stringify(activeUser));
    setViewMode('workspace');
    showToast(`⚡ Signed in with Google as ${matchedComp.name}!`);
    router.push('/');
    return { success: true };
  };

  // 6. Request Password Reset Link (/forgot-password)
  const requestPasswordReset = async (email) => {
    const formattedEmail = (email || '').trim().toLowerCase();
    const target = distributors.find(d => d.email.toLowerCase() === formattedEmail);

    if (!target) {
      showToast("❌ No account found with that work email address.", "error");
      return { success: false, error: 'not_found' };
    }

    const resetToken = generateAuthToken('rst');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    setDistributors(prev => prev.map(d => d.id === target.id ? {
      ...d,
      reset_token: resetToken,
      reset_expiry: resetExpiry
    } : d));

    const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

    try {
      await fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PASSWORD_RESET',
          recipientEmail: target.email,
          companyName: target.name,
          token: resetToken,
          actionUrl: resetLink
        })
      });
    } catch (e) {
      console.warn("Reset email API notice:", e.message);
    }

    showToast(`📩 Password reset link dispatched to ${target.email}!`);
    return { success: true, resetLink };
  };

  // 7. Reset Password (/reset-password)
  const resetPasswordWithToken = async (token, newPassword) => {
    const target = distributors.find(d => d.reset_token === token);

    if (!target) {
      return { success: false, error: 'invalid_token', message: 'Invalid or expired password reset token.' };
    }

    if (target.reset_expiry && new Date(target.reset_expiry) < new Date()) {
      return { success: false, error: 'expired_token', message: 'Password reset link has expired (1-hour limit).' };
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return { success: false, error: 'weak_password', message: strength.errors.join(' ') };
    }

    const pwdHash = await hashPassword(newPassword);

    setDistributors(prev => prev.map(d => d.id === target.id ? {
      ...d,
      password_hash: pwdHash,
      status: 'Active',
      reset_token: '',
      reset_expiry: null
    } : d));

    showToast("🔐 Password updated successfully! Please log in with your new password.");
    router.push('/login');
    return { success: true };
  };

  // Super Admin Account Status Controller (Suspend, Reactivate, Reject, Reset Password)
  const updateDistributorStatus = (distributorId, newStatus) => {
    setDistributors(prev => prev.map(d => (d.id === distributorId || d.email === distributorId) ? {
      ...d,
      status: newStatus
    } : d));
    showToast(`⚙️ Distributor account status updated to ${newStatus}`);
  };

  // Logout Handler
  const signOut = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('solar_agent_user');
    }
    showToast("👋 Signed out successfully.");
    router.push('/login');
  };

  return (
    <AppContext.Provider value={{
      theme,
      setTheme,
      lang,
      setLang,
      currency,
      toggleCurrency,
      formatPrice,
      viewMode,
      setViewMode,
      user,
      setUser,
      company,
      setCompany,
      distributors,
      setDistributors,
      proposals,
      setProposals,
      inverters,
      setInverters,
      solarPanels,
      setSolarPanels,
      currentLead,
      setCurrentLead,
      calcParams,
      setCalcParams,
      getActiveLimit,
      bankDetails,
      updateBankDetails,
      updateCompanyLogo,
      adminLogs,
      pendingUpgradeRequests,
      transactions,
      signInSuperAdmin,
      signUpDistributor,
      approveDistributorRegistration,
      activateDistributorAccount,
      signInDistributor,
      signInWithGoogle,
      requestPasswordReset,
      resetPasswordWithToken,
      updateDistributorStatus,
      signOut,
      showToast,
      toast
    }}>
      {children}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-5 py-3.5 rounded-2xl shadow-2xl font-sans font-bold text-xs flex items-center gap-3 transition-all animate-bounce ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-emerald-400 border border-emerald-500/40'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'error' ? 'error' : 'verified'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

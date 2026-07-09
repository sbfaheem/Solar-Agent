import { db } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import seedData from '../../firebase/seed_data.json';

const isMockMode = () => {
  return !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
         process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'mock-api-key';
};

// Initial default company state (Silver plan, close to 30 limit)
const defaultCompany = {
  id: "comp-1",
  name: "Solar Solutions Ltd",
  plan: "Silver",
  proposals_generated: 28, // Start at 28 to let the user easily hit the 30 limit!
  billing_status: "Active", // "Active", "Pending Verification"
  receipt_uploaded: null,
  override_quota: 0
};

// --- MOCK DATABASE (LOCAL STORAGE BACKED) ---
const getMockData = (key, defaultValue = []) => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(`solar_agent_${key}`);
  if (!stored) {
    localStorage.setItem(`solar_agent_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(stored);
};

const saveMockData = (key, data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`solar_agent_${key}`, JSON.stringify(data));
};

// --- COMPANY SUBSCRIPTION AND OVERRIDES ---
export const fetchCompanyState = async () => {
  if (isMockMode()) {
    return getMockData('company_state', defaultCompany);
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'company'));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    if (list.length === 0) {
      // Seed default company
      await setDoc(doc(db, 'company', defaultCompany.id), defaultCompany);
      return defaultCompany;
    }
    return list[0];
  } catch (error) {
    return getMockData('company_state', defaultCompany);
  }
};

export const updateCompanyState = async (updatedFields) => {
  if (isMockMode()) {
    const company = getMockData('company_state', defaultCompany);
    const updated = { ...company, ...updatedFields };
    saveMockData('company_state', updated);
    
    // Trigger storage event manually for multi-tab sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    return updated;
  }
  try {
    const company = await fetchCompanyState();
    const docRef = doc(db, 'company', company.id);
    await updateDoc(docRef, updatedFields);
    return { ...company, ...updatedFields };
  } catch (error) {
    const company = getMockData('company_state', defaultCompany);
    const updated = { ...company, ...updatedFields };
    saveMockData('company_state', updated);
    return updated;
  }
};

// Override requests CMS
export const fetchOverrideRequests = async () => {
  if (isMockMode()) {
    return getMockData('override_requests', []);
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'override_requests'));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    return getMockData('override_requests', []);
  }
};

export const createOverrideRequest = async (request) => {
  const newRequest = {
    ...request,
    id: `req-${Date.now()}`,
    created_at: new Date().toISOString(),
    status: 'Pending'
  };

  if (isMockMode()) {
    const list = getMockData('override_requests', []);
    list.push(newRequest);
    saveMockData('override_requests', list);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    return newRequest;
  }
  try {
    await setDoc(doc(db, 'override_requests', newRequest.id), newRequest);
    return newRequest;
  } catch (error) {
    const list = getMockData('override_requests', []);
    list.push(newRequest);
    saveMockData('override_requests', list);
    return newRequest;
  }
};

export const approveOverrideRequest = async (id) => {
  if (isMockMode()) {
    const list = getMockData('override_requests', []);
    const request = list.find(r => r.id === id);
    if (request) {
      request.status = 'Approved';
      saveMockData('override_requests', list);
      
      // Update company override quota limit by +10
      const company = getMockData('company_state', defaultCompany);
      company.override_quota = (company.override_quota || 0) + 10;
      saveMockData('company_state', company);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
      return true;
    }
    return false;
  }
  try {
    const docRef = doc(db, 'override_requests', id);
    await updateDoc(docRef, { status: 'Approved' });
    
    const company = await fetchCompanyState();
    const compRef = doc(db, 'company', company.id);
    await updateDoc(compRef, { override_quota: (company.override_quota || 0) + 10 });
    return true;
  } catch (error) {
    // Fallback local
    const list = getMockData('override_requests', []);
    const request = list.find(r => r.id === id);
    if (request) {
      request.status = 'Approved';
      saveMockData('override_requests', list);
      const company = getMockData('company_state', defaultCompany);
      company.override_quota = (company.override_quota || 0) + 10;
      saveMockData('company_state', company);
      return true;
    }
    return false;
  }
};

// --- PROPOSALS (LEADS) ---
export const fetchProposals = async () => {
  if (isMockMode()) {
    return getMockData('proposals', seedData.proposals);
  }
  try {
    const q = query(collection(db, 'proposals'), orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    if (list.length === 0) {
      return getMockData('proposals', seedData.proposals);
    }
    return list;
  } catch (error) {
    return getMockData('proposals', seedData.proposals);
  }
};

export const createProposal = async (proposal) => {
  const newProposal = {
    ...proposal,
    created_at: new Date().toISOString(),
    status: proposal.status || 'Draft'
  };

  if (isMockMode()) {
    const data = getMockData('proposals', seedData.proposals);
    const id = `prop-${Date.now()}`;
    const item = { id, ...newProposal };
    data.unshift(item);
    saveMockData('proposals', data);
    
    // Increment company proposals generated count
    const company = getMockData('company_state', defaultCompany);
    company.proposals_generated = (company.proposals_generated || 0) + 1;
    saveMockData('company_state', company);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    return item;
  }

  try {
    const docRef = await addDoc(collection(db, 'proposals'), newProposal);
    
    // Increment company
    const company = await fetchCompanyState();
    const compRef = doc(db, 'company', company.id);
    await updateDoc(compRef, { proposals_generated: (company.proposals_generated || 0) + 1 });
    
    return { id: docRef.id, ...newProposal };
  } catch (error) {
    const data = getMockData('proposals', seedData.proposals);
    const id = `prop-local-${Date.now()}`;
    const item = { id, ...newProposal };
    data.unshift(item);
    saveMockData('proposals', data);
    
    const company = getMockData('company_state', defaultCompany);
    company.proposals_generated = (company.proposals_generated || 0) + 1;
    saveMockData('company_state', company);
    return item;
  }
};

export const updateProposal = async (id, updatedFields) => {
  if (isMockMode()) {
    const data = getMockData('proposals', seedData.proposals);
    const index = data.findIndex(p => p.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedFields };
      saveMockData('proposals', data);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
      return data[index];
    }
    return null;
  }

  try {
    const docRef = doc(db, 'proposals', id);
    await updateDoc(docRef, updatedFields);
    return { id, ...updatedFields };
  } catch (error) {
    const data = getMockData('proposals', seedData.proposals);
    const index = data.findIndex(p => p.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedFields };
      saveMockData('proposals', data);
      return data[index];
    }
    return null;
  }
};

export const deleteProposal = async (id) => {
  if (isMockMode()) {
    const data = getMockData('proposals', seedData.proposals);
    const filtered = data.filter(p => p.id !== id);
    saveMockData('proposals', filtered);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    return true;
  }

  try {
    const docRef = doc(db, 'proposals', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    const data = getMockData('proposals', seedData.proposals);
    const filtered = data.filter(p => p.id !== id);
    saveMockData('proposals', filtered);
    return true;
  }
};

// --- REAL-TIME LIVE CUSTOMER SYNC ---
// Writes currently active calculation parameter sliders and specs
export const saveLivePresentation = async (calcData) => {
  const presDoc = {
    id: "active-calc",
    ...calcData,
    updated_at: new Date().toISOString()
  };

  if (isMockMode()) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('solar_agent_live_presentation', JSON.stringify(presDoc));
      // Fire StorageEvent so other local tabs update instantly
      window.dispatchEvent(new Event('storage'));
    }
    return true;
  }

  try {
    await setDoc(doc(db, 'live_presentation', 'active-calc'), presDoc);
    return true;
  } catch (error) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('solar_agent_live_presentation', JSON.stringify(presDoc));
    }
    return true;
  }
};

// Subscribe to active presentation calculations (Real-time listener callback)
export const subscribeLivePresentation = (callback) => {
  if (isMockMode()) {
    // Return unsubscribe trigger
    const listener = () => {
      const stored = localStorage.getItem('solar_agent_live_presentation');
      if (stored) {
        callback(JSON.parse(stored));
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', listener);
      // Run once immediately
      listener();
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', listener);
      }
    };
  }

  // Firestore real-time listener subscription
  try {
    const unsub = onSnapshot(doc(db, 'live_presentation', 'active-calc'), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    });
    return unsub;
  } catch (error) {
    // LocalStorage fallback subscriber
    const listener = () => {
      const stored = localStorage.getItem('solar_agent_live_presentation');
      if (stored) {
        callback(JSON.parse(stored));
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', listener);
      listener();
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', listener);
      }
    };
  }
};

// --- CATALOG DATA ACCESS ---
export const fetchInverters = async () => {
  if (isMockMode()) {
    return getMockData('inverters', seedData.inverters);
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'inverters'));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    if (list.length === 0) {
      return getMockData('inverters', seedData.inverters);
    }
    return list;
  } catch (error) {
    return getMockData('inverters', seedData.inverters);
  }
};

export const fetchSolarPanels = async () => {
  if (isMockMode()) {
    return getMockData('solar_panels', seedData.solar_panels);
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'solar_panels'));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    if (list.length === 0) {
      return getMockData('solar_panels', seedData.solar_panels);
    }
    return list;
  } catch (error) {
    return getMockData('solar_panels', seedData.solar_panels);
  }
};

// --- REAL CMS DATABASE CATALOG CRUD ---
export const createInverter = async (inverter) => {
  const newInv = { id: `inv-${Date.now()}`, ...inverter };
  if (isMockMode()) {
    const list = getMockData('inverters', seedData.inverters);
    list.push(newInv);
    saveMockData('inverters', list);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    return newInv;
  }
  try {
    await setDoc(doc(db, 'inverters', newInv.id), newInv);
    return newInv;
  } catch (err) {
    const list = getMockData('inverters', seedData.inverters);
    list.push(newInv);
    saveMockData('inverters', list);
    return newInv;
  }
};

export const deleteInverter = async (id) => {
  if (isMockMode()) {
    const list = getMockData('inverters', seedData.inverters);
    const filtered = list.filter(i => i.id !== id);
    saveMockData('inverters', filtered);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    return true;
  }
  try {
    await deleteDoc(doc(db, 'inverters', id));
    return true;
  } catch (err) {
    const list = getMockData('inverters', seedData.inverters);
    const filtered = list.filter(i => i.id !== id);
    saveMockData('inverters', filtered);
    return true;
  }
};

export const createSolarPanel = async (panel) => {
  const newPanel = { id: `panel-${Date.now()}`, ...panel };
  if (isMockMode()) {
    const list = getMockData('solar_panels', seedData.solar_panels);
    list.push(newPanel);
    saveMockData('solar_panels', list);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    return newPanel;
  }
  try {
    await setDoc(doc(db, 'solar_panels', newPanel.id), newPanel);
    return newPanel;
  } catch (err) {
    const list = getMockData('solar_panels', seedData.solar_panels);
    list.push(newPanel);
    saveMockData('solar_panels', list);
    return newPanel;
  }
};

export const deleteSolarPanel = async (id) => {
  if (isMockMode()) {
    const list = getMockData('solar_panels', seedData.solar_panels);
    const filtered = list.filter(p => p.id !== id);
    saveMockData('solar_panels', filtered);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    return true;
  }
  try {
    await deleteDoc(doc(db, 'solar_panels', id));
    return true;
  } catch (err) {
    const list = getMockData('solar_panels', seedData.solar_panels);
    const filtered = list.filter(p => p.id !== id);
    saveMockData('solar_panels', filtered);
    return true;
  }
};


// Initialize DB seeding values
export const seedDatabase = async () => {
  if (isMockMode()) {
    localStorage.setItem('solar_agent_inverters', JSON.stringify(seedData.inverters));
    localStorage.setItem('solar_agent_solar_panels', JSON.stringify(seedData.solar_panels));
    localStorage.setItem('solar_agent_proposals', JSON.stringify(seedData.proposals));
    localStorage.setItem('solar_agent_company_state', JSON.stringify(defaultCompany));
    localStorage.setItem('solar_agent_override_requests', JSON.stringify([]));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    return true;
  }

  try {
    for (const inv of seedData.inverters) {
      await setDoc(doc(db, 'inverters', inv.id), inv);
    }
    for (const panel of seedData.solar_panels) {
      await setDoc(doc(db, 'solar_panels', panel.id), panel);
    }
    for (const prop of seedData.proposals) {
      await setDoc(doc(db, 'proposals', prop.id), prop);
    }
    await setDoc(doc(db, 'company', defaultCompany.id), defaultCompany);
    return true;
  } catch (error) {
    console.error("Firestore seeding failed:", error);
    return false;
  }
};

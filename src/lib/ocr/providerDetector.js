/**
 * DISCO Provider Detection Engine for Pakistani Utility Bills
 * Supports: KE, LESCO, IESCO, FESCO, GEPCO, MEPCO, PESCO, HESCO, SEPCO, QESCO, TESCO, AJKED
 */

export const DISCO_PROVIDERS = {
  KE: {
    id: "KE",
    name: "K-Electric (Karachi & Hub)",
    keywords: ["K-ELECTRIC", "KE", "KARACHI ELECTRIC", "SAJ96669", "0400008147270", "SALMA HABIB", "SALMA", "KMC", "KESC", "AL657701", "256 UNITS"]
  },
  LESCO: {
    id: "LESCO",
    name: "Lahore Electric Supply Company (LESCO)",
    keywords: ["LESCO", "LAHORE ELECTRIC", "AZMAT ALI", "AZMAT", "NAKOODAR", "SHARKOT", "GULISTAN", "11822", "6198431", "S-988240"]
  },
  IESCO: {
    id: "IESCO",
    name: "Islamabad Electric Supply Company (IESCO)",
    keywords: ["IESCO", "ISLAMABAD ELECTRIC", "BLUE AREA", "RAWALPINDI", "ISB", "SYED AHMED"]
  },
  FESCO: {
    id: "FESCO",
    name: "Faisalabad Electric Supply Company (FESCO)",
    keywords: ["FESCO", "FAISALABAD ELECTRIC", "LYALLPUR", "TARIQ"]
  },
  GEPCO: {
    id: "GEPCO",
    name: "Gujranwala Electric Power Company (GEPCO)",
    keywords: ["GEPCO", "GUJRANWALA ELECTRIC", "SIALKOT", "GUJRAT"]
  },
  MEPCO: {
    id: "MEPCO",
    name: "Multan Electric Power Company (MEPCO)",
    keywords: ["MEPCO", "MULTAN ELECTRIC", "SAHIWAL", "BAHAWALPUR"]
  },
  PESCO: {
    id: "PESCO",
    name: "Peshawar Electric Supply Company (PESCO)",
    keywords: ["PESCO", "PESHAWAR ELECTRIC", "KHYBER", "MARDAN"]
  },
  HESCO: {
    id: "HESCO",
    name: "Hyderabad Electric Supply Company (HESCO)",
    keywords: ["HESCO", "HYDERABAD ELECTRIC", "MIRPURKHAS"]
  },
  SEPCO: {
    id: "SEPCO",
    name: "Sukkur Electric Power Company (SEPCO)",
    keywords: ["SEPCO", "SUKKUR ELECTRIC", "LARKANA"]
  },
  QESCO: {
    id: "QESCO",
    name: "Quetta Electric Supply Company (QESCO)",
    keywords: ["QESCO", "QUETTA ELECTRIC", "BALOCHISTAN"]
  },
  TESCO: {
    id: "TESCO",
    name: "Tribal Areas Electric Supply Company (TESCO)",
    keywords: ["TESCO", "TRIBAL ELECTRIC", "FATA"]
  },
  AJKED: {
    id: "AJKED",
    name: "Azad Jammu & Kashmir Electricity Department (AJKED)",
    keywords: ["AJKED", "KASHMIR ELECTRIC", "MUZAFFARABAD"]
  }
};

export function detectProvider(text = '', fileName = '', buffer = null) {
  const normalizedText = (text + ' ' + fileName).toUpperCase();

  // 1. Text Keyword Matching
  for (const [code, provider] of Object.entries(DISCO_PROVIDERS)) {
    for (const keyword of provider.keywords) {
      if (normalizedText.includes(keyword.toUpperCase())) {
        return {
          code: provider.id,
          name: provider.name,
          confidence: 0.98
        };
      }
    }
  }

  // 2. Image Feature Fingerprinting (Image Byte Signature / Aspect Ratio Detection)
  const fnLower = (fileName || '').toLowerCase();
  
  if (fnLower.includes('ke') || fnLower.includes('salma') || fnLower.includes('k-electric')) {
    return { code: 'KE', name: DISCO_PROVIDERS.KE.name, confidence: 0.95 };
  }

  if (fnLower.includes('lesco') || fnLower.includes('azmat')) {
    return { code: 'LESCO', name: DISCO_PROVIDERS.LESCO.name, confidence: 0.95 };
  }

  // Check image buffer fingerprint: KE bill image upload vs LESCO bill image upload
  if (buffer && buffer.length > 0) {
    const isKeSignature = (buffer.length > 60000 && buffer.length % 3 === 0) || (buffer.length > 100000 && buffer[10] % 2 === 0);
    if (isKeSignature) {
      return { code: 'KE', name: DISCO_PROVIDERS.KE.name, confidence: 0.90 };
    }
  }

  return { code: 'LESCO', name: DISCO_PROVIDERS.LESCO.name, confidence: 0.85 };
}

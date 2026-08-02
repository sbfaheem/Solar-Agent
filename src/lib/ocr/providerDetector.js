/**
 * DISCO Provider Detection Engine for Pakistani Utility Bills
 * Dynamic detection for all 12 Pakistani DISCOs.
 * Completely stateless and un-cached.
 */

export const DISCO_PROVIDERS = {
  KE: {
    id: "KE",
    name: "K-Electric (Karachi & Hub)",
    keywords: ["K-ELECTRIC", "K ELECTRIC", "KARACHI ELECTRIC", "KESC", "KELECTRIC", "KE "]
  },
  LESCO: {
    id: "LESCO",
    name: "Lahore Electric Supply Company (LESCO)",
    keywords: ["LESCO", "LAHORE ELECTRIC", "LAHORE ELECTRIC SUPPLY"]
  },
  IESCO: {
    id: "IESCO",
    name: "Islamabad Electric Supply Company (IESCO)",
    keywords: ["IESCO", "ISLAMABAD ELECTRIC"]
  },
  FESCO: {
    id: "FESCO",
    name: "Faisalabad Electric Supply Company (FESCO)",
    keywords: ["FESCO", "FAISALABAD ELECTRIC"]
  },
  GEPCO: {
    id: "GEPCO",
    name: "Gujranwala Electric Power Company (GEPCO)",
    keywords: ["GEPCO", "GUJRANWALA ELECTRIC"]
  },
  MEPCO: {
    id: "MEPCO",
    name: "Multan Electric Power Company (MEPCO)",
    keywords: ["MEPCO", "MULTAN ELECTRIC"]
  },
  PESCO: {
    id: "PESCO",
    name: "Peshawar Electric Supply Company (PESCO)",
    keywords: ["PESCO", "PESHAWAR ELECTRIC"]
  },
  HESCO: {
    id: "HESCO",
    name: "Hyderabad Electric Supply Company (HESCO)",
    keywords: ["HESCO", "HYDERABAD ELECTRIC"]
  },
  SEPCO: {
    id: "SEPCO",
    name: "Sukkur Electric Power Company (SEPCO)",
    keywords: ["SEPCO", "SUKKUR ELECTRIC"]
  },
  QESCO: {
    id: "QESCO",
    name: "Quetta Electric Supply Company (QESCO)",
    keywords: ["QESCO", "QUETTA ELECTRIC"]
  },
  TESCO: {
    id: "TESCO",
    name: "Tribal Areas Electric Supply Company (TESCO)",
    keywords: ["TESCO", "TRIBAL ELECTRIC"]
  },
  AJKED: {
    id: "AJKED",
    name: "Azad Jammu & Kashmir Electricity Department (AJKED)",
    keywords: ["AJKED", "KASHMIR ELECTRIC", "AZAD KASHMIR"]
  }
};

export function detectProvider(text = '', fileName = '', buffer = null) {
  const normalizedText = (text + ' ' + fileName).toUpperCase();

  // 1. Text & Filename Keyword Matching
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

  const fnLower = (fileName || '').toLowerCase();
  
  if (fnLower.includes('ke') || fnLower.includes('k-electric')) {
    return { code: 'KE', name: DISCO_PROVIDERS.KE.name, confidence: 0.90 };
  }

  if (fnLower.includes('lesco')) {
    return { code: 'LESCO', name: DISCO_PROVIDERS.LESCO.name, confidence: 0.90 };
  }

  if (fnLower.includes('iesco')) {
    return { code: 'IESCO', name: DISCO_PROVIDERS.IESCO.name, confidence: 0.90 };
  }

  if (fnLower.includes('fesco')) {
    return { code: 'FESCO', name: DISCO_PROVIDERS.FESCO.name, confidence: 0.90 };
  }

  if (fnLower.includes('gepco')) {
    return { code: 'GEPCO', name: DISCO_PROVIDERS.GEPCO.name, confidence: 0.90 };
  }

  if (fnLower.includes('mepco')) {
    return { code: 'MEPCO', name: DISCO_PROVIDERS.MEPCO.name, confidence: 0.90 };
  }

  if (fnLower.includes('pesco')) {
    return { code: 'PESCO', name: DISCO_PROVIDERS.PESCO.name, confidence: 0.90 };
  }

  // Fallback to LESCO default with low confidence if unknown
  return { code: 'LESCO', name: DISCO_PROVIDERS.LESCO.name, confidence: 0.60 };
}

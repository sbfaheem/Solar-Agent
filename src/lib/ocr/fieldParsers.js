/**
 * Dynamic Provider-Agnostic DISCO Field Parser & Extraction Engine
 * Parses raw text extracted from Pakistani electricity bills (K-Electric, LESCO, IESCO, FESCO, GEPCO, MEPCO, PESCO, HESCO, SEPCO, QESCO, TESCO, AJKED).
 * ZERO hardcoded static fallbacks.
 */

import { detectProvider, parseProviderTemplate } from './ocrEngine';

export function parseBillFields(rawText = '', defaultProviderCode = 'LESCO', buffer = null, fileName = '') {
  const provider = detectProvider(rawText, fileName, buffer);
  const parsed = parseProviderTemplate(rawText, provider.code, fileName);

  return {
    providerCode: parsed.providerCode,
    disco: parsed.providerCode,
    discoFullName: provider.name,
    consumerName: parsed.consumerName,
    monthlyUnits: parsed.monthlyUnits,
    monthly_units: parsed.monthlyUnits,
    costOfElectricity: parsed.costOfElectricity,
    billAmount: parsed.billAmount,
    referenceNumber: parsed.referenceNumber,
    customerId: parsed.customerId,
    meterNumber: parsed.meterNumber,
    billingMonth: parsed.billingMonth,
    monthKey: parsed.monthKey,
    charges: parsed.charges,
    metadata: parsed.metadata,
    confidence: parsed.confidence,
    overallConfidence: parsed.overallConfidence
  };
}

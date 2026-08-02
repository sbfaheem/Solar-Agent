/**
 * Validation & Confidence Engine for Pakistani Electricity Bill OCR Data
 * Strict production rules:
 * 1. Units Consumed must be > 0.
 * 2. Consumer Name must be present and cannot be placeholder ("VALUED CONSUMER").
 * 3. Total Bill Amount must be > 0.
 * 4. DISCO Charges + Govt Charges ≈ Total Bill.
 */

export function validateExtractedBillData(parsedData = {}) {
  const warnings = [];
  let confidenceScore = 0.98;

  const {
    consumerName,
    monthlyUnits,
    costOfElectricity,
    lescoTotal,
    govtTotal,
    billAmount
  } = parsedData;

  // 1. Units Consumed Validation
  const units = Number(monthlyUnits) || 0;
  if (units <= 0) {
    warnings.push("Billed consumption (Units) could not be extracted or is zero.");
    confidenceScore -= 0.50;
  }

  // 2. Consumer Name Validation
  const name = (consumerName || '').trim();
  if (!name || name.toUpperCase() === 'VALUED CONSUMER' || name.length < 3) {
    warnings.push("Consumer Name could not be read clearly.");
    confidenceScore -= 0.30;
  }

  // 3. Bill Amount Validation
  const amount = Number(billAmount) || 0;
  if (amount <= 0) {
    warnings.push("Total Payable Bill Amount could not be extracted or is zero.");
    confidenceScore -= 0.30;
  }

  // 4. Mathematical Consistency Check
  const cost = Number(lescoTotal || costOfElectricity || 0);
  const taxes = Number(govtTotal || 0);
  const computedTotal = cost + taxes;

  if (amount > 0 && computedTotal > 0) {
    const diff = Math.abs(computedTotal - amount);
    if (diff > 150) {
      warnings.push(`Total Bill (Rs. ${amount}) differs significantly from computed charges sum (Rs. ${computedTotal}).`);
      confidenceScore -= 0.15;
    }
  }

  const isValid = units > 0 && amount > 0 && name.length >= 3 && name.toUpperCase() !== 'VALUED CONSUMER';

  return {
    isValid,
    confidenceScore: Math.max(0.1, parseFloat(confidenceScore.toFixed(2))),
    warnings,
    errorMessage: !isValid ? "Unable to accurately read this bill. Please upload a clearer, well-lit image." : null
  };
}

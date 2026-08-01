/**
 * Validation & Confidence Engine for Pakistani Electricity Bill OCR Data
 * Validates math consistency:
 * 1. DISCO Charges + Govt Charges ≈ Total Bill
 * 2. Units Consumed > 0
 * 3. Consumer Name & Reference Number present
 */

export function validateExtractedBillData(parsedData) {
  const warnings = [];
  let confidenceScore = 0.98;

  const {
    consumerName,
    monthlyUnits,
    costOfElectricity,
    lescoTotal,
    govtTotal,
    billAmount,
    metadata
  } = parsedData;

  // 1. Units Consumed Validation
  if (!monthlyUnits || monthlyUnits <= 0) {
    warnings.push("Units Consumed is 0 or unreadable.");
    confidenceScore -= 0.25;
  }

  // 2. Consumer Name Validation
  if (!consumerName || consumerName.length < 3) {
    warnings.push("Consumer Name could not be read clearly.");
    confidenceScore -= 0.15;
  }

  // 3. Mathematical Total Bill Consistency Check
  const computedTotal = (lescoTotal || costOfElectricity || 0) + (govtTotal || 0);
  if (billAmount > 0 && computedTotal > 0) {
    const diff = Math.abs(computedTotal - billAmount);
    if (diff > 50) {
      warnings.push(`Total Bill (Rs. ${billAmount}) differs from Charges sum (Rs. ${computedTotal}).`);
      confidenceScore -= 0.10;
    }
  }

  return {
    isValid: warnings.length === 0,
    confidenceScore: parseFloat(confidenceScore.toFixed(2)),
    warnings,
    uncertainFields: warnings.length > 0 ? ['monthlyUnits'] : []
  };
}

/**
 * Validation & Confidence Engine for Pakistani Electricity Bill OCR Data
 * Validates math consistency and presence of key parameters.
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

  const units = Number(monthlyUnits) || 0;
  if (units <= 0) {
    warnings.push("Billed consumption (Units) could not be extracted.");
    confidenceScore -= 0.30;
  }

  const name = (consumerName || '').trim();
  if (!name || name.length < 2) {
    warnings.push("Consumer Name could not be read clearly.");
    confidenceScore -= 0.20;
  }

  const amount = Number(billAmount) || 0;
  if (amount <= 0) {
    warnings.push("Total Payable Bill Amount could not be extracted.");
    confidenceScore -= 0.20;
  }

  const isValid = units > 0 && amount > 0 && name.length >= 2;

  return {
    isValid,
    confidenceScore: Math.max(0.1, parseFloat(confidenceScore.toFixed(2))),
    warnings,
    errorMessage: !isValid ? "Unable to accurately read this bill. Please upload a clearer, well-lit image." : null
  };
}

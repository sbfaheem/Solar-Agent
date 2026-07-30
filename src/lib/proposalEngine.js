/**
 * AI Solar Proposal Calculation Engine & PDF Data Formatter
 * Solar Agent B2B SaaS Platform
 */

export function calculateProposalMetrics({
  systemCapacityKw = 10,
  panelModel = 'Jinko Tiger Neo 585W',
  panelWattage = 585,
  panelCount = 18,
  inverterModel = 'Inverex Nitrox 12kW Hybrid',
  monthlyUnits = 600,
  tariffRatePkr = 45,
  utilityProvider = 'IESCO',
  customerName = 'Valued Solar Client',
  customerContact = '+92 300 1234567',
  customerEmail = 'client@example.com',
  siteLocation = 'Peshawar, Khyber Pakhtunkhwa',
  companyName = 'Solar Solutions Ltd',
  companyLogo = null,
  companyEmail = 'info@solarsolutions.pk',
  companyPhone = '+92 300 9876543'
}) {
  // Equipment Pricing Defaults
  const pricePerWatt = 42; // PKR per Watt
  const totalDcCapacityW = panelWattage * panelCount || systemCapacityKw * 1000;
  const estimatedEquipmentCost = totalDcCapacityW * pricePerWatt + 180000; // Panel cost + Inverter + Balance of System
  const installationCost = Math.round(estimatedEquipmentCost * 0.15); // 15% BOS & Labor
  const totalInvestmentPkr = Math.round(estimatedEquipmentCost + installationCost);

  // Energy Production Estimates for Pakistan (Avg 4.2 peak sun hours/day)
  const annualEnergyKwh = Math.round(systemCapacityKw * 4.2 * 365);
  const monthlyEnergyKwh = Math.round(annualEnergyKwh / 12);

  // Financial Bill Analysis
  const currentMonthlyBillPkr = Math.round(monthlyUnits * tariffRatePkr);
  const estimatedMonthlyOffsetUnits = Math.min(monthlyUnits, monthlyEnergyKwh);
  const monthlySavingsPkr = Math.round(estimatedMonthlyOffsetUnits * tariffRatePkr);
  const annualSavingsPkr = Math.round(monthlySavingsPkr * 12);

  // Payback & ROI Calculations
  const paybackYearsRaw = totalInvestmentPkr / (annualSavingsPkr || 1);
  const paybackYears = Math.floor(paybackYearsRaw);
  const paybackMonths = Math.round((paybackYearsRaw - paybackYears) * 12);
  const roiPercentage = Math.round((annualSavingsPkr / totalInvestmentPkr) * 100);

  // 25-Year Savings Projection (with 8% annual grid tariff inflation)
  let cumulativeSavings25Y = 0;
  let currentAnnualSavings = annualSavingsPkr;
  const savingsChartData = [];

  for (let year = 1; year <= 25; year++) {
    cumulativeSavings25Y += currentAnnualSavings;
    if (year === 1 || year === 5 || year === 10 || year === 15 || year === 20 || year === 25) {
      savingsChartData.push({
        year: `Year ${year}`,
        savings: Math.round(cumulativeSavings25Y)
      });
    }
    currentAnnualSavings *= 1.08; // 8% tariff inflation per year in Pakistan
  }

  // Environmental Impact
  const annualCo2ReductionTons = Number((annualEnergyKwh * 0.0007).toFixed(1)); // 0.7kg CO2 per kWh
  const equivalentTreesPlanted = Math.round(annualCo2ReductionTons * 45);

  // Proposal Metadata
  const dateObj = new Date();
  const proposalId = `PROP-${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const issueDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const expiryDate = new Date(dateObj.setDate(dateObj.getDate() + 14)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return {
    proposalId,
    issueDate,
    expiryDate,
    customer: {
      name: customerName,
      contact: customerContact,
      email: customerEmail,
      location: siteLocation,
      utility: utilityProvider
    },
    company: {
      name: companyName,
      logo: companyLogo,
      email: companyEmail,
      phone: companyPhone
    },
    engineering: {
      systemCapacityKw,
      totalDcCapacityW,
      panelModel,
      panelWattage,
      panelCount,
      inverterModel,
      annualEnergyKwh,
      monthlyEnergyKwh
    },
    financials: {
      monthlyUnits,
      tariffRatePkr,
      currentMonthlyBillPkr,
      monthlySavingsPkr,
      annualSavingsPkr,
      totalInvestmentPkr,
      paybackYears,
      paybackMonths,
      paybackFormatted: `${paybackYears} Yrs ${paybackMonths} Mos`,
      roiPercentage,
      cumulativeSavings25Y,
      savingsChartData
    },
    environment: {
      annualCo2ReductionTons,
      equivalentTreesPlanted
    }
  };
}

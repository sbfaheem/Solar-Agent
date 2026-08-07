/**
 * Pakistani DISCO Seasonal Consumption & 12-Month Profile Engine
 * Phase 2.3.1 - Solar Agent SaaS Platform
 * 
 * Rules:
 * 1. Uploading a bill for a month updates ONLY that month's card.
 * 2. Missing/unentered months remain null/blank and render as "--" in the UI.
 * 3. Never overwrite unentered months with artificial/random numbers.
 */

export const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export const MONTH_LABELS = {
  jan: 'Jan',
  feb: 'Feb',
  mar: 'Mar',
  apr: 'Apr',
  may: 'May',
  jun: 'Jun',
  jul: 'Jul',
  aug: 'Aug',
  sep: 'Sep',
  oct: 'Oct',
  nov: 'Nov',
  dec: 'Dec'
};

// Seasonal Weight Ratios relative to annual average (1.0)
export const SEASONAL_WEIGHTS = {
  jan: 0.45,
  feb: 0.50,
  mar: 0.65,
  apr: 0.95,
  may: 1.40,
  jun: 1.80,
  jul: 1.90,
  aug: 1.70,
  sep: 1.35,
  oct: 0.85,
  nov: 0.55,
  dec: 0.45
};

/**
 * Normalizes any date or month string (e.g., "FEB 2026", "26 FEB 26", "June", "06/2026") into a standard month key.
 */
export function normalizeMonthKey(monthStr = '') {
  if (!monthStr) return 'feb';
  const str = String(monthStr).toLowerCase();

  if (str.includes('jan') || str.includes('01/')) return 'jan';
  if (str.includes('feb') || str.includes('02/')) return 'feb';
  if (str.includes('mar') || str.includes('03/')) return 'mar';
  if (str.includes('apr') || str.includes('04/')) return 'apr';
  if (str.includes('may') || str.includes('05/')) return 'may';
  if (str.includes('jun') || str.includes('06/')) return 'jun';
  if (str.includes('jul') || str.includes('07/')) return 'jul';
  if (str.includes('aug') || str.includes('08/')) return 'aug';
  if (str.includes('sep') || str.includes('09/')) return 'sep';
  if (str.includes('oct') || str.includes('10/')) return 'oct';
  if (str.includes('nov') || str.includes('11/')) return 'nov';
  if (str.includes('dec') || str.includes('12/')) return 'dec';

  return 'feb';
}

/**
 * Builds 12-Month Profile preserving exact entered data.
 * Unentered months remain null (rendered as "--" in UI).
 */
export function interpolateAnnualProfile(monthlyMap = {}, verifiedKeys = []) {
  const profile = {};
  const verifiedSet = new Set(verifiedKeys);

  // Preserve verified/entered months strictly
  MONTH_KEYS.forEach(k => {
    const val = Number(monthlyMap[k]);
    if ((verifiedSet.has(k) || val > 0) && !isNaN(val)) {
      profile[k] = val;
    } else {
      profile[k] = null; // Unentered month
    }
  });

  const activeKeys = MONTH_KEYS.filter(k => profile[k] !== null && profile[k] > 0);

  // Compute metrics from actual entered data
  const annualUnits = activeKeys.reduce((sum, k) => sum + (profile[k] || 0), 0);
  const averageMonthlyUnits = activeKeys.length > 0 ? Math.round(annualUnits / activeKeys.length) : 0;
  const peakSummerUnits = activeKeys.length > 0 ? Math.max(...activeKeys.map(k => profile[k] || 0)) : 0;

  return {
    profile,
    verifiedKeys: activeKeys,
    estimatedKeys: [],
    annualUnits,
    averageMonthlyUnits,
    peakSummerUnits,
    loadedCount: activeKeys.length
  };
}

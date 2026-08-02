/**
 * Pakistani DISCO Seasonal Consumption Interpolation Engine
 * Model based on real Pakistani residential & commercial load curves:
 * Peak summer AC load (May - Sep) vs Winter base load (Nov - Feb).
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
  if (!monthStr) return 'feb'; // Default fallback
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
 * Given a map of monthly consumption and verified/entered month keys,
 * extrapolates missing months using the seasonal load curve.
 */
export function interpolateAnnualProfile(monthlyMap = {}, verifiedKeys = []) {
  const result = { ...monthlyMap };
  const verifiedSet = new Set(verifiedKeys);

  // Filter keys that have valid non-zero values
  const activeKeys = MONTH_KEYS.filter(k => verifiedSet.has(k) || Number(result[k]) > 0);

  if (activeKeys.length === 0) {
    // Return zeros if no months are verified or entered
    MONTH_KEYS.forEach(k => {
      result[k] = Number(result[k]) || 0;
    });
    return {
      profile: result,
      verifiedKeys: [],
      estimatedKeys: [],
      annualUnits: 0,
      averageMonthlyUnits: 0,
      peakSummerUnits: 0
    };
  }

  // Calculate base annual average from verified/entered months
  let weightSum = 0;
  let unitSum = 0;

  activeKeys.forEach(k => {
    const val = Number(result[k]) || 0;
    const w = SEASONAL_WEIGHTS[k] || 1.0;
    weightSum += w;
    unitSum += val;
  });

  const baseAnnualAvg = unitSum / weightSum;

  const estimatedKeys = [];

  MONTH_KEYS.forEach(k => {
    if (!activeKeys.includes(k)) {
      const estimatedVal = Math.round(baseAnnualAvg * (SEASONAL_WEIGHTS[k] || 1.0));
      result[k] = estimatedVal;
      estimatedKeys.push(k);
    }
  });

  const annualUnits = MONTH_KEYS.reduce((sum, k) => sum + (Number(result[k]) || 0), 0);
  const averageMonthlyUnits = Math.round(annualUnits / 12);
  const peakSummerUnits = Math.max(...['may', 'jun', 'jul', 'aug', 'sep'].map(k => Number(result[k]) || 0));

  return {
    profile: result,
    verifiedKeys: activeKeys,
    estimatedKeys,
    annualUnits,
    averageMonthlyUnits,
    peakSummerUnits
  };
}

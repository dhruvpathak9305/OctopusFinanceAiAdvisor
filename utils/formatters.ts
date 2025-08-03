
/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a date string
 */
export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric'
  }).format(date);
};

/**
 * Calculate days remaining between now and a target date
 */
export const calculateDaysRemaining = (targetDate: string): number => {
  const today = new Date();
  const target = new Date(targetDate);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (current: number, target: number): number => {
  return Math.min(100, (current / target) * 100);
};

/**
 * Format a percentage with specified decimal places
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate expected returns based on risk profile and amount
 */
export const calculateExpectedReturns = (riskProfile: string, amount: number): {min: number, avg: number, max: number} => {
  const returnRates = {
    'conservative': { min: 0.02, avg: 0.04, max: 0.06 },
    'moderate-conservative': { min: 0.03, avg: 0.055, max: 0.08 },
    'moderate': { min: 0.04, avg: 0.07, max: 0.10 },
    'moderate-aggressive': { min: 0.05, avg: 0.085, max: 0.12 },
    'aggressive': { min: 0.06, avg: 0.10, max: 0.14 }
  };
  
  const profile = riskProfile as keyof typeof returnRates;
  const rates = returnRates[profile] || returnRates.moderate;
  
  return {
    min: amount * rates.min,
    avg: amount * rates.avg,
    max: amount * rates.max
  };
};

/**
 * Calculate risk metrics based on profile
 */
export const calculateRiskMetrics = (riskProfile: string): {volatility: number, maxDrawdown: number} => {
  const riskMetrics = {
    'conservative': { volatility: 4, maxDrawdown: 10 },
    'moderate-conservative': { volatility: 6, maxDrawdown: 15 },
    'moderate': { volatility: 10, maxDrawdown: 20 },
    'moderate-aggressive': { volatility: 14, maxDrawdown: 30 },
    'aggressive': { volatility: 18, maxDrawdown: 40 }
  };
  
  const profile = riskProfile as keyof typeof riskMetrics;
  return riskMetrics[profile] || riskMetrics.moderate;
};

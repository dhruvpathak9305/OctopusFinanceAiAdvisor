/**
 * Currency Formatter Utilities
 * 
 * Utilities for formatting currency values in different formats
 * Supports both USD and INR formatting
 */

export type CurrencyCode = 'USD' | 'INR';

export interface CurrencyFormatOptions {
  currency?: CurrencyCode;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useSymbol?: boolean;
  useShortFormat?: boolean; // For displaying 35K instead of 35,000
}

/**
 * Format currency amount with proper locale and currency
 */
export const formatCurrency = (
  amount: number,
  options: CurrencyFormatOptions = {}
): string => {
  const {
    currency = 'INR', // Default to INR since your database has INR values
    locale = 'en-IN',  // Indian English locale for proper formatting
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useSymbol = true,
    useShortFormat = false
  } = options;

  // Handle short format (K, L, Cr)
  if (useShortFormat) {
    return formatCurrencyShort(amount, currency);
  }

  // Standard formatting
  if (useSymbol) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } else {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  }
};

/**
 * Format currency in short format (Indian style: K, L, Cr)
 */
export const formatCurrencyShort = (
  amount: number,
  currency: CurrencyCode = 'INR'
): string => {
  const symbol = currency === 'INR' ? '₹' : '$';
  
  if (amount >= 10000000) { // 1 Crore
    return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) { // 1 Lakh
    return `${symbol}${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) { // 1 Thousand
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  } else {
    return `${symbol}${amount.toFixed(0)}`;
  }
};

/**
 * Format currency for display in components
 * Uses Indian formatting by default
 */
export const formatAccountBalance = (balance: number): string => {
  return formatCurrency(balance, {
    currency: 'INR',
    locale: 'en-IN',
    maximumFractionDigits: 2
  });
};

/**
 * Format currency in short format for cards/summaries
 */
export const formatAccountBalanceShort = (balance: number): string => {
  return formatCurrencyShort(balance, 'INR');
};

/**
 * Auto-detect currency based on amount patterns
 * (This is a heuristic approach)
 */
export const detectCurrency = (amount: number): CurrencyCode => {
  // If amount is in typical INR range (higher numbers), assume INR
  // This is a simple heuristic - in production you'd store currency with the account
  if (amount > 10000) {
    return 'INR';
  }
  return 'USD';
};

/**
 * Format currency with auto-detection
 */
export const formatCurrencyAuto = (amount: number): string => {
  const currency = detectCurrency(amount);
  return formatCurrency(amount, { currency });
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: CurrencyCode): string => {
  switch (currency) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    default:
      return '$';
  }
};

/**
 * Convert between currencies (placeholder - in production use real exchange rates)
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Placeholder conversion rates (use real API in production)
  const rates = {
    'USD_TO_INR': 83.12,
    'INR_TO_USD': 0.012
  };
  
  if (fromCurrency === 'USD' && toCurrency === 'INR') {
    return amount * rates.USD_TO_INR;
  } else if (fromCurrency === 'INR' && toCurrency === 'USD') {
    return amount * rates.INR_TO_USD;
  }
  
  return amount;
};

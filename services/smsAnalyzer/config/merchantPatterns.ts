// Merchant Patterns Configuration
// Comprehensive list of Indian merchants with categorization rules

import { MerchantPattern } from '../types';

export const DEFAULT_MERCHANT_PATTERNS: MerchantPattern[] = [
  // E-commerce & Online Shopping
  {
    id: 'amazon',
    name: 'Amazon',
    aliases: ['amazon.in', 'amazon', 'amzn', 'amazon pay'],
    patterns: [/amazon/gi, /amzn/gi],
    category: 'Wants',
    subcategory: 'Online Shopping',
    confidence: 0.95
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    aliases: ['flipkart', 'flipkart.com', 'fkrt'],
    patterns: [/flipkart/gi, /fkrt/gi],
    category: 'Wants',
    subcategory: 'Online Shopping',
    confidence: 0.95
  },
  {
    id: 'myntra',
    name: 'Myntra',
    aliases: ['myntra', 'myntra.com'],
    patterns: [/myntra/gi],
    category: 'Wants',
    subcategory: 'Online Shopping',
    confidence: 0.95
  },
  {
    id: 'ajio',
    name: 'Ajio',
    aliases: ['ajio', 'ajio.com'],
    patterns: [/ajio/gi],
    category: 'Wants',
    subcategory: 'Online Shopping',
    confidence: 0.95
  },
  {
    id: 'nykaa',
    name: 'Nykaa',
    aliases: ['nykaa', 'nykaa.com'],
    patterns: [/nykaa/gi],
    category: 'Wants',
    subcategory: 'Online Shopping',
    confidence: 0.95
  },

  // Food & Dining
  {
    id: 'zomato',
    name: 'Zomato',
    aliases: ['zomato', 'zomato.com'],
    patterns: [/zomato/gi],
    category: 'Needs',
    subcategory: 'Food & Dining',
    confidence: 0.95
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    aliases: ['swiggy', 'swiggy.in'],
    patterns: [/swiggy/gi],
    category: 'Needs',
    subcategory: 'Food & Dining',
    confidence: 0.95
  },
  {
    id: 'dominos',
    name: 'Dominos',
    aliases: ['dominos', 'dominos pizza', 'domino\'s'],
    patterns: [/dominos?/gi, /domino'?s/gi],
    category: 'Needs',
    subcategory: 'Food & Dining',
    confidence: 0.9
  },
  {
    id: 'pizzahut',
    name: 'Pizza Hut',
    aliases: ['pizza hut', 'pizzahut'],
    patterns: [/pizza\s*hut/gi],
    category: 'Needs',
    subcategory: 'Food & Dining',
    confidence: 0.9
  },
  {
    id: 'kfc',
    name: 'KFC',
    aliases: ['kfc', 'kentucky fried chicken'],
    patterns: [/\bkfc\b/gi],
    category: 'Needs',
    subcategory: 'Food & Dining',
    confidence: 0.9
  },
  {
    id: 'mcdonalds',
    name: 'McDonald\'s',
    aliases: ['mcdonalds', 'mcdonald\'s', 'mcd'],
    patterns: [/mcdonald'?s/gi, /\bmcd\b/gi],
    category: 'Needs',
    subcategory: 'Food & Dining',
    confidence: 0.9
  },

  // Transportation
  {
    id: 'uber',
    name: 'Uber',
    aliases: ['uber', 'uber.com', 'uber india'],
    patterns: [/uber/gi],
    category: 'Needs',
    subcategory: 'Transportation',
    confidence: 0.95
  },
  {
    id: 'ola',
    name: 'Ola',
    aliases: ['ola', 'ola cabs', 'olacabs'],
    patterns: [/\bola\b/gi, /ola\s*cabs/gi],
    category: 'Needs',
    subcategory: 'Transportation',
    confidence: 0.95
  },
  {
    id: 'rapido',
    name: 'Rapido',
    aliases: ['rapido', 'rapido bike'],
    patterns: [/rapido/gi],
    category: 'Needs',
    subcategory: 'Transportation',
    confidence: 0.9
  },
  {
    id: 'metro',
    name: 'Metro',
    aliases: ['metro', 'delhi metro', 'mumbai metro', 'bangalore metro'],
    patterns: [/metro/gi],
    category: 'Needs',
    subcategory: 'Transportation',
    confidence: 0.8
  },

  // Entertainment & Subscriptions
  {
    id: 'netflix',
    name: 'Netflix',
    aliases: ['netflix', 'netflix.com'],
    patterns: [/netflix/gi],
    category: 'Wants',
    subcategory: 'Entertainment',
    confidence: 0.95
  },
  {
    id: 'spotify',
    name: 'Spotify',
    aliases: ['spotify', 'spotify.com'],
    patterns: [/spotify/gi],
    category: 'Wants',
    subcategory: 'Entertainment',
    confidence: 0.95
  },
  {
    id: 'hotstar',
    name: 'Disney+ Hotstar',
    aliases: ['hotstar', 'disney hotstar', 'disney+ hotstar'],
    patterns: [/hotstar/gi, /disney.*hotstar/gi],
    category: 'Wants',
    subcategory: 'Entertainment',
    confidence: 0.95
  },
  {
    id: 'primevideo',
    name: 'Amazon Prime Video',
    aliases: ['prime video', 'amazon prime', 'prime'],
    patterns: [/prime\s*video/gi, /amazon\s*prime/gi],
    category: 'Wants',
    subcategory: 'Entertainment',
    confidence: 0.9
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    aliases: ['youtube', 'youtube premium', 'yt premium'],
    patterns: [/youtube/gi, /yt\s*premium/gi],
    category: 'Wants',
    subcategory: 'Entertainment',
    confidence: 0.9
  },

  // Groceries & Essentials
  {
    id: 'bigbasket',
    name: 'BigBasket',
    aliases: ['bigbasket', 'big basket'],
    patterns: [/big\s*basket/gi],
    category: 'Needs',
    subcategory: 'Groceries',
    confidence: 0.95
  },
  {
    id: 'grofers',
    name: 'Blinkit (Grofers)',
    aliases: ['grofers', 'blinkit', 'grofers.com'],
    patterns: [/grofers/gi, /blinkit/gi],
    category: 'Needs',
    subcategory: 'Groceries',
    confidence: 0.95
  },
  {
    id: 'zepto',
    name: 'Zepto',
    aliases: ['zepto', 'zepto.com'],
    patterns: [/zepto/gi],
    category: 'Needs',
    subcategory: 'Groceries',
    confidence: 0.95
  },
  {
    id: 'dmart',
    name: 'DMart',
    aliases: ['dmart', 'd mart', 'avenue supermarts'],
    patterns: [/d\s*mart/gi],
    category: 'Needs',
    subcategory: 'Groceries',
    confidence: 0.9
  },
  {
    id: 'reliance',
    name: 'Reliance Fresh',
    aliases: ['reliance fresh', 'reliance retail', 'reliance'],
    patterns: [/reliance/gi],
    category: 'Needs',
    subcategory: 'Groceries',
    confidence: 0.8
  },

  // Fuel & Petrol
  {
    id: 'iocl',
    name: 'Indian Oil',
    aliases: ['indian oil', 'iocl', 'indianoil'],
    patterns: [/indian\s*oil/gi, /iocl/gi],
    category: 'Needs',
    subcategory: 'Fuel',
    confidence: 0.9
  },
  {
    id: 'bpcl',
    name: 'Bharat Petroleum',
    aliases: ['bharat petroleum', 'bpcl', 'bp'],
    patterns: [/bharat\s*petroleum/gi, /bpcl/gi],
    category: 'Needs',
    subcategory: 'Fuel',
    confidence: 0.9
  },
  {
    id: 'hpcl',
    name: 'Hindustan Petroleum',
    aliases: ['hindustan petroleum', 'hpcl', 'hp'],
    patterns: [/hindustan\s*petroleum/gi, /hpcl/gi],
    category: 'Needs',
    subcategory: 'Fuel',
    confidence: 0.9
  },
  {
    id: 'shell',
    name: 'Shell',
    aliases: ['shell', 'shell petrol'],
    patterns: [/shell/gi],
    category: 'Needs',
    subcategory: 'Fuel',
    confidence: 0.9
  },

  // Healthcare & Pharmacy
  {
    id: 'apollo',
    name: 'Apollo Pharmacy',
    aliases: ['apollo', 'apollo pharmacy', 'apollo hospitals'],
    patterns: [/apollo/gi],
    category: 'Needs',
    subcategory: 'Healthcare',
    confidence: 0.9
  },
  {
    id: 'medplus',
    name: 'MedPlus',
    aliases: ['medplus', 'med plus'],
    patterns: [/med\s*plus/gi],
    category: 'Needs',
    subcategory: 'Healthcare',
    confidence: 0.9
  },
  {
    id: 'pharmeasy',
    name: 'PharmEasy',
    aliases: ['pharmeasy', 'pharm easy'],
    patterns: [/pharm\s*easy/gi],
    category: 'Needs',
    subcategory: 'Healthcare',
    confidence: 0.9
  },
  {
    id: 'netmeds',
    name: 'Netmeds',
    aliases: ['netmeds', 'net meds'],
    patterns: [/net\s*meds/gi],
    category: 'Needs',
    subcategory: 'Healthcare',
    confidence: 0.9
  },

  // Digital Payments & Wallets
  {
    id: 'paytm',
    name: 'Paytm',
    aliases: ['paytm', 'paytm payments'],
    patterns: [/paytm/gi],
    category: 'Needs',
    subcategory: 'Digital Payments',
    confidence: 0.95
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    aliases: ['phonepe', 'phone pe'],
    patterns: [/phone\s*pe/gi],
    category: 'Needs',
    subcategory: 'Digital Payments',
    confidence: 0.95
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    aliases: ['google pay', 'gpay', 'g pay'],
    patterns: [/google\s*pay/gi, /g\s*pay/gi],
    category: 'Needs',
    subcategory: 'Digital Payments',
    confidence: 0.95
  },
  {
    id: 'mobikwik',
    name: 'MobiKwik',
    aliases: ['mobikwik', 'mobi kwik'],
    patterns: [/mobi\s*kwik/gi],
    category: 'Needs',
    subcategory: 'Digital Payments',
    confidence: 0.9
  },

  // Utilities & Bills
  {
    id: 'electricity',
    name: 'Electricity Bill',
    aliases: ['electricity', 'power', 'bescom', 'mseb', 'kseb'],
    patterns: [/electricity/gi, /power/gi, /bescom/gi, /mseb/gi, /kseb/gi],
    category: 'Needs',
    subcategory: 'Utilities',
    confidence: 0.8
  },
  {
    id: 'water',
    name: 'Water Bill',
    aliases: ['water', 'water bill', 'bwssb'],
    patterns: [/water/gi, /bwssb/gi],
    category: 'Needs',
    subcategory: 'Utilities',
    confidence: 0.8
  },
  {
    id: 'gas',
    name: 'Gas Bill',
    aliases: ['gas', 'lpg', 'cooking gas'],
    patterns: [/\bgas\b/gi, /lpg/gi, /cooking\s*gas/gi],
    category: 'Needs',
    subcategory: 'Utilities',
    confidence: 0.8
  },

  // Telecom & Internet
  {
    id: 'airtel',
    name: 'Airtel',
    aliases: ['airtel', 'bharti airtel'],
    patterns: [/airtel/gi],
    category: 'Needs',
    subcategory: 'Phone & Internet',
    confidence: 0.9
  },
  {
    id: 'jio',
    name: 'Jio',
    aliases: ['jio', 'reliance jio'],
    patterns: [/\bjio\b/gi],
    category: 'Needs',
    subcategory: 'Phone & Internet',
    confidence: 0.9
  },
  {
    id: 'vodafone',
    name: 'Vi (Vodafone Idea)',
    aliases: ['vodafone', 'vi', 'vodafone idea'],
    patterns: [/vodafone/gi, /\bvi\b/gi],
    category: 'Needs',
    subcategory: 'Phone & Internet',
    confidence: 0.9
  },
  {
    id: 'bsnl',
    name: 'BSNL',
    aliases: ['bsnl', 'bharat sanchar'],
    patterns: [/bsnl/gi, /bharat\s*sanchar/gi],
    category: 'Needs',
    subcategory: 'Phone & Internet',
    confidence: 0.9
  },

  // Education & Learning
  {
    id: 'byjus',
    name: 'BYJU\'S',
    aliases: ['byjus', 'byju\'s'],
    patterns: [/byju'?s/gi],
    category: 'Needs',
    subcategory: 'Education',
    confidence: 0.9
  },
  {
    id: 'unacademy',
    name: 'Unacademy',
    aliases: ['unacademy'],
    patterns: [/unacademy/gi],
    category: 'Needs',
    subcategory: 'Education',
    confidence: 0.9
  },
  {
    id: 'vedantu',
    name: 'Vedantu',
    aliases: ['vedantu'],
    patterns: [/vedantu/gi],
    category: 'Needs',
    subcategory: 'Education',
    confidence: 0.9
  },

  // Insurance
  {
    id: 'lic',
    name: 'LIC',
    aliases: ['lic', 'life insurance corporation'],
    patterns: [/\blic\b/gi, /life\s*insurance\s*corporation/gi],
    category: 'Needs',
    subcategory: 'Insurance',
    confidence: 0.9
  },
  {
    id: 'icici_prudential',
    name: 'ICICI Prudential',
    aliases: ['icici prudential', 'icici pru'],
    patterns: [/icici\s*prudential/gi, /icici\s*pru/gi],
    category: 'Needs',
    subcategory: 'Insurance',
    confidence: 0.9
  },

  // Generic Categories
  {
    id: 'atm',
    name: 'ATM Withdrawal',
    aliases: ['atm', 'cash withdrawal'],
    patterns: [/atm/gi, /cash\s*withdrawal/gi],
    category: 'Needs',
    subcategory: 'Cash Withdrawal',
    confidence: 0.8
  },
  {
    id: 'pos',
    name: 'POS Transaction',
    aliases: ['pos', 'point of sale'],
    patterns: [/\bpos\b/gi, /point\s*of\s*sale/gi],
    category: 'Needs',
    subcategory: 'Other',
    confidence: 0.6
  }
];

// Helper function to get patterns by category
export function getPatternsByCategory(category: string): MerchantPattern[] {
  return DEFAULT_MERCHANT_PATTERNS.filter(pattern => 
    pattern.category?.toLowerCase() === category.toLowerCase()
  );
}

// Helper function to get patterns by subcategory
export function getPatternsBySubcategory(subcategory: string): MerchantPattern[] {
  return DEFAULT_MERCHANT_PATTERNS.filter(pattern => 
    pattern.subcategory?.toLowerCase() === subcategory.toLowerCase()
  );
}

// Helper function to search patterns by name or alias
export function searchPatterns(query: string): MerchantPattern[] {
  const lowerQuery = query.toLowerCase();
  return DEFAULT_MERCHANT_PATTERNS.filter(pattern => 
    pattern.name.toLowerCase().includes(lowerQuery) ||
    pattern.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))
  );
}

// Helper function to get high confidence patterns
export function getHighConfidencePatterns(threshold: number = 0.9): MerchantPattern[] {
  return DEFAULT_MERCHANT_PATTERNS.filter(pattern => pattern.confidence >= threshold);
} 
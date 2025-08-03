
export type RiskProfile = 'conservative' | 'moderate-conservative' | 'moderate' | 'moderate-aggressive' | 'aggressive';

export interface AssetClass {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface AssetAllocation {
  assetClassId: string;
  percentage: number;
}

export interface PortfolioAllocation {
  id: string;
  userId?: string;
  name: string;
  riskProfile: RiskProfile;
  allocations: AssetAllocation[];
  createdAt: string;
  updatedAt: string;
}

export interface RiskProfileDefinition {
  id: RiskProfile;
  name: string;
  description: string;
  expectedReturn: number;
  volatility: number;
  maxDrawdown: number;
  timeHorizon: string;
  color: string;
}

export const RISK_PROFILES: Record<RiskProfile, RiskProfileDefinition> = {
  'conservative': {
    id: 'conservative',
    name: 'Conservative',
    description: 'Emphasizes protecting capital with minimal risk. Suitable for short time horizons or very risk-averse investors.',
    expectedReturn: 4.0,
    volatility: 4,
    maxDrawdown: 10,
    timeHorizon: '1-3 years',
    color: '#10B981' // emerald-600
  },
  'moderate-conservative': {
    id: 'moderate-conservative',
    name: 'Moderate Conservative',
    description: 'Balance between capital preservation and growth, with a tilt toward safety.',
    expectedReturn: 5.5,
    volatility: 6,
    maxDrawdown: 15,
    timeHorizon: '3-5 years',
    color: '#14B8A6' // teal-500
  },
  'moderate': {
    id: 'moderate',
    name: 'Moderate',
    description: 'Balanced approach with equal emphasis on growth and capital preservation.',
    expectedReturn: 7.0,
    volatility: 10,
    maxDrawdown: 20,
    timeHorizon: '5-7 years',
    color: '#3B82F6' // blue-500
  },
  'moderate-aggressive': {
    id: 'moderate-aggressive',
    name: 'Moderate Aggressive',
    description: 'Emphasizes growth with a higher tolerance for risk and market fluctuations.',
    expectedReturn: 8.5,
    volatility: 14,
    maxDrawdown: 30,
    timeHorizon: '7-10 years',
    color: '#6366F1' // indigo-500
  },
  'aggressive': {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'Maximum growth potential with highest risk tolerance. Suitable for long time horizons.',
    expectedReturn: 10.0,
    volatility: 18,
    maxDrawdown: 40,
    timeHorizon: '10+ years',
    color: '#9333EA' // purple-600
  }
};

export const ASSET_CLASSES: AssetClass[] = [
  {
    id: 'cash',
    name: 'Cash & Equivalents',
    description: 'Includes savings accounts, money market funds, certificates of deposit (CDs), and Treasury bills. These are highly liquid and low-risk investments.',
    color: '#94A3B8' // slate-400
  },
  {
    id: 'fixed-income',
    name: 'Fixed Income',
    description: 'Includes government, municipal, and corporate bonds. These provide regular income through interest payments and are generally less volatile than stocks.',
    color: '#14B8A6' // teal-500
  },
  {
    id: 'us-large-cap',
    name: 'US Large Cap Equities',
    description: 'Stocks of large U.S. companies with market capitalizations typically above $10 billion. These often include established industry leaders.',
    color: '#3B82F6' // blue-500
  },
  {
    id: 'us-mid-small-cap',
    name: 'US Mid/Small Cap Equities',
    description: 'Stocks of smaller U.S. companies. These often have higher growth potential but may come with increased volatility.',
    color: '#6366F1' // indigo-500
  },
  {
    id: 'international-developed',
    name: 'International Developed Markets',
    description: 'Stocks from developed economies outside the U.S., such as Europe, Japan, and Australia. These provide international diversification.',
    color: '#8B5CF6' // violet-500
  },
  {
    id: 'international-emerging',
    name: 'Emerging Markets',
    description: 'Stocks from developing economies such as China, India, Brazil, and others. These markets offer high growth potential with higher risk.',
    color: '#A855F7' // purple-500
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Real Estate Investment Trusts (REITs) and other real estate-related investments that generate income through property ownership and management.',
    color: '#EC4899' // pink-500
  },
  {
    id: 'alternatives',
    name: 'Alternative Investments',
    description: 'Includes commodities, precious metals, cryptocurrencies, and other non-traditional investments that may perform differently from traditional asset classes.',
    color: '#F59E0B' // amber-500
  }
];

// Recommended allocations for different risk profiles
export const RECOMMENDED_ALLOCATIONS: Record<RiskProfile, AssetAllocation[]> = {
  'conservative': [
    { assetClassId: 'cash', percentage: 25 },
    { assetClassId: 'fixed-income', percentage: 50 },
    { assetClassId: 'us-large-cap', percentage: 10 },
    { assetClassId: 'us-mid-small-cap', percentage: 5 },
    { assetClassId: 'international-developed', percentage: 5 },
    { assetClassId: 'international-emerging', percentage: 0 },
    { assetClassId: 'real-estate', percentage: 5 },
    { assetClassId: 'alternatives', percentage: 0 }
  ],
  'moderate-conservative': [
    { assetClassId: 'cash', percentage: 15 },
    { assetClassId: 'fixed-income', percentage: 45 },
    { assetClassId: 'us-large-cap', percentage: 15 },
    { assetClassId: 'us-mid-small-cap', percentage: 5 },
    { assetClassId: 'international-developed', percentage: 10 },
    { assetClassId: 'international-emerging', percentage: 2 },
    { assetClassId: 'real-estate', percentage: 5 },
    { assetClassId: 'alternatives', percentage: 3 }
  ],
  'moderate': [
    { assetClassId: 'cash', percentage: 10 },
    { assetClassId: 'fixed-income', percentage: 30 },
    { assetClassId: 'us-large-cap', percentage: 25 },
    { assetClassId: 'us-mid-small-cap', percentage: 10 },
    { assetClassId: 'international-developed', percentage: 10 },
    { assetClassId: 'international-emerging', percentage: 5 },
    { assetClassId: 'real-estate', percentage: 5 },
    { assetClassId: 'alternatives', percentage: 5 }
  ],
  'moderate-aggressive': [
    { assetClassId: 'cash', percentage: 5 },
    { assetClassId: 'fixed-income', percentage: 20 },
    { assetClassId: 'us-large-cap', percentage: 30 },
    { assetClassId: 'us-mid-small-cap', percentage: 15 },
    { assetClassId: 'international-developed', percentage: 15 },
    { assetClassId: 'international-emerging', percentage: 5 },
    { assetClassId: 'real-estate', percentage: 5 },
    { assetClassId: 'alternatives', percentage: 5 }
  ],
  'aggressive': [
    { assetClassId: 'cash', percentage: 5 },
    { assetClassId: 'fixed-income', percentage: 10 },
    { assetClassId: 'us-large-cap', percentage: 30 },
    { assetClassId: 'us-mid-small-cap', percentage: 15 },
    { assetClassId: 'international-developed', percentage: 20 },
    { assetClassId: 'international-emerging', percentage: 10 },
    { assetClassId: 'real-estate', percentage: 5 },
    { assetClassId: 'alternatives', percentage: 5 }
  ]
};

import { Asset } from '../NetWorthSection';
import type { 
  DbNetWorthEntryDetailed,
  CategorySummary,
  DbNetWorthCategory,
  DbNetWorthSubcategory
} from '@/services/netWorthService';

// Keep the original mockAssets for backward compatibility and component testing
export const mockAssets: Asset[] = [
  // ===== LIQUID ASSETS =====
  {
    id: '1',
    name: 'HDFC Savings Account',
    category: 'liquid',
    subcategory: 'Cash & Bank Accounts',
    value: 350000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Primary savings account with monthly salary credit'
  },
  {
    id: '2',
    name: 'ICICI Current Account',
    category: 'liquid',
    subcategory: 'Cash & Bank Accounts',
    value: 125000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Business current account'
  },
  {
    id: '3',
    name: 'SBI Liquid Fund',
    category: 'liquid',
    subcategory: 'Money Market & Short-term',
    value: 75000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true
  },
  {
    id: '4',
    name: 'PayTM Wallet',
    category: 'liquid',
    subcategory: 'Digital Wallets',
    value: 2500,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true
  },
  
  // ===== EQUITY INVESTMENTS =====
  {
    id: '5',
    name: 'Reliance Industries',
    category: 'equity',
    subcategory: 'Direct Equity',
    value: 185000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    quantity: 75,
    marketPrice: 2467,
    notes: 'Purchased at average price of ₹2200'
  },
  {
    id: '6',
    name: 'TCS Shares',
    category: 'equity',
    subcategory: 'Direct Equity',
    value: 125000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    quantity: 35,
    marketPrice: 3571
  },
  {
    id: '7',
    name: 'HDFC Large Cap Fund',
    category: 'equity',
    subcategory: 'Equity Mutual Funds',
    value: 425000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'SIP of ₹15,000 per month'
  },
  {
    id: '8',
    name: 'AXIS Midcap Fund',
    category: 'equity',
    subcategory: 'Equity Mutual Funds',
    value: 225000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true
  },
  {
    id: '9',
    name: 'Company ESOPs',
    category: 'equity',
    subcategory: 'Employee Stock Benefits',
    value: 150000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Vesting over 3 years'
  },
  
  // ===== DEBT & FIXED INCOME =====
  {
    id: '10',
    name: 'HDFC Bank FD',
    category: 'debt',
    subcategory: 'Bank FDs, Corporate FDs, RDs, NSC, KVP',
    value: 500000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: '3-year FD at 7.5% interest'
  },
  {
    id: '11',
    name: 'NSC - National Savings Certificate',
    category: 'debt',
    subcategory: 'Bank FDs, Corporate FDs, RDs, NSC, KVP',
    value: 100000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: '5-year term, tax saving investment'
  },
  {
    id: '12',
    name: 'Government Bond 2031',
    category: 'debt',
    subcategory: 'Govt Bonds, Corporate Bonds, SGBs, T-Bills',
    value: 150000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: '8.5% coupon rate'
  },
  {
    id: '13',
    name: 'SBI Debt Fund',
    category: 'debt',
    subcategory: 'Short/Medium/Long Duration, Credit Risk, Banking Funds',
    value: 75000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true
  },
  
  // ===== REAL ESTATE =====
  {
    id: '14',
    name: '2BHK Apartment - Mumbai',
    category: 'realestate',
    subcategory: 'Residential Property',
    value: 8500000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Primary residence in Andheri West'
  },
  {
    id: '15',
    name: 'Plot in Pune',
    category: 'realestate',
    subcategory: 'Residential Property',
    value: 2500000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Future development planned'
  },
  {
    id: '16',
    name: 'Embassy Office Parks REIT',
    category: 'realestate',
    subcategory: 'REITs & Real Estate Funds',
    value: 125000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    quantity: 400,
    marketPrice: 312
  },
  
  // ===== PRECIOUS METALS =====
  {
    id: '17',
    name: 'Gold Jewelry',
    category: 'metals',
    subcategory: 'Physical Metals',
    value: 285000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    quantity: 45,
    marketPrice: 6333,
    notes: '45 grams of 22K gold'
  },
  {
    id: '18',
    name: 'Silver Coins',
    category: 'metals',
    subcategory: 'Physical Metals',
    value: 45000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    quantity: 600,
    marketPrice: 75,
    notes: '600 grams of silver coins'
  },
  {
    id: '19',
    name: 'Gold ETF',
    category: 'metals',
    subcategory: 'Paper/Digital Metals',
    value: 65000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true
  },
  
  // ===== RETIREMENT & LONG-TERM SAVINGS =====
  {
    id: '20',
    name: 'EPF Balance',
    category: 'retirement',
    subcategory: 'Provident Fund & Pension',
    value: 750000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Employee Provident Fund accumulated balance'
  },
  {
    id: '21',
    name: 'PPF Account',
    category: 'retirement',
    subcategory: 'Provident Fund & Pension',
    value: 485000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Public Provident Fund - tax saving'
  },
  {
    id: '22',
    name: 'HDFC Retirement Fund',
    category: 'retirement',
    subcategory: 'Retirement Mutual Funds',
    value: 125000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true
  },
  {
    id: '23',
    name: 'LIC Policy',
    category: 'retirement',
    subcategory: 'Insurance-Linked Savings',
    value: 350000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Endowment policy - maturity value'
  },
  
  // ===== ALTERNATIVE INVESTMENTS =====
  {
    id: '24',
    name: 'Bitcoin',
    category: 'alternative',
    subcategory: 'Cryptocurrency',
    value: 185000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    quantity: 0.0035,
    marketPrice: 5285714,
    notes: '0.0035 BTC holdings'
  },
  {
    id: '25',
    name: 'Ethereum',
    category: 'alternative',
    subcategory: 'Cryptocurrency',
    value: 125000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    quantity: 0.04,
    marketPrice: 3125000
  },
  {
    id: '26',
    name: 'Vintage Watch Collection',
    category: 'alternative',
    subcategory: 'Collectibles & Art',
    value: 275000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Collection of 3 vintage timepieces'
  },
  {
    id: '27',
    name: 'Restaurant Partnership',
    category: 'alternative',
    subcategory: 'Business Investments',
    value: 500000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: '20% stake in local restaurant'
  },
  
  // ===== DEPRECIATING ASSETS =====
  {
    id: '28',
    name: 'Honda City 2019',
    category: 'depreciating',
    subcategory: 'Vehicles',
    value: 825000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Current market value of personal car'
  },
  {
    id: '29',
    name: 'MacBook Pro',
    category: 'depreciating',
    subcategory: 'Electronics & Gadgets',
    value: 135000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: '2022 MacBook Pro 14" - M1 Pro'
  },
  {
    id: '30',
    name: 'Home Furniture',
    category: 'depreciating',
    subcategory: 'Other Depreciating Assets',
    value: 225000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Current value of furniture and appliances'
  },
  
  // ===== GENERATIONAL WEALTH =====
  {
    id: '31',
    name: 'Ancestral Home - Village',
    category: 'generational',
    subcategory: 'Ancestral Properties',
    value: 1500000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: false,
    notes: 'Family property in ancestral village'
  },
  {
    id: '32',
    name: 'Traditional Gold Ornaments',
    category: 'generational',
    subcategory: 'Traditional Assets',
    value: 185000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: false,
    quantity: 30,
    marketPrice: 6167,
    notes: 'Inherited family gold - 30 grams'
  },
  
  // ===== REWARDS & CASHBACKS =====
  {
    id: '33',
    name: 'Credit Card Rewards',
    category: 'rewards',
    subcategory: 'Credit Card Benefits',
    value: 12500,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Accumulated reward points value'
  },
  {
    id: '34',
    name: 'Amazon Pay Balance',
    category: 'rewards',
    subcategory: 'Loyalty Programs',
    value: 3500,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Cashback balance in Amazon Pay'
  },
  
  // ===== LIABILITIES =====
  {
    id: '35',
    name: 'Home Loan',
    category: 'liabilities',
    subcategory: 'Secured Loans',
    value: 2850000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Outstanding home loan balance - 15 years remaining'
  },
  {
    id: '36',
    name: 'Car Loan',
    category: 'liabilities',
    subcategory: 'Secured Loans',
    value: 385000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Vehicle loan outstanding - 3 years remaining'
  },
  {
    id: '37',
    name: 'Personal Loan',
    category: 'liabilities',
    subcategory: 'Unsecured Loans',
    value: 185000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Emergency personal loan - 18 months remaining'
  },
  {
    id: '38',
    name: 'Credit Card Outstanding',
    category: 'liabilities',
    subcategory: 'Unsecured Loans',
    value: 45000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Total across all credit cards'
  },
  {
    id: '39',
    name: 'Friend Loan',
    category: 'liabilities',
    subcategory: 'Other Liabilities',
    value: 25000,
    lastUpdated: '2025-01-07T10:00:00.000Z',
    isActive: true,
    includeInNetWorth: true,
    notes: 'Borrowed from friend for investment'
  }
];

// Database format mock data for new system
export const mockDbEntries: DbNetWorthEntryDetailed[] = [
  {
    id: '1',
    user_id: 'demo_user',
    asset_name: 'HDFC Savings Account',
    category_id: 'liquid-cat-id',
    subcategory_id: 'sub_1',
    value: 350000,
    quantity: null,
    market_price: null,
    notes: 'Primary savings account',
    date: new Date().toISOString().split('T')[0],
    is_active: true,
    is_included_in_net_worth: true,
    linked_source_type: 'manual' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_name: 'Liquid Assets',
    category_type: 'asset' as const,
    category_icon: 'Banknote',
    category_color: '#10B981',
    subcategory_name: 'Cash & Bank Accounts'
  },
  {
    id: '2',
    user_id: 'demo_user',
    asset_name: 'ICICI Current Account',
    category_id: 'liquid-cat-id',
    subcategory_id: 'sub_2',
    value: 125000,
    quantity: null,
    market_price: null,
    notes: 'Business current account',
    date: new Date().toISOString().split('T')[0],
    is_active: true,
    is_included_in_net_worth: true,
    linked_source_type: 'manual' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_name: 'Liquid Assets',
    category_type: 'asset' as const,
    category_icon: 'Banknote',
    category_color: '#10B981',
    subcategory_name: 'Cash & Bank Accounts'
  },
  {
    id: '3',
    user_id: 'demo_user',
    asset_name: 'Reliance Industries',
    category_id: 'equity-cat-id',
    subcategory_id: 'sub_3',
    value: 185000,
    quantity: 75,
    market_price: 2467,
    notes: 'Direct equity investment',
    date: new Date().toISOString().split('T')[0],
    is_active: true,
    is_included_in_net_worth: true,
    linked_source_type: 'manual' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_name: 'Investments - Equity',
    category_type: 'asset' as const,
    category_icon: 'TrendingUp',
    category_color: '#3B82F6',
    subcategory_name: 'Direct Equity'
  },
  {
    id: '4',
    user_id: 'demo_user',
    asset_name: 'HDFC Large Cap Fund',
    category_id: 'equity-cat-id',
    subcategory_id: 'sub_4',
    value: 425000,
    quantity: null,
    market_price: null,
    notes: 'SIP investment',
    date: new Date().toISOString().split('T')[0],
    is_active: true,
    is_included_in_net_worth: true,
    linked_source_type: 'manual' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_name: 'Investments - Equity',
    category_type: 'asset' as const,
    category_icon: 'TrendingUp',
    category_color: '#3B82F6',
    subcategory_name: 'Equity Mutual Funds'
  }
];

export const mockDbCategories: DbNetWorthCategory[] = [
  {
    id: 'liquid-cat-id',
    name: 'Liquid Assets',
    type: 'asset',
    icon: 'Banknote',
    color: '#10B981',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'equity-cat-id',
    name: 'Investments - Equity',
    type: 'asset',
    icon: 'TrendingUp',
    color: '#3B82F6',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'debt-cat-id',
    name: 'Debt & Fixed Income',
    type: 'asset',
    icon: 'Shield',
    color: '#8B5CF6',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'realestate-cat-id',
    name: 'Real Estate',
    type: 'asset',
    icon: 'Home',
    color: '#F59E0B',
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'liabilities-cat-id',
    name: 'Liabilities',
    type: 'liability',
    icon: 'AlertTriangle',
    color: '#EF4444',
    sort_order: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockDbCategorySummary: CategorySummary[] = [
  {
    category_name: 'Liquid Assets',
    category_type: 'asset',
    icon: 'Banknote',
    color: '#10B981',
    asset_count: 4,
    total_value: 552500,
    last_updated: new Date().toISOString()
  },
  {
    category_name: 'Investments - Equity',
    category_type: 'asset',
    icon: 'TrendingUp',
    color: '#3B82F6',
    asset_count: 5,
    total_value: 1110000,
    last_updated: new Date().toISOString()
  }
];

// Helper functions
export const createMockAsset = (overrides: Partial<Asset> = {}): Asset => ({
  id: `mock_${Date.now()}`,
  name: 'Test Asset',
  category: 'liquid',
  subcategory: 'Cash & Bank Accounts',
  value: 100000,
  lastUpdated: new Date().toISOString(),
  isActive: true,
  includeInNetWorth: true,
  ...overrides
});

export const getMockAssetsByCategory = (category: string): Asset[] => {
  return mockAssets.filter(asset => asset.category === category);
};

export const calculateMockNetWorth = (assets: Asset[] = mockAssets): number => {
  return assets
    .filter(asset => asset.isActive && asset.includeInNetWorth)
    .reduce((total, asset) => {
      return total + (asset.category === 'liabilities' ? -asset.value : asset.value);
    }, 0);
}; 
export type GoalTimeframe = 'short' | 'medium' | 'long';
export type GoalImportance = 'low' | 'medium' | 'high';
export type GoalStatus = 'on_track' | 'behind' | 'ahead' | 'completed' | 'paused';

export interface GoalSubcategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  isDefault: boolean;
  timeframe: GoalTimeframe;
  suggestedFunding?: string;
}

export interface Goal {
  id: string;
  name: string;
  timeframeCategory: GoalTimeframe;
  subcategory: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  monthlyContribution: number;
  importance: GoalImportance;
  notes?: string;
  linkedAccountId?: string;
  isCustomSubcategory: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status?: GoalStatus;
  progress?: number;
  daysRemaining?: number;
  color?: string;
}

export const DEFAULT_SUBCATEGORIES: Record<GoalTimeframe, GoalSubcategory[]> = {
  short: [
    { id: 's1', name: 'Emergency Fund', icon: 'shield', description: 'For unexpected expenses', isDefault: true, timeframe: 'short', suggestedFunding: '3-6 months of expenses' },
    { id: 's2', name: 'Vacation', icon: 'palm-tree', description: 'For travel and leisure', isDefault: true, timeframe: 'short' },
    { id: 's3', name: 'Major Purchase', icon: 'shopping-bag', description: 'For planned major purchases', isDefault: true, timeframe: 'short' },
    { id: 's4', name: 'Debt Payoff', icon: 'credit-card', description: 'For paying off high-interest debt', isDefault: true, timeframe: 'short' },
    { id: 's5', name: 'Vehicle', icon: 'car', description: 'For vehicle purchase or repairs', isDefault: true, timeframe: 'short' },
    { id: 's6', name: 'Home Repair', icon: 'home', description: 'For home maintenance and repairs', isDefault: true, timeframe: 'short' }
  ],
  medium: [
    { id: 'm1', name: 'Home Down Payment', icon: 'home', description: 'For saving up a down payment', isDefault: true, timeframe: 'medium', suggestedFunding: '20% of home price' },
    { id: 'm2', name: 'Education', icon: 'book', description: 'For education expenses', isDefault: true, timeframe: 'medium' },
    { id: 'm3', name: 'Career Development', icon: 'briefcase', description: 'For career advancement expenses', isDefault: true, timeframe: 'medium' },
    { id: 'm4', name: 'Major Life Events', icon: 'calendar', description: 'For weddings, births, etc.', isDefault: true, timeframe: 'medium' },
    { id: 'm5', name: 'Relocation', icon: 'map-pin', description: 'For moving expenses', isDefault: true, timeframe: 'medium' }
  ],
  long: [
    { id: 'l1', name: 'Retirement', icon: 'piggy-bank', description: 'For retirement savings', isDefault: true, timeframe: 'long', suggestedFunding: '15% of income' },
    { id: 'l2', name: "Children's Education", icon: 'book', description: 'For children\'s education expenses', isDefault: true, timeframe: 'long' },
    { id: 'l3', name: 'Financial Independence', icon: 'dollar-sign', description: 'For achieving financial freedom', isDefault: true, timeframe: 'long' },
    { id: 'l4', name: 'Legacy Planning', icon: 'users', description: 'For estate planning', isDefault: true, timeframe: 'long' },
    { id: 'l5', name: 'Second Home', icon: 'home', description: 'For purchasing a second property', isDefault: true, timeframe: 'long' }
  ]
};

export const TIMEFRAME_COLORS = {
  short: '#0F766E', // Needs
  medium: '#F59E0B', // Wants
  long: '#10B981',  // Save
};

export const IMPORTANCE_COLORS = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#ef4444',
};

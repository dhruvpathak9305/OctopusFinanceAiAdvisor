/**
 * Mock implementations for service layer functions
 */

// Mock Supabase Client with proper method chaining
export const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    })
  },
  // Default resolved value for queries
  then: jest.fn().mockResolvedValue({ data: [], error: null })
};

// Helper to create a proper mock chain that resolves with data
export const createMockSupabaseChain = (resolvedValue = { data: [], error: null }) => {
  const chain = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
  };
  
  // Make the chain thenable (Promise-like)
  Object.keys(chain).forEach(key => {
    if (typeof chain[key] === 'function') {
      chain[key].mockImplementation(() => {
        const newChain = { ...chain };
        // The final method in the chain should resolve with the data
        newChain.then = jest.fn().mockResolvedValue(resolvedValue);
        return newChain;
      });
    }
  });
  
  chain.then = jest.fn().mockResolvedValue(resolvedValue);
  return chain;
};

// Mock API Response Structure
export const mockApiResponse = {
  success: (data) => ({ data, error: null }),
  error: (message) => ({ data: null, error: { message } })
};

// Mock Account Service
export const mockAccountService = {
  fetchAccounts: jest.fn().mockResolvedValue([
    {
      id: 'acc-1',
      name: 'Main Checking',
      type: 'checking',
      balance: 1500.00,
      institution: 'Chase Bank',
      account_number: '1234'
    }
  ]),
  addAccount: jest.fn().mockResolvedValue({
    id: 'acc-new',
    name: 'New Account',
    type: 'savings',
    balance: 0,
    institution: 'Bank',
    account_number: '9999'
  }),
  updateAccount: jest.fn().mockResolvedValue(true),
  deleteAccount: jest.fn().mockResolvedValue(true),
  fetchAccountsHistory: jest.fn().mockResolvedValue([
    { date: '2024-01', value: 5000 },
    { date: '2024-02', value: 5500 },
    { date: '2024-03', value: 6000 }
  ]),
  fetchAccountBalanceHistory: jest.fn().mockResolvedValue([
    { date: '2024-01', value: 3000 },
    { date: '2024-02', value: 3200 },
    { date: '2024-03', value: 3500 }
  ])
};

// Mock Credit Card Service
export const mockCreditCardService = {
  fetchCreditCards: jest.fn().mockResolvedValue([
    {
      id: 'cc-1',
      name: 'Chase Sapphire',
      bank: 'Chase',
      lastFourDigits: '9999',
      creditLimit: 2000.00,
      currentBalance: -250.00,
      dueDate: '2024-03-15'
    }
  ]),
  addCreditCard: jest.fn().mockResolvedValue({
    id: 'cc-new',
    name: 'New Card',
    bank: 'Bank',
    lastFourDigits: '0000',
    creditLimit: 1000.00,
    currentBalance: 0,
    dueDate: '2024-04-01'
  }),
  updateCreditCard: jest.fn().mockResolvedValue(true),
  deleteCreditCard: jest.fn().mockResolvedValue(true)
};

// Mock Transaction Service
export const mockTransactionService = {
  fetchTransactions: jest.fn().mockResolvedValue([
    {
      id: 'txn-1',
      amount: 25.50,
      description: 'Coffee Shop',
      date: '2024-03-15',
      category_id: 'cat-1',
      account_id: 'acc-1',
      type: 'expense',
      merchant: 'Starbucks'
    }
  ]),
  fetchTransactionById: jest.fn().mockResolvedValue({
    id: 'txn-1',
    amount: 25.50,
    description: 'Coffee Shop',
    date: '2024-03-15',
    category_id: 'cat-1',
    account_id: 'acc-1',
    type: 'expense',
    merchant: 'Starbucks'
  }),
  addTransaction: jest.fn().mockResolvedValue({
    id: 'txn-new',
    amount: 100.00,
    description: 'New Transaction',
    date: '2024-03-16',
    category_id: 'cat-1',
    account_id: 'acc-1',
    type: 'expense',
    merchant: 'Store'
  }),
  updateTransaction: jest.fn().mockResolvedValue(true),
  deleteTransaction: jest.fn().mockResolvedValue(true),
  fetchTransactionSummary: jest.fn().mockResolvedValue({
    total: 425.00,
    count: 3,
    averageAmount: 141.67,
    periodComparison: {
      current: 425.00,
      previous: 200.00,
      percentageChange: 112.5
    }
  }),
  fetchMonthlyTransactionSummary: jest.fn().mockResolvedValue({
    total: 1200.00,
    count: 8,
    averageAmount: 150.00
  }),
  prepareTransactionForInsert: jest.fn().mockReturnValue({
    name: 'Test Transaction',
    amount: 100.00,
    user_id: 'user-1',
    source_account_type: 'bank',
    is_recurring: false
  }),
  transformTransactionResponse: jest.fn().mockReturnValue({
    id: 'txn-1',
    name: 'Coffee Shop',
    category_name: 'Food & Dining',
    subcategory_name: 'Coffee'
  }),
  getMonthlyDateRanges: jest.fn().mockReturnValue([
    { start: '2024-01-01', end: '2024-01-31' },
    { start: '2024-02-01', end: '2024-02-29' },
    { start: '2024-03-01', end: '2024-03-31' }
  ])
};

// Mock Budget Service
export const mockBudgetService = {
  fetchCategories: jest.fn().mockResolvedValue([
    {
      id: 'cat-1',
      name: 'Food & Dining',
      budget_limit: 500,
      ring_color: '#ff6b6b',
      bg_color: '#ffe6e6'
    }
  ]),
  addCategory: jest.fn().mockResolvedValue({
    id: 'cat-new',
    name: 'New Category',
    budget_limit: 200,
    ring_color: '#000000',
    bg_color: '#ffffff'
  }),
  updateCategory: jest.fn().mockResolvedValue(true),
  deleteCategory: jest.fn().mockResolvedValue(true),
  fetchSubcategories: jest.fn().mockResolvedValue([
    {
      id: 'sub-1',
      name: 'Restaurants',
      category_id: 'cat-1',
      budget_limit: 200
    }
  ]),
  addSubcategory: jest.fn().mockResolvedValue({
    id: 'sub-new',
    name: 'New Subcategory',
    category_id: 'cat-1',
    budget_limit: 100
  }),
  updateSubcategory: jest.fn().mockResolvedValue(true),
  deleteSubcategory: jest.fn().mockResolvedValue(true)
};

// Mock Budget Subcategory Service
export const mockBudgetSubcategoryService = {
  updateSubCategoryInDB: jest.fn().mockResolvedValue(true),
  addSubCategoryToDB: jest.fn().mockResolvedValue({
    id: 'sub-new',
    name: 'Groceries',
    amount: 400,
    color: '#4caf50',
    icon: '🛒',
    category_id: 'cat-1'
  }),
  deleteSubCategoryFromDB: jest.fn().mockResolvedValue(true)
};

// Mock Autopay Service
export const mockAutopayService = {
  processAutopayForDueBills: jest.fn().mockResolvedValue({
    processed: 2,
    errors: 0
  }),
  updatePendingBillStatuses: jest.fn().mockResolvedValue({
    updated: 3
  })
};

// Mock AI Service
export const mockAIService = {
  analyzeTransaction: jest.fn().mockResolvedValue({
    category: 'Food & Dining',
    subcategory: 'Restaurants',
    confidence: 0.95,
    merchant: 'Starbucks'
  }),
  analyzeSMS: jest.fn().mockResolvedValue({
    transactions: [
      {
        amount: 25.50,
        description: 'Coffee purchase',
        merchant: 'Starbucks',
        category: 'Food & Dining'
      }
    ]
  }),
  analyzeImage: jest.fn().mockResolvedValue({
    text: 'Receipt text',
    transactions: [
      {
        amount: 15.99,
        description: 'Grocery purchase',
        merchant: 'Grocery Store'
      }
    ]
  })
};

// Mock Demo Data
export const mockDemoData = {
  accounts: [
    {
      id: 'demo-acc-1',
      name: 'Demo Checking',
      type: 'checking',
      balance: 2500.00,
      institution: 'Demo Bank'
    }
  ],
  transactions: [
    {
      id: 'demo-txn-1',
      amount: 50.00,
      description: 'Demo Transaction',
      date: '2024-03-15',
      type: 'expense'
    }
  ],
  categories: [
    {
      id: 'demo-cat-1',
      name: 'Demo Category',
      budget_limit: 300
    }
  ]
}; 
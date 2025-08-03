// Top-level const mock
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  single: jest.fn(), // To be mocked in individual tests
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  rpc: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
};

jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

jest.mock('@/utils/tableMapping', () => ({
  getTableMap: jest.fn().mockReturnValue({
    budget_periods: 'budget_periods_mock',
    budget_categories: 'budget_categories_mock',
    transactions: 'transactions_mock',
  }),
  validateTableConsistency: jest.fn()
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Import service and types AFTER mocks
import { advancedBudgetingService, BudgetSettings, BudgetStrategy } from '../advancedBudgetingService';

describe('advancedBudgetingService', () => {
  const mockUserId = 'user-123';
  const mockUser = { id: mockUserId };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  describe('saveBudgetSettings', () => {
    const mockSettings: BudgetSettings = {
      type: 'monthly',
      amount: 3000,
      applyToAllMonths: false,
      strategy: 'zero-based' as BudgetStrategy,
      categories: [
        { name: 'Needs', percentage: 50, amount: 1500, bgColor: '#FF0000', ringColor: '#AA0000' },
        { name: 'Wants', percentage: 30, amount: 900, bgColor: '#00FF00', ringColor: '#00AA00' },
      ],
      needsPercentage: 50,
      wantsPercentage: 30,
    };

    const mockPeriodData = {
      id: 'period-1',
      user_id: mockUserId,
      total_budget: mockSettings.amount,
    };

    it('saves budget settings successfully (single month)', async () => {
      const mockPeriodInsertSingle = jest.fn().mockResolvedValue({ data: mockPeriodData, error: null });
      const mockPeriodInsertSelect = jest.fn().mockReturnValue({ single: mockPeriodInsertSingle });
      const mockPeriodInsert = jest.fn().mockReturnValue({ select: mockPeriodInsertSelect });
      
      const mockCategoryInsert = jest.fn().mockResolvedValue({ error: null });

      const mockFromPeriods = jest.fn().mockImplementation((tableName: string) => {
        if (tableName === 'budget_periods_mock') {
          return { insert: mockPeriodInsert };
        }
        return mockSupabaseClient;
      });
      
      const mockFromCategories = jest.fn().mockImplementation((tableName: string) => {
        if (tableName === 'budget_categories_mock') {
          return { insert: mockCategoryInsert };
        }
        return mockSupabaseClient;
      });

      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        if (tableName === 'budget_periods_mock') return mockFromPeriods(tableName);
        if (tableName === 'budget_categories_mock') return mockFromCategories(tableName);
        return mockSupabaseClient;
      });
      
      const result = await advancedBudgetingService.saveBudgetSettings(mockSettings, false);
      
      expect(result).toEqual(mockPeriodData);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_periods_mock');
      expect(mockPeriodInsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: mockUserId, total_budget: mockSettings.amount }));
      expect(mockPeriodInsertSelect).toHaveBeenCalled();
      expect(mockPeriodInsertSingle).toHaveBeenCalled();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories_mock');
      expect(mockCategoryInsert).toHaveBeenCalledTimes(mockSettings.categories.length);
      mockSettings.categories.forEach(cat => {
        expect(mockCategoryInsert).toHaveBeenCalledWith(expect.objectContaining({
          user_id: mockUserId,
          name: cat.name,
          percentage: cat.percentage,
          budget_limit: cat.amount
        }));
      });
      expect(jest.requireMock('react-hot-toast').toast.success).toHaveBeenCalledWith('Budget settings saved successfully');
    });
    
    it('saves budget settings successfully (applyToAllMonths)', async () => {
      const settingsForAllMonths = { ...mockSettings, applyToAllMonths: true };
      const mockPeriodInsertSingle = jest.fn().mockResolvedValue({ data: mockPeriodData, error: null });
      const mockPeriodInsertSelect = jest.fn().mockReturnValue({ single: mockPeriodInsertSingle });
      const mockPeriodInsert = jest.fn().mockReturnValue({ select: mockPeriodInsertSelect }); 
      
      const mockCategoryInsert = jest.fn().mockResolvedValue({ error: null });

      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        if (tableName === 'budget_periods_mock') return { insert: mockPeriodInsert };
        if (tableName === 'budget_categories_mock') return { insert: mockCategoryInsert };
        return mockSupabaseClient;
      });

      await advancedBudgetingService.saveBudgetSettings(settingsForAllMonths, false);

      // Current month (1) + 11 future months = 12 calls to insert on budget_periods
      expect(mockPeriodInsert).toHaveBeenCalledTimes(12);
      expect(jest.requireMock('react-hot-toast').toast.success).toHaveBeenCalledWith('Budget settings saved successfully');
    });

    it('handles error during budget period creation', async () => {
      const dbError = new Error('DB period insert error');
      const mockPeriodInsertSingle = jest.fn().mockResolvedValue({ data: null, error: dbError });
      const mockPeriodInsertSelect = jest.fn().mockReturnValue({ single: mockPeriodInsertSingle });
      const mockPeriodInsert = jest.fn().mockReturnValue({ select: mockPeriodInsertSelect });

      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        if (tableName === 'budget_periods_mock') return { insert: mockPeriodInsert };
        return mockSupabaseClient;
      });

      await expect(advancedBudgetingService.saveBudgetSettings(mockSettings, false))
        .rejects.toThrow('DB period insert error');
      expect(jest.requireMock('react-hot-toast').toast.error).toHaveBeenCalledWith('Failed to save budget settings');
    });

    it('handles error during budget category creation', async () => {
      const mockPeriodInsertSingle = jest.fn().mockResolvedValue({ data: mockPeriodData, error: null });
      const mockPeriodInsertSelect = jest.fn().mockReturnValue({ single: mockPeriodInsertSingle });
      const mockPeriodInsert = jest.fn().mockReturnValue({ select: mockPeriodInsertSelect });
      
      const categoryDbError = new Error('DB category insert error');
      const mockCategoryInsert = jest.fn().mockResolvedValue({ error: categoryDbError });

      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        if (tableName === 'budget_periods_mock') return { insert: mockPeriodInsert };
        if (tableName === 'budget_categories_mock') return { insert: mockCategoryInsert };
        return mockSupabaseClient;
      });
      
      mockCategoryInsert.mockImplementationOnce(() => Promise.reject(categoryDbError));

      await expect(advancedBudgetingService.saveBudgetSettings(mockSettings, false))
        .rejects.toThrow('DB category insert error');
      expect(jest.requireMock('react-hot-toast').toast.error).toHaveBeenCalledWith('Failed to save budget settings');
    });
    
    it('throws error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      await expect(advancedBudgetingService.saveBudgetSettings(mockSettings, false))
        .rejects.toThrow('User not authenticated');
    });
  });

  describe('createZeroBasedBudget', () => {
    it('creates zero-based budget successfully', async () => {
      const mockTxData = { id: 'tx-zbb-1', user_id: mockUserId, amount: 100, category_id: 'cat-1' };
      const mockSingle = jest.fn().mockResolvedValue({ data: mockTxData, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        if (tableName === 'transactions_mock') return { insert: mockInsert };
        return mockSupabaseClient;
      });

      const result = await advancedBudgetingService.createZeroBasedBudget('period-1', 'cat-1', 100, false);

      expect(result).toEqual({
        id: 'tx-zbb-1',
        period_id: 'period-1',
        category_id: 'cat-1',
        allocated_amount: 100,
        spent_amount: 0,
        remaining_amount: 100
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions_mock');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: mockUserId,
        category_id: 'cat-1',
        amount: 100,
        metadata: expect.objectContaining({ period_id: 'period-1', budget_type: 'zero-based' })
      }));
    });
     it('throws error if user is not authenticated for createZeroBasedBudget', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      await expect(advancedBudgetingService.createZeroBasedBudget('p1', 'c1', 100, false))
        .rejects.toThrow('User not authenticated');
    });
    it('handles db error for createZeroBasedBudget', async () => {
      const dbError = new Error("DB insert error ZBB");
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: dbError });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        if (tableName === 'transactions_mock') return { insert: mockInsert };
        return mockSupabaseClient;
      });
       await expect(advancedBudgetingService.createZeroBasedBudget('p1', 'c1', 100, false))
        .rejects.toThrow('DB insert error ZBB');
    });
  });

  // ... (Keep placeholders for other functions or implement them similarly) ...
  // analyzeSpendingPatterns, adjustRollingBudget, getBudgetRecommendations
  // These would require understanding their Supabase interactions from the service file.
}); 
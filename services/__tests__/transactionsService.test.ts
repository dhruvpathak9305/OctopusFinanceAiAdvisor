/**
 * Unit tests for transactionsService.ts
 * Tests transaction CRUD operations, filtering, summaries, and transformations
 */

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
  ilike: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn(),
  auth: {
    getUser: jest.fn()
  }
};

jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

jest.mock('@/utils/tableMapping', () => ({
  getTableMap: jest.fn((isDemo: boolean) => ({
    transactions: isDemo ? 'transactions' : 'transactions_real',
    budget_categories: isDemo ? 'budget_categories' : 'budget_categories_real',
    budget_subcategories: isDemo ? 'budget_subcategories' : 'budget_subcategories_real'
  })),
  validateTableConsistency: jest.fn().mockReturnValue(true)
}));

// Import after mocking
import {
  fetchTransactionById,
  fetchTransactions,
  fetchTransactionSummary,
  fetchMonthlyTransactionSummary,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  prepareTransactionForInsert,
  transformTransactionResponse,
  getMonthlyDateRanges
} from '../transactionsService';
import { Transaction } from '@/types/transactions';

describe('transactionsService', () => {
  const mockUser = { id: 'user-1' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authentication
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  describe('fetchTransactionById', () => {
    const mockTransaction = {
      id: 'txn-1',
      name: 'Coffee Shop',
      amount: 25.50,
      date: '2024-03-15',
      type: 'expense',
      merchant: 'Starbucks',
      category_id: 'cat-1',
      user_id: 'user-1',
      budget_categories: { name: 'Food & Dining' },
      budget_subcategories: { name: 'Coffee' }
    };

    it('should fetch transaction by ID successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockTransaction,
        error: null
      });
      const mockEqId = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqUser = jest.fn().mockReturnValue({ eq: mockEqId });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEqUser });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const result = await fetchTransactionById('txn-1', false);

      expect(result).toBeDefined();
      expect(result?.id).toBe('txn-1');
      expect(result?.category_name).toBe('Food & Dining');
      expect(result?.subcategory_name).toBe('Coffee');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions_real');
      expect(mockEqUser).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockEqId).toHaveBeenCalledWith('id', 'txn-1');
    });

    it('should return null when transaction not found', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null
      });
      const mockEqId = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqUser = jest.fn().mockReturnValue({ eq: mockEqId });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEqUser });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const result = await fetchTransactionById('non-existent', false);

      expect(result).toBeNull();
    });

    it('should handle authentication failure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(fetchTransactionById('txn-1', false)).rejects.toThrow('User not authenticated');
    });
  });

  describe('fetchTransactions', () => {
    const mockTransactions = [
      {
        id: 'txn-1',
        name: 'Coffee Shop',
        amount: 25.50,
        date: '2024-03-15',
        type: 'expense',
        budget_categories: { name: 'Food & Dining' },
        budget_subcategories: { name: 'Coffee' }
      },
      {
        id: 'txn-2',
        name: 'Salary',
        amount: 5000.00,
        date: '2024-03-01',
        type: 'income',
        budget_categories: { name: 'Income' },
        budget_subcategories: null
      }
    ];

    it('should fetch all transactions successfully', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockTransactions,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const result = await fetchTransactions({}, false);

      expect(result).toHaveLength(2);
      expect(result[0].category_name).toBe('Food & Dining');
      expect(result[1].category_name).toBe('Income');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions_real');
    });

    it('should filter transactions by type', async () => {
      const expenseTransactions = [mockTransactions[0]];
      const mockOrder = jest.fn().mockResolvedValue({
        data: expenseTransactions,
        error: null
      });
      const mockEqType = jest.fn().mockReturnValue({ order: mockOrder });
      const mockEqUser = jest.fn().mockReturnValue({ eq: mockEqType });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEqUser });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const result = await fetchTransactions({ type: 'expense' }, false);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('expense');
      expect(mockEqType).toHaveBeenCalledWith('type', 'expense');
    });

    it('should filter transactions by date range', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockTransactions,
        error: null
      });
      const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
      const mockGte = jest.fn().mockReturnValue({ lte: mockLte });
      const mockEq = jest.fn().mockReturnValue({ gte: mockGte });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const dateRange = {
        start: new Date('2024-03-01'),
        end: new Date('2024-03-31')
      };

      await fetchTransactions({ dateRange }, false);

      expect(mockGte).toHaveBeenCalledWith('date', dateRange.start.toISOString());
      expect(mockLte).toHaveBeenCalledWith('date', dateRange.end.toISOString());
    });

    it('should filter transactions by search query', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: [mockTransactions[0]],
        error: null
      });
      const mockOr = jest.fn().mockReturnValue({ order: mockOrder });
      const mockEq = jest.fn().mockReturnValue({ or: mockOr });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      await fetchTransactions({ searchQuery: 'coffee' }, false);

      expect(mockOr).toHaveBeenCalledWith(
        'description.ilike.%coffee%,category.ilike.%coffee%,subcategory.ilike.%coffee%'
      );
    });
  });

  describe('addTransaction', () => {
    const newTransaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      name: 'New Transaction',
      description: 'Test transaction',
      amount: 100,
      date: '2024-03-16',
      type: 'expense',
      category_id: 'cat-1',
      subcategory_id: null,
      icon: null,
      merchant: null,
      source_account_id: null,
      source_account_type: 'bank',
      source_account_name: null,
      destination_account_id: null,
      destination_account_type: null,
      destination_account_name: null,
      is_recurring: false,
      recurrence_pattern: null,
      recurrence_end_date: null,
      parent_transaction_id: null,
      interest_rate: null,
      loan_term_months: null,
      metadata: null
      // ❌ EXCLUDE is_credit_card - it's a GENERATED column
    };

    it('should add transaction successfully', async () => {
      const createdTransaction = {
        id: 'txn-new',
        ...newTransaction,
        user_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: createdTransaction,
        error: null
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });

      const result = await addTransaction(newTransaction, false);

      expect(result.id).toBe('txn-new');
      expect(result.name).toBe('New Transaction');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions_real');
      // Service calls insert with an array containing the transaction data
      expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
        name: newTransaction.name,
        amount: newTransaction.amount,
        type: newTransaction.type,
        user_id: 'user-1'
      })]);
    });

    it('should handle insertion errors', async () => {
      const insertError = new Error('Insert failed');
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: insertError
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });

      await expect(addTransaction(newTransaction, false)).rejects.toThrow('Insert failed');
    });

    it('should handle demo mode', async () => {
      const createdTransaction = {
        id: 'txn-new',
        ...newTransaction,
        user_id: 'user-1'
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: createdTransaction,
        error: null
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });

      await addTransaction(newTransaction, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
    });
  });

  describe('updateTransaction', () => {
    const transactionId = 'txn-1';
    const updates = {
      name: 'Updated Transaction',
      amount: 200
    };

    it('should update transaction successfully', async () => {
      const updatedTransaction = {
        id: transactionId,
        ...updates,
        user_id: 'user-1',
        type: 'expense'
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: updatedTransaction,
        error: null
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqUser = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqUser });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });

      mockSupabaseClient.from.mockReturnValue({ update: mockUpdate });

      const result = await updateTransaction(transactionId, updates, false);

      expect(result.id).toBe(transactionId);
      expect(result.name).toBe('Updated Transaction');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions_real');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        name: updates.name,
        amount: updates.amount
      }));
      // Chain order: .eq('id', id).eq('user_id', user.id)
      expect(mockEqId).toHaveBeenCalledWith('id', transactionId);
      expect(mockEqUser).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('should handle update errors', async () => {
      const updateError = new Error('Update failed');
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: updateError
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEqUser = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqUser });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqId });

      mockSupabaseClient.from.mockReturnValue({ update: mockUpdate });

      await expect(updateTransaction(transactionId, updates, false)).rejects.toThrow('Update failed');
    });
  });

  describe('deleteTransaction', () => {
    const transactionId = 'txn-1';

    it('should delete transaction successfully', async () => {
      const mockEqUser = jest.fn().mockResolvedValue({ error: null });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqUser });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });

      mockSupabaseClient.from.mockReturnValue({ delete: mockDelete });

      await deleteTransaction(transactionId, false);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions_real');
      // Chain order: .eq('id', id).eq('user_id', user.id)
      expect(mockEqId).toHaveBeenCalledWith('id', transactionId);
      expect(mockEqUser).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('should handle deletion errors', async () => {
      const deleteError = new Error('Delete failed');
      const mockEqUser = jest.fn().mockResolvedValue({ error: deleteError });
      const mockEqId = jest.fn().mockReturnValue({ eq: mockEqUser });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqId });

      mockSupabaseClient.from.mockReturnValue({ delete: mockDelete });

      await expect(deleteTransaction(transactionId, false)).rejects.toThrow('Delete failed');
    });
  });

  describe('fetchTransactionSummary', () => {
    it('should calculate transaction summary successfully', async () => {
      const mockTransactions = [
        { amount: 100, type: 'expense' },
        { amount: 200, type: 'expense' },
        { amount: 500, type: 'income' }
      ];

      const mockOrder = jest.fn().mockResolvedValue({
        data: mockTransactions,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const result = await fetchTransactionSummary({}, false, false);

      expect(result.total).toBe(800); // Sum of all transactions
      expect(result.count).toBe(3);
      expect(result.averageAmount).toBeCloseTo(266.67, 2); // Use toBeCloseTo for floating point
    });
  });

  describe('fetchMonthlyTransactionSummary', () => {
    it('should fetch monthly summary for expenses', async () => {
      const mockTransactions = [
        { amount: 100, type: 'expense' },
        { amount: 50, type: 'expense' }
      ];

      const mockOrder = jest.fn().mockResolvedValue({
        data: mockTransactions,
        error: null
      });
      const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
      const mockGte = jest.fn().mockReturnValue({ lte: mockLte });
      const mockEqType = jest.fn().mockReturnValue({ gte: mockGte });
      const mockEqUser = jest.fn().mockReturnValue({ eq: mockEqType });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEqUser });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const result = await fetchMonthlyTransactionSummary('expense', false);

      expect(result.total).toBe(150);
      expect(result.count).toBe(2);
      expect(result.averageAmount).toBe(75);
    });
  });

  describe('utility functions', () => {
    describe('getMonthlyDateRanges', () => {
      it('should return correct date ranges for current and previous month', () => {
        const testDate = new Date('2024-03-15T12:00:00.000Z'); // Use UTC
        const result = getMonthlyDateRanges(testDate);

        // March input should give March as current month (index 2)
        expect(result.current.start.getUTCFullYear()).toBe(2024);
        expect(result.current.start.getUTCMonth()).toBe(2); // March (0-indexed)
        expect(result.current.start.getUTCDate()).toBe(1);
        
        expect(result.current.end.getUTCFullYear()).toBe(2024);
        expect(result.current.end.getUTCMonth()).toBe(2); // March
        expect(result.current.end.getUTCDate()).toBe(31);
        
        // February should be the previous month (index 1)
        expect(result.previous.start.getUTCFullYear()).toBe(2024);
        expect(result.previous.start.getUTCMonth()).toBe(1); // February (0-indexed)
        expect(result.previous.start.getUTCDate()).toBe(1);
        
        expect(result.previous.end.getUTCFullYear()).toBe(2024);
        expect(result.previous.end.getUTCMonth()).toBe(1); // February
        expect(result.previous.end.getUTCDate()).toBe(29); // 2024 is a leap year
      });
    });

    describe('prepareTransactionForInsert', () => {
      it('should prepare transaction data correctly', () => {
        const transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
          name: 'Test Transaction',
          description: 'Test description',
          amount: 100,
          date: '2024-03-15',
          type: 'expense',
          category_id: null,
          subcategory_id: null,
          icon: null,
          merchant: null,
          source_account_id: null,
          source_account_type: 'bank',
          source_account_name: null,
          destination_account_id: null,
          destination_account_type: null,
          destination_account_name: null,
          is_recurring: false,
          recurrence_pattern: null,
          recurrence_end_date: null,
          parent_transaction_id: null,
          interest_rate: null,
          loan_term_months: null,
          metadata: null
          // ❌ EXCLUDE is_credit_card - it's a GENERATED column
        };

        const result = prepareTransactionForInsert(transaction, 'user-1');

        expect(result).toEqual(expect.objectContaining({
          name: 'Test Transaction',
          amount: 100,
          date: '2024-03-15',
          type: 'expense',
          description: 'Test description',
          source_account_type: 'bank'
        }));
      });
    });

    describe('transformTransactionResponse', () => {
      it('should transform raw database response correctly', () => {
        const rawData = {
          id: 'txn-1',
          name: 'Coffee',
          amount: 5.50,
          budget_categories: { name: 'Food' },
          budget_subcategories: { name: 'Coffee' }
        };

        const result = transformTransactionResponse(rawData);

        expect(result.category_name).toBe('Food');
        expect(result.subcategory_name).toBe('Coffee');
      });
    });
  });
}); 
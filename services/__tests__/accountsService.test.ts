/**
 * Unit tests for accountsService.ts
 * Tests account CRUD operations, history fetching, and authentication
 */

// Mock Supabase client using the pattern from budgetService.test.ts
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(), // Will be mocked per test
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  auth: {
    getUser: jest.fn() // Will be mocked per test or in beforeEach
  }
};

jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

jest.mock('@/utils/tableMapping', () => ({
  getTableMap: jest.fn().mockReturnValue({
    accounts: 'accounts',
    transactions: 'transactions'
  }),
  validateTableConsistency: jest.fn()
}));

// Import after mocking, similar to budgetService.test.ts
import {
  fetchAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  fetchAccountsHistory,
  fetchAccountBalanceHistory
} from '../accountsService';
import { Account } from '@/contexts/AccountsContext';

describe('accountsService', () => {
  const mockUser = { id: 'user-1' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for getUser for most tests
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  describe('fetchAccounts', () => {
    const mockAccountsData = [
      {
        id: 'acc-1',
        name: 'Main Checking',
        type: 'checking',
        institution: 'Chase Bank',
        balance: 1500.00,
        account_number: '1234',
        logo_url: 'https://example.com/logo.png',
        user_id: 'user-1'
      },
      {
        id: 'acc-2',
        name: 'Savings Account',
        type: 'savings',
        institution: 'Bank of America',
        balance: 5000.00,
        account_number: '5678',
        logo_url: null,
        user_id: 'user-1'
      }
    ];

    it('should fetch accounts successfully', async () => {
      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: mockAccountsData,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelect });

      const result = await fetchAccounts(false);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'acc-1',
        name: 'Main Checking',
        type: 'checking',
        institution: 'Chase Bank',
        balance: 1500.00,
        account_number: '1234',
        logo_url: 'https://example.com/logo.png'
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('accounts');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });
    });

    it('should handle empty accounts list', async () => {
      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: [],
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelect });

      const result = await fetchAccounts(false);
      expect(result).toEqual([]);
    });

    it('should handle authentication failure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      });
      await expect(fetchAccounts(false)).rejects.toThrow('User not authenticated');
    });

    it('should handle database errors', async () => {
      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: null,
        error: new Error('Database error')
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelect });

      await expect(fetchAccounts(false)).rejects.toThrow('Database error');
    });

    it('should handle demo mode', async () => {
      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: mockAccountsData,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelect });

      const result = await fetchAccounts(true); // isDemo = true
      expect(result).toHaveLength(2);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('accounts'); // Assuming getTableMapping handles demo mode correctly for table name
    });
  });

  describe('addAccount', () => {
    const newAccount: Omit<Account, 'id'> = {
      name: 'New Checking',
      type: 'checking',
      institution: 'Wells Fargo',
      balance: 2000.00,
      account_number: '9999',
      logo_url: 'https://example.com/wells.png'
    };

    const mockInsertedAccount = {
      id: 'acc-new',
      ...newAccount,
      user_id: 'user-1'
    };

    it('should add account successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: mockInsertedAccount,
        error: null
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockSupabaseClient.from.mockReturnValueOnce({ insert: mockInsert });

      const result = await addAccount(newAccount as Account, false);

      expect(result).toEqual({
        id: 'acc-new',
        name: 'New Checking',
        type: 'checking',
        institution: 'Wells Fargo',
        balance: 2000.00,
        account_number: '9999',
        logo_url: 'https://example.com/wells.png'
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('accounts');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ name: newAccount.name }));
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
    });

    it('should handle authentication failure for addAccount', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      });
      await expect(addAccount(newAccount as Account, false)).rejects.toThrow('User not authenticated');
    });

    it('should handle insertion errors for addAccount', async () => {
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: null,
        error: new Error('Insert failed')
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockSupabaseClient.from.mockReturnValueOnce({ insert: mockInsert });

      await expect(addAccount(newAccount as Account, false)).rejects.toThrow('Insert failed');
    });

    it('should handle demo mode', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockInsertedAccount,
        error: null
      });

      const result = await addAccount(newAccount as Account, true);

      expect(result.id).toBe('acc-new');
      expect(mockSupabaseClient.insert).toHaveBeenCalled(); // Ensure insert was called
    });
  });

  describe('updateAccount', () => {
    const accountToUpdate: Account = {
      id: 'acc-1',
      name: 'Updated Checking',
      type: 'checking',
      institution: 'Chase Bank',
      balance: 1800.00,
      account_number: '1234',
      logo_url: 'https://example.com/updated.png'
    };

    const mockUpdatedAccount = {
      ...accountToUpdate,
      user_id: 'user-1'
    };

    it('should update account successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: mockUpdatedAccount,
        error: null
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      // For update().eq().eq().select().single()
      // The .eq calls are part of the filter builder returned by update() before select()
      const mockEq2 = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabaseClient.from.mockReturnValueOnce({ update: mockUpdate });
      
      const result = await updateAccount(accountToUpdate, false);

      expect(result).toEqual({
        id: 'acc-1',
        name: 'Updated Checking',
        type: 'checking',
        institution: 'Chase Bank',
        balance: 1800.00,
        account_number: '1234',
        logo_url: 'https://example.com/updated.png'
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('accounts');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: accountToUpdate.name }));
      expect(mockEq1).toHaveBeenCalledWith('id', accountToUpdate.id);
      expect(mockEq2).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
    });

    it('should handle missing account ID', async () => {
      const accountWithoutId = { ...accountToUpdate };
      delete (accountWithoutId as any).id;

      await expect(updateAccount(accountWithoutId, false)).rejects.toThrow('Account ID is required for updates');
    });

    it('should handle authentication failure for updateAccount', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      });
      await expect(updateAccount(accountToUpdate, false)).rejects.toThrow('User not authenticated');
    });

    it('should handle update errors for updateAccount', async () => {
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: null,
        error: new Error('Update failed')
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEq2 = jest.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabaseClient.from.mockReturnValueOnce({ update: mockUpdate });
      
      await expect(updateAccount(accountToUpdate, false)).rejects.toThrow('Update failed');
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      // For delete().eq().eq()
      // The result of the final .eq() is what's awaited (it's a PostgrestResponse)
      const mockEq2 = jest.fn().mockResolvedValueOnce({ error: null }); // delete chain ends with the last filter if no select
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabaseClient.from.mockReturnValueOnce({ delete: mockDelete });

      await deleteAccount('acc-1', false);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('accounts');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq1).toHaveBeenCalledWith('id', 'acc-1');
      expect(mockEq2).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    it('should handle authentication failure for deleteAccount', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      });
      await expect(deleteAccount('acc-1', false)).rejects.toThrow('User not authenticated');
    });

    it('should handle deletion errors for deleteAccount', async () => {
      const mockEq2 = jest.fn().mockResolvedValueOnce({ error: new Error('Delete failed') });
      const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabaseClient.from.mockReturnValueOnce({ delete: mockDelete });

      await expect(deleteAccount('acc-1', false)).rejects.toThrow('Delete failed');
    });
  });

  describe('fetchAccountsHistory', () => {
    it('should fetch accounts history successfully', async () => {
      const mockTransactionData = [
        { 
          date: '2024-01-15', 
          amount: 1000, 
          type: 'income' 
        },
        { 
          date: '2024-02-15', 
          amount: 500, 
          type: 'expense' 
        },
        { 
          date: '2024-03-15', 
          amount: 1500, 
          type: 'income' 
        }
      ];

      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: mockTransactionData,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelect });

      const result = await fetchAccountsHistory(12, false);

      expect(result).toHaveLength(12); // Should return 12 months of data
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('value');
      expect(typeof result[0].value).toBe('number');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions'); // As per service code
    });

    it('should generate placeholder data when no history exists', async () => {
      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: [],
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelect });

      const result = await fetchAccountsHistory(12, false);

      expect(result).toHaveLength(12);
      // Check that placeholder values are positive, as per original logic
      result.forEach(item => expect(item.value).toBeGreaterThanOrEqual(0)); 
    });

    it('should handle database errors gracefully', async () => {
      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelect });

      const result = await fetchAccountsHistory(12, false);

      // Should return placeholder data on error
      expect(result).toHaveLength(12);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('value');
      result.forEach(item => expect(item.value).toBeGreaterThanOrEqual(0));
    });
  });

  describe('fetchAccountBalanceHistory', () => {
    it('should fetch account balance history successfully', async () => {
      const mockHistoryData = [
        { snapshot_date: '2024-01-01', total_balance: 3000 },
        { snapshot_date: '2024-02-01', total_balance: 3200 },
        { snapshot_date: '2024-03-01', total_balance: 3500 }
      ];

      const mockOrder = jest.fn().mockResolvedValueOnce({ data: mockHistoryData, error: null });
      const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
      const mockGte = jest.fn().mockReturnValue({ lte: mockLte });
      const mockEq = jest.fn().mockReturnValue({ gte: mockGte });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelect });
      
      const result = await fetchAccountBalanceHistory('user-1', 12, false);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: 'Jan',
        value: 3000
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('account_balance_history');
    });

    it('should generate placeholder data when no history exists', async () => {
      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: [],
        error: null
      });
      const mockLte = jest.fn().mockReturnValue({ order: mockOrder });
      const mockGte = jest.fn().mockReturnValue({ lte: mockLte });
      const mockEq = jest.fn().mockReturnValue({ gte: mockGte });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelect });

      const result = await fetchAccountBalanceHistory('user-1', 12, false);

      expect(result).toHaveLength(12);
      result.forEach(item => expect(item.value).toBeGreaterThanOrEqual(0));
    });
  });
}); 
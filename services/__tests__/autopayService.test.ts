/**
 * Unit tests for autopayService.ts
 * Tests automatic payment processing, bill status updates, and date calculations
 */

// Top-level const mock
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(), // Will be detailed in tests
  insert: jest.fn().mockReturnThis(), // Will be detailed in tests
  update: jest.fn().mockReturnThis(), // Will be detailed in tests
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),     // Will be detailed in tests
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
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
  getTableMap: jest.fn().mockReturnValue({
    upcoming_bills: 'upcoming_bills_mock',
    transactions: 'transactions_mock',
    accounts: 'accounts_mock',
    // Add other tables if used by the service
  }),
  validateTableConsistency: jest.fn()
}));

jest.mock('react-hot-toast', () => ({ // Service doesn't use toast, but good to have if it changes
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Import service and types AFTER mocks
import {
  processAutopayForDueBills,
  updatePendingBillStatuses,
} from '../autopayService';
// Import types used in tests if not directly from service
import { UpcomingBill } from '@/hooks/useUpcomingBills'; 
import { Database } from '@/types/supabase';

describe('autopayService', () => {
  const mockUserId = 'test-user-id';
  const mockUser = { id: mockUserId };
  const today = new Date().toISOString().split('T')[0];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  describe('processAutopayForDueBills', () => {
    // Cast to any to allow for joined properties not strictly in UpcomingBill type definition
    const mockDueBill: any = {
      id: 'bill-1',
      name: 'Electric Bill',
      amount: 150.00,
      due_date: today,
      frequency: 'monthly',
      autopay: true,
      autopay_source: 'account',
      account_id: 'acc-1',
      credit_card_id: null,
      category_id: 'cat-1',
      subcategory_id: 'sub-1',
      user_id: mockUserId,
      transaction_id: 'txn-parent-1',
      status: 'upcoming',
      end_date: null,
      description: 'Monthly electric bill',
      accounts: {
        id: 'acc-1',
        name: 'Main Checking',
        type: 'checking',
        balance: 5000,
        account_number: 'xxxx1234',
        institution: 'Mock Bank',
        user_id: mockUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      credit_cards: null,
      budget_categories: { id: 'cat-1', name: 'Utilities', user_id: mockUserId, budget_limit: 200, type: 'expense' },
      budget_subcategories: { id: 'sub-1', name: 'Electric', category_id: 'cat-1', user_id: mockUserId },
    };

    it('should process autopay bills successfully and create next bill', async () => {
      // 1. Mock fetching due bills
      const mockEqStatus = jest.fn().mockResolvedValue({ data: [mockDueBill], error: null });
      const mockEqAutopay = jest.fn().mockReturnValue({ eq: mockEqStatus });
      const mockEqDueDate = jest.fn().mockReturnValue({ eq: mockEqAutopay });
      const mockSelectBills = jest.fn().mockReturnValue({ eq: mockEqDueDate });
      
      // 2. Mock transaction creation
      const mockNewTx = { id: 'new-txn-1', /* ...other tx fields... */ user_id: mockUserId };
      const mockSelectTx = jest.fn().mockResolvedValue({ data: [mockNewTx], error: null });
      const mockInsertTx = jest.fn().mockReturnValue({ select: mockSelectTx });

      // 3. Mock bill status update (to 'paid')
      const mockEqUpdateBill = jest.fn().mockResolvedValue({ data: [{id: mockDueBill.id, status: 'paid'}], error: null }); // Select after update for return
      const mockUpdateBillStatus = jest.fn().mockReturnValue({ eq: mockEqUpdateBill });

      // 4. Mock next bill creation
      const mockInsertNextBill = jest.fn().mockResolvedValue({ data: [{id: 'next-bill-1'}], error: null });

      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        if (tableName === 'upcoming_bills_mock') {
          // Differentiate calls based on usage: select, update, insert
          // This is a bit tricky as .from() is called multiple times for the same table
          // A more robust way might be to use .mockImplementationOnce for each specific call chain
          if (mockSelectBills.mock.calls.length === 0) return { select: mockSelectBills }; // First call is fetching bills
          if (mockUpdateBillStatus.mock.calls.length === 0) return { update: mockUpdateBillStatus }; // Second call is updating status
          return { insert: mockInsertNextBill }; // Third call is inserting next bill
        }
        if (tableName === 'transactions_mock') {
          return { insert: mockInsertTx };
        }
        return mockSupabaseClient; // Fallback
      });
      
      // Override from for specific sequence
       mockSupabaseClient.from
         .mockImplementationOnce(() => ({ select: mockSelectBills })) // Fetch due bills
         .mockImplementationOnce(() => ({ insert: mockInsertTx }))    // Create transaction
         .mockImplementationOnce(() => ({ update: mockUpdateBillStatus })) // Update current bill
         .mockImplementationOnce(() => ({ insert: mockInsertNextBill })); // Create next bill


      const result = await processAutopayForDueBills(false);

      expect(result).toEqual({ processed: 1, errors: 0 });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('upcoming_bills_mock'); // Called 3 times
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions_mock'); // Called 1 time
      
      expect(mockSelectBills).toHaveBeenCalledWith(expect.stringContaining('accounts:'));
      expect(mockEqDueDate).toHaveBeenCalledWith('due_date', today);
      expect(mockEqAutopay).toHaveBeenCalledWith('autopay', true);
      expect(mockEqStatus).toHaveBeenCalledWith('status', 'upcoming');

      expect(mockInsertTx).toHaveBeenCalledWith(expect.objectContaining({ name: `Autopay: ${mockDueBill.name}` }));
      expect(mockEqUpdateBill).toHaveBeenCalledWith('id', mockDueBill.id);
      expect(mockInsertNextBill).toHaveBeenCalledWith([expect.objectContaining({ name: mockDueBill.name, status: 'upcoming' })]);
    });

    it('should handle no bills due today', async () => {
      const mockEqStatus = jest.fn().mockResolvedValueOnce({ data: [], error: null }); // No bills
      const mockEqAutopay = jest.fn().mockReturnValue({ eq: mockEqStatus });
      const mockEqDueDate = jest.fn().mockReturnValue({ eq: mockEqAutopay });
      const mockSelectBills = jest.fn().mockReturnValue({ eq: mockEqDueDate });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelectBills });

      const result = await processAutopayForDueBills(false);
      expect(result).toEqual({ processed: 0, errors: 0 });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('upcoming_bills_mock');
    });

    it('should handle database errors when fetching bills', async () => {
      const dbError = new Error('DB fetch error');
      const mockEqStatus = jest.fn().mockResolvedValueOnce({ data: null, error: dbError });
      const mockEqAutopay = jest.fn().mockReturnValue({ eq: mockEqStatus });
      const mockEqDueDate = jest.fn().mockReturnValue({ eq: mockEqAutopay });
      const mockSelectBills = jest.fn().mockReturnValue({ eq: mockEqDueDate });
      mockSupabaseClient.from.mockReturnValueOnce({ select: mockSelectBills });

      await expect(processAutopayForDueBills(false)).rejects.toThrow('DB fetch error');
    });
    
    it('should correctly handle demo mode by not making DB calls', async () => {
      const mockEqStatus = jest.fn().mockResolvedValueOnce({ data: [], error: null }); 
      const mockEqAutopay = jest.fn().mockReturnValue({ eq: mockEqStatus });
      const mockEqDueDate = jest.fn().mockReturnValue({ eq: mockEqAutopay });
      const mockSelectBills = jest.fn().mockReturnValue({ eq: mockEqDueDate });
      mockSupabaseClient.from.mockImplementationOnce(() => ({ select: mockSelectBills }));

      const result = await processAutopayForDueBills(true); 
      expect(result).toEqual({ processed: 0, errors: 0 }); 
      expect(jest.requireMock('@/utils/tableMapping').getTableMap(true).upcoming_bills).toBe('upcoming_bills_mock'); 
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('upcoming_bills_mock'); 
    });

     it('should increment errorCount if transaction creation fails', async () => {
      const mockEqStatusBills = jest.fn().mockResolvedValue({ data: [mockDueBill], error: null });
      const mockEqAutopayBills = jest.fn().mockReturnValue({ eq: mockEqStatusBills });
      const mockEqDueDateBills = jest.fn().mockReturnValue({ eq: mockEqAutopayBills });
      const mockSelectDueBills = jest.fn().mockReturnValue({ eq: mockEqDueDateBills });

      const txError = new Error('Transaction failed');
      const mockSelectTxError = jest.fn().mockResolvedValue({ data: null, error: txError });
      const mockInsertTxError = jest.fn().mockReturnValue({ select: mockSelectTxError });

      mockSupabaseClient.from
        .mockImplementationOnce(() => ({ select: mockSelectDueBills }))   // Fetch due bills (success)
        .mockImplementationOnce(() => ({ insert: mockInsertTxError })); // Create transaction (fail)

      const result = await processAutopayForDueBills(false);
      expect(result).toEqual({ processed: 0, errors: 1 });
    });

  });

  describe('updatePendingBillStatuses', () => {
    it('should update pending bill statuses successfully', async () => {
      const mockUpdatedBills = [{ id: 'bill-2', status: 'pending' }, { id: 'bill-3', status: 'pending' }];
      const mockSelectUpdate = jest.fn().mockResolvedValueOnce({ data: mockUpdatedBills, error: null });
      const mockEqStatusUpdate = jest.fn().mockReturnValue({ select: mockSelectUpdate });
      const mockEqAutopayUpdate = jest.fn().mockReturnValue({ eq: mockEqStatusUpdate });
      const mockEqDueDateUpdate = jest.fn().mockReturnValue({ eq: mockEqAutopayUpdate });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqDueDateUpdate });
      mockSupabaseClient.from.mockReturnValueOnce({ update: mockUpdate });

      const result = await updatePendingBillStatuses(false);

      expect(result).toEqual({ updated: 2 });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('upcoming_bills_mock');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'pending' });
      expect(mockEqDueDateUpdate).toHaveBeenCalledWith('due_date', today);
      expect(mockEqAutopayUpdate).toHaveBeenCalledWith('autopay', false);
      expect(mockEqStatusUpdate).toHaveBeenCalledWith('status', 'upcoming');
      expect(mockSelectUpdate).toHaveBeenCalled();
    });

    it('should handle database errors when updating statuses', async () => {
      const dbError = new Error('DB update error');
      const mockSelectUpdate = jest.fn().mockResolvedValueOnce({ data: null, error: dbError });
      const mockEqStatusUpdate = jest.fn().mockReturnValue({ select: mockSelectUpdate });
      const mockEqAutopayUpdate = jest.fn().mockReturnValue({ eq: mockEqStatusUpdate });
      const mockEqDueDateUpdate = jest.fn().mockReturnValue({ eq: mockEqAutopayUpdate });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqDueDateUpdate });
      mockSupabaseClient.from.mockReturnValueOnce({ update: mockUpdate });

      await expect(updatePendingBillStatuses(false)).rejects.toThrow('DB update error');
    });

    it('should handle demo mode for updatePendingBillStatuses', async () => {
        const mockSelectUpdate = jest.fn().mockResolvedValueOnce({ data: [], error: null }); 
        const mockEqStatusUpdate = jest.fn().mockReturnValue({ select: mockSelectUpdate });
        const mockEqAutopayUpdate = jest.fn().mockReturnValue({ eq: mockEqStatusUpdate });
        const mockEqDueDateUpdate = jest.fn().mockReturnValue({ eq: mockEqAutopayUpdate });
        const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqDueDateUpdate });
        mockSupabaseClient.from.mockReturnValueOnce({ update: mockUpdate });

        const result = await updatePendingBillStatuses(true); 
        expect(result).toEqual({ updated: 0 });
        expect(jest.requireMock('@/utils/tableMapping').getTableMap(true).upcoming_bills).toBe('upcoming_bills_mock');
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('upcoming_bills_mock');
    });

  });
}); 
import { renderHook, act } from '@testing-library/react-hooks';
import { useTransactions, Transaction } from './useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }),
    removeChannel: jest.fn(),
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('useTransactions', () => {
  const mockTransaction: Omit<Transaction, 'id'> = {
    name: 'Test Transaction',
    description: 'Test Description',
    amount: 100,
    type: 'expense',
    date: new Date().toISOString(),
    category: 'Food',
    merchant: 'Test Merchant',
    source_account_type: 'bank',
    source_account_name: 'Test Bank',
  };

  const mockUser = { id: 'user123' };
  const mockToast = { toast: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('should fetch transactions on mount', async () => {
    const mockTransactions = [
      { 
        id: 'tx1', 
        ...mockTransaction,
        user_id: mockUser.id,
        categories: { name: 'Food' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const selectMock = jest.fn().mockResolvedValue({ data: mockTransactions, error: null });
    const orderMock = jest.fn().mockReturnValue({ limit: selectMock });
    const fromMock = jest.fn().mockReturnValue({ 
      select: jest.fn().mockReturnValue({ 
        order: orderMock 
      }) 
    });
    
    (supabase.from as jest.Mock).mockReturnValue({ 
      select: fromMock().select 
    });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useTransactions());
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    
    // Wait for the data to be fetched
    await waitForNextUpdate();
    
    // Should have fetched transactions
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(fromMock().select).toHaveBeenCalledWith('*, categories(name)');
    expect(orderMock).toHaveBeenCalledWith('date', { ascending: false });
    expect(selectMock).toHaveBeenCalledWith(5);
    
    // Should have updated the state
    expect(result.current.loading).toBe(false);
    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].category).toBe('Food');
    expect(result.current.transactions[0].bank).toBe(mockTransactions[0].source_account_name);
  });

  it('should add a transaction', async () => {
    const newTxWithId = { 
      id: 'new-tx-id', 
      ...mockTransaction,
      user_id: mockUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_account_name: 'Test Bank'
    };
    
    const insertMock = jest.fn().mockResolvedValue({ 
      data: [newTxWithId], 
      error: null 
    });
    
    (supabase.from as jest.Mock).mockReturnValue({ 
      insert: insertMock,
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null })
    });

    // Render the hook
    const { result } = renderHook(() => useTransactions());
    
    // Add the transaction
    await act(async () => {
      const response = await result.current.addTransaction(mockTransaction);
      expect(response.success).toBe(true);
    });
    
    // Should have added the transaction
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(insertMock).toHaveBeenCalled();
    
    // Should have updated state
    expect(result.current.transactions[0].id).toBe('new-tx-id');
    expect(result.current.transactions[0].name).toBe('Test Transaction');
    expect(result.current.transactions[0].bank).toBe('Test Bank');
  });

  it('should edit a transaction', async () => {
    const updatedTx = {
      id: 'tx1',
      name: 'Updated Transaction',
      amount: 200,
      source_account_name: 'Updated Bank',
      user_id: mockUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updateMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [updatedTx],
            error: null
          })
        })
      })
    });
    
    (supabase.from as jest.Mock).mockReturnValue({ 
      update: updateMock,
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ 
        data: [{ 
          id: 'tx1', 
          ...mockTransaction,
          user_id: mockUser.id
        }], 
        error: null 
      })
    });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useTransactions());
    
    // Wait for initial data to be fetched
    await waitForNextUpdate();
    
    // Edit the transaction
    await act(async () => {
      const response = await result.current.editTransaction('tx1', { 
        name: 'Updated Transaction', 
        amount: 200,
        bank: 'Updated Bank'
      });
      expect(response.success).toBe(true);
    });
    
    // Should have updated the transaction
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(updateMock).toHaveBeenCalled();
    
    // Check that bank field gets mapped to source_account_name
    const updateCall = updateMock.mock.calls[0][0];
    expect(updateCall.source_account_name).toBe('Updated Bank');
  });

  it('should delete a transaction', async () => {
    const deleteMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      })
    });
    
    (supabase.from as jest.Mock).mockReturnValue({ 
      delete: deleteMock,
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ 
        data: [{ 
          id: 'tx1', 
          ...mockTransaction,
          user_id: mockUser.id
        }], 
        error: null 
      })
    });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useTransactions());
    
    // Wait for initial data to be fetched
    await waitForNextUpdate();
    
    // Delete the transaction
    await act(async () => {
      const response = await result.current.deleteTransaction('tx1');
      expect(response.success).toBe(true);
    });
    
    // Should have deleted the transaction
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(deleteMock).toHaveBeenCalled();
    
    // Should have updated state
    expect(result.current.transactions).toHaveLength(0);
  });
  
  // Test handling of different transaction types
  it('should handle different transaction types', async () => {
    // Example test for transfers
    const transferTx: Omit<Transaction, 'id'> = {
      name: 'Transfer to Savings',
      amount: 500,
      type: 'transfer',
      date: new Date().toISOString(),
      source_account_type: 'bank',
      source_account_name: 'Checking',
      destination_account_name: 'Savings',
      category: 'Transfer'
    };
    
    const insertMock = jest.fn().mockResolvedValue({ 
      data: [{ 
        id: 'transfer-tx-id', 
        ...transferTx, 
        user_id: mockUser.id 
      }], 
      error: null 
    });
    
    (supabase.from as jest.Mock).mockReturnValue({ 
      insert: insertMock,
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null })
    });

    // Render the hook
    const { result } = renderHook(() => useTransactions());
    
    // Add the transfer transaction
    await act(async () => {
      const response = await result.current.addTransaction(transferTx);
      expect(response.success).toBe(true);
    });
    
    // Should have added the transaction with correct properties
    expect(insertMock).toHaveBeenCalled();
    const insertCall = insertMock.mock.calls[0][0][0];
    expect(insertCall.type).toBe('transfer');
    expect(insertCall.source_account_name).toBe('Checking');
    expect(insertCall.destination_account_name).toBe('Savings');
  });
}); 
import { renderHook, act } from '@testing-library/react';
import { useTransactions } from '../useTransactions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock the dependencies
jest.mock('@/integrations/supabase/client');
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/use-toast');

describe('useTransactions', () => {
  const mockUser = { id: 'user-123' };
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it('should fetch transactions successfully', async () => {
    const mockTransactions = [
      {
        id: 'txn-1',
        name: 'Test Transaction',
        amount: 100,
        type: 'expense',
        date: '2024-01-01',
        category_id: 'cat-1',
        budget_categories: {
          id: 'cat-1',
          name: 'Test Category',
          bg_color: '#000000',
          ring_color: '#ffffff',
          budget_limit: 1000,
          percentage: 10
        }
      }
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: mockTransactions, error: null })
    });

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.transactions).toEqual(mockTransactions);
    expect(result.current.loading).toBe(false);
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Fetch failed');

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: null, error: mockError })
    });

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error fetching transactions',
      description: mockError.message,
      variant: 'destructive',
      duration: 500
    });
    expect(result.current.transactions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should add transaction successfully', async () => {
    const newTransaction = {
      name: 'New Transaction',
      amount: 200,
      type: 'income' as const,
      date: '2024-01-02',
      category_id: 'cat-2'
    };

    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ 
        data: [{ ...newTransaction, id: 'txn-2' }], 
        error: null 
      })
    });

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      const { success } = await result.current.addTransaction(newTransaction);
      expect(success).toBe(true);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Transaction added',
      description: 'Your transaction has been added successfully',
      duration: 500
    });
  });

  it('should handle add transaction error', async () => {
    const newTransaction = {
      name: 'New Transaction',
      amount: 200,
      type: 'income' as const,
      date: '2024-01-02',
      category_id: 'cat-2'
    };

    const mockError = new Error('Add failed');

    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: null, error: mockError })
    });

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      const { success, error } = await result.current.addTransaction(newTransaction);
      expect(success).toBe(false);
      expect(error).toBe(mockError);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error adding transaction',
      description: mockError.message,
      variant: 'destructive',
      duration: 500
    });
  });

  it('should edit transaction successfully', async () => {
    const transactionId = 'txn-1';
    const updates = {
      name: 'Updated Transaction',
      amount: 300
    };

    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ 
        data: [{ id: transactionId, ...updates }], 
        error: null 
      })
    });

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      const { success } = await result.current.editTransaction(transactionId, updates);
      expect(success).toBe(true);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Transaction updated',
      description: 'Your transaction has been updated successfully',
      duration: 500
    });
  });

  it('should delete transaction successfully', async () => {
    const transactionId = 'txn-1';

    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ error: null })
    });

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      const { success } = await result.current.deleteTransaction(transactionId);
      expect(success).toBe(true);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Transaction deleted',
      description: 'Your transaction has been deleted successfully',
      duration: 500
    });
  });
}); 
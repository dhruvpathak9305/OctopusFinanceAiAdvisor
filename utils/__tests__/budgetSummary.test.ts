import { calculateBudgetSummary } from '../budgetSummary';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('calculateBudgetSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate budget summary correctly', async () => {
    // Mock user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    // Mock transactions
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'transactions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({
            data: [
              {
                id: 'txn-1',
                amount: 1000,
                category_id: 'cat-1',
                subcategory_id: 'sub-1',
                type: 'expense',
                date: new Date().toISOString(),
                budget_categories: { id: 'cat-1', name: 'Needs' },
                budget_subcategories: { id: 'sub-1', name: 'Food' },
              },
              {
                id: 'txn-2',
                amount: 700,
                category_id: 'cat-1',
                subcategory_id: 'sub-2',
                type: 'expense',
                date: new Date().toISOString(),
                budget_categories: { id: 'cat-1', name: 'Needs' },
                budget_subcategories: { id: 'sub-2', name: 'Rent' },
              },
            ],
            error: null,
          }),
        };
      } else if (table === 'budget_categories') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({
            data: [
              { id: 'cat-1', name: 'Needs', is_active: true },
              { id: 'cat-2', name: 'Wants', is_active: true },
            ],
            error: null,
          }),
        };
      } else if (table === 'budget_subcategories') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({
            data: [
              { id: 'sub-1', name: 'Food', category_id: 'cat-1', is_active: true },
              { id: 'sub-2', name: 'Rent', category_id: 'cat-1', is_active: true },
              { id: 'sub-3', name: 'Entertainment', category_id: 'cat-2', is_active: true },
            ],
            error: null,
          }),
        };
      }
    });

    const summary = await calculateBudgetSummary();

    expect(summary).toEqual({
      'Needs': {
        'Food': 1000,
        'Rent': 700,
      },
      'Wants': {
        'Entertainment': 0,
      },
    });
  });

  it('should handle errors when fetching data', async () => {
    // Mock user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    // Mock error for transactions
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'transactions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Failed to fetch transactions'),
          }),
        };
      }
    });

    await expect(calculateBudgetSummary()).rejects.toThrow('Failed to fetch transactions');
  });

  it('should throw error when user is not authenticated', async () => {
    // Mock no user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
    });

    await expect(calculateBudgetSummary()).rejects.toThrow('User not authenticated');
  });
}); 
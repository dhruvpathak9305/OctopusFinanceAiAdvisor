import { act } from '@testing-library/react';
import { addDays, subDays } from 'date-fns';
import { renderHook } from '@testing-library/react';
import React from 'react';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  single: jest.fn(),
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } }
    })
  }
};

// Mock Auth Context
const mockAuthContext = {
  user: { id: 'test-user-id' },
  isAuthenticated: true
};

// Setup mocks
jest.mock('../../integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

jest.mock('../../common/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() })
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthContext: {
    Provider: ({ children, value }: { children: React.ReactNode, value: any }) => React.createElement('div', {}, children)
  }
}));

// Import after mocking
import { useUpcomingBills } from '../useUpcomingBills';

// Mock today date
const mockToday = new Date('2024-03-15T10:00:00Z');

// Mock bill data
const createMockBills = (today: Date) => [
  {
    id: '1',
    name: 'Netflix',
    amount: 15.99,
    due_date: subDays(today, 2).toISOString(),
    end_date: addDays(today, 210).toISOString(),
    status: 'upcoming',
    user_id: 'test-user-id',
    autopay: false,
    accounts: { name: 'Test Account' },
    credit_cards: { name: 'Test Card' },
    budget_categories: { name: 'Entertainment' },
    budget_subcategories: { name: 'Streaming' }
  },
  {
    id: '2', 
    name: 'Rent',
    amount: 1200,
    due_date: addDays(today, 15).toISOString(),
    end_date: addDays(today, 210).toISOString(),
    status: 'upcoming',
    user_id: 'test-user-id',
    autopay: true,
    autopay_source: 'bank',
    account_id: 'test-account-2',
    accounts: { name: 'Checking Account' },
    budget_categories: { name: 'Housing' }
  }
];

const mockBills = createMockBills(mockToday);

// Set up default mock return value
mockSupabaseClient.from.mockReturnValue({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      lte: jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: mockBills, error: null })
            })
          })
        })
      })
    })
  }),
  insert: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: mockBills[0], error: null })
    })
  }),
  update: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockBills[0], error: null })
      })
    })
  }),
  delete: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ data: null, error: null })
  })
});

// Wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', {}, children);
};

describe('useUpcomingBills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return upcoming bills', async () => {
    const { result } = renderHook(() => useUpcomingBills({
      status: 'upcoming',
      dueWithin: 'month',
      includeOverdue: true
    }), { wrapper });

    await act(async () => {
      // Wait for the hook to complete
    });

    expect(result.current.upcomingBills).toHaveLength(2);
    
    const netflixBill = result.current.upcomingBills.find(bill => bill.id === '1');
    expect(netflixBill?.account_name).toBe('Test Account');
    expect(netflixBill?.credit_card_name).toBe('Test Card');
    expect(netflixBill?.category_name).toBe('Entertainment');
    expect(netflixBill?.subcategory_name).toBe('Streaming');

    const rentBill = result.current.upcomingBills.find(bill => bill.id === '2');
    expect(rentBill?.account_name).toBe('Checking Account');
    expect(rentBill?.category_name).toBe('Housing');
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Failed to fetch bills');
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      })
    });

    const { result } = renderHook(() => useUpcomingBills(), { wrapper });

    await act(async () => {
      // Wait for error handling
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.upcomingBills).toHaveLength(0);
  });

  it('should handle marking a bill as paid', async () => {
    const { result } = renderHook(() => useUpcomingBills(), { wrapper });
    
    let updatedBill;
    await act(async () => {
      updatedBill = await result.current.markBillAsPaid('1');
    });

    expect(updatedBill?.account_name).toBe('Test Account');
  });

  it('should handle empty bills array', async () => {
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
    });

    const { result } = renderHook(() => useUpcomingBills(), { wrapper });
    
    await act(async () => {
      // Wait for fetch
    });

    expect(result.current.upcomingBills).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
}); 
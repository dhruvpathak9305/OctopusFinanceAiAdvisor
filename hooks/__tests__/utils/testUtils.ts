import { vi } from 'vitest';
import { addDays, subDays } from 'date-fns';
import type { Database } from '../../../integrations/supabase/types';

// Extended type for the mock bills that includes the related entities
export type MockBill = Database['public']['Tables']['upcoming_bills']['Row'] & {
  accounts?: { name: string } | null;
  credit_cards?: { name: string } | null;
  budget_categories?: { name: string } | null;
  budget_subcategories?: { name: string } | null;
};

// Mock bills data for testing
export const createMockBills = (baseDate: Date = new Date()): MockBill[] => {
  return [
    {
      id: '1',
      name: 'Netflix',
      amount: 499,
      due_date: baseDate.toISOString(), // Today
      status: 'upcoming',
      frequency: 'monthly',
      end_date: addDays(baseDate, 210).toISOString(), // +7 months
      user_id: 'test-user-id',
      transaction_id: 'test-transaction-1',
      autopay: false,
      autopay_source: 'none',
      account_id: 'test-account-1',
      credit_card_id: 'test-card-1',
      category_id: 'test-category-1',
      subcategory_id: 'test-subcategory-1',
      description: null,
      created_at: baseDate.toISOString(),
      updated_at: baseDate.toISOString(),
      accounts: {
        name: 'Test Account'
      },
      credit_cards: {
        name: 'Test Card'
      },
      budget_categories: {
        name: 'Entertainment'
      },
      budget_subcategories: {
        name: 'Streaming'
      }
    },
    {
      id: '2',
      name: 'Rent',
      amount: 1500,
      due_date: addDays(baseDate, 20).toISOString(), // Upcoming
      status: 'upcoming',
      frequency: 'monthly',
      end_date: addDays(baseDate, 210).toISOString(), // +7 months
      user_id: 'test-user-id',
      transaction_id: 'test-transaction-2',
      autopay: true,
      autopay_source: 'bank',
      account_id: 'test-account-2',
      credit_card_id: null,
      category_id: 'test-category-2',
      subcategory_id: null,
      description: null,
      created_at: baseDate.toISOString(),
      updated_at: baseDate.toISOString(),
      accounts: {
        name: 'Checking Account'
      },
      credit_cards: null,
      budget_categories: {
        name: 'Housing'
      },
      budget_subcategories: null
    },
    {
      id: '3',
      name: 'Old Subscription',
      amount: 299,
      due_date: addDays(baseDate, 15).toISOString(), // Upcoming but expired
      status: 'upcoming',
      frequency: 'monthly',
      end_date: subDays(baseDate, 1).toISOString(), // Already expired
      user_id: 'test-user-id',
      transaction_id: 'test-transaction-3',
      autopay: false,
      autopay_source: 'none',
      account_id: null,
      credit_card_id: null,
      category_id: null,
      subcategory_id: null,
      description: null,
      created_at: baseDate.toISOString(),
      updated_at: baseDate.toISOString(),
      accounts: null,
      credit_cards: null,
      budget_categories: null,
      budget_subcategories: null
    }
  ];
};

// Create mock supabase client for testing
export const createMockSupabaseClient = (mockBills: MockBill[]) => {
  return {
    from: vi.fn(() => ({
      select: vi.fn((query) => {
        // The query string should include all the relationships
        if (query && query.includes('accounts') && query.includes('credit_cards') && query.includes('budget_categories')) {
          return {
            eq: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ 
              data: mockBills.map(bill => ({
                ...bill,
                accounts: bill.accounts || null,
                credit_cards: bill.credit_cards || null,
                budget_categories: bill.budget_categories || null,
                budget_subcategories: bill.budget_subcategories || null,
                account_name: bill.accounts?.name || null,
                credit_card_name: bill.credit_cards?.name || null,
                category_name: bill.budget_categories?.name || null,
                subcategory_name: bill.budget_subcategories?.name || null,
                is_overdue: new Date(bill.due_date) < new Date(),
                due_status: new Date(bill.due_date).toISOString() === new Date().toISOString() ? 'today' : 
                          new Date(bill.due_date) < new Date() ? 'overdue' : 'upcoming'
              })), 
              error: null 
            })
          };
        }
        return {
          eq: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        };
      }),
      eq: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
    })) as any,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null })
    }
  };
};

// Setup mocks for testing
export const setupMocks = (mockBills: MockBill[]) => {
  const mockSupabase = createMockSupabaseClient(mockBills);
  
  // Reset all mocks
  vi.clearAllMocks();
  
  return {
    mockSupabase,
    mockBills
  };
}; 
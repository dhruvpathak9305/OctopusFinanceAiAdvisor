import { vi } from 'vitest';
import { createMockBills, MockBill } from './testUtils';
import { Session, User } from "@supabase/supabase-js";

// Define AuthContextType interface that matches the actual context structure
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Mock today's date
export const mockToday = new Date('2025-05-01');
const mockBills = createMockBills(mockToday);

// Mock Supabase client for tests
export const mockSupabaseClient = {
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
              is_overdue: bill.due_date < new Date().toISOString(),
              due_status: bill.due_date === new Date().toISOString() ? 'today' : 
                        bill.due_date < new Date().toISOString() ? 'overdue' : 'upcoming'
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

// Mock auth context with full required interface
export const mockAuthContext: AuthContextType = {
  user: { id: 'test-user-id' } as any,
  session: null,
  loading: false,
  isAuthenticated: true,
  signUp: vi.fn().mockResolvedValue(undefined),
  signIn: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
  resetPassword: vi.fn().mockResolvedValue(undefined),
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn()
};

// Mock toast hook
export const mockToast = {
  toast: vi.fn()
};

// Setup all mocks for tests
export const setupAllMocks = () => {
  // Mock Supabase client
  vi.mock('../../../integrations/supabase/client', () => ({
    supabase: mockSupabaseClient
  }));

  // Mock auth context
  vi.mock('../../../contexts/AuthContext', () => ({
    useAuth: vi.fn(() => mockAuthContext),
    AuthContext: {
      Provider: ({ children }: { children: React.ReactNode }) => children,
    }
  }));

  // Mock toast hook
  vi.mock('../../../common/hooks/use-toast', () => ({
    useToast: vi.fn(() => ({ toast: mockToast.toast }))
  }));

  // Mock react-router-dom
  vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn()
  }));

  return {
    mockSupabaseClient,
    mockAuthContext,
    mockToast,
    mockBills
  };
}; 
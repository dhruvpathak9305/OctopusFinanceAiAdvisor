/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  order: jest.fn().mockReturnThis(),
  auth: {
    getUser: jest.fn()
  }
};

// Mock modules
jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@/utils/tableMapping', () => ({
  getTableMap: jest.fn((isDemo: boolean) => ({
    credit_cards: isDemo ? 'credit_cards' : 'credit_cards_real',
    transactions: isDemo ? 'transactions' : 'transactions_real'
  })),
  validateTableConsistency: jest.fn().mockReturnValue(true)
}));

// Import after mocking
import { 
  fetchCreditCards, 
  addCreditCard, 
  updateCreditCard, 
  deleteCreditCard, 
  fetchCreditCardsHistory 
} from '../creditCardService';

describe('creditCardService', () => {
  const mockUser = { id: 'user123' };
  const mockCreditCard = {
    name: 'Test Credit Card',
    bank: 'Test Bank',
    lastFourDigits: '4321',
    creditLimit: 10000,
    currentBalance: 2500,
    dueDate: '2023-12-31',
    billingCycle: '1-30',
    logoUrl: 'test-logo.png'
  };
  const mockDbCreditCard = {
    id: 'card123',
    name: 'Test Credit Card',
    institution: 'Test Bank',
    last_four_digits: 4321,
    credit_limit: 10000,
    current_balance: 2500,
    due_date: '2023-12-31',
    billing_cycle: '1-30',
    logo_url: 'test-logo.png',
    user_id: 'user123',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth mock
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  describe('fetchCreditCards', () => {
    it('should fetch credit cards successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [mockDbCreditCard],
            error: null
          })
        })
      });

      const result = await fetchCreditCards();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('credit_cards_real');
      expect(result).toEqual([{
        id: 'card123',
        name: 'Test Credit Card',
        bank: 'Test Bank',
        lastFourDigits: '4321',
        creditLimit: 10000,
        currentBalance: 2500,
        dueDate: '2023-12-31',
        billingCycle: '1-30',
        logoUrl: 'test-logo.png'
      }]);
    });

    it('should fetch credit cards in demo mode', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      const result = await fetchCreditCards(true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('credit_cards');
      expect(result).toEqual([]);
    });

    it('should throw error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(fetchCreditCards()).rejects.toThrow('User not authenticated');
    });

    it('should throw error if database query fails', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error')
          })
        })
      });

      await expect(fetchCreditCards()).rejects.toThrow('Database error');
    });
  });

  describe('addCreditCard', () => {
    it('should add credit card successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockDbCreditCard,
              error: null
            })
          })
        })
      });

      const result = await addCreditCard(mockCreditCard);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('credit_cards_real');
      expect(result).toEqual({
        id: 'card123',
        name: 'Test Credit Card',
        bank: 'Test Bank',
        lastFourDigits: '4321',
        creditLimit: 10000,
        currentBalance: 2500,
        dueDate: '2023-12-31',
        billingCycle: '1-30',
        logoUrl: 'test-logo.png'
      });
    });

    it('should add credit card in demo mode', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockDbCreditCard,
              error: null
            })
          })
        })
      });

      const result = await addCreditCard(mockCreditCard, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('credit_cards');
      expect(result.name).toBe('Test Credit Card');
    });

    it('should throw error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(addCreditCard(mockCreditCard)).rejects.toThrow('User not authenticated');
    });

    it('should throw error if insertion fails', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Insertion error')
            })
          })
        })
      });

      await expect(addCreditCard(mockCreditCard)).rejects.toThrow('Insertion error');
    });
  });

  describe('updateCreditCard', () => {
    it('should update credit card successfully', async () => {
      const updates = { name: 'Updated Card' };
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockDbCreditCard, name: 'Updated Card' },
                  error: null
                })
              })
            })
          })
        })
      });

      const result = await updateCreditCard('card123', updates);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('credit_cards_real');
      expect(result.name).toBe('Updated Card');
    });

    it('should update credit card in demo mode', async () => {
      const updates = { name: 'Updated Card' };
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockDbCreditCard, name: 'Updated Card' },
                  error: null
                })
              })
            })
          })
        })
      });

      const result = await updateCreditCard('card123', updates, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('credit_cards');
      expect(result.name).toBe('Updated Card');
    });

    it('should throw error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(updateCreditCard('card123', { name: 'Test' })).rejects.toThrow('User not authenticated');
    });
  });

  describe('deleteCreditCard', () => {
    it('should delete credit card successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      });

      await deleteCreditCard('card123');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('credit_cards_real');
    });

    it('should delete credit card in demo mode', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      });

      await deleteCreditCard('card123', true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('credit_cards');
    });

    it('should throw error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(deleteCreditCard('card123')).rejects.toThrow('User not authenticated');
    });
  });

  describe('fetchCreditCardsHistory', () => {
    it('should fetch credit cards history successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [
                  { amount: 100, date: '2023-01-01', type: 'expense' },
                  { amount: 50, date: '2023-02-01', type: 'expense' }
                ],
                error: null
              })
            })
          })
        })
      });

      const result = await fetchCreditCardsHistory(3);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions_real');
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should fetch history in demo mode', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })
      });

      const result = await fetchCreditCardsHistory(3, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
      expect(result).toBeInstanceOf(Array);
    });

    it('should return placeholder data if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const result = await fetchCreditCardsHistory();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0); // Should return placeholder data
    });

    it('should return placeholder data on error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Database error')
              })
            })
          })
        })
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await fetchCreditCardsHistory(6);
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(6); // Should return placeholder data
      
      consoleSpy.mockRestore();
    });
  });
}); 
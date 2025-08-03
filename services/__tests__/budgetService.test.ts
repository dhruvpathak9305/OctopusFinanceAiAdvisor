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
  upsert: jest.fn().mockReturnThis(),
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

jest.mock('@/lib/date', () => ({
  getCurrentMonth: jest.fn().mockReturnValue(5), // May
  getCurrentYear: jest.fn().mockReturnValue(2023)
}));

jest.mock('@/utils/tableMapping', () => ({
  getTableMap: jest.fn((isDemo: boolean) => ({
    budget_categories: isDemo ? 'budget_categories' : 'budget_categories_real',
    budget_subcategories: isDemo ? 'budget_subcategories' : 'budget_subcategories_real',
    budget_periods: isDemo ? 'budget_periods' : 'budget_periods_real'
  })),
  validateTableConsistency: jest.fn().mockReturnValue(true)
}));

// Import after mocking
import { 
  fetchBudgetCategories, 
  fetchBudgetSubcategories, 
  fetchCurrentBudgetPeriod,
  addBudgetCategory,
  updateBudgetCategory,
  reorderBudgetCategories,
  createBudgetPeriod
} from '../budgetService';

describe('budgetService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchBudgetCategories', () => {
    it('should fetch budget categories successfully', async () => {
      // Mock successful categories fetch
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [
                { 
                  id: '1', 
                  name: 'Needs', 
                  budget_limit: 2000, 
                  bg_color: 'bg-teal',
                  ring_color: '#0F766E',
                  is_archived: false,
                  display_order: 0
                },
                { 
                  id: '2', 
                  name: 'Wants', 
                  budget_limit: 1000, 
                  bg_color: 'bg-gold',
                  ring_color: '#F59E0B',
                  is_archived: false,
                  display_order: 1
                }
              ],
              error: null
            })
          })
        })
      });

      const result = await fetchBudgetCategories();

      // Check that we called the APIs correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories_real');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Needs');
      expect(result[1].name).toBe('Wants');
    });

    it('should fetch budget categories in demo mode', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const result = await fetchBudgetCategories(true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories');
      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error')
            })
          })
        })
      });

      await expect(fetchBudgetCategories()).rejects.toThrow('Database error');
    });
  });

  describe('addBudgetCategory', () => {
    it('should add a budget category successfully', async () => {
      const newCategory = {
        name: 'Health',
        budget_limit: 500,
        bg_color: 'bg-blue',
        ring_color: '#3B82F6',
        user_id: 'user-1'
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { 
                id: '3',
                ...newCategory
              },
              error: null
            })
          })
        })
      });

      const result = await addBudgetCategory(newCategory);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories_real');
      expect(result.id).toBe('3');
      expect(result.name).toBe('Health');
    });

    it('should add category in demo mode', async () => {
      const newCategory = {
        name: 'Health',
        budget_limit: 500,
        bg_color: 'bg-blue',
        ring_color: '#3B82F6',
        user_id: 'user-1'
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { 
                id: '3',
                ...newCategory
              },
              error: null
            })
          })
        })
      });

      const result = await addBudgetCategory(newCategory, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories');
      expect(result.name).toBe('Health');
    });

    it('should throw error when insertion fails', async () => {
      const newCategory = {
        name: 'Health',
        budget_limit: 500,
        bg_color: 'bg-blue',
        ring_color: '#3B82F6',
        user_id: 'user-1'
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Insertion failed')
            })
          })
        })
      });

      await expect(addBudgetCategory(newCategory)).rejects.toThrow('Insertion failed');
    });
  });

  describe('updateBudgetCategory', () => {
    it('should update a budget category successfully', async () => {
      const updates = {
        name: 'Updated Health',
        budget_limit: 600
      };

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { 
                  id: '1',
                  name: 'Updated Health',
                  budget_limit: 600
                },
                error: null
              })
            })
          })
        })
      });

      const result = await updateBudgetCategory('1', updates);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories_real');
      expect(result.name).toBe('Updated Health');
      expect(result.budget_limit).toBe(600);
    });

    it('should update category in demo mode', async () => {
      const updates = {
        name: 'Updated Health',
        budget_limit: 600
      };

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { 
                  id: '1',
                  name: 'Updated Health',
                  budget_limit: 600
                },
                error: null
              })
            })
          })
        })
      });

      const result = await updateBudgetCategory('1', updates, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories');
      expect(result.name).toBe('Updated Health');
    });
  });

  describe('fetchBudgetSubcategories', () => {
    it('should fetch budget subcategories successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [
              { 
                id: '1', 
                name: 'Groceries', 
                category_id: '1',
                display_order: 0
              },
              { 
                id: '2', 
                name: 'Gas', 
                category_id: '1',
                display_order: 1
              }
            ],
            error: null
          })
        })
      });

      const result = await fetchBudgetSubcategories();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories_real');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Groceries');
      expect(result[1].name).toBe('Gas');
    });

    it('should fetch subcategories in demo mode', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      const result = await fetchBudgetSubcategories(true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories');
      expect(result).toEqual([]);
    });
  });

  describe('fetchCurrentBudgetPeriod', () => {
    it('should fetch current budget period successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: '1',
                    period_start: '2023-05-01',
                    period_end: '2023-05-31',
                    total_budget: 3000,
                    user_id: 'user-1'
                  },
                  error: null
                })
              })
            })
          })
        })
      });

      const result = await fetchCurrentBudgetPeriod();

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(result.total_budget).toBe(3000);
    });

    it('should create default period when none exists', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      });

      // Mock no period found (PGRST116 error)
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' }
                })
              })
            })
          })
        })
      });

      // Mock successful creation of default period
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '2',
                period_start: '2023-05-01',
                period_end: '2023-05-31',
                total_budget: 0,
                user_id: 'user-1',
                status: 'not_set'
              },
              error: null
            })
          })
        })
      });

      const result = await fetchCurrentBudgetPeriod();

      expect(result.status).toBe('not_set');
      expect(result.total_budget).toBe(0);
    });
  });

  describe('reorderBudgetCategories', () => {
    it('should reorder budget categories successfully', async () => {
      const categoryIds = ['2', '1', '3'];

      const mockUpsert = jest.fn().mockResolvedValue({
        data: null,
        error: null
      });

      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert
      });

      await reorderBudgetCategories(categoryIds);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories_real');
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should reorder categories in demo mode', async () => {
      const categoryIds = ['2', '1', '3'];

      const mockUpsert = jest.fn().mockResolvedValue({
        data: null,
        error: null
      });

      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert
      });

      await reorderBudgetCategories(categoryIds, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories');
    });
  });

  describe('createBudgetPeriod', () => {
    it('should create a budget period successfully', async () => {
      const newPeriod = {
        month: 6,
        year: 2023,
        is_active: true,
        period_start: '2023-06-01',
        period_end: '2023-06-30',
        total_budget: 4000,
        total_spend: 0,
        status: 'not_set' as const,
        needs_percentage: 50,
        wants_percentage: 30,
        savings_percentage: 20,
        name: 'June 2023 Budget'
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '3',
                ...newPeriod,
                user_id: 'user-1'
              },
              error: null
            })
          })
        })
      });

      const result = await createBudgetPeriod(newPeriod);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_periods_real');
      expect(result.total_budget).toBe(4000);
      expect(result.name).toBe('June 2023 Budget');
    });
  });
}); 
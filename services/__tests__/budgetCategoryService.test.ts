// Top-level const mock
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(), // To be mocked in individual tests
  order: jest.fn().mockReturnThis(), 
  auth: {
    getUser: jest.fn()
  }
};

jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

// budgetCategoryService.ts uses toast from 'sonner'
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@/utils/tableMapping', () => ({
  getTableMap: jest.fn().mockReturnValue({
    budget_categories: 'budget_categories_mock',
    budget_subcategories: 'budget_subcategories_mock'
  }),
  validateTableConsistency: jest.fn()
}));

// Import service and types AFTER mocks
import {
  fetchBudgetCategories,
  createCategoryInDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
  // budgetCategoryService // This object is also exported, handle if its methods are tested
} from '../budgetCategoryService';
import { BudgetCategory } from '@/types/budget'; // Ensure this path is correct
import { mapDbCategoryToModel } from "@/utils/budgetMappers"; // If this util is complex, it might need its own mock

jest.mock('@/utils/budgetMappers', () => ({
    mapDbCategoryToModel: jest.fn((category, subcategories) => ({
        ...category, // Spread basic fields
        id: category.id || 'mock-id',
        name: category.name || 'Mock Category',
        limit: category.budget_limit || 0,
        spent: 0, // Default or calculate if necessary for mock
        remaining: category.budget_limit || 0,
        bgColor: category.bg_color || '#000000',
        ringColor: category.ring_color || '#FFFFFF',
        subcategories: subcategories || [],
        // Add other fields expected by BudgetCategory type, ensure defaults
        percentage: category.percentage === undefined ? 0 : category.percentage,
        type: category.type === undefined ? 'expense' : category.type, // example default
        status: category.status === undefined ? 'not_set' : category.status, // example default
        user_id: category.user_id || 'mock-user-id',
        created_at: category.created_at || new Date().toISOString(),
        updated_at: category.updated_at || new Date().toISOString(),
        display_order: category.display_order === undefined ? 0 : category.display_order,
        is_default: category.is_default === undefined ? false : category.is_default,
        is_active: category.is_active === undefined ? true : category.is_active,
        goal_id: category.goal_id === undefined ? null : category.goal_id,
        icon: category.icon === undefined ? 'Home' : category.icon, // example default
    }))
}));

describe('budgetCategoryService', () => {
  const mockUserId = 'test-user-id';
  const mockUser = { id: mockUserId }; 

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser }, 
      error: null
    });
    // Reset mapDbCategoryToModel mock calls if needed
    (mapDbCategoryToModel as jest.Mock).mockClear();
  });

  describe('fetchBudgetCategories', () => {
    const dbCategories = [
      { id: 'cat-1', name: 'Needs', budget_limit: 2500, user_id: mockUserId, display_order: 1, bg_color: 'bg-teal', ring_color: '#0F766E' },
      { id: 'cat-2', name: 'Wants', budget_limit: 1000, user_id: mockUserId, display_order: 2, bg_color: 'bg-gold', ring_color: '#F59E0B' }
    ];
    const dbSubcategoriesCat1 = [{ id: 'sub-1', name: 'Rent', category_id: 'cat-1' }];
    const dbSubcategoriesCat2 = [{ id: 'sub-2', name: 'Dining', category_id: 'cat-2' }];

    it('should fetch budget categories and their subcategories successfully', async () => {
      const mockOrderCat = jest.fn().mockResolvedValue({ data: dbCategories, error: null });
      const mockEqUserCat = jest.fn().mockReturnValue({ order: mockOrderCat });
      const mockSelectCat = jest.fn().mockReturnValue({ eq: mockEqUserCat });

      const mockEqSubCat1 = jest.fn().mockResolvedValue({ data: dbSubcategoriesCat1, error: null });
      const mockSelectSubCat1 = jest.fn().mockReturnValue({ eq: mockEqSubCat1 });
      
      const mockEqSubCat2 = jest.fn().mockResolvedValue({ data: dbSubcategoriesCat2, error: null });
      const mockSelectSubCat2 = jest.fn().mockReturnValue({ eq: mockEqSubCat2 });

      mockSupabaseClient.from
        .mockImplementationOnce(() => ({ select: mockSelectCat }))       // Fetch categories
        .mockImplementationOnce(() => ({ select: mockSelectSubCat1 }))  // Fetch subcategories for cat-1
        .mockImplementationOnce(() => ({ select: mockSelectSubCat2 })); // Fetch subcategories for cat-2

      // Mock mapDbCategoryToModel to return something identifiable for assertions
      (mapDbCategoryToModel as jest.Mock)
        .mockImplementationOnce((cat, subs) => ({ ...cat, name: `Mapped ${cat.name}`, subcategories: subs }))
        .mockImplementationOnce((cat, subs) => ({ ...cat, name: `Mapped ${cat.name}`, subcategories: subs }));

      const result = await fetchBudgetCategories(false);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories_mock');
      expect(mockSelectCat).toHaveBeenCalledWith('*');
      expect(mockEqUserCat).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockOrderCat).toHaveBeenCalledWith('display_order', { ascending: true });
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories_mock');
      expect(mockSelectSubCat1).toHaveBeenCalledWith('*');
      expect(mockEqSubCat1).toHaveBeenCalledWith('category_id', 'cat-1');
      expect(mockSelectSubCat2).toHaveBeenCalledWith('*');
      expect(mockEqSubCat2).toHaveBeenCalledWith('category_id', 'cat-2');
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Mapped Needs');
      expect(result[0].subcategories).toEqual(dbSubcategoriesCat1);
      expect(result[1].name).toBe('Mapped Wants');
      expect(result[1].subcategories).toEqual(dbSubcategoriesCat2);
      expect(mapDbCategoryToModel).toHaveBeenCalledTimes(2);
    });

    it('should create default categories if none exist and fetch again', async () => {
        const mockOrderCatEmpty = jest.fn().mockResolvedValue({ data: [], error: null });
        const mockEqUserCatEmpty = jest.fn().mockReturnValue({ order: mockOrderCatEmpty });
        const mockSelectCatEmpty = jest.fn().mockReturnValue({ eq: mockEqUserCatEmpty });

        // Mock for createCategoryInDB (inside the loop)
        const mockCreateCatSingle = jest.fn().mockResolvedValue({ data: { id: 'new-cat-id-default' }, error: null });
        const mockCreateCatSelect = jest.fn().mockReturnValue({ single: mockCreateCatSingle });
        const mockCreateCatInsert = jest.fn().mockReturnValue({ select: mockCreateCatSelect });

        // Mock for the second fetchBudgetCategories call
        const defaultDbCategories = [
            { id: 'def-cat-1', name: 'Needs', user_id: mockUserId, display_order: 1 },
            { id: 'def-cat-2', name: 'Wants', user_id: mockUserId, display_order: 2 },
            { id: 'def-cat-3', name: 'Save', user_id: mockUserId, display_order: 3 },
        ];
        const mockOrderCatSecond = jest.fn().mockResolvedValue({ data: defaultDbCategories, error: null });
        const mockEqUserCatSecond = jest.fn().mockReturnValue({ order: mockOrderCatSecond });
        const mockSelectCatSecond = jest.fn().mockReturnValue({ eq: mockEqUserCatSecond });

        const mockEqSubCatEmpty = jest.fn().mockResolvedValue({ data: [], error: null });
        const mockSelectSubCatEmpty = jest.fn().mockReturnValue({ eq: mockEqSubCatEmpty });

        mockSupabaseClient.from
            .mockImplementationOnce(() => ({ select: mockSelectCatEmpty })) // First fetch (empty)
            // For createCategoryInDB calls (3 times)
            .mockImplementationOnce(() => ({ insert: mockCreateCatInsert }))
            .mockImplementationOnce(() => ({ insert: mockCreateCatInsert }))
            .mockImplementationOnce(() => ({ insert: mockCreateCatInsert }))
            // For the second fetchBudgetCategories
            .mockImplementationOnce(() => ({ select: mockSelectCatSecond })) // Second fetch (default categories)
            // For subcategory fetches in the second run (3 categories, 3 calls)
            .mockImplementationOnce(() => ({ select: mockSelectSubCatEmpty })) 
            .mockImplementationOnce(() => ({ select: mockSelectSubCatEmpty }))
            .mockImplementationOnce(() => ({ select: mockSelectSubCatEmpty }));

        (mapDbCategoryToModel as jest.Mock).mockImplementation((cat, subs) => ({ ...cat, subcategories: subs }));

        const result = await fetchBudgetCategories(false);

        expect(mockSelectCatEmpty).toHaveBeenCalledTimes(1);
        expect(mockCreateCatInsert).toHaveBeenCalledTimes(3); // Default categories created
        expect(mockSelectCatSecond).toHaveBeenCalledTimes(1); // Second fetch called
        expect(result).toHaveLength(3); 
    });

  });

  describe('createCategoryInDB', () => {
    const newCategory: Partial<BudgetCategory> = {
      name: 'New Cat',
      bgColor: 'bg-red',
      ringColor: '#FF0000',
      limit: 500
    };
    const dbCreatedCategory = { id: 'created-id', ...newCategory, user_id: mockUserId, percentage: 0 };

    it('should create a category successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValueOnce({ data: dbCreatedCategory, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockSupabaseClient.from.mockReturnValueOnce({ insert: mockInsert });

      const result = await createCategoryInDB(newCategory, false);

      expect(result).toEqual(dbCreatedCategory);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories_mock');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        name: newCategory.name,
        user_id: mockUserId
      }));
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(jest.requireMock('sonner').toast.error).not.toHaveBeenCalled(); // No error toast
    });

    it('handles error during category creation and calls toast.error', async () => {
        const dbError = new Error('DB Insert Error Create');
        const mockSingle = jest.fn().mockResolvedValueOnce({ data: null, error: dbError });
        const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
        const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
        mockSupabaseClient.from.mockReturnValueOnce({ insert: mockInsert });

        await expect(createCategoryInDB(newCategory, false)).rejects.toThrow('DB Insert Error Create');
        expect(jest.requireMock('sonner').toast.error).toHaveBeenCalledWith('Failed to create budget category');
    });
  });

  describe('updateCategoryInDB', () => {
    const categoryIdToUpdate = 'cat-to-update';
    const updates: Partial<BudgetCategory> = { name: 'Updated Name', limit: 1200 };

    it('should update a category successfully', async () => {
      const mockEq = jest.fn().mockResolvedValueOnce({ error: null }); // Update ends with .eq normally
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValueOnce({ update: mockUpdate });

      await updateCategoryInDB(categoryIdToUpdate, updates, false);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_categories_mock');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        name: updates.name,
        budget_limit: updates.limit
      }));
      expect(mockEq).toHaveBeenCalledWith('id', categoryIdToUpdate);
    });
  });

  describe('deleteCategoryFromDB', () => {
    const categoryIdToDelete = 'cat-to-delete';

    it('should delete a category and its subcategories successfully', async () => {
      const mockEqSubcatDelete = jest.fn().mockResolvedValueOnce({ error: null });
      const mockDeleteSubcat = jest.fn().mockReturnValue({ eq: mockEqSubcatDelete });

      const mockEqCatDelete = jest.fn().mockResolvedValueOnce({ error: null });
      const mockDeleteCat = jest.fn().mockReturnValue({ eq: mockEqCatDelete });

      mockSupabaseClient.from
        .mockImplementationOnce(() => ({ delete: mockDeleteSubcat })) // Delete subcategories
        .mockImplementationOnce(() => ({ delete: mockDeleteCat }));    // Delete category

      await deleteCategoryFromDB(categoryIdToDelete, false);

      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(1, 'budget_subcategories_mock');
      expect(mockDeleteSubcat).toHaveBeenCalled();
      expect(mockEqSubcatDelete).toHaveBeenCalledWith('category_id', categoryIdToDelete);

      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(2, 'budget_categories_mock');
      expect(mockDeleteCat).toHaveBeenCalled();
      expect(mockEqCatDelete).toHaveBeenCalledWith('id', categoryIdToDelete);
    });
  });
}); 
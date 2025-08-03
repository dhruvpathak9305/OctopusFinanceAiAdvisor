/**
 * Unit tests for budgetSubcategoryService.ts
 * Tests subcategory CRUD operations and error handling
 */

// Top-level const mock
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  auth: {
    getUser: jest.fn()
  }
};

jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}));

jest.mock('@/utils/tableMapping', () => ({
  getTableMap: jest.fn((isDemo: boolean) => ({
    budget_subcategories: isDemo ? 'budget_subcategories' : 'budget_subcategories_real'
  })),
  validateTableConsistency: jest.fn().mockReturnValue(true)
}));

// Import after mocking
import {
  updateSubCategoryInDB,
  addSubCategoryToDB,
  deleteSubCategoryFromDB
} from '../budgetSubcategoryService';
import { SubCategory } from '@/types/budget';

describe('budgetSubcategoryService', () => {
  const mockSubCategory: SubCategory = {
    name: 'Test Subcategory',
    amount: 500,
    color: 'bg-blue-500',
    icon: '🛒'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateSubCategoryInDB', () => {
    const categoryId = 'cat-1';
    const subCategoryName = 'Test Subcategory';
    const updates: Partial<SubCategory> = {
      name: 'Updated Subcategory',
      amount: 600,
      color: 'bg-green-500',
      icon: '🎯'
    };

    it('should update subcategory successfully', async () => {
      const mockSubcategoryData = {
        id: 'sub-1',
        name: 'Test Subcategory',
        amount: 500,
        color: 'bg-blue-500',
        icon: '🛒',
        category_id: 'cat-1'
      };

      // Mock for finding the subcategory
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: mockSubcategoryData,
        error: null
      });
      const mockSelectFind = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingleFind
          })
        })
      });

      // Mock for updating the subcategory
      const mockEqUpdate = jest.fn().mockResolvedValue({ error: null });
      const mockUpdateChain = jest.fn().mockReturnValue({ eq: mockEqUpdate });

      mockSupabaseClient.from
        .mockImplementationOnce(() => ({ select: mockSelectFind })) // Find subcategory
        .mockImplementationOnce(() => ({ update: mockUpdateChain })); // Update subcategory

      await updateSubCategoryInDB(categoryId, subCategoryName, updates, false);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories_real');
      expect(mockSelectFind).toHaveBeenCalledWith('*');
      expect(mockUpdateChain).toHaveBeenCalledWith(expect.objectContaining({
        name: updates.name,
        amount: updates.amount,
        color: updates.color,
        icon: updates.icon
      }));
      expect(mockEqUpdate).toHaveBeenCalledWith('id', 'sub-1');
    });

    it('should handle subcategory not found', async () => {
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      });
      const mockSelectFind = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingleFind
          })
        })
      });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelectFind });

      await expect(updateSubCategoryInDB(categoryId, subCategoryName, updates, false))
        .rejects.toThrow('Subcategory not found');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories_real');
    });

    it('should handle update errors', async () => {
      const mockSubcategoryData = {
        id: 'sub-1',
        name: 'Test Subcategory',
        amount: 500,
        color: 'bg-blue-500',
        icon: '🛒',
        category_id: 'cat-1'
      };

      // Mock for finding the subcategory
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: mockSubcategoryData,
        error: null
      });
      const mockSelectFind = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingleFind
          })
        })
      });

      // Mock for update error
      const updateError = new Error('Update failed');
      const mockEqUpdate = jest.fn().mockResolvedValue({ error: updateError });
      const mockUpdateChain = jest.fn().mockReturnValue({ eq: mockEqUpdate });

      mockSupabaseClient.from
        .mockImplementationOnce(() => ({ select: mockSelectFind })) // Find subcategory
        .mockImplementationOnce(() => ({ update: mockUpdateChain })); // Update subcategory

      await expect(updateSubCategoryInDB(categoryId, subCategoryName, updates, false))
        .rejects.toThrow('Update failed');
    });

    it('should handle demo mode', async () => {
      const mockSubcategoryData = {
        id: 'sub-1',
        name: 'Test Subcategory',
        amount: 500,
        color: 'bg-blue-500',
        icon: '🛒',
        category_id: 'cat-1'
      };

      // Mock for finding the subcategory
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: mockSubcategoryData,
        error: null
      });
      const mockSelectFind = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingleFind
          })
        })
      });

      // Mock for updating the subcategory
      const mockEqUpdate = jest.fn().mockResolvedValue({ error: null });
      const mockUpdateChain = jest.fn().mockReturnValue({ eq: mockEqUpdate });

      mockSupabaseClient.from
        .mockImplementationOnce(() => ({ select: mockSelectFind })) // Find subcategory
        .mockImplementationOnce(() => ({ update: mockUpdateChain })); // Update subcategory

      await updateSubCategoryInDB(categoryId, subCategoryName, updates, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories');
    });
  });

  describe('addSubCategoryToDB', () => {
    const categoryId = 'cat-1';

    it('should add subcategory successfully', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });

      await addSubCategoryToDB(categoryId, mockSubCategory, false);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories_real');
      expect(mockInsert).toHaveBeenCalledWith({
        category_id: categoryId,
        name: mockSubCategory.name,
        amount: mockSubCategory.amount,
        color: mockSubCategory.color,
        icon: mockSubCategory.icon
      });
    });

    it('should handle insertion errors', async () => {
      const insertError = new Error('Insert failed');
      const mockInsert = jest.fn().mockResolvedValue({ error: insertError });
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });

      await expect(addSubCategoryToDB(categoryId, mockSubCategory, false))
        .rejects.toThrow('Insert failed');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories_real');
    });

    it('should handle demo mode', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert });

      await addSubCategoryToDB(categoryId, mockSubCategory, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories');
    });
  });

  describe('deleteSubCategoryFromDB', () => {
    const categoryId = 'cat-1';
    const subCategoryName = 'Test Subcategory';

    it('should delete subcategory successfully', async () => {
      const mockSubcategoryData = { id: 'sub-1' };

      // Mock for finding the subcategory
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: mockSubcategoryData,
        error: null
      });
      const mockSelectFind = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingleFind
          })
        })
      });

      // Mock for deleting the subcategory
      const mockEqDelete = jest.fn().mockResolvedValue({ error: null });
      const mockDeleteChain = jest.fn().mockReturnValue({ eq: mockEqDelete });

      mockSupabaseClient.from
        .mockImplementationOnce(() => ({ select: mockSelectFind })) // Find subcategory
        .mockImplementationOnce(() => ({ delete: mockDeleteChain })); // Delete subcategory

      await deleteSubCategoryFromDB(categoryId, subCategoryName, false);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories_real');
      expect(mockSelectFind).toHaveBeenCalledWith('id');
      expect(mockDeleteChain).toHaveBeenCalled();
      expect(mockEqDelete).toHaveBeenCalledWith('id', 'sub-1');
    });

    it('should handle subcategory not found during deletion', async () => {
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      });
      const mockSelectFind = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingleFind
          })
        })
      });

      mockSupabaseClient.from.mockReturnValue({ select: mockSelectFind });

      await expect(deleteSubCategoryFromDB(categoryId, subCategoryName, false))
        .rejects.toThrow('Subcategory not found');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories_real');
    });

    it('should handle deletion errors', async () => {
      const mockSubcategoryData = { id: 'sub-1' };

      // Mock for finding the subcategory
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: mockSubcategoryData,
        error: null
      });
      const mockSelectFind = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingleFind
          })
        })
      });

      // Mock for deletion error
      const deleteError = new Error('Delete failed');
      const mockEqDelete = jest.fn().mockResolvedValue({ error: deleteError });
      const mockDeleteChain = jest.fn().mockReturnValue({ eq: mockEqDelete });

      mockSupabaseClient.from
        .mockImplementationOnce(() => ({ select: mockSelectFind })) // Find subcategory
        .mockImplementationOnce(() => ({ delete: mockDeleteChain })); // Delete subcategory

      await expect(deleteSubCategoryFromDB(categoryId, subCategoryName, false))
        .rejects.toThrow('Delete failed');
    });

    it('should handle demo mode', async () => {
      const mockSubcategoryData = { id: 'sub-1' };

      // Mock for finding the subcategory
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: mockSubcategoryData,
        error: null
      });
      const mockSelectFind = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingleFind
          })
        })
      });

      // Mock for deleting the subcategory
      const mockEqDelete = jest.fn().mockResolvedValue({ error: null });
      const mockDeleteChain = jest.fn().mockReturnValue({ eq: mockEqDelete });

      mockSupabaseClient.from
        .mockImplementationOnce(() => ({ select: mockSelectFind })) // Find subcategory
        .mockImplementationOnce(() => ({ delete: mockDeleteChain })); // Delete subcategory

      await deleteSubCategoryFromDB(categoryId, subCategoryName, true);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('budget_subcategories');
    });
  });
}); 
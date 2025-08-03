/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { useBudget } from '../useBudget';
import * as budgetService from '@/services/budgetService';
import { BudgetProvider } from '@/contexts/BudgetContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { vi } from 'vitest';

// Mock the services
vi.mock('@/services/budgetService');
vi.mock('react-hot-toast');
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('useBudget', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <BudgetProvider>{children}</BudgetProvider>
    </AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add a category with optimistic updates', async () => {
    const mockCategory = {
      id: '123',
      name: 'Test Category',
      budget_limit: 1000,
      percentage: 0,
      bg_color: '#000000',
      ring_color: '#ffffff',
    };

    (budgetService.addBudgetCategory as any).mockResolvedValueOnce(mockCategory);

    const { result } = renderHook(() => useBudget(), { wrapper });

    await act(async () => {
      await result.current.addCategory(mockCategory);
    });

    // Check if the category was added optimistically
    expect(result.current.categories).toContainEqual(expect.objectContaining({
      name: mockCategory.name,
      budget_limit: mockCategory.budget_limit,
    }));
  });

  it('should delete a category after confirmation', async () => {
    const mockCategory = {
      id: '123',
      name: 'Test Category',
    };

    const { result } = renderHook(() => useBudget(), { wrapper });

    // Simulate delete request
    await act(async () => {
      await result.current.deleteCategory(mockCategory.id);
    });

    // Check if confirmation modal is shown
    expect(result.current.confirmationState).toEqual(expect.objectContaining({
      isOpen: true,
      itemType: 'category',
      itemId: mockCategory.id,
    }));

    // Simulate confirmation
    await act(async () => {
      if (result.current.confirmationState.onConfirm) {
        await result.current.confirmationState.onConfirm();
      }
    });

    // Check if the category was deleted
    expect(budgetService.deleteBudgetCategory).toHaveBeenCalledWith(mockCategory.id);
  });

  it('should delete a subcategory after confirmation', async () => {
    const mockSubcategory = {
      id: '456',
      name: 'Test Subcategory',
    };

    const { result } = renderHook(() => useBudget(), { wrapper });

    // Simulate delete request
    await act(async () => {
      await result.current.deleteSubcategory(mockSubcategory.id);
    });

    // Check if confirmation modal is shown
    expect(result.current.confirmationState).toEqual(expect.objectContaining({
      isOpen: true,
      itemType: 'subcategory',
      itemId: mockSubcategory.id,
    }));

    // Simulate confirmation
    await act(async () => {
      if (result.current.confirmationState.onConfirm) {
        await result.current.confirmationState.onConfirm();
      }
    });

    // Check if the subcategory was deleted
    expect(budgetService.deleteBudgetSubcategory).toHaveBeenCalledWith(mockSubcategory.id);
  });

  it('should handle errors during category operations', async () => {
    const error = new Error('Test error');
    (budgetService.addBudgetCategory as any).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBudget(), { wrapper });

    await act(async () => {
      try {
        await result.current.addCategory({
          name: 'Test Category',
          budget_limit: 1000,
        });
      } catch (e) {
        expect(e).toBe(error);
      }
    });
  });
}); 
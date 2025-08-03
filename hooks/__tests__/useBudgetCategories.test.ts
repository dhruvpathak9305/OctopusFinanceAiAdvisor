/* eslint-disable @typescript-eslint/no-explicit-any */

import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useBudgetCategories } from '../useBudgetCategories';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    }),
    removeChannel: vi.fn()
  }
}));

describe('useBudgetCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches budget categories and subcategories on mount', async () => {
    // Mock auth response
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    } as any);

    // Mock category response
    vi.mocked(supabase.order).mockResolvedValueOnce({
      data: [
        { id: 'cat1', name: 'Housing', user_id: 'test-user-id', display_order: 0, is_active: true }
      ],
      error: null
    } as any);

    // Mock subcategory response
    vi.mocked(supabase.order).mockResolvedValueOnce({
      data: [
        { id: 'sub1', name: 'Rent', category_id: 'cat1', display_order: 0, is_active: true }
      ],
      error: null
    } as any);

    const { result } = renderHook(() => useBudgetCategories());

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);

    // Wait for the data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the data is loaded
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].name).toBe('Housing');
    expect(result.current.subcategories).toHaveLength(1);
    expect(result.current.subcategories[0].name).toBe('Rent');
    
    // Verify that the channel subscription was created
    expect(supabase.channel).toHaveBeenCalledTimes(2);
    expect(supabase.channel).toHaveBeenCalledWith('budget_categories_changes');
    expect(supabase.channel).toHaveBeenCalledWith('budget_subcategories_changes');
  });

  it('handles error during fetch', async () => {
    // Mock auth response
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    } as any);

    // Mock category fetch error
    vi.mocked(supabase.order).mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' }
    } as any);

    const { result } = renderHook(() => useBudgetCategories());

    // Wait for the error to be set
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Verify the error is handled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.categories).toHaveLength(0);
    expect(result.current.subcategories).toHaveLength(0);
  });

  it('refreshes data when refresh function is called', async () => {
    // Mock auth response
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    } as any);

    // Mock initial category response
    vi.mocked(supabase.order).mockResolvedValueOnce({
      data: [
        { id: 'cat1', name: 'Housing', user_id: 'test-user-id' }
      ],
      error: null
    } as any);

    // Mock initial subcategory response
    vi.mocked(supabase.order).mockResolvedValueOnce({
      data: [
        { id: 'sub1', name: 'Rent', category_id: 'cat1' }
      ],
      error: null
    } as any);

    const { result } = renderHook(() => useBudgetCategories());

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock updated category response for refresh
    vi.mocked(supabase.order).mockResolvedValueOnce({
      data: [
        { id: 'cat1', name: 'Housing', user_id: 'test-user-id' },
        { id: 'cat2', name: 'Food', user_id: 'test-user-id' }
      ],
      error: null
    } as any);

    // Mock updated subcategory response for refresh
    vi.mocked(supabase.order).mockResolvedValueOnce({
      data: [
        { id: 'sub1', name: 'Rent', category_id: 'cat1' },
        { id: 'sub2', name: 'Groceries', category_id: 'cat2' }
      ],
      error: null
    } as any);

    // Call refresh function
    result.current.refresh();

    // Wait for refresh to complete
    await waitFor(() => {
      expect(result.current.categories).toHaveLength(2);
    });

    // Verify data is updated
    expect(result.current.categories[1].name).toBe('Food');
    expect(result.current.subcategories).toHaveLength(2);
    expect(result.current.subcategories[1].name).toBe('Groceries');
  });
}); 
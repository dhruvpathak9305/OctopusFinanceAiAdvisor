/* eslint-disable react-refresh/only-export-components, react-hooks/exhaustive-deps */
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import { toast } from 'sonner';
import * as budgetService from '../services/budgetService';
import type { BudgetPeriodInput } from '../services/budgetService';
import { Database } from '../types/supabase';

export type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];
export type BudgetSubcategory = Database['public']['Tables']['budget_subcategories']['Row'];
export type BudgetPeriod = Database['public']['Tables']['budget_periods']['Row'];

interface BudgetContextType {
  // Data
  categories: BudgetCategory[];
  subcategories: BudgetSubcategory[];
  currentPeriod: BudgetPeriod | null;
  
  // Loading states
  loading: boolean;
  categoriesLoading: boolean;
  subcategoriesLoading: boolean;
  periodLoading: boolean;
  
  // Error state
  error: Error | null;
  
  // State setters
  setCategories: React.Dispatch<React.SetStateAction<BudgetCategory[]>>;
  setSubcategories: React.Dispatch<React.SetStateAction<BudgetSubcategory[]>>;
  
  // Action methods
  refreshBudgetData: () => Promise<void>;
  addBudgetCategory: (category: Omit<BudgetCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<BudgetCategory>;
  updateBudgetCategory: (id: string, updates: Partial<Omit<BudgetCategory, 'id'>>) => Promise<BudgetCategory>;
  deleteBudgetCategory: (id: string) => Promise<void>;
  addBudgetSubcategory: (subcategory: Omit<BudgetSubcategory, 'id' | 'created_at' | 'updated_at'>) => Promise<BudgetSubcategory>;
  updateBudgetSubcategory: (id: string, updates: Partial<Omit<BudgetSubcategory, 'id'>>) => Promise<BudgetSubcategory>;
  deleteBudgetSubcategory: (id: string) => Promise<void>;
  createBudgetPeriod: (period: BudgetPeriodInput) => Promise<BudgetPeriod>;
  updateBudgetPeriod: (id: string, updates: Partial<Omit<BudgetPeriod, 'id'>>) => Promise<BudgetPeriod>;
  
  // Helper methods
  getSubcategoriesForCategory: (categoryId: string) => BudgetSubcategory[];
  getCategoryById: (id: string) => BudgetCategory | undefined;
  getSubcategoryById: (id: string) => BudgetSubcategory | undefined;
  getCategoryProgress: (categoryId: string) => { current: number; limit: number; percentage: number };
  getTotalBudgetProgress: () => { current: number; limit: number; percentage: number };
}

export const BudgetContext = createContext<BudgetContextType | null>(null);

export const useBudget = (): BudgetContextType | null => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    console.warn('useBudget must be used within a BudgetProvider');
    return null;
  }
  return context;
};

interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  // State
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [subcategories, setSubcategories] = useState<BudgetSubcategory[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<BudgetPeriod | null>(null);
  
  // Loading states
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState<boolean>(true);
  const [periodLoading, setPeriodLoading] = useState<boolean>(true);
  
  // Error state
  const [error, setError] = useState<Error | null>(null);
  
  const { user } = useAuth();
  const { isDemo } = useDemoMode();
  
  // Define a computed loading state
  const loading = categoriesLoading || subcategoriesLoading || periodLoading;
  
  const fetchBudgetData = useCallback(async () => {
    setError(null);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('BudgetContext: Starting to fetch budget data, isDemo:', isDemo);
    }

    try {
      // 1. Fetch current period first (will create one if none exists)
      const period = await budgetService.fetchCurrentBudgetPeriod(isDemo);
      setCurrentPeriod(period);

      // 2. Fetch all active categories
      const fetchedCategories = await budgetService.fetchBudgetCategories(isDemo);
      setCategories(fetchedCategories);

      // 3. Fetch all subcategories for active categories
      const fetchedSubcategories = await budgetService.fetchBudgetSubcategories(isDemo);
      setSubcategories(fetchedSubcategories);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('BudgetContext: Data fetched -', fetchedCategories.length, 'categories,', fetchedSubcategories.length, 'subcategories');
      }
    } catch (err) {
      console.error('BudgetContext: Error fetching budget data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch budget data'));
      toast.error('Failed to load budget data', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setCategoriesLoading(false);
      setSubcategoriesLoading(false);
      setPeriodLoading(false);
    }
  }, [isDemo]);
  
  // Refresh budget data
  const refreshBudgetData = async () => {
    await fetchBudgetData();
  };
  
    // Budget category operations
  const addBudgetCategory = async (category: Omit<BudgetCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCategory = await budgetService.addBudgetCategory(category, isDemo);
      setCategories([...categories, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add budget category'));
      toast.error('Failed to add budget category', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
      throw err;
    }
  };

  const updateBudgetCategory = async (id: string, updates: Partial<Omit<BudgetCategory, 'id'>>) => {
    try {
      const updatedCategory = await budgetService.updateBudgetCategory(id, updates, isDemo);
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update budget category'));
      toast.error('Failed to update budget category', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
      throw err;
    }
  };

  const deleteBudgetCategory = async (id: string) => {
    try {
      await budgetService.deleteBudgetCategory(id, isDemo);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      // Also remove related subcategories
      setSubcategories(prev => prev.filter(subcat => subcat.category_id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete budget category'));
      toast.error('Failed to delete budget category', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
      throw err;
    }
  };
  
    // Budget subcategory operations
  const addBudgetSubcategory = async (subcategory: Omit<BudgetSubcategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSubcategory = await budgetService.addBudgetSubcategory(subcategory, isDemo);
      setSubcategories([...subcategories, newSubcategory]);
      return newSubcategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add budget subcategory'));
      toast.error('Failed to add budget subcategory', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
      throw err;
    }
  };

  const updateBudgetSubcategory = async (id: string, updates: Partial<Omit<BudgetSubcategory, 'id'>>) => {
    try {
      const updatedSubcategory = await budgetService.updateBudgetSubcategory(id, updates, isDemo);
      setSubcategories(prev => prev.map(subcat => subcat.id === id ? updatedSubcategory : subcat));
      return updatedSubcategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update budget subcategory'));
      toast.error('Failed to update budget subcategory', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
      throw err;
    }
  };

  const deleteBudgetSubcategory = async (id: string) => {
    try {
      await budgetService.deleteBudgetSubcategory(id, isDemo);
      setSubcategories(prev => prev.filter(subcat => subcat.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete budget subcategory'));
      toast.error('Failed to delete budget subcategory', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
      throw err;
    }
  };
  
    // Budget period operations
  const createBudgetPeriod = async (period: BudgetPeriodInput) => {
    try {
      const newPeriod = await budgetService.createBudgetPeriod(period, isDemo);
      setCurrentPeriod(newPeriod);
      return newPeriod;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create budget period'));
      toast.error('Failed to create budget period', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
      throw err;
    }
  };

  const updateBudgetPeriod = async (id: string, updates: Partial<Omit<BudgetPeriod, 'id'>>) => {
    try {
      const updatedPeriod = await budgetService.updateBudgetPeriod(id, updates, isDemo);
      if (currentPeriod?.id === id) {
        setCurrentPeriod(updatedPeriod);
      }
      return updatedPeriod;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update budget period'));
      toast.error('Failed to update budget period', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
      throw err;
    }
  };
  
  // Helper methods
  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter(subcat => subcat.category_id === categoryId);
  };
  
  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };
  
  const getSubcategoryById = (id: string) => {
    return subcategories.find(subcat => subcat.id === id);
  };
  
  const getCategoryProgress = (categoryId: string) => {
    const current = subcategories
      .filter(sub => sub.category_id === categoryId)
      .reduce((acc, sub) => acc + (sub.current_spend || 0), 0);
    const limit = categories.find(cat => cat.id === categoryId)?.budget_limit || 0;
    const percentage = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;
    
    return { current, limit, percentage };
  };
  
  const getTotalBudgetProgress = () => {
    const totalSpent = subcategories.reduce((acc, sub) => acc + (sub.current_spend || 0), 0);
    const totalBudget = categories.reduce((acc, cat) => acc + (cat.budget_limit || 0), 0);
    const percentage = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;
    
    return { current: totalSpent, limit: totalBudget, percentage };
  };
  
  // Initialize by fetching data
  useEffect(() => {
    if (user) {
      fetchBudgetData();
    }
  }, [user, isDemo, fetchBudgetData]);

  // Set up real-time subscriptions separately to avoid circular dependencies
  useEffect(() => {
    if (!user) return;

    // Subscribe to budget categories changes
    const categoriesSubscription = supabase
      .channel('budget_categories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_categories',
          filter: `user_id=eq.${user.id}`
        },
        async () => {
          await fetchBudgetData();
        }
      )
      .subscribe();

    // Subscribe to budget subcategories changes
    const subcategoriesSubscription = supabase
      .channel('budget_subcategories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_subcategories'
        },
        async () => {
          await fetchBudgetData();
        }
      )
      .subscribe();

    return () => {
      categoriesSubscription.unsubscribe();
      subcategoriesSubscription.unsubscribe();
    };
  }, [user, fetchBudgetData]);
  
  // Create the context value
  const value: BudgetContextType = {
    // Data
    categories,
    subcategories,
    currentPeriod,
    
    // Loading states
    loading,
    categoriesLoading,
    subcategoriesLoading,
    periodLoading,
    
    // Error state
    error,
    
    // State setters
    setCategories,
    setSubcategories,
    
    // Action methods
    refreshBudgetData,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    addBudgetSubcategory,
    updateBudgetSubcategory,
    deleteBudgetSubcategory,
    createBudgetPeriod,
    updateBudgetPeriod,
    
    // Helper methods
    getSubcategoriesForCategory,
    getCategoryById,
    getSubcategoryById,
    getCategoryProgress,
    getTotalBudgetProgress,
  };
  
  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}; 

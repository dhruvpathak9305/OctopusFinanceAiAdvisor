import { supabase } from '../lib/supabase/client';
import { Database } from '../types/supabase';
import { 
  getTableMap, 
  validateTableConsistency, 
  type TableMap 
} from '../utils/tableMapping';

export type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];
export type BudgetSubcategory = Database['public']['Tables']['budget_subcategories']['Row'];
export type BudgetPeriod = Database['public']['Tables']['budget_periods']['Row'];
export type MainCategoryType = 'Needs' | 'Wants' | 'Save' | 'Debt/Loans';
export type BudgetCategoryInsert = Database['public']['Tables']['budget_categories']['Insert'];
export type BudgetCategoryUpdate = Database['public']['Tables']['budget_categories']['Update'];

// Helper function to get the appropriate table mapping
const getTableMapping = (isDemo: boolean): TableMap => {
  const tableMap = getTableMap(isDemo);
  
  // Validate consistency during development
  if (process.env.NODE_ENV === 'development') {
    validateTableConsistency(tableMap);
  }
  
  return tableMap;
};

// Input types for creating new records
export type BudgetPeriodInput = {
  month?: number; // Optional - used for calculation but not stored
  year?: number; // Optional - used for calculation but not stored
  is_active?: boolean; // Optional - will be converted to string for DB
  period_start: string;
  period_end: string;
  total_budget: number;
  total_spend: number;
  status: 'under_budget' | 'on_budget' | 'over_budget' | 'not_set';
  budget_set_for_period?: 'monthly' | 'quarterly' | 'yearly';
  budget_strategy?: 'zero-based' | 'envelope' | 'rolling' | 'ai-powered';
  apply_to_all_months?: boolean;
  name: string;
  user_id?: string;
};

// Simplified types for batch updates
type CategoryBatchUpdate = {
  id: string;
  display_order: number;
};

type SubcategoryBatchUpdate = {
  id: string;
  display_order: number;
};

// Budget Categories
export async function fetchBudgetCategories(isDemo: boolean = false): Promise<BudgetCategory[]> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    // filter out inactive categories (is_active is text type: 'true'/'false')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error }: { data: BudgetCategory[]; error: any } = await (supabase as any)
      .from(tableMap.budget_categories)
      .select('*')
      .neq('is_active', 'false')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching budget categories:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchBudgetCategories:', error);
    throw error;
  }
}

export async function addBudgetCategory(category: BudgetCategoryInsert, isDemo: boolean = false): Promise<BudgetCategory> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { data, error } = await (supabase as any)
      .from(tableMap.budget_categories)
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error adding budget category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addBudgetCategory:', error);
    throw error;
  }
}

export async function updateBudgetCategory(id: string, updates: Partial<BudgetCategoryUpdate>, isDemo: boolean = false): Promise<BudgetCategory> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { data, error } = await (supabase as any)
      .from(tableMap.budget_categories)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBudgetCategory:', error);
    throw error;
  }
}

export async function deleteBudgetCategory(id: string, isDemo: boolean = false): Promise<void> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { error } = await (supabase as any)
      .from(tableMap.budget_categories)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteBudgetCategory:', error);
    throw error;
  }
}

export async function archiveBudgetCategory(id: string, isDemo: boolean = false): Promise<BudgetCategory> {
  // deactivate the category (is_active is text type)
  return updateBudgetCategory(id, { is_active: "false" }, isDemo);
}

export async function reorderBudgetCategories(categoryIds: string[], isDemo: boolean = false): Promise<void> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    // Create batch updates with display_order values
    const updates: CategoryBatchUpdate[] = categoryIds.map((id, index) => ({
      id,
      display_order: index
    }));

    // TypeScript doesn't like the upsert operation with only partial data
    // Use a type assertion as a workaround
    const { error } = await (supabase as any)
      .from(tableMap.budget_categories)
      .upsert(updates as unknown as BudgetCategory[]);

    if (error) {
      console.error('Error reordering budget categories:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in reorderBudgetCategories:', error);
    throw error;
  }
}

// Budget Subcategories
export async function fetchBudgetSubcategories(isDemo: boolean = false): Promise<BudgetSubcategory[]> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { data, error } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching budget subcategories:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchBudgetSubcategories:', error);
    throw error;
  }
}

export async function addBudgetSubcategory(subcategory: Omit<BudgetSubcategory, 'id' | 'created_at' | 'updated_at'>, isDemo: boolean = false): Promise<BudgetSubcategory> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { data, error } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .insert(subcategory)
      .select()
      .single();

    if (error) {
      console.error('Error adding budget subcategory:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addBudgetSubcategory:', error);
    throw error;
  }
}

export async function updateBudgetSubcategory(id: string, updates: Partial<Omit<BudgetSubcategory, 'id'>>, isDemo: boolean = false): Promise<BudgetSubcategory> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { data, error } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget subcategory:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBudgetSubcategory:', error);
    throw error;
  }
}

export async function deleteBudgetSubcategory(id: string, isDemo: boolean = false): Promise<void> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { error } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget subcategory:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteBudgetSubcategory:', error);
    throw error;
  }
}

export async function reorderBudgetSubcategories(subcategoryIds: string[], isDemo: boolean = false): Promise<void> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    // Create batch updates with display_order values
    const updates: SubcategoryBatchUpdate[] = subcategoryIds.map((id, index) => ({
      id,
      display_order: index
    }));

    // TypeScript doesn't like the upsert operation with only partial data
    // Use a type assertion as a workaround
    const { error } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .upsert(updates as unknown as BudgetSubcategory[]);

    if (error) {
      console.error('Error reordering budget subcategories:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in reorderBudgetSubcategories:', error);
    throw error;
  }
}

// Budget Periods
export async function fetchCurrentBudgetPeriod(isDemo: boolean = false): Promise<BudgetPeriod> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Get current month start and end dates
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based month
    const periodStart = new Date(currentYear, currentMonth, 1);
    const periodEnd = new Date(currentYear, currentMonth + 1, 1); // Start of next month
    
    // Both demo and real tables use period_start/period_end columns
    const tableName = isDemo ? 'budget_periods' : 'budget_periods_real';
    const query = (supabase as any)
      .from(tableMap.budget_periods || tableName)
      .select('*')
      .eq('user_id', user.id)
      .gte('period_start', periodStart.toISOString())
      .lt('period_start', periodEnd.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No budget period found for current month, create a default one
        const defaultPeriod: BudgetPeriodInput = {
          month: currentMonth + 1, // Convert to 1-based month
          year: currentYear,
          is_active: true,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          total_budget: 0,
          total_spend: 0,
          status: 'not_set',
          budget_set_for_period: 'monthly',
          budget_strategy: 'zero-based',
          apply_to_all_months: false,
          name: `${periodStart.toLocaleDateString('en-US', { month: 'long' })} ${currentYear}`,
          user_id: user.id
        };
        
        return await createBudgetPeriod(defaultPeriod, isDemo);
      }
      console.error('Error fetching current budget period:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchCurrentBudgetPeriod:', error);
    throw error;
  }
}

export async function createBudgetPeriod(period: BudgetPeriodInput, isDemo: boolean = false): Promise<BudgetPeriod> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const tableMap = getTableMapping(isDemo);
    
    // Both demo and real tables use the same schema (period_start/period_end)
    // Remove month/year from the data as they don't exist in the table schema
    const { month, year, ...periodWithoutMonthYear } = period;
    const periodData = {
      ...periodWithoutMonthYear,
      user_id: user.id
    };

    const tableName = isDemo ? 'budget_periods' : 'budget_periods_real';
    const { data, error } = await (supabase as any)
      .from(tableMap.budget_periods || tableName)
      .insert(periodData)
      .select()
      .single();

    if (error) {
      console.error('Error creating budget period:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createBudgetPeriod:', error);
    throw error;
  }
}

export async function updateBudgetPeriod(id: string, updates: Partial<Omit<BudgetPeriod, 'id'>>, isDemo: boolean = false): Promise<BudgetPeriod> {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { data, error } = await (supabase as any)
      .from(tableMap.budget_periods || 'budget_periods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget period:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBudgetPeriod:', error);
    throw error;
  }
} 
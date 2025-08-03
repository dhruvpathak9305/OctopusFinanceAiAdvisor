import { supabase } from '../lib/supabase/client';
import { Database } from '../types/supabase';
import { TimePeriod } from '../hooks/useFetchBudgetSubcategories';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];
type BudgetSubcategory = Database['public']['Tables']['budget_subcategories']['Row'];

interface BudgetSummary {
  [categoryName: string]: {
    total: number;
    subcategories: {
      [subcategoryName: string]: number;
    };
  };
}

/**
 * Calculates budget summary based on specified time period
 */
export async function calculateBudgetSummary(timePeriod: TimePeriod = 'monthly'): Promise<BudgetSummary> {
  // Calculate date range based on time period
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  
  if (timePeriod === 'monthly') {
    // Current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (timePeriod === 'quarterly') {
    // Current quarter
    const currentQuarter = Math.floor(now.getMonth() / 3);
    startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
    endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
  } else {
    // Current year
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 12, 0);
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Fetch transactions for the selected time period
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select(`
      *,
      budget_categories!category_id (*),
      budget_subcategories!subcategory_id (*)
    `)
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .eq('type', 'expense'); // Only consider expenses for budget summary

  if (transactionsError) {
    throw new Error(`Failed to fetch transactions: ${transactionsError.message}`);
  }

  // Fetch all budget categories and subcategories
  const { data: categories, error: categoriesError } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', "true");

  if (categoriesError) {
    throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
  }

  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('budget_subcategories')
    .select('*')
    .eq('is_active', true);

  if (subcategoriesError) {
    throw new Error(`Failed to fetch subcategories: ${subcategoriesError.message}`);
  }

  // Initialize the summary object with all categories and subcategories
  const summary: BudgetSummary = {};

  // Initialize all categories and subcategories with 0
  categories.forEach(category => {
    summary[category.name] = {
      total: 0,
      subcategories: {}
    };
    subcategories
      .filter(sub => sub.category_id === category.id)
      .forEach(sub => {
        summary[category.name].subcategories[sub.name] = 0;
      });
  });

  // Calculate totals for each subcategory and category
  transactions.forEach(transaction => {
    const categoryName = transaction.budget_categories?.name;
    const subcategoryName = transaction.budget_subcategories?.name;
    // Only accumulate if we have an initialized summary entry
    if (categoryName && subcategoryName && summary[categoryName]) {
      // Initialize subcategory in summary if missing
      if (summary[categoryName].subcategories[subcategoryName] === undefined) {
        summary[categoryName].subcategories[subcategoryName] = 0;
      }
      summary[categoryName].subcategories[subcategoryName] += transaction.amount;
      summary[categoryName].total += transaction.amount;
    }
  });

  return summary;
}

// Helper function to log the budget summary
export async function logBudgetSummary(timePeriod: TimePeriod = 'monthly') {
  try {
    const summary = await calculateBudgetSummary(timePeriod);
    console.log(`Budget Summary for ${timePeriod} period:`, summary);
  } catch (error) {
    console.error('Error calculating budget summary:', error);
  }
}

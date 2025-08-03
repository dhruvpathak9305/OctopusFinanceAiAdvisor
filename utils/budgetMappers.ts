import type { Database } from "../types/supabase";
import { BudgetCategory } from "../types/budget";

// Helper function to map database category to frontend model
export const mapDbCategoryToModel = (
  dbCategory: Database['public']['Tables']['budget_categories']['Row'],
  subCategories: Database['public']['Tables']['budget_subcategories']['Row'][] = []
): BudgetCategory => {
  // Calculate spent amount based on subcategories
  const spent = subCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const percentage = Math.round((spent / dbCategory.budget_limit) * 100);
  
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    percentage,
    spent,
    limit: dbCategory.budget_limit,
    remaining: dbCategory.budget_limit - spent,
    bgColor: dbCategory.bg_color,
    ringColor: dbCategory.ring_color,
    subcategories: subCategories.map(sub => ({
      name: sub.name,
      amount: sub.amount,
      color: sub.color,
      icon: sub.icon,
    }))
  };
};

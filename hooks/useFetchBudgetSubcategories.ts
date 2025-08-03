import { useState, useEffect } from 'react';
import { supabase } from "../lib/supabase/client";
import { calculateBudgetSummary } from "../utils/budgetSummary";

export interface BudgetCategory {
  name: string;
  amount: number;
  color: string;
  bgColor: string;
  limit: number;
  percentage: number;
  subcategories: {
    name: string;
    amount: number;
    color: string;
  }[];
}

// Expanded time period type to include quarterly
export type TimePeriod = 'monthly' | 'quarterly' | 'yearly';

export function useFetchBudgetSubcategories(viewOption: TimePeriod = 'monthly') {
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Fetch active budget categories
        const { data: categories, error: categoriesError } = await supabase
          .from('budget_categories')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', "true");

        if (categoriesError) throw categoriesError;

        // Sort categories by display_order
        categories.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

        // Get budget summary with time period
        const summary = await calculateBudgetSummary(viewOption);

        // Transform data for the component using budget_limit and percentage from categories
        const transformedData = categories.map(category => {
          const categorySummary = summary[category.name] || { total: 0, subcategories: {} };
          
          // Adjust limit based on time period
          let adjustedLimit = Number(category.budget_limit);
          if (viewOption === 'quarterly') {
            adjustedLimit = adjustedLimit * 3; // Quarterly is 3x monthly
          } else if (viewOption === 'yearly') {
            adjustedLimit = adjustedLimit * 12; // Yearly is 12x monthly
          }
          
          return {
            name: category.name,
            amount: categorySummary.total,
            color: category.ring_color,
            bgColor: category.bg_color,
            limit: adjustedLimit,
            percentage: Number(category.percentage),
            subcategories: Object.entries(categorySummary.subcategories).map(([name, amount]) => ({
              name,
              amount,
              color: category.ring_color
            }))
          };
        });

        setBudgetData(transformedData);
      } catch (err) {
        console.error('Error fetching budget data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch budget data');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [viewOption]);

  return { budgetData, loading, error };
} 
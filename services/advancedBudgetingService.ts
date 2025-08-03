import { supabase } from "../lib/supabase/client";
import Toast from 'react-native-toast-message';
import type { Database } from '../types/supabase';
import { 
  getTableMap, 
  validateTableConsistency, 
  type TableMap 
} from '../utils/tableMapping';

// Helper function to get the appropriate table mapping
const getTableMapping = (isDemo: boolean): TableMap => {
  const tableMap = getTableMap(isDemo);
  
  // Validate consistency during development
  if (process.env.NODE_ENV === 'development') {
    validateTableConsistency(tableMap);
  }
  
  return tableMap;
};

export type BudgetStrategy = 'zero-based' | 'ai-powered' | 'envelope' | 'rolling';

export interface BudgetSettings {
  type: 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  applyToAllMonths: boolean;
  monthlyBudgets?: { [key: string]: number };
  strategy: BudgetStrategy;
  categories: {
    name: string;
    percentage: number;
    amount: number;
    bgColor: string;
    ringColor: string;
  }[];
  needsPercentage?: number;
  wantsPercentage?: number;
  savingsPercentage?: number;
}

export interface ZeroBasedBudget {
  id: string;
  period_id: string;
  category_id: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
}

export interface EnvelopeBudget {
  id: string;
  period_id: string;
  category_id: string;
  envelope_name: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  is_rollover_enabled: boolean;
  rollover_amount: number;
}

// Typed representation for AI pattern data
interface PatternData {
  averageSpend: number;
  frequency: number;
  highestSpend: number;
  patternType: string;
  prediction: string;
}

export interface AISpendingPattern {
  id: string;
  category_id: string;
  pattern_type: string;
  pattern_data: PatternData;
  confidence_score: number;
}

export interface RollingBudgetAdjustment {
  id: string;
  period_id: string;
  category_id: string;
  adjustment_type: 'increase' | 'decrease';
  adjustment_amount: number;
  adjustment_reason: string;
  previous_amount: number;
  new_amount: number;
}

export const advancedBudgetingService = {
  // Save budget settings
  async saveBudgetSettings(settings: BudgetSettings, isDemo: boolean = false) {
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const tableMap = getTableMapping(isDemo);

      const { data: period, error: periodError } = await (supabase as any)
        .from(tableMap.budget_periods || 'budget_periods')
        .insert({
          user_id: userId,
          total_budget: settings.amount,
          period_start: new Date().toISOString(),
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
          budget_set_for_period: settings.type,
          budget_strategy: settings.strategy,
          apply_to_all_months: settings.applyToAllMonths,
          needs_percentage: settings.needsPercentage || 
            settings.categories.find(c => c.name === "Needs")?.percentage || 0,
          wants_percentage: settings.wantsPercentage || 
            settings.categories.find(c => c.name === "Wants")?.percentage || 0,
          savings_percentage: settings.savingsPercentage || 
            settings.categories.find(c => c.name === "Savings")?.percentage || 0,
          name: `Budget for ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
          status: 'not_set'
        })
        .select()
        .single();

      if (periodError) {
        console.error('Error creating budget period:', periodError);
        throw periodError;
      }

      // Save categories using dynamic table name
      const categoryPromises = settings.categories.map(category =>
        (supabase as any)
          .from(tableMap.budget_categories)
          .insert({
            user_id: userId,
            name: category.name,
            percentage: category.percentage,
            budget_limit: category.amount,
            bg_color: category.bgColor,
            ring_color: category.ringColor
          })
      );

      await Promise.all(categoryPromises);

      if (settings.applyToAllMonths) {
        // Apply to all months logic
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const year = new Date().getFullYear();
        
        const futurePeriods = months.map(month => {
          // Skip the current month as we already created it
          if (month === new Date().getMonth() + 1) return null;
          
          return (supabase as any)
            .from(tableMap.budget_periods || 'budget_periods')
            .insert({
              user_id: userId,
              total_budget: settings.amount,
              period_start: new Date(year, month - 1, 1).toISOString(),
              period_end: new Date(year, month, 0).toISOString(),
              budget_set_for_period: settings.type,
              budget_strategy: settings.strategy,
              apply_to_all_months: settings.applyToAllMonths,
              needs_percentage: settings.needsPercentage || 
                settings.categories.find(c => c.name === "Needs")?.percentage || 0,
              wants_percentage: settings.wantsPercentage || 
                settings.categories.find(c => c.name === "Wants")?.percentage || 0,
              savings_percentage: settings.savingsPercentage || 
                settings.categories.find(c => c.name === "Savings")?.percentage || 0,
              name: `Budget for ${new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' })} ${year}`,
              status: 'not_set'
            });
        }).filter(Boolean);

        await Promise.all(futurePeriods);
      }

      toast.success('Budget settings saved successfully');
      return period;
    } catch (error) {
      console.error('Error saving budget settings:', error);
      toast.error('Failed to save budget settings');
      throw error;
    }
  },

  // Create a custom table for zero-based budgets if it doesn't exist in schema
  async createZeroBasedBudget(periodId: string, categoryId: string, amount: number, isDemo: boolean = false) {
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const tableMap = getTableMapping(isDemo);

      // Using transactions table since zero_based_budgets table doesn't exist in schema
      const { data, error } = await (supabase as any)
        .from(tableMap.transactions)
        .insert({
          user_id: userId,
          name: 'Budget Allocation',
          amount: amount,
          date: new Date().toISOString(),
          type: 'expense', // Using the allowed transaction type
          category_id: categoryId,
          description: `Budget allocation for period ${periodId}`,
          source_account_type: 'bank', // Required field
          metadata: { period_id: periodId, allocated_amount: amount, budget_type: 'zero-based' }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating zero-based budget:', error);
        throw error;
      }
      
      return {
        id: data.id,
        period_id: periodId,
        category_id: categoryId,
        allocated_amount: amount,
        spent_amount: 0,
        remaining_amount: amount
      };
    } catch (error) {
      console.error('Error in createZeroBasedBudget:', error);
      throw error;
    }
  },

  // Create envelope budget
  async createEnvelopeBudget(periodId: string, categoryId: string, envelopeDetails: { 
    envelope_name: string; 
    allocated_amount: number;
    is_rollover_enabled: boolean;
    rollover_amount: number;
  }, isDemo: boolean = false) {
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const tableMap = getTableMapping(isDemo);

      // Using transactions table with metadata to simulate envelope budgets
      const { data, error } = await (supabase as any)
        .from(tableMap.transactions)
        .insert({
          user_id: userId,
          name: `Envelope: ${envelopeDetails.envelope_name}`,
          amount: envelopeDetails.allocated_amount,
          date: new Date().toISOString(),
          type: 'expense',
          category_id: categoryId,
          description: `Envelope budget allocation for ${envelopeDetails.envelope_name}`,
          source_account_type: 'bank',
          metadata: { 
            period_id: periodId, 
            envelope_name: envelopeDetails.envelope_name,
            allocated_amount: envelopeDetails.allocated_amount,
            is_rollover_enabled: envelopeDetails.is_rollover_enabled,
            rollover_amount: envelopeDetails.rollover_amount,
            budget_type: 'envelope'
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating envelope budget:', error);
        throw error;
      }

      return {
        id: data.id,
        period_id: periodId,
        category_id: categoryId,
        envelope_name: envelopeDetails.envelope_name,
        allocated_amount: envelopeDetails.allocated_amount,
        spent_amount: 0,
        remaining_amount: envelopeDetails.allocated_amount,
        is_rollover_enabled: envelopeDetails.is_rollover_enabled,
        rollover_amount: envelopeDetails.rollover_amount
      };
    } catch (error) {
      console.error('Error in createEnvelopeBudget:', error);
      throw error;
    }
  },

  // Analyze spending patterns using AI
  async analyzeSpendingPatterns(categoryId: string, isDemo: boolean = false) {
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const tableMap = getTableMapping(isDemo);

      // Fetch transaction data for the category
      const { data: transactions, error } = await (supabase as any)
        .from(tableMap.transactions)
        .select('*')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .gte('date', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 6 months

      if (error) {
        console.error('Error fetching transactions for analysis:', error);
        throw error;
      }

      if (!transactions || transactions.length === 0) {
        return {
          id: 'generated',
          category_id: categoryId,
          pattern_type: 'insufficient_data',
          pattern_data: {
            averageSpend: 0,
            frequency: 0,
            highestSpend: 0,
            patternType: 'No pattern detected',
            prediction: 'Insufficient data for analysis'
          },
          confidence_score: 0
        };
      }

      // Simple AI-like analysis
      const amounts = transactions.map((t: any) => t.amount);
      const averageSpend = amounts.reduce((sum: number, amount: number) => sum + amount, 0) / amounts.length;
      const highestSpend = Math.max(...amounts);
      const frequency = transactions.length;

      // Determine pattern type based on spending behavior
      let patternType = 'regular';
      let prediction = `Estimated monthly spend: $${averageSpend.toFixed(2)}`;
      let confidenceScore = 0.7;

      if (frequency > 20) {
        patternType = 'frequent';
        prediction = `High frequency spending detected. Consider budget limits.`;
        confidenceScore = 0.8;
      } else if (highestSpend > averageSpend * 3) {
        patternType = 'irregular';
        prediction = `Irregular spending pattern. Large purchases detected.`;
        confidenceScore = 0.6;
      }

      return {
        id: `ai_${categoryId}_${Date.now()}`,
        category_id: categoryId,
        pattern_type: patternType,
        pattern_data: {
          averageSpend,
          frequency,
          highestSpend,
          patternType,
          prediction
        },
        confidence_score: confidenceScore
      };
    } catch (error) {
      console.error('Error in analyzeSpendingPatterns:', error);
      throw error;
    }
  },

  // Adjust rolling budget
  async adjustRollingBudget(adjustment: {
    period_id: string;
    category_id: string;
    adjustment_type: 'increase' | 'decrease';
    adjustment_amount: number;
    adjustment_reason: string;
    previous_amount: number;
    new_amount: number;
  }, isDemo: boolean = false) {
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const tableMap = getTableMapping(isDemo);

      // Store adjustment as a transaction with metadata
      const { data, error } = await (supabase as any)
        .from(tableMap.transactions)
        .insert({
          user_id: userId,
          name: `Budget Adjustment: ${adjustment.adjustment_type}`,
          amount: adjustment.adjustment_amount,
          date: new Date().toISOString(),
          type: adjustment.adjustment_type === 'increase' ? 'income' : 'expense',
          category_id: adjustment.category_id,
          description: `Rolling budget adjustment: ${adjustment.adjustment_reason}`,
          source_account_type: 'bank',
          metadata: {
            period_id: adjustment.period_id,
            adjustment_type: adjustment.adjustment_type,
            adjustment_amount: adjustment.adjustment_amount,
            adjustment_reason: adjustment.adjustment_reason,
            previous_amount: adjustment.previous_amount,
            new_amount: adjustment.new_amount,
            budget_type: 'rolling'
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating rolling budget adjustment:', error);
        throw error;
      }

      return {
        id: data.id,
        period_id: adjustment.period_id,
        category_id: adjustment.category_id,
        adjustment_type: adjustment.adjustment_type,
        adjustment_amount: adjustment.adjustment_amount,
        adjustment_reason: adjustment.adjustment_reason,
        previous_amount: adjustment.previous_amount,
        new_amount: adjustment.new_amount
      };
    } catch (error) {
      console.error('Error in adjustRollingBudget:', error);
      throw error;
    }
  },

  // Get budget recommendations
  async getBudgetRecommendations(userId: string, isDemo: boolean = false) {
    try {
      const tableMap = getTableMapping(isDemo);

      // Type definitions moved to interface for better organization
      type TransactionWithCategory = Database['public']['Tables']['transactions']['Row'];
      
      interface CategoryGroup {
        name: string;
        transactions: TransactionWithCategory[];
      }

      // Fetch user's transactions and categories
      const { data: transactions, error: transactionsError } = await (supabase as any)
        .from(tableMap.transactions)
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 3 months

      if (transactionsError) {
        console.error('Error fetching transactions for recommendations:', transactionsError);
        throw transactionsError;
      }

      const { data: categories, error: categoriesError } = await (supabase as any)
        .from(tableMap.budget_categories)
        .select('*')
        .eq('user_id', userId);

      if (categoriesError) {
        console.error('Error fetching categories for recommendations:', categoriesError);
        throw categoriesError;
      }

      // Simple recommendation logic
      const recommendations = [];

      if (!transactions || transactions.length === 0) {
        recommendations.push({
          type: 'setup',
          title: 'Start Tracking Expenses',
          description: 'Begin by adding your regular expenses to get personalized recommendations.'
        });
      } else {
        // Analyze spending patterns
        const totalSpending = transactions.reduce((sum: number, t: any) => sum + (t.type === 'expense' ? t.amount : 0), 0);
        const averageMonthlySpending = totalSpending / 3;

        recommendations.push({
          type: 'budget',
          title: 'Set Monthly Budget',
          description: `Based on your spending, consider setting a monthly budget of $${(averageMonthlySpending * 1.1).toFixed(2)}`
        });

        // Category-specific recommendations
        if (categories && categories.length > 0) {
          categories.forEach((category: any) => {
            const categoryTransactions = transactions.filter((t: any) => t.category_id === category.id);
            if (categoryTransactions.length > 0) {
              const categorySpending = categoryTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
              const categoryAverage = categorySpending / categoryTransactions.length;
              
              recommendations.push({
                type: 'category',
                title: `${category.name} Budget`,
                description: `Consider allocating $${(categoryAverage * 1.2).toFixed(2)} monthly for ${category.name.toLowerCase()}`
              });
            }
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error in getBudgetRecommendations:', error);
      throw error;
    }
  }
}; 
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase/client";
import { toast } from "sonner";
import { BudgetCategory, SubCategory } from "../types/budget";

type BudgetingMethod = "traditional" | "zero-based" | "envelope" | "rolling";

interface AdvancedBudgetingContextType {
  activeBudgetingMethod: BudgetingMethod;
  setActiveBudgetingMethod: (method: BudgetingMethod) => void;
  applyZeroBasedBudgeting: () => Promise<void>;
  applyEnvelopeBudgeting: () => Promise<void>;
  applyRollingBudget: () => Promise<void>;
  suggestCategorization: (transactionDescription: string) => Promise<string>;
  isAdjustingBudget: boolean;
  unallocatedAmount: number;
}

const AdvancedBudgetingContext = createContext<AdvancedBudgetingContextType | undefined>(undefined);

export function AdvancedBudgetingProvider({ children }: { children: React.ReactNode }) {
  const [activeBudgetingMethod, setActiveBudgetingMethod] = useState<BudgetingMethod>("traditional");
  const [isAdjustingBudget, setIsAdjustingBudget] = useState(false);
  const [unallocatedAmount, setUnallocatedAmount] = useState(0);

  // Apply Zero-Based Budgeting
  const applyZeroBasedBudgeting = async () => {
    try {
      setIsAdjustingBudget(true);
      toast.info("Applying Zero-Based Budgeting method...");
      
      // Get user's current income
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      // Fetch income transactions to calculate total income
      const { data: incomeData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .gte('date', new Date(new Date().setDate(1)).toISOString());
      
      const totalIncome = incomeData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
      
      // Get current categories
      const { data: categories } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id);
      
      if (!categories || categories.length === 0) {
        toast.error("No budget categories found");
        setIsAdjustingBudget(false);
        return;
      }
      
      // Calculate equal allocation for each category
      const equalAllocation = Math.floor(totalIncome / categories.length);
      
      // Update each category with the equal allocation
      for (const category of categories) {
        await supabase
          .from('budget_categories')
          .update({ budget_limit: equalAllocation })
          .eq('id', category.id);
      }
      
      setActiveBudgetingMethod("zero-based");
      toast.success("Zero-Based Budgeting applied successfully");
      setUnallocatedAmount(0);
    } catch (error) {
      console.error("Error applying zero-based budgeting:", error);
      toast.error("Failed to apply Zero-Based Budgeting");
    } finally {
      setIsAdjustingBudget(false);
    }
  };
  
  // Apply Envelope Budgeting
  const applyEnvelopeBudgeting = async () => {
    try {
      setIsAdjustingBudget(true);
      toast.info("Applying Envelope Budgeting method...");
      
      // Get user's current income and existing budget categories
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      // Fetch current categories with their subcategories
      const { data: categories } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id);
      
      if (!categories || categories.length === 0) {
        toast.error("No budget categories found");
        setIsAdjustingBudget(false);
        return;
      }
      
      // For envelope budgeting, we'll ensure each category has at least one subcategory
      for (const category of categories) {
        // Check if category has subcategories
        const { data: subcategories } = await supabase
          .from('budget_subcategories')
          .select('*')
          .eq('category_id', category.id);
          
        // If no subcategories, create a default "Envelope" subcategory
        if (!subcategories || subcategories.length === 0) {
          await supabase
            .from('budget_subcategories')
            .insert({
              category_id: category.id,
              name: `${category.name} Envelope`,
              amount: category.budget_limit * 0.9, // Set envelope to 90% of budget
              color: "#3b82f6",
              icon: "badgeIcon"
            });
        }
      }
      
      setActiveBudgetingMethod("envelope");
      toast.success("Envelope Budgeting applied successfully");
    } catch (error) {
      console.error("Error applying envelope budgeting:", error);
      toast.error("Failed to apply Envelope Budgeting");
    } finally {
      setIsAdjustingBudget(false);
    }
  };
  
  // Apply Rolling Budget
  const applyRollingBudget = async () => {
    try {
      setIsAdjustingBudget(true);
      toast.info("Applying Rolling Budget method...");
      
      // Get user and their transaction history
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      // Get categories
      const { data: categories } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id);
      
      if (!categories || categories.length === 0) {
        toast.error("No budget categories found");
        setIsAdjustingBudget(false);
        return;
      }
      
      // For each category, get spending average from last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      for (const category of categories) {
        // Get subcategories
        const { data: subcategories } = await supabase
          .from('budget_subcategories')
          .select('*')
          .eq('category_id', category.id);
        
        if (subcategories && subcategories.length > 0) {
          // Sum the amounts in subcategories to get total spent
          const totalSpent = subcategories.reduce((sum, subCat) => sum + subCat.amount, 0);
          
          // Adjust budget limit based on spending pattern (10% buffer)
          const suggestedLimit = Math.ceil(totalSpent * 1.1);
          
          // Update category budget limit
          await supabase
            .from('budget_categories')
            .update({ budget_limit: suggestedLimit })
            .eq('id', category.id);
        }
      }
      
      setActiveBudgetingMethod("rolling");
      toast.success("Rolling Budget applied successfully");
    } catch (error) {
      console.error("Error applying rolling budget:", error);
      toast.error("Failed to apply Rolling Budget");
    } finally {
      setIsAdjustingBudget(false);
    }
  };

  // AI-Powered Categorization
  const suggestCategorization = async (transactionDescription: string): Promise<string> => {
    try {
      // Use the existing parse-transaction edge function to categorize
      const { data, error } = await supabase.functions.invoke("parse-transaction", {
        body: { text: transactionDescription },
      });
      
      if (error) throw error;
      
      return data.category || "Uncategorized";
    } catch (error) {
      console.error("Error suggesting category:", error);
      return "Uncategorized";
    }
  };

  // Calculate unallocated amount for zero-based budgeting
  useEffect(() => {
    if (activeBudgetingMethod === "zero-based") {
      const calculateUnallocated = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          // Get total income
          const { data: incomeData } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('type', 'income')
            .gte('date', new Date(new Date().setDate(1)).toISOString());
          
          const totalIncome = incomeData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
          
          // Get total allocated in budgets
          const { data: categories } = await supabase
            .from('budget_categories')
            .select('budget_limit')
            .eq('user_id', user.id);
          
          const totalAllocated = categories?.reduce((sum, cat) => sum + cat.budget_limit, 0) || 0;
          
          // Calculate unallocated
          setUnallocatedAmount(totalIncome - totalAllocated);
        } catch (error) {
          console.error("Error calculating unallocated amount:", error);
        }
      };
      
      calculateUnallocated();
    }
  }, [activeBudgetingMethod]);

  const value = {
    activeBudgetingMethod,
    setActiveBudgetingMethod,
    applyZeroBasedBudgeting,
    applyEnvelopeBudgeting,
    applyRollingBudget,
    suggestCategorization,
    isAdjustingBudget,
    unallocatedAmount
  };

  return (
    <AdvancedBudgetingContext.Provider value={value}>
      {children}
    </AdvancedBudgetingContext.Provider>
  );
}

export const useAdvancedBudgeting = () => {
  const context = useContext(AdvancedBudgetingContext);
  if (context === undefined) {
    throw new Error("useAdvancedBudgeting must be used within an AdvancedBudgetingProvider");
  }
  return context;
};

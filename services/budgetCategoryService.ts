import { supabase } from "../lib/supabase/client";
import { BudgetCategory, BudgetStatus } from "../types/budget";
import { mapDbCategoryToModel } from "../utils/budgetMappers";
import Toast from "react-native-toast-message";
import type { Database } from "../types/supabase";
import {
  getTableMap,
  validateTableConsistency,
  type TableMap,
} from "../utils/tableMapping";

// Helper function to get the appropriate table mapping
const getTableMapping = (isDemo: boolean): TableMap => {
  const tableMap = getTableMap(isDemo);

  // Validate consistency during development
  if (process.env.NODE_ENV === "development") {
    validateTableConsistency(tableMap);
  }

  return tableMap;
};

// Fetch budget categories and their subcategories
export const fetchBudgetCategories = async (
  isDemo: boolean = false
): Promise<BudgetCategory[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const tableMap = getTableMap(isDemo);

    const { data, error } = await (supabase as any)
      .from(tableMap.budget_categories)
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching budget categories:", error);
      throw error;
    }

    // Map the database data to BudgetCategory type
    return (data || []).map((category: any) =>
      mapDbCategoryToModel(category, [])
    );
  } catch (err) {
    console.error("Error fetching budget categories:", err);
    throw err;
  }
};

// Create a new category in the database
export const createCategoryInDB = async (
  category: Partial<BudgetCategory>,
  isDemo: boolean = false
) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const tableMap = getTableMapping(isDemo);

    const { data, error } = await (supabase as any)
      .from(tableMap.budget_categories)
      .insert({
        name: category.name,
        bg_color: category.bgColor,
        ring_color: category.ringColor,
        budget_limit: category.limit,
        percentage: 0,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      throw error;
    }
    return data;
  } catch (err) {
    console.error("Error creating category:", err);
    Toast.show({
      type: "error",
      text1: "Failed to create budget category",
    });
    throw err;
  }
};

// Update a category in the database
export const updateCategoryInDB = async (
  categoryId: string,
  updates: Partial<BudgetCategory>,
  isDemo: boolean = false
) => {
  try {
    const tableMap = getTableMapping(isDemo);

    const { error } = await (supabase as any)
      .from(tableMap.budget_categories)
      .update({
        name: updates.name,
        bg_color: updates.bgColor,
        ring_color: updates.ringColor,
        budget_limit: updates.limit,
      })
      .eq("id", categoryId);

    if (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateCategoryInDB:", error);
    throw error;
  }
};

// Delete a category from the database
export const deleteCategoryFromDB = async (
  categoryId: string,
  isDemo: boolean = false
) => {
  try {
    const tableMap = getTableMapping(isDemo);

    // First, delete all subcategories
    const { error: subCategoryError } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .delete()
      .eq("category_id", categoryId);

    if (subCategoryError) {
      console.error("Error deleting subcategories:", subCategoryError);
      throw new Error(
        `Failed to delete subcategories: ${subCategoryError.message}`
      );
    }

    // Then delete the category
    const { error } = await (supabase as any)
      .from(tableMap.budget_categories)
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error("Error deleting category:", error);
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in deleteCategoryFromDB:", error);
    throw error;
  }
};

export const budgetCategoryService = {
  async fetchCategories(isDemo: boolean = false): Promise<BudgetCategory[]> {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) return [];

      const tableMap = getTableMapping(isDemo);

      // Fetch categories with their subcategories to calculate spent amounts
      const { data: categories, error } = await (supabase as any)
        .from(tableMap.budget_categories)
        .select(
          `
          *,
          subcategories:${tableMap.budget_subcategories}(
            id,
            name,
            current_spend,
            budget_limit,
            is_active,
            icon,
            color
          )
        `
        )
        .eq("user_id", user.user.id)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching budget categories:", error);
        return [];
      }

      return (categories || []).map((cat: any) => {
        // Calculate total spent from active subcategories
        const activeSubcategories = (cat.subcategories || []).filter(
          (sub: any) => sub.is_active !== false
        );
        const totalSpent = activeSubcategories.reduce(
          (sum: number, sub: any) => sum + (parseFloat(sub.current_spend) || 0),
          0
        );

        const budgetLimit = parseFloat(cat.budget_limit) || 0;

        return {
          id: cat.id,
          name: cat.name,
          percentage: cat.percentage || 0,
          limit: budgetLimit,
          spent: totalSpent,
          remaining: Math.max(0, budgetLimit - totalSpent),
          bgColor: cat.bg_color || "#047857",
          ringColor: cat.ring_color || "#10b981",
          subcategories: activeSubcategories,
          is_active: cat.is_active ?? true,
          status: (cat.status as BudgetStatus) || "not_set",
          display_order: cat.display_order || 0,
          category_type: cat.category_type || "expense",
          icon: cat.icon || null,
        };
      });
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      return [];
    }
  },

  async updateCategory(
    category: BudgetCategory,
    isDemo: boolean = false
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) return;

      const tableMap = getTableMapping(isDemo);

      const { error } = await (supabase as any)
        .from(tableMap.budget_categories)
        .update({
          name: category.name,
          percentage: category.percentage,
          budget_limit: category.limit,
          bg_color: category.bgColor,
          ring_color: category.ringColor,
          is_active: category.is_active,
          status: category.status,
          display_order: category.display_order,
        })
        .eq("id", category.id)
        .eq("user_id", user.user.id);

      if (error) {
        console.error("Error updating budget category:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in updateCategory:", error);
      throw error;
    }
  },

  async createCategory(
    category: Omit<BudgetCategory, "id">,
    isDemo: boolean = false
  ): Promise<BudgetCategory> {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) throw new Error("User not authenticated");

      const tableMap = getTableMapping(isDemo);

      const { data, error } = await (supabase as any)
        .from(tableMap.budget_categories)
        .insert({
          name: category.name,
          percentage: category.percentage,
          budget_limit: category.limit,
          bg_color: category.bgColor,
          ring_color: category.ringColor,
          is_active: category.is_active,
          status: category.status,
          display_order: category.display_order,
          user_id: user.user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating budget category:", error);
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        percentage: data.percentage || 0,
        limit: data.budget_limit || 0,
        spent: 0,
        remaining: data.budget_limit || 0,
        bgColor: data.bg_color || "#047857",
        ringColor: data.ring_color || "#10b981",
        subcategories: [],
        is_active: data.is_active ?? true,
        status: (data.status as BudgetStatus) || "not_set",
        display_order: data.display_order || 0,
      };
    } catch (error) {
      console.error("Error in createCategory:", error);
      throw error;
    }
  },

  async updateCategories(
    categories: BudgetCategory[],
    isDemo: boolean = false
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) return;

      const tableMap = getTableMapping(isDemo);

      // Update each category
      const updates = categories.map((category) => ({
        id: category.id,
        name: category.name,
        percentage: category.percentage,
        budget_limit: category.limit,
        bg_color: category.bgColor,
        ring_color: category.ringColor,
        is_active: category.is_active,
        status: category.status,
        display_order: category.display_order,
        user_id: user.user.id,
      }));

      const { error } = await (supabase as any)
        .from(tableMap.budget_categories)
        .upsert(updates);

      if (error) {
        console.error("Error updating budget categories:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in updateCategories:", error);
      throw error;
    }
  },

  async saveCategories(
    categories: BudgetCategory[],
    isDemo: boolean = false
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) return;

      const tableMap = getTableMapping(isDemo);

      // Update categories with computed values
      const updates = categories.map((category, index) => ({
        id: category.id,
        name: category.name,
        percentage: category.percentage,
        budget_limit: category.limit,
        bg_color: category.bgColor,
        ring_color: category.ringColor,
        is_active: category.is_active,
        status: category.status,
        display_order: index,
        user_id: user.user.id,
      }));

      const { error } = await (supabase as any)
        .from(tableMap.budget_categories)
        .upsert(updates);

      if (error) {
        console.error("Error saving budget categories:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in saveCategories:", error);
      throw error;
    }
  },

  async deleteCategory(
    categoryId: string,
    isDemo: boolean = false
  ): Promise<void> {
    try {
      const tableMap = getTableMapping(isDemo);

      // First delete all subcategories
      await (supabase as any)
        .from(tableMap.budget_subcategories)
        .delete()
        .eq("category_id", categoryId);

      // Then delete the category
      const { error } = await (supabase as any)
        .from(tableMap.budget_categories)
        .delete()
        .eq("id", categoryId);

      if (error) {
        console.error("Error deleting budget category:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      throw error;
    }
  },

  async bulkUpdateSubcategoryBudgets(
    categoryId: string,
    subcategoryUpdates: Array<{ id: string; budget_limit: number }>,
    isDemo: boolean = false
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) return;

      const tableMap = getTableMapping(isDemo);

      // Update each subcategory's budget limit
      for (const update of subcategoryUpdates) {
        const { error } = await (supabase as any)
          .from(tableMap.budget_subcategories)
          .update({
            budget_limit: update.budget_limit,
            amount: update.budget_limit, // Keep amount in sync with budget_limit
            updated_at: new Date().toISOString(),
          })
          .eq("id", update.id);

        if (error) {
          console.error("Error updating subcategory budget:", error);
          throw error;
        }
      }

      console.log(
        `✅ Successfully updated ${subcategoryUpdates.length} subcategory budgets`
      );
    } catch (error) {
      console.error("Error in bulkUpdateSubcategoryBudgets:", error);
      throw error;
    }
  },
};

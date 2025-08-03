/**
 * Budget Subcategory Service
 * 
 * This service manages CRUD operations for budget subcategories within the application.
 * 
 * Use Cases:
 * - Create new budget subcategories under existing categories
 * - Update existing subcategory details (name, amount, color, icon)
 * - Delete subcategories from the database
 * - Handle both demo and production data environments
 * - Maintain budget hierarchy with parent categories
 * 
 * Key Functions:
 * - updateSubCategoryInDB(): Updates an existing subcategory by category ID and name
 * - addSubCategoryToDB(): Creates a new subcategory under a specified category
 * - deleteSubCategoryFromDB(): Removes a subcategory by category ID and name
 * 
 * Data Fields Managed:
 * - name: Subcategory display name
 * - amount: Budget allocation for the subcategory
 * - color: UI color theme for visual representation
 * - icon: Emoji or icon for quick identification
 * - category_id: Parent category association
 * 
 * This service supports both demo mode and production environments through table mapping.
 */

import { supabase } from "../lib/supabase/client";
import { SubCategory } from "../types/budget";
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

// Update a subcategory in the database
export const updateSubCategoryInDB = async (
  categoryId: string,
  subCategoryName: string,
  updates: Partial<SubCategory>,
  isDemo: boolean = false
) => {
  try {
    const tableMap = getTableMapping(isDemo);
    
    // Find the subcategory to get its database ID
    const { data: subCatData, error: subCatError } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .select('*')
      .eq('category_id', categoryId)
      .eq('name', subCategoryName)
      .single();
    
    if (subCatError || !subCatData) {
      console.error("Error finding subcategory:", subCatError);
      throw new Error("Subcategory not found");
    }
    
    // Update the subcategory in the database
    const { error: updateError } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .update({
        name: updates.name || subCatData.name,
        amount: updates.amount !== undefined ? updates.amount : subCatData.amount,
        color: updates.color || subCatData.color,
        icon: updates.icon || subCatData.icon
      })
      .eq('id', subCatData.id);
    
    if (updateError) {
      console.error("Error updating subcategory:", updateError);
      throw updateError;
    }
  } catch (error) {
    console.error("Error in updateSubCategoryInDB:", error);
    throw error;
  }
};

// Add a new subcategory to the database
export const addSubCategoryToDB = async (
  categoryId: string,
  subCategory: SubCategory,
  isDemo: boolean = false
) => {
  try {
    const tableMap = getTableMapping(isDemo);
    
    const { error } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .insert({
        category_id: categoryId,
        name: subCategory.name,
        amount: subCategory.amount,
        color: subCategory.color,
        icon: subCategory.icon
      });
    
    if (error) {
      console.error("Error adding subcategory:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in addSubCategoryToDB:", error);
    throw error;
  }
};

// Delete a subcategory from the database
export const deleteSubCategoryFromDB = async (
  categoryId: string,
  subCategoryName: string,
  isDemo: boolean = false
) => {
  try {
    const tableMap = getTableMapping(isDemo);
    
    // Find the subcategory to get its database ID
    const { data: subCatData, error: subCatError } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .select('id')
      .eq('category_id', categoryId)
      .eq('name', subCategoryName)
      .single();
    
    if (subCatError || !subCatData) {
      console.error("Error finding subcategory:", subCatError);
      throw new Error("Subcategory not found");
    }
    
    // Delete the subcategory from the database
    const { error: deleteError } = await (supabase as any)
      .from(tableMap.budget_subcategories)
      .delete()
      .eq('id', subCatData.id);
    
    if (deleteError) {
      console.error("Error deleting subcategory:", deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error("Error in deleteSubCategoryFromDB:", error);
    throw error;
  }
};

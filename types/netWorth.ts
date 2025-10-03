/**
 * =============================================================================
 * NET WORTH TYPES - TYPESCRIPT DEFINITIONS
 * =============================================================================
 *
 * This file contains TypeScript type definitions for net worth categories,
 * subcategories, and related CRUD operations.
 */

import type { Database } from "./supabase";

// =============================================================================
// DATABASE TYPES
// =============================================================================

export type NetWorthType = Database["public"]["Enums"]["net_worth_type"];
export type LinkedSourceType =
  Database["public"]["Enums"]["linked_source_type"];

// Category types
export type NetWorthCategory =
  Database["public"]["Tables"]["net_worth_categories_real"]["Row"];
export type NetWorthCategoryInsert =
  Database["public"]["Tables"]["net_worth_categories_real"]["Insert"];
export type NetWorthCategoryUpdate =
  Database["public"]["Tables"]["net_worth_categories_real"]["Update"];

// Subcategory types
export type NetWorthSubcategory =
  Database["public"]["Tables"]["net_worth_subcategories_real"]["Row"];
export type NetWorthSubcategoryInsert =
  Database["public"]["Tables"]["net_worth_subcategories_real"]["Insert"];
export type NetWorthSubcategoryUpdate =
  Database["public"]["Tables"]["net_worth_subcategories_real"]["Update"];

// Entry types
export type NetWorthEntry =
  Database["public"]["Tables"]["net_worth_entries_real"]["Row"];
export type NetWorthEntryInsert =
  Database["public"]["Tables"]["net_worth_entries_real"]["Insert"];
export type NetWorthEntryUpdate =
  Database["public"]["Tables"]["net_worth_entries_real"]["Update"];

// =============================================================================
// CRUD OPERATION TYPES
// =============================================================================

export interface CreateCategoryInput {
  name: string;
  type: NetWorthType;
  color?: string;
  icon?: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateSubcategoryInput {
  category_id: string;
  name: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateSubcategoryInput {
  id: string;
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface BulkCreateCategoryInput {
  name: string;
  type: NetWorthType;
  color?: string;
  icon?: string;
  description?: string;
  sort_order?: number;
  subcategories?: string[];
}

export interface ReorderItem {
  id: string;
  sort_order: number;
}

// =============================================================================
// ENHANCED TYPES WITH RELATIONSHIPS
// =============================================================================

export interface CategoryWithSubcategories extends NetWorthCategory {
  subcategories: NetWorthSubcategory[];
}

export interface SubcategoryWithCategory extends NetWorthSubcategory {
  category: NetWorthCategory;
}

export interface SearchResults {
  categories: NetWorthCategory[];
  subcategories: SubcategoryWithCategory[];
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

export interface CategoryPickerItem {
  id: string;
  name: string;
  type: NetWorthType;
  color?: string;
  icon?: string;
  subcategories?: SubcategoryPickerItem[];
}

export interface SubcategoryPickerItem {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
}

export interface CategoryFormData {
  name: string;
  type: NetWorthType;
  color: string;
  icon: string;
  description: string;
}

export interface SubcategoryFormData {
  name: string;
  description: string;
  category_id: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface BulkCreateResult {
  category: NetWorthCategory;
  subcategories: NetWorthSubcategory[];
}

export interface CategoryStats {
  total_categories: number;
  asset_categories: number;
  liability_categories: number;
  total_subcategories: number;
  active_entries: number;
}

// =============================================================================
// CONTEXT TYPES
// =============================================================================

export interface NetWorthCategoryContextType {
  // State
  categories: NetWorthCategory[];
  subcategories: NetWorthSubcategory[];
  loading: boolean;
  error: string | null;

  // Category CRUD
  createCategory: (data: CreateCategoryInput) => Promise<NetWorthCategory>;
  updateCategory: (data: UpdateCategoryInput) => Promise<NetWorthCategory>;
  deleteCategory: (id: string) => Promise<void>;
  fetchCategories: (type?: NetWorthType | "all") => Promise<void>;

  // Subcategory CRUD
  createSubcategory: (
    data: CreateSubcategoryInput
  ) => Promise<NetWorthSubcategory>;
  updateSubcategory: (
    data: UpdateSubcategoryInput
  ) => Promise<NetWorthSubcategory>;
  deleteSubcategory: (id: string) => Promise<void>;
  fetchSubcategories: (categoryId?: string) => Promise<void>;

  // Advanced operations
  bulkCreateCategories: (
    categories: BulkCreateCategoryInput[]
  ) => Promise<BulkCreateResult[]>;
  reorderCategories: (items: ReorderItem[]) => Promise<void>;
  reorderSubcategories: (
    categoryId: string,
    items: ReorderItem[]
  ) => Promise<void>;
  searchCategories: (
    searchTerm: string,
    type?: NetWorthType
  ) => Promise<SearchResults>;
  initializeDefaults: () => Promise<void>;

  // Utility
  getCategoryById: (id: string) => NetWorthCategory | undefined;
  getSubcategoryById: (id: string) => NetWorthSubcategory | undefined;
  getCategoriesWithSubcategories: (
    type?: NetWorthType
  ) => CategoryWithSubcategories[];
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const NET_WORTH_TYPES: NetWorthType[] = ["asset", "liability"];

export const DEFAULT_COLORS = {
  asset: "#10B981",
  liability: "#EF4444",
} as const;

export const DEFAULT_ICONS = {
  asset: "📈",
  liability: "💳",
} as const;

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type CategoryFilter = NetWorthType | "all";
export type SortOrder = "asc" | "desc";
export type CategorySortField = "name" | "sort_order" | "created_at" | "type";

export interface CategoryListOptions {
  filter?: CategoryFilter;
  sortBy?: CategorySortField;
  sortOrder?: SortOrder;
  includeInactive?: boolean;
}

export interface SubcategoryListOptions {
  categoryId?: string;
  sortBy?: "name" | "sort_order" | "created_at";
  sortOrder?: SortOrder;
  includeInactive?: boolean;
}


import { useState, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import {
  BudgetCategory,
  BudgetSubcategory,
  SortMode,
  ViewMode,
} from "../types";
import {
  calculateTotalSpent,
  calculateTotalBudget,
  calculatePercentage,
} from "../utils/budgetCalculations";
import {
  sortSubcategories,
  getMockSubcategories,
  generateSubcategoryId,
} from "../utils/subcategoryHelpers";
import { fetchBudgetSubcategories } from "../../../../../services/budgetService";
import { useDemoMode } from "../../../../../contexts/DemoModeContext";
import { getSubcategoryProgress } from "../../../../../services/budgetProgressService";
import { useUnifiedAuth } from "../../../../../contexts/UnifiedAuthContext";

export type ModalView =
  | "main"
  | "edit-subcategory"
  | "add-subcategory"
  | "bulk-allocation"
  | "edit-category";

export interface BudgetModalState {
  // View state
  currentView: ModalView;
  viewMode: ViewMode;
  sortMode: SortMode;
  showSortDropdown: boolean;

  // Data state
  subcategories: BudgetSubcategory[];
  selectedSubcategory: BudgetSubcategory | null;

  // Calculated values
  totalSpent: number;
  totalBudget: number;
  totalPercentage: number;
  sortedSubcategories: BudgetSubcategory[];
}

export interface BudgetModalActions {
  // View actions
  setViewMode: (mode: ViewMode) => void;
  setSortMode: (mode: SortMode) => void;
  setShowSortDropdown: (show: boolean) => void;

  // Navigation actions
  goToMain: () => void;
  goToEditSubcategory: (subcategory: BudgetSubcategory) => void;
  goToAddSubcategory: () => void;
  goToBulkAllocation: () => void;
  goToEditCategory: () => void;

  // Data actions
  addSubcategory: (subcategory: Omit<BudgetSubcategory, "id">) => void;
  updateSubcategory: (
    id: string,
    updates: Partial<Omit<BudgetSubcategory, "id">>
  ) => void;
  deleteSubcategory: (id: string) => void;
  bulkUpdateSubcategories: (subcategories: BudgetSubcategory[]) => void;

  // Reset actions
  resetModal: () => void;
}

export const useBudgetModal = (
  visible: boolean,
  category: BudgetCategory | null,
  periodType: "monthly" | "quarterly" | "yearly" = "monthly"
): BudgetModalState & BudgetModalActions => {
  const { isDemo } = useDemoMode();
  const { user } = useUnifiedAuth();

  // View state
  const [currentView, setCurrentView] = useState<ModalView>("main");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Data state - use real subcategories from the category if available, otherwise fetch from database
  const [subcategories, setSubcategories] = useState<BudgetSubcategory[]>([]);

  // Initialize subcategories when category changes
  useEffect(() => {
    const fetchSubcategoriesForCategory = async () => {
      if (!category) {
        setSubcategories([]);
        return;
      }

      try {
        if (isDemo) {
          // Use mock data for demo mode
          setSubcategories(getMockSubcategories());
          return;
        }

        // Fetch real subcategory progress data with actual spending from database
        if (user?.id && category.id) {
          const subcategoryProgressData = await getSubcategoryProgress(
            user.id,
            category.id,
            category.category_type as "expense" | "income",
            periodType
          );

          // Map the progress data to the expected format
          const mappedSubcategories: BudgetSubcategory[] =
            subcategoryProgressData.map((sub) => ({
              id: sub.subcategory_id,
              name: sub.subcategory_name,
              amount: sub.budget_limit,
              budgetLimit: sub.budget_limit,
              color: sub.color || "#10B981",
              icon: sub.icon || "flash",
              spent: sub.spent_amount,
              current_spend: sub.spent_amount,
              remaining: sub.remaining_amount,
              category_id: category.id,
              is_active: sub.is_active,
            }));

          setSubcategories(mappedSubcategories);
        } else {
          // Fallback: try to use subcategories from category object if available
          const categoryWithSubs = category as BudgetCategory & {
            subcategories?: any[];
          };

          if (
            categoryWithSubs?.subcategories &&
            categoryWithSubs.subcategories.length > 0
          ) {
            const mappedSubcategories: BudgetSubcategory[] =
              categoryWithSubs.subcategories.map((sub: any) => ({
                id: sub.id,
                name: sub.name,
                amount: parseFloat(sub.budget_limit) || 0,
                budgetLimit: parseFloat(sub.budget_limit) || 0,
                color: sub.color || "#10B981",
                icon: sub.icon || "flash",
                spent: parseFloat(sub.current_spend) || 0,
                current_spend: parseFloat(sub.current_spend) || 0,
                remaining: Math.max(
                  0,
                  (parseFloat(sub.budget_limit) || 0) -
                    (parseFloat(sub.current_spend) || 0)
                ),
                category_id: categoryWithSubs.id || "",
                is_active: sub.is_active !== false,
              }));
            setSubcategories(mappedSubcategories);
          } else {
            setSubcategories([]);
          }
        }
      } catch (error) {
        console.error("Error fetching subcategory progress:", error);
        // Fallback to mock data on error
        setSubcategories(getMockSubcategories());
      }
    };

    fetchSubcategoriesForCategory();
  }, [category, isDemo, user?.id, periodType]);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<BudgetSubcategory | null>(null);

  // Calculated values
  const totalSpent = useMemo(
    () => calculateTotalSpent(subcategories),
    [subcategories]
  );
  const totalBudget = useMemo(() => {
    // Use the main category's budget limit, not the sum of subcategories
    return category?.budget_limit || 0;
  }, [category?.budget_limit]);
  const totalPercentage = useMemo(
    () => calculatePercentage(totalSpent, totalBudget),
    [totalSpent, totalBudget]
  );
  const sortedSubcategories = useMemo(
    () => sortSubcategories(subcategories, sortMode),
    [subcategories, sortMode]
  );

  // Navigation actions
  const goToMain = () => {
    setCurrentView("main");
    setSelectedSubcategory(null);
    setShowSortDropdown(false);
  };

  const goToEditSubcategory = (subcategory: BudgetSubcategory) => {
    setSelectedSubcategory(subcategory);
    setCurrentView("edit-subcategory");
    setShowSortDropdown(false);
  };

  const goToAddSubcategory = () => {
    setSelectedSubcategory(null);
    setCurrentView("add-subcategory");
    setShowSortDropdown(false);
  };

  const goToBulkAllocation = () => {
    setSelectedSubcategory(null);
    setCurrentView("bulk-allocation");
    setShowSortDropdown(false);
  };

  const goToEditCategory = () => {
    // Edit category will be handled by a separate modal, not a view change
    setSelectedSubcategory(null);
    setShowSortDropdown(false);
  };

  // Data actions
  const addSubcategory = (newSubcategory: Omit<BudgetSubcategory, "id">) => {
    const subcategoryWithId: BudgetSubcategory = {
      ...newSubcategory,
      id: generateSubcategoryId(),
    };

    setSubcategories((prev) => [...prev, subcategoryWithId]);
    goToMain();
  };

  const updateSubcategory = (
    id: string,
    updates: Partial<Omit<BudgetSubcategory, "id">>
  ) => {
    setSubcategories((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub))
    );
    goToMain();
  };

  const deleteSubcategory = (id: string) => {
    const subcategoryToDelete = subcategories.find((sub) => sub.id === id);
    if (!subcategoryToDelete) return;

    Alert.alert(
      "Delete Subcategory",
      `Are you sure you want to delete "${subcategoryToDelete.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setSubcategories((prev) => prev.filter((sub) => sub.id !== id));
            goToMain();
          },
        },
      ]
    );
  };

  const bulkUpdateSubcategories = (
    updatedSubcategories: BudgetSubcategory[]
  ) => {
    setSubcategories(updatedSubcategories);
    goToMain();
  };

  // Reset modal to initial state
  const resetModal = () => {
    setCurrentView("main");
    setViewMode("grid");
    setSortMode("name");
    setShowSortDropdown(false);
    setSelectedSubcategory(null);
  };

  // Reset when modal opens/closes
  useEffect(() => {
    if (visible) {
      setCurrentView("main");
      setShowSortDropdown(false);
    } else {
      resetModal();
    }
  }, [visible]);

  // Auto-hide dropdown when view changes
  useEffect(() => {
    if (currentView !== "main") {
      setShowSortDropdown(false);
    }
  }, [currentView]);

  return {
    // State
    currentView,
    viewMode,
    sortMode,
    showSortDropdown,
    subcategories,
    selectedSubcategory,
    totalSpent,
    totalBudget,
    totalPercentage,
    sortedSubcategories,

    // Actions
    setViewMode,
    setSortMode,
    setShowSortDropdown,
    goToMain,
    goToEditSubcategory,
    goToAddSubcategory,
    goToBulkAllocation,
    goToEditCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    bulkUpdateSubcategories,
    resetModal,
  };
};

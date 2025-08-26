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

export type ModalView = "main" | "edit-subcategory" | "add-subcategory";

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

  // Data actions
  addSubcategory: (subcategory: Omit<BudgetSubcategory, "id">) => void;
  updateSubcategory: (
    id: string,
    updates: Partial<Omit<BudgetSubcategory, "id">>
  ) => void;
  deleteSubcategory: (id: string) => void;

  // Reset actions
  resetModal: () => void;
}

export const useBudgetModal = (
  visible: boolean,
  category: BudgetCategory | null
): BudgetModalState & BudgetModalActions => {
  // View state
  const [currentView, setCurrentView] = useState<ModalView>("main");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Data state - using mock data for now, replace with real data later
  const [subcategories, setSubcategories] = useState<BudgetSubcategory[]>(
    getMockSubcategories()
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<BudgetSubcategory | null>(null);

  // Calculated values
  const totalSpent = useMemo(
    () => calculateTotalSpent(subcategories),
    [subcategories]
  );
  const totalBudget = useMemo(
    () => calculateTotalBudget(subcategories),
    [subcategories]
  );
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
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    resetModal,
  };
};

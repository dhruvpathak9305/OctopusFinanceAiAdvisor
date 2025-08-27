import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { BudgetSubcategory } from "../types";
import {
  validateSubcategoryForm,
  validateField,
  formatNumericInput,
  SubcategoryFormData,
} from "../utils/formValidation";
import { AVAILABLE_COLORS } from "../utils/subcategoryHelpers";
import { ALL_IONICONS } from "../utils/allIonicons";

export interface SubCategoryFormState {
  // Form data
  name: string;
  description: string;
  amount: string; // Main budget amount
  currentSpend: string; // Current spending
  budgetLimit: string; // Warning/alert limit
  icon: string;
  color: string;
  displayOrder: string;
  isActive: boolean;
  transactionCategoryId: string;

  // Validation state
  errors: { [key: string]: string };
  isValid: boolean;

  // UI state
  isSubmitting: boolean;
}

export interface SubCategoryFormActions {
  // Field updates
  updateName: (name: string) => void;
  updateDescription: (description: string) => void;
  updateAmount: (amount: string) => void;
  updateCurrentSpend: (amount: string) => void;
  updateBudgetLimit: (amount: string) => void;
  updateIcon: (icon: string) => void;
  updateColor: (color: string) => void;
  updateDisplayOrder: (order: string) => void;
  updateIsActive: (isActive: boolean) => void;
  updateTransactionCategoryId: (id: string) => void;

  // Form actions
  validateForm: () => boolean;
  resetForm: () => void;
  loadFromSubcategory: (subcategory: BudgetSubcategory) => void;
  getFormData: () => Omit<BudgetSubcategory, "id">;

  // Submit actions
  handleSubmit: (
    onSubmit: (data: Omit<BudgetSubcategory, "id">) => void
  ) => void;
}

const getInitialFormState = (): SubCategoryFormState => ({
  name: "",
  description: "",
  amount: "",
  currentSpend: "0",
  budgetLimit: "",
  icon: ALL_IONICONS[0]?.name || "card",
  color: AVAILABLE_COLORS[0]?.hex || "#10B981",
  displayOrder: "0",
  isActive: true,
  transactionCategoryId: "",
  errors: {},
  isValid: false,
  isSubmitting: false,
});

export const useSubcategoryForm = (): SubCategoryFormState &
  SubCategoryFormActions => {
  const [formState, setFormState] = useState<SubCategoryFormState>(
    getInitialFormState()
  );

  // Field update functions with validation
  const updateName = (name: string) => {
    const validation = validateField("name", name);
    setFormState((prev) => ({
      ...prev,
      name,
      errors: {
        ...prev.errors,
        name: validation.isValid ? "" : validation.error || "",
      },
    }));
  };

  const updateDescription = (description: string) => {
    setFormState((prev) => ({
      ...prev,
      description,
      errors: {
        ...prev.errors,
        description: "", // Description is optional
      },
    }));
  };

  const updateAmount = (amount: string) => {
    const formatted = formatNumericInput(amount);
    const validation = validateField("amount", formatted);
    setFormState((prev) => ({
      ...prev,
      amount: formatted,
      errors: {
        ...prev.errors,
        amount: validation.isValid ? "" : validation.error || "",
      },
    }));
  };

  const updateCurrentSpend = (amount: string) => {
    const formatted = formatNumericInput(amount);
    const validation = validateField("currentSpend", formatted);
    setFormState((prev) => ({
      ...prev,
      currentSpend: formatted,
      errors: {
        ...prev.errors,
        currentSpend: validation.isValid ? "" : validation.error || "",
      },
    }));
  };

  const updateBudgetLimit = (amount: string) => {
    const formatted = formatNumericInput(amount);
    const validation = validateField("budgetLimit", formatted);
    setFormState((prev) => ({
      ...prev,
      budgetLimit: formatted,
      errors: {
        ...prev.errors,
        budgetLimit: validation.isValid ? "" : validation.error || "",
      },
    }));
  };

  const updateIcon = (icon: string) => {
    setFormState((prev) => ({
      ...prev,
      icon,
      errors: {
        ...prev.errors,
        icon: "",
      },
    }));
  };

  const updateColor = (color: string) => {
    setFormState((prev) => ({
      ...prev,
      color,
      errors: {
        ...prev.errors,
        color: "",
      },
    }));
  };

  const updateDisplayOrder = (order: string) => {
    const formatted = order.replace(/[^\d]/g, ''); // Only allow digits
    setFormState((prev) => ({
      ...prev,
      displayOrder: formatted,
      errors: {
        ...prev.errors,
        displayOrder: "",
      },
    }));
  };

  const updateIsActive = (isActive: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isActive,
      errors: {
        ...prev.errors,
        isActive: "",
      },
    }));
  };

  const updateTransactionCategoryId = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      transactionCategoryId: id,
      errors: {
        ...prev.errors,
        transactionCategoryId: "",
      },
    }));
  };

  // Form validation
  const validateForm = (): boolean => {
    const formData: SubcategoryFormData = {
      name: formState.name,
      description: formState.description,
      amount: formState.amount,
      currentSpend: formState.currentSpend,
      budgetLimit: formState.budgetLimit,
      icon: formState.icon,
      color: formState.color,
      displayOrder: formState.displayOrder,
      isActive: formState.isActive,
      transactionCategoryId: formState.transactionCategoryId,
    };

    const validation = validateSubcategoryForm(formData);

    // Convert errors array to object for easier field access
    const errorObject: { [key: string]: string } = {};
    validation.errors.forEach((error) => {
      if (error.includes("name")) errorObject.name = error;
      else if (error.includes("amount") || error.includes("Amount"))
        errorObject.amount = error;
      else if (error.includes("Current spend") || error.includes("current"))
        errorObject.currentSpend = error;
      else if (error.includes("Budget limit") || error.includes("budget"))
        errorObject.budgetLimit = error;
      else if (error.includes("icon")) errorObject.icon = error;
      else if (error.includes("color")) errorObject.color = error;
      else errorObject.general = error;
    });

    setFormState((prev) => ({
      ...prev,
      errors: errorObject,
      isValid: validation.isValid,
    }));

    return validation.isValid;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormState(getInitialFormState());
  };

  // Load form from existing subcategory (for editing)
  const loadFromSubcategory = (subcategory: BudgetSubcategory) => {
    setFormState((prev) => ({
      ...prev,
      name: subcategory.name,
      description: subcategory.description || "",
      amount: subcategory.amount.toString(),
      currentSpend: (subcategory.current_spend || 0).toString(),
      budgetLimit: (subcategory.budget_limit || 0).toString(),
      icon: subcategory.icon,
      color: subcategory.color,
      displayOrder: (subcategory.display_order || 0).toString(),
      isActive: subcategory.is_active !== false, // Default to true
      transactionCategoryId: subcategory.transaction_category_id || "",
      errors: {},
      isValid: true,
    }));
  };

  // Get form data as subcategory object
  const getFormData = (): Omit<BudgetSubcategory, "id"> => {
    return {
      category_id: "", // This will be set by the parent component
      name: formState.name.trim(),
      amount: parseFloat(formState.amount) || 0,
      color: formState.color,
      icon: formState.icon,
      display_order: parseInt(formState.displayOrder) || 0,
      is_active: formState.isActive,
      description: formState.description.trim() || undefined,
      current_spend: parseFloat(formState.currentSpend) || 0,
      budget_limit: parseFloat(formState.budgetLimit) || 0,
      transaction_category_id: formState.transactionCategoryId.trim() || undefined,
    };
  };

  // Handle form submission
  const handleSubmit = (
    onSubmit: (data: Omit<BudgetSubcategory, "id">) => void
  ) => {
    if (formState.isSubmitting) return;

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    if (validateForm()) {
      try {
        const formData = getFormData();
        onSubmit(formData);
      } catch (error) {
        Alert.alert("Error", "Failed to save subcategory. Please try again.");
      }
    } else {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before submitting."
      );
    }

    setFormState((prev) => ({ ...prev, isSubmitting: false }));
  };

  // Auto-validate on form changes
  useEffect(() => {
    if (formState.name || formState.amount) {
      // Only validate if user has started filling the form
      const hasData = formState.name.trim() || formState.amount.trim();
      if (hasData) {
        validateForm();
      }
    }
  }, [
    formState.name,
    formState.amount,
    formState.currentSpend,
    formState.budgetLimit,
    formState.icon,
    formState.color,
    formState.displayOrder,
    formState.isActive,
    formState.transactionCategoryId,
  ]);

  return {
    // State
    ...formState,

    // Actions
    updateName,
    updateDescription,
    updateAmount,
    updateCurrentSpend,
    updateBudgetLimit,
    updateIcon,
    updateColor,
    updateDisplayOrder,
    updateIsActive,
    updateTransactionCategoryId,
    validateForm,
    resetForm,
    loadFromSubcategory,
    getFormData,
    handleSubmit,
  };
};

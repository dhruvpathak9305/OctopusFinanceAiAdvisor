import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { BudgetSubcategory } from "../types";
import {
  validateSubcategoryForm,
  validateField,
  formatNumericInput,
  SubcategoryFormData,
} from "../utils/formValidation";
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from "../utils/subcategoryHelpers";

export interface SubCategoryFormState {
  // Form data
  name: string;
  description: string;
  budgetLimit: string;
  spent: string;
  icon: string;
  color: string;

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
  updateBudgetLimit: (amount: string) => void;
  updateSpent: (amount: string) => void;
  updateIcon: (icon: string) => void;
  updateColor: (color: string) => void;

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
  budgetLimit: "",
  spent: "0",
  icon: AVAILABLE_ICONS[0],
  color: AVAILABLE_COLORS[0],
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

  const updateSpent = (amount: string) => {
    const formatted = formatNumericInput(amount);
    const validation = validateField("spent", formatted);
    setFormState((prev) => ({
      ...prev,
      spent: formatted,
      errors: {
        ...prev.errors,
        spent: validation.isValid ? "" : validation.error || "",
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

  // Form validation
  const validateForm = (): boolean => {
    const formData: SubcategoryFormData = {
      name: formState.name,
      description: formState.description,
      budgetLimit: formState.budgetLimit,
      spent: formState.spent,
      icon: formState.icon,
      color: formState.color,
    };

    const validation = validateSubcategoryForm(formData);

    // Convert errors array to object for easier field access
    const errorObject: { [key: string]: string } = {};
    validation.errors.forEach((error) => {
      if (error.includes("name")) errorObject.name = error;
      else if (error.includes("budget") || error.includes("Budget"))
        errorObject.budgetLimit = error;
      else if (error.includes("spent") || error.includes("Spent"))
        errorObject.spent = error;
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
      description: "", // Reset description for editing
      budgetLimit: subcategory.budget_limit.toString(),
      spent: subcategory.spent.toString(),
      icon: subcategory.icon,
      color: subcategory.color,
      errors: {},
      isValid: true,
    }));
  };

  // Get form data as subcategory object
  const getFormData = (): Omit<BudgetSubcategory, "id"> => {
    return {
      name: formState.name.trim(),
      budget_limit: parseFloat(formState.budgetLimit) || 0,
      spent: parseFloat(formState.spent) || 0,
      icon: formState.icon,
      color: formState.color,
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
    if (formState.name || formState.budgetLimit) {
      // Only validate if user has started filling the form
      const hasData = formState.name.trim() || formState.budgetLimit.trim();
      if (hasData) {
        validateForm();
      }
    }
  }, [
    formState.name,
    formState.budgetLimit,
    formState.spent,
    formState.icon,
    formState.color,
  ]);

  return {
    // State
    ...formState,

    // Actions
    updateName,
    updateDescription,
    updateBudgetLimit,
    updateSpent,
    updateIcon,
    updateColor,
    validateForm,
    resetForm,
    loadFromSubcategory,
    getFormData,
    handleSubmit,
  };
};

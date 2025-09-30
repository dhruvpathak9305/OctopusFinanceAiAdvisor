/**
 * Custom hook for managing loan form state and validation
 */

import { useState, useEffect, useCallback } from "react";
import {
  LoanFormData,
  LoanFormErrors,
  LoanFormValidation,
  DEFAULT_LOAN_FORM_DATA,
  LoanCreationProps,
} from "../types";

export const useLoanForm = (props: LoanCreationProps) => {
  const [formData, setFormData] = useState<LoanFormData>({
    ...DEFAULT_LOAN_FORM_DATA,
    loanType: props.defaultLoanType || "take",
    ...props.initialData,
  });

  const [errors, setErrors] = useState<LoanFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (props.visible) {
      setFormData({
        ...DEFAULT_LOAN_FORM_DATA,
        loanType: props.defaultLoanType || "take",
        ...props.initialData,
      });
      setErrors({});
    }
  }, [props.visible, props.defaultLoanType, props.initialData]);

  // Calculate form progress
  useEffect(() => {
    if (!props.enableProgress) return;

    const requiredFields = [
      "selectedRecipient",
      "amount",
      "description",
      "dueDate",
    ];

    const filledFields = requiredFields.filter((field) => {
      const value = formData[field as keyof LoanFormData];
      return value && value.toString().trim() !== "";
    });

    const progress = (filledFields.length / requiredFields.length) * 100;
    setFormProgress(progress);
  }, [formData, props.enableProgress]);

  // Validation functions
  const validateField = useCallback(
    (field: keyof LoanFormData, value: any): string | undefined => {
      switch (field) {
        case "amount":
          if (!value || value === "0") return "Amount is required";
          if (isNaN(Number(value))) return "Amount must be a valid number";
          if (Number(value) <= 0) return "Amount must be greater than 0";
          if (Number(value) > 10000000) return "Amount is too large";
          break;

        case "selectedRecipient":
          if (!value || value.trim() === "") return "Please select a recipient";
          break;

        case "dueDate":
          if (!value) return "Due date is required";
          const dueDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (dueDate <= today) return "Due date must be in the future";
          break;

        case "interestRate":
          if (
            value &&
            (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)
          ) {
            return "Interest rate must be between 0 and 100";
          }
          break;

        case "description":
          if (!value || value.trim().length < 3)
            return "Description must be at least 3 characters";
          if (value.length > 200)
            return "Description must be less than 200 characters";
          break;

        case "numberOfInstallments":
          if (
            value &&
            (isNaN(Number(value)) || Number(value) <= 0 || Number(value) > 120)
          ) {
            return "Number of installments must be between 1 and 120";
          }
          break;

        default:
          return undefined;
      }
    },
    []
  );

  const validateForm = useCallback(
    (data: LoanFormData): LoanFormErrors => {
      const newErrors: LoanFormErrors = {};

      // Validate required fields
      const requiredFields: (keyof LoanFormData)[] = [
        "selectedRecipient",
        "amount",
        "description",
        "dueDate",
      ];

      requiredFields.forEach((field) => {
        const error = validateField(field, data[field]);
        if (error) newErrors[field] = error;
      });

      // Validate optional fields if they have values
      const optionalFields: (keyof LoanFormData)[] = [
        "interestRate",
        "numberOfInstallments",
      ];

      optionalFields.forEach((field) => {
        const value = data[field];
        if (value && value !== "" && value !== "0") {
          const error = validateField(field, value);
          if (error) newErrors[field] = error;
        }
      });

      return newErrors;
    },
    [validateField]
  );

  const clearError = useCallback((field: keyof LoanFormData) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const updateField = useCallback(
    (field: keyof LoanFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        clearError(field);
      }
    },
    [errors, clearError]
  );

  const setFieldValue = useCallback(
    (field: keyof LoanFormData, value: any) => {
      updateField(field, value);
    },
    [updateField]
  );

  const resetForm = useCallback(() => {
    setFormData({
      ...DEFAULT_LOAN_FORM_DATA,
      loanType: props.defaultLoanType || "take",
      ...props.initialData,
    });
    setErrors({});
    setFormProgress(0);
  }, [props.defaultLoanType, props.initialData]);

  const submitForm = useCallback(async () => {
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    const isValid = Object.keys(formErrors).length === 0;
    if (!isValid) return;

    try {
      setLoading(true);
      await props.onCreateLoan(formData);
      resetForm();
      props.onClose();
    } catch (error) {
      console.error("Error creating loan:", error);
      // Handle error - could set a general error state
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, props, resetForm]);

  const isFormValid = useCallback(() => {
    const formErrors = validateForm(formData);
    return Object.keys(formErrors).length === 0;
  }, [formData, validateForm]);

  const validation: LoanFormValidation = {
    errors,
    isValid: isFormValid(),
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
  };

  return {
    // Form data
    formData,
    updateField,
    setFieldValue,
    resetForm,

    // Validation
    validation,

    // State
    loading: loading || props.loading || false,
    formProgress,

    // Actions
    submitForm,
    isFormValid,
  };
};


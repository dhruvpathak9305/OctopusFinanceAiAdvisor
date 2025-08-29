import { useState } from "react";
import { CreditCardFormData, FormErrors } from "../types";

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    institution: "",
    lastFourDigits: "",
    creditLimit: "",
    currentBalance: "",
  });

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const clearAllErrors = () => {
    setErrors({
      name: "",
      institution: "",
      lastFourDigits: "",
      creditLimit: "",
      currentBalance: "",
    });
  };

  const validateForm = (formData: CreditCardFormData): boolean => {
    const newErrors: FormErrors = {
      name: "",
      institution: "",
      lastFourDigits: "",
      creditLimit: "",
      currentBalance: "",
    };

    let hasErrors = false;

    // Validate Card Name
    if (!formData.name.trim()) {
      newErrors.name = "Please enter a card name";
      hasErrors = true;
    }

    // Validate Institution
    if (!formData.institution.trim()) {
      newErrors.institution = "Please select a card issuer";
      hasErrors = true;
    }

    // Validate Last 4 Digits
    if (
      !formData.lastFourDigits.trim() ||
      formData.lastFourDigits.length !== 4
    ) {
      newErrors.lastFourDigits = "Please enter the last 4 digits of your card";
      hasErrors = true;
    }

    // Validate Credit Limit
    if (
      !formData.creditLimit.trim() ||
      isNaN(parseFloat(formData.creditLimit))
    ) {
      newErrors.creditLimit = "Please enter a valid credit limit";
      hasErrors = true;
    }

    // Validate Current Balance
    if (
      !formData.currentBalance.trim() ||
      isNaN(parseFloat(formData.currentBalance))
    ) {
      newErrors.currentBalance = "Please enter a valid current balance";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const validateField = (field: keyof FormErrors, value: string): string => {
    switch (field) {
      case "name":
        return !value.trim() ? "Please enter a card name" : "";
      case "institution":
        return !value.trim() ? "Please select a card issuer" : "";
      case "lastFourDigits":
        return !value.trim() || value.length !== 4
          ? "Please enter the last 4 digits of your card"
          : "";
      case "creditLimit":
        return !value.trim() || isNaN(parseFloat(value))
          ? "Please enter a valid credit limit"
          : "";
      case "currentBalance":
        return !value.trim() || isNaN(parseFloat(value))
          ? "Please enter a valid current balance"
          : "";
      default:
        return "";
    }
  };

  return {
    errors,
    clearError,
    clearAllErrors,
    validateForm,
    validateField,
  };
};

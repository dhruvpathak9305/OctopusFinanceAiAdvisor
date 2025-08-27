export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface SubcategoryFormData {
  name: string;
  description?: string;
  amount: string; // Main budget amount
  currentSpend?: string; // Current spending
  budgetLimit?: string; // Warning/alert limit
  icon: string;
  color: string;
  displayOrder?: string;
  isActive?: boolean;
  transactionCategoryId?: string;
}

/**
 * Validate subcategory form data
 */
export const validateSubcategoryForm = (
  data: SubcategoryFormData
): ValidationResult => {
  const errors: string[] = [];

  // Name validation
  if (!data.name.trim()) {
    errors.push("Subcategory name is required");
  } else if (data.name.trim().length < 2) {
    errors.push("Subcategory name must be at least 2 characters");
  } else if (data.name.trim().length > 50) {
    errors.push("Subcategory name must be less than 50 characters");
  }

  // Amount validation (main budget amount)
  const amount = parseFloat(data.amount);
  if (!data.amount.trim()) {
    errors.push("Budget amount is required");
  } else if (isNaN(amount)) {
    errors.push("Budget amount must be a valid number");
  } else if (amount < 0) {
    errors.push("Budget amount cannot be negative");
  } else if (amount > 1000000) {
    errors.push("Budget amount cannot exceed $1,000,000");
  }

  // Current spend validation (optional)
  if (data.currentSpend && data.currentSpend.trim()) {
    const currentSpend = parseFloat(data.currentSpend);
    if (isNaN(currentSpend)) {
      errors.push("Current spend must be a valid number");
    } else if (currentSpend < 0) {
      errors.push("Current spend cannot be negative");
    }
  }

  // Budget limit validation (optional warning limit)
  if (data.budgetLimit && data.budgetLimit.trim()) {
    const budgetLimit = parseFloat(data.budgetLimit);
    if (isNaN(budgetLimit)) {
      errors.push("Budget limit must be a valid number");
    } else if (budgetLimit < 0) {
      errors.push("Budget limit cannot be negative");
    } else if (budgetLimit > 1000000) {
      errors.push("Budget limit cannot exceed $1,000,000");
    }
  }

  // Icon validation
  if (!data.icon) {
    errors.push("Please select an icon");
  }

  // Color validation
  if (!data.color) {
    errors.push("Please select a color");
  } else if (!/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    errors.push("Invalid color format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate individual field
 */
export const validateField = (
  fieldName: keyof SubcategoryFormData,
  value: string
): { isValid: boolean; error?: string } => {
  const data = { [fieldName]: value } as Partial<SubcategoryFormData>;

  switch (fieldName) {
    case "name":
      if (!value.trim()) return { isValid: false, error: "Name is required" };
      if (value.trim().length < 2)
        return { isValid: false, error: "Name too short" };
      if (value.trim().length > 50)
        return { isValid: false, error: "Name too long" };
      break;

    case "amount":
      const amount = parseFloat(value);
      if (!value.trim())
        return { isValid: false, error: "Budget amount is required" };
      if (isNaN(amount))
        return { isValid: false, error: "Must be a valid number" };
      if (amount < 0) return { isValid: false, error: "Cannot be negative" };
      if (amount > 1000000)
        return { isValid: false, error: "Amount too large" };
      break;

    case "currentSpend":
      if (value.trim()) {
        const currentSpend = parseFloat(value);
        if (isNaN(currentSpend))
          return { isValid: false, error: "Must be a valid number" };
        if (currentSpend < 0)
          return { isValid: false, error: "Cannot be negative" };
      }
      break;

    case "budgetLimit":
      if (value.trim()) {
        const budgetLimit = parseFloat(value);
        if (isNaN(budgetLimit))
          return { isValid: false, error: "Must be a valid number" };
        if (budgetLimit < 0)
          return { isValid: false, error: "Cannot be negative" };
        if (budgetLimit > 1000000)
          return { isValid: false, error: "Amount too large" };
      }
      break;
  }

  return { isValid: true };
};

/**
 * Clean and format numeric input
 */
export const formatNumericInput = (value: string): string => {
  // Remove any non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, "");

  // Ensure only one decimal point
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }

  // Limit decimal places to 2
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + "." + parts[1].substring(0, 2);
  }

  return cleaned;
};

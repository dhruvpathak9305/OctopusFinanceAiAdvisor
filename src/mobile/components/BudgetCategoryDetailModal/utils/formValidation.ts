export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface SubcategoryFormData {
  name: string;
  description?: string;
  budgetLimit: string;
  spent?: string;
  icon: string;
  color: string;
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

  // Budget limit validation
  const budgetLimit = parseFloat(data.budgetLimit);
  if (!data.budgetLimit.trim()) {
    errors.push("Budget limit is required");
  } else if (isNaN(budgetLimit)) {
    errors.push("Budget limit must be a valid number");
  } else if (budgetLimit < 0) {
    errors.push("Budget limit cannot be negative");
  } else if (budgetLimit > 1000000) {
    errors.push("Budget limit cannot exceed $1,000,000");
  }

  // Spent amount validation (optional)
  if (data.spent && data.spent.trim()) {
    const spent = parseFloat(data.spent);
    if (isNaN(spent)) {
      errors.push("Spent amount must be a valid number");
    } else if (spent < 0) {
      errors.push("Spent amount cannot be negative");
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

    case "budgetLimit":
      const budget = parseFloat(value);
      if (!value.trim())
        return { isValid: false, error: "Budget limit is required" };
      if (isNaN(budget))
        return { isValid: false, error: "Must be a valid number" };
      if (budget < 0) return { isValid: false, error: "Cannot be negative" };
      if (budget > 1000000)
        return { isValid: false, error: "Amount too large" };
      break;

    case "spent":
      if (value.trim()) {
        const spent = parseFloat(value);
        if (isNaN(spent))
          return { isValid: false, error: "Must be a valid number" };
        if (spent < 0) return { isValid: false, error: "Cannot be negative" };
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

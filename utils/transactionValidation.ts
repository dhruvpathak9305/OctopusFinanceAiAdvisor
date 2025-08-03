import { TransactionFormData } from '../types/transactions';

type ValidationErrors = Record<string, string>;

/**
 * Validates transaction form data and returns validation errors
 */
export const validateTransactionForm = (data: TransactionFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Validate name/description
  if (!data.name.trim()) {
    errors.name = "Transaction name is required";
  }
  
  // Validate amount
  const amountValue = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
  if (isNaN(amountValue) || amountValue <= 0) {
    errors.amount = "Valid amount is required";
  }
  
  // Validate account
  if (!data.account.trim()) {
    errors.account = "Account is required";
  }
  
  // Validate destination account for transfers
  if (data.type === "transfer" && !data.destinationAccount?.trim()) {
    errors.destinationAccount = "Destination account is required";
  }
  
  // Validate category (allow temporary IDs from SMS analysis)
  if (!data.selectedCategoryId && !data.selectedCategoryName) {
    errors.category = "Category is required";
  }
  
  // Validate date
  if (!data.date) {
    errors.date = "Date is required";
  }
  
  // Validate recurring transaction fields
  if (data.isRecurring) {
    if (!data.recurrence_pattern) {
      errors.recurrence_pattern = "Frequency is required for recurring transactions";
    }
    
    if (data.isAutopay && !data.autopaySource) {
      errors.autopaySource = "Autopay source is required";
    }
    
    if (data.isAutopay && data.autopaySource === 'account' && !data.autopayAccountId) {
      errors.autopayAccountId = "Autopay account is required";
    }
  }
  
  return errors;
};

/**
 * Utility to clear a specific validation error
 */
export const clearValidationError = (
  errors: ValidationErrors, 
  field: string
): ValidationErrors => {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
};

/**
 * Validates a field value and returns error if invalid
 */
export const validateField = (
  field: keyof TransactionFormData, 
  value: any, 
  formData: TransactionFormData
): string | null => {
  const mockData = { ...formData, [field]: value };
  const errors = validateTransactionForm(mockData);
  return errors[field] || null;
}; 
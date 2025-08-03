import { supabase } from "../lib/supabase/client";
import { Category, Subcategory, Transaction, TransactionFormData } from "../types/transactions";

/**
 * Fetches categories from the database
 */
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Fetches subcategories for a specific category
 */
export const fetchSubcategories = async (categoryId?: string | null): Promise<Subcategory[]> => {
  try {
    let query = supabase
      .from('budget_subcategories')
      .select('*')
      .order('name');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
};

/**
 * Creates a new category
 */
export const createCategory = async (
  name: string,
  budgetLimit: number,
  ringColor: string,
  bgColor: string,
  userId?: string,
  description?: string,
  isActive?: string,
  percentage?: number
): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('budget_categories')
      .insert([{
        name,
        budget_limit: budgetLimit,
        ring_color: ringColor,
        bg_color: bgColor,
        user_id: userId,
        description,
        is_active: isActive,
        percentage
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    return null;
  }
};

/**
 * Creates a new subcategory
 */
export const createSubcategory = async (
  name: string, 
  categoryId: string,
  amount: number,
  color: string,
  icon: string,
  description?: string,
  transactionCategoryId?: string
): Promise<Subcategory | null> => {
  try {
    const { data, error } = await supabase
      .from('budget_subcategories')
      .insert([{
        name,
        category_id: categoryId,
        amount,
        color,
        icon,
        description,
        transaction_category_id: transactionCategoryId
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return null;
  }
};

/**
 * Maps a transaction from API format to form data format
 */
export const mapTransactionToFormData = (transaction: Transaction): TransactionFormData => {
  // Convert recurrence_pattern value to one of the allowed enum values
  let recurrencePattern: 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly';
  if (transaction.recurrence_pattern) {
    if (['weekly', 'monthly', 'quarterly', 'yearly'].includes(transaction.recurrence_pattern)) {
      recurrencePattern = transaction.recurrence_pattern as 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    }
  }
  
  return {
    name: transaction.name || "",
    amount: transaction.amount?.toString() || "",
    type: transaction.type as "income" | "expense" | "transfer",
    selectedCategoryId: transaction.category_id,
    selectedCategoryName: transaction.category_name || "",
    selectedSubcategoryId: transaction.subcategory_id,
    selectedSubcategoryName: transaction.subcategory_name || "",
    merchant: transaction.merchant || "",
    account: transaction.source_account_name || transaction.source_account_type || "",
    destinationAccount: transaction.destination_account_name || "",
    date: transaction.date ? new Date(transaction.date) : new Date(),
    isRecurring: transaction.is_recurring || false,
    recurrence_pattern: recurrencePattern,
    isAutopay: false, // Default, as API might not have this field
    autopaySource: 'account', // Default, as API might not have this field
    billDueDate: new Date(), // Default, as API might not have this field
    recurrenceEndDate: transaction.recurrence_end_date ? new Date(transaction.recurrence_end_date) : null,
    autopayAccountId: "", // Default, as API might not have this field
    useSelectedAccount: true, // Default, as API might not have this field
    id: transaction.id,
    description: transaction.description || null,
    user_id: transaction.user_id,
    parent_transaction_id: transaction.parent_transaction_id || null,
    interest_rate: transaction.interest_rate || null,
    loan_term_months: transaction.loan_term_months || null,
    metadata: transaction.metadata || null,
    // ❌ EXCLUDE is_credit_card - it's a GENERATED column (read-only)
  };
};

/**
 * Maps form data back to API transaction format for updates
 * Now properly determines account type and excludes generated columns
 */
export const mapFormDataToTransaction = (
  formData: TransactionFormData,
  existingTransaction?: Transaction,
  accounts?: Array<{id: string, name: string, type: string}>,
  creditCards?: Array<{id: string, name: string}>
): Partial<Transaction> => {
  // Find the account info to determine the correct type
  let accountInfo = {
    id: formData.account,
    name: formData.account,
    type: 'bank' // default
  };

  // Check if it's a credit card first
  if (creditCards?.some(cc => cc.id === formData.account)) {
    const creditCard = creditCards.find(cc => cc.id === formData.account);
    accountInfo = {
      id: formData.account,
      name: creditCard?.name || formData.account,
      type: 'credit_card'
    };
  }
  // Then check if it's a bank account
  else if (accounts?.some(acc => acc.id === formData.account)) {
    const account = accounts.find(acc => acc.id === formData.account);
    accountInfo = {
      id: formData.account,
      name: account?.name || formData.account,
      type: account?.type || 'bank'
    };
  }

  return {
    name: formData.name,
    amount: parseFloat(formData.amount),
    type: formData.type,
    category_id: formData.selectedCategoryId,
    subcategory_id: formData.selectedSubcategoryId,
    merchant: formData.merchant,
    source_account_id: accountInfo.id,
    source_account_name: accountInfo.name,
    source_account_type: accountInfo.type,
    destination_account_name: formData.type === 'transfer' ? formData.destinationAccount : null,
    destination_account_id: formData.type === 'transfer' ? formData.destinationAccount : null,
    destination_account_type: formData.type === 'transfer' ? 'bank' : null,
    date: formData.date.toISOString(),
    is_recurring: formData.isRecurring,
    description: formData.description || null,
    user_id: formData.user_id,
    recurrence_pattern: formData.recurrence_pattern || null,
    recurrence_end_date: formData.recurrenceEndDate ? formData.recurrenceEndDate.toISOString() : null,
    parent_transaction_id: formData.parent_transaction_id || null,
    interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate.toString()) : null,
    loan_term_months: formData.loan_term_months || null,
    metadata: formData.metadata || null,
    // ❌ EXCLUDE is_credit_card as it's a GENERATED column
    ...(existingTransaction?.id ? { id: existingTransaction.id } : {}),
  };
};

/**
 * Initialize empty form data
 */
export const getEmptyFormData = (): TransactionFormData => {
  return {
    name: "",
    amount: "",
    type: "expense",
    selectedCategoryId: null,
    selectedCategoryName: "",
    selectedSubcategoryId: null,
    selectedSubcategoryName: "",
    merchant: "",
    account: "",
    destinationAccount: "",
    date: new Date(),
    isRecurring: false,
    recurrence_pattern: 'monthly',
    isAutopay: false,
    autopaySource: 'account',
    billDueDate: new Date(),
    recurrenceEndDate: null,
    autopayAccountId: "",
    useSelectedAccount: true,
  };
}; 
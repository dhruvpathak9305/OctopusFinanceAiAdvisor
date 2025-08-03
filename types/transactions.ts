/**
 * Transaction type as returned from the API
 */
export type Transaction = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  date: string;
  created_at?: string;
  type: 'income' | 'expense' | 'transfer' | 'loan' | 'loan_repayment' | 'debt' | 'debt_collection';
  category_id: string | null;
  subcategory_id: string | null;
  icon: string | null;
  merchant: string | null;
  source_account_id: string | null;
  source_account_type: string;
  source_account_name: string | null;
  destination_account_id: string | null;
  destination_account_type: string | null;
  destination_account_name: string | null;
  is_recurring: boolean;
  category_name?: string;
  subcategory_name?: string;
  user_id: string;
  recurrence_pattern?: string | null;
  recurrence_end_date?: string | null;
  parent_transaction_id?: string | null;
  interest_rate?: number | null;
  loan_term_months?: number | null;
  metadata?: Record<string, any> | null;
  is_credit_card?: boolean;
};

/**
 * Data structure for transaction form fields
 */
export interface TransactionFormData {
  id?: string; // Optional for new transactions
  name: string;
  description?: string | null;
  amount: string;
  date: Date;
  type: "income" | "expense" | "transfer";
  selectedCategoryId: string | null;
  selectedCategoryName?: string;
  selectedSubcategoryId: string | null;
  selectedSubcategoryName?: string;
  merchant?: string;
  account: string;
  destinationAccount?: string; // Only for transfers
  isRecurring: boolean;
  recurrence_pattern?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  isAutopay?: boolean;
  autopaySource?: 'account' | 'credit_card';
  billDueDate?: Date;
  recurrenceEndDate?: Date | null;
  autopayAccountId?: string;
  useSelectedAccount?: boolean;
  user_id?: string;
  parent_transaction_id?: string | null;
  interest_rate?: number | null;
  loan_term_months?: number | null;
  metadata?: Record<string, any> | null;
  is_credit_card?: boolean;
}

/**
 * Category interface
 */
export interface Category {
  id: string;
  name: string;
  user_id?: string | null;
  budget_limit: number;
  ring_color: string;
  bg_color: string;
  created_at?: string;
  updated_at?: string;
  display_order?: number;
  description?: string;
  status?: string;
  start_date?: string;
  frequency?: string;
  strategy?: string;
  is_active?: string;
  percentage?: number;
}

/**
 * Subcategory interface
 */
export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  amount: number;
  color: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
  display_order?: number;
  is_active?: boolean;
  description?: string;
  current_spend?: number;
  budget_limit?: number;
  transaction_category_id?: string;
}

/**
 * Props for transaction form components
 */
export interface TransactionDialogProps {
  mode: 'add' | 'edit';
  open: boolean;
  transactionData?: Transaction;
  onClose: () => void;
  onSubmit: (formData: TransactionFormData) => Promise<void>;
  defaultActiveTab?: 'manual' | 'sms' | 'image';
  categories?: Category[];
  subcategories?: Subcategory[];
  categoriesLoading?: boolean;
} 
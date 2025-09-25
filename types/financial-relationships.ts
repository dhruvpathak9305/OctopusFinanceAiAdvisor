/**
 * Types for financial relationship management functionality
 */

/**
 * Financial relationship between two users
 */
export interface FinancialRelationship {
  id: string;
  user_id: string;
  related_user_id: string;
  relationship_type: RelationshipType;
  total_amount: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Additional properties for UI display
  has_active_loans?: boolean;
  has_active_splits?: boolean;

  // Individual contact properties
  display_name?: string;
  contact_email?: string;
  last_activity?: string;

  // Group properties
  description?: string;
  member_count?: number;
  group_image_url?: string;
}

/**
 * Type of financial relationship
 */
export type RelationshipType =
  | "lender"
  | "borrower"
  | "split_expense"
  | "individual"
  | "group";

/**
 * Summary of a financial relationship
 */
export interface RelationshipSummary {
  id: string;
  userId: string;
  relatedUserId: string;
  relationshipType: RelationshipType;
  totalAmount: number;
  currency: string;
  activeLoans: Loan[];
  unpaidSplits: TransactionSplit[];
  recentTransactions: RelationshipTransaction[];
  updatedAt: string;
}

/**
 * Transaction in a financial relationship
 */
export interface RelationshipTransaction {
  id: string;
  transactionId: string;
  description: string;
  amount: number;
  date: string;
  isPaid: boolean;
  type: "split" | "loan" | "loan_payment";
}

/**
 * Loan between two users
 */
export interface Loan {
  id: string;
  lender_id: string;
  borrower_id: string;
  relationship_id: string;
  amount: number;
  interest_rate?: number;
  start_date: string;
  due_date?: string;
  status: LoanStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Status of a loan
 */
export type LoanStatus = "active" | "paid" | "overdue" | "defaulted";

/**
 * Payment on a loan
 */
export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

/**
 * Transaction split linked to a financial relationship
 */
export interface TransactionSplit {
  id: string;
  transaction_id: string;
  user_id: string;
  relationship_id?: string;
  share_amount: number;
  share_percentage?: number;
  split_type: "equal" | "percentage" | "custom" | "amount";
  is_paid: boolean;
  due_date?: string;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payment reminder for a loan or split
 */
export interface PaymentReminder {
  id: string;
  loan_id?: string;
  split_id?: string;
  creator_id: string;
  recipient_id: string;
  amount: number;
  due_date: string;
  reminder_date: string;
  status: ReminderStatus;
  message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Status of a payment reminder
 */
export type ReminderStatus = "pending" | "sent" | "cancelled";

/**
 * Constants for better type safety
 */
export const RELATIONSHIP_TYPES = {
  LENDER: "lender",
  BORROWER: "borrower",
  SPLIT_EXPENSE: "split_expense",
} as const;

export const LOAN_STATUS = {
  ACTIVE: "active",
  PAID: "paid",
  OVERDUE: "overdue",
  DEFAULTED: "defaulted",
} as const;

export const REMINDER_STATUS = {
  PENDING: "pending",
  SENT: "sent",
  CANCELLED: "cancelled",
} as const;

/**
 * Summary of financial relationships for a user
 */
export interface UserFinancialSummary {
  totalOwed: number; // Amount others owe to user
  totalOwing: number; // Amount user owes to others
  netBalance: number; // Positive = user is owed money, Negative = user owes money
  activeLoanCount: number;
  unpaidSplitCount: number;
  currency: string;
}

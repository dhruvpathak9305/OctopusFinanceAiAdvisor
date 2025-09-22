export interface SMSTransactionData {
  // Core transaction fields matching transactions_real table
  name: string; // Transaction description/title
  description?: string; // Additional details
  amount: number; // Transaction amount
  date: string; // ISO date string for database
  type:
    | "income"
    | "expense"
    | "transfer"
    | "loan"
    | "loan_repayment"
    | "debt"
    | "debt_collection";

  // Account information
  source_account_type:
    | "bank"
    | "credit_card"
    | "cash"
    | "digital_wallet"
    | "investment"
    | "other";
  source_account_name?: string;
  destination_account_type?:
    | "bank"
    | "credit_card"
    | "cash"
    | "digital_wallet"
    | "investment"
    | "other";
  destination_account_name?: string;

  // Merchant and category
  merchant?: string;
  category?: string; // For mapping to category_id
  subcategory?: string; // For mapping to subcategory_id

  // Additional extracted data
  balance?: number;
  accountNumber?: string; // Last 4 digits
  cardNumber?: string; // Last 4 digits
  transactionId?: string; // Bank reference
  location?: string;

  // SMS-specific fields
  originalSMSType?: "debit" | "credit"; // Original SMS language
  bankName?: string;
  upiRef?: string;
}

export interface SMSAnalysisResult {
  id: string;
  originalSMS: string;
  extractedData: SMSTransactionData;
  insights: string[];
  confidence: number;
  category: string;
  isValid: boolean;
  warnings?: string[];
  suggestions?: string[];
  // New field for database-ready transaction
  transactionRecord?: DatabaseTransactionRecord;
}

// Database-ready transaction record matching transactions_real table
export interface DatabaseTransactionRecord {
  name: string;
  description?: string;
  amount: number;
  date: string; // ISO timestamp
  type:
    | "income"
    | "expense"
    | "transfer"
    | "loan"
    | "loan_repayment"
    | "debt"
    | "debt_collection";
  merchant?: string;
  source_account_type:
    | "bank"
    | "credit_card"
    | "cash"
    | "digital_wallet"
    | "investment"
    | "other";
  source_account_name?: string;
  destination_account_type?:
    | "bank"
    | "credit_card"
    | "cash"
    | "digital_wallet"
    | "investment"
    | "other";
  destination_account_name?: string;
  is_recurring?: boolean;
  metadata?: {
    sms_source: boolean;
    original_sms: string;
    bank_reference?: string;
    upi_reference?: string;
    account_last_four?: string;
    card_last_four?: string;
    balance_after_transaction?: number;
    confidence_score?: number;
  };
}

export interface SMSMessage {
  id: string;
  type: "user" | "assistant" | "analysis";
  content: string;
  smsData?: SMSTransactionData;
  analysisResult?: SMSAnalysisResult;
  timestamp: number;
}

export interface SMSChatState {
  messages: SMSMessage[];
  isLoading: boolean;
  error: string | null;
  selectedModel: SMSModel;
}

export interface SMSModel {
  id: string;
  name: string;
  description?: string;
  provider: string;
  model?: string;
  apiKey?: string;
  supportsAnalysis?: boolean;
}

export enum SMSActionType {
  ADD_MESSAGE = "ADD_MESSAGE",
  SET_LOADING = "SET_LOADING",
  SET_ERROR = "SET_ERROR",
  CLEAR_MESSAGES = "CLEAR_MESSAGES",
  CHANGE_MODEL = "CHANGE_MODEL",
}

export type SMSAction =
  | { type: SMSActionType.ADD_MESSAGE; payload: SMSMessage }
  | { type: SMSActionType.SET_LOADING; payload: boolean }
  | { type: SMSActionType.SET_ERROR; payload: string | null }
  | { type: SMSActionType.CLEAR_MESSAGES }
  | { type: SMSActionType.CHANGE_MODEL; payload: SMSModel };

// Common SMS patterns and categories
export const SMS_CATEGORIES = {
  DEBIT: "debit",
  CREDIT: "credit",
  ATM: "atm_withdrawal",
  ONLINE: "online_purchase",
  TRANSFER: "transfer",
  BILL_PAYMENT: "bill_payment",
  SUBSCRIPTION: "subscription",
  REFUND: "refund",
  INTEREST: "interest",
  CHARGES: "charges",
  UNKNOWN: "unknown",
} as const;

export const SPENDING_CATEGORIES = {
  GROCERIES: "groceries",
  FUEL: "fuel",
  RESTAURANTS: "restaurants",
  SHOPPING: "shopping",
  UTILITIES: "utilities",
  HEALTHCARE: "healthcare",
  ENTERTAINMENT: "entertainment",
  TRANSPORT: "transport",
  EDUCATION: "education",
  INSURANCE: "insurance",
  INVESTMENT: "investment",
  OTHER: "other",
} as const;

export type SMSCategory = (typeof SMS_CATEGORIES)[keyof typeof SMS_CATEGORIES];
export type SpendingCategory =
  (typeof SPENDING_CATEGORIES)[keyof typeof SPENDING_CATEGORIES];

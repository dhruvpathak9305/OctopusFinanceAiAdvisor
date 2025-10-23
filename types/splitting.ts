// Types for Splitwise-style expense splitting functionality

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  group_image_url?: string;
  member_count?: number; // Computed field
  total_expenses?: number; // Computed field
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "member" | "admin";
  joined_at: string;
  is_active: boolean;
  // User details (joined from users table or stored directly)
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  mobile_number?: string; // Contact phone number
  relationship?: string; // Relationship to user (friend, family, colleague, etc.)
  is_registered_user?: boolean; // Whether this is a registered user or guest
}

export interface TransactionSplit {
  id: string;
  transaction_id: string;
  user_id: string;
  group_id?: string;
  share_amount: number;
  share_percentage?: number;
  split_type: "equal" | "percentage" | "custom" | "amount";
  is_paid: boolean;
  paid_by?: string;
  settled_at?: string;
  settlement_method?: "cash" | "upi" | "bank_transfer" | "other";
  notes?: string;
  created_at: string;
  updated_at: string;
  // User details (joined from users table)
  user_name?: string;
  user_email?: string;
}

export interface SplitCalculation {
  user_id: string;
  user_name: string;
  share_amount: number;
  share_percentage: number;
  is_paid: boolean;
}

export interface GroupBalance {
  group_id: string;
  group_name: string;
  user_id: string;
  user_name: string;
  total_owed: number; // Amount this user owes to the group
  total_owed_to: number; // Amount owed to this user by the group
  net_balance: number; // Positive = owed to user, Negative = user owes
}

export interface SplitTransaction {
  transaction: any; // Base transaction
  splits: TransactionSplit[];
  total_amount: number;
  split_count: number;
  is_fully_settled: boolean;
  pending_amount: number;
}

// UI-specific types
export interface SplitFormData {
  split_type: "equal" | "percentage" | "custom" | "amount";
  participants: SplitParticipant[];
  group_id?: string;
  total_amount: number;
}

export interface SplitParticipant {
  user_id: string;
  user_name: string;
  user_email?: string;
  share_amount: number;
  share_percentage: number;
  is_payer: boolean; // Who paid for the expense
}

export interface IndividualPerson {
  id: string;
  name: string;
  email: string;
  share_amount: number;
  share_percentage: number;
}

// Validation types
export interface SplitValidation {
  is_valid: boolean;
  total_shares: number;
  expected_total: number;
  difference: number;
  errors: string[];
  warnings: string[];
}

// Settlement types
export interface Settlement {
  from_user_id: string;
  to_user_id: string;
  amount: number;
  description: string;
}

export interface GroupSettlement {
  group_id: string;
  settlements: Settlement[];
  total_settlements: number;
}

// Enums for better type safety
export const SPLIT_TYPES = {
  EQUAL: "equal",
  PERCENTAGE: "percentage",
  CUSTOM: "custom",
  AMOUNT: "amount",
} as const;

export const SETTLEMENT_METHODS = {
  CASH: "cash",
  UPI: "upi",
  BANK_TRANSFER: "bank_transfer",
  OTHER: "other",
} as const;

export const GROUP_ROLES = {
  MEMBER: "member",
  ADMIN: "admin",
} as const;

export type SplitType = (typeof SPLIT_TYPES)[keyof typeof SPLIT_TYPES];
export type SettlementMethod =
  (typeof SETTLEMENT_METHODS)[keyof typeof SETTLEMENT_METHODS];
export type GroupRole = (typeof GROUP_ROLES)[keyof typeof GROUP_ROLES];

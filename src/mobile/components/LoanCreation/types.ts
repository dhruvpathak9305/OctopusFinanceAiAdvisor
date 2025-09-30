/**
 * Types for the reusable Loan Creation component system
 */

export type LoanType = "give" | "take";
export type RecipientType = "person" | "group" | "bank";

export type RepaymentMethod = "lump_sum" | "installments";
export type InstallmentFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly";
export type InterestType = "simple" | "compound";
export type ReminderTiming = "1_day" | "3_days" | "1_week" | "custom";
export type NotificationMethod = "push" | "email" | "sms" | "all";

export interface InstallmentSchedule {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
}

export interface AttachmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  thumbnail?: string;
}

export interface LoanFormData {
  // Core loan details
  loanType: LoanType;
  recipientType: RecipientType;
  selectedRecipient: string;
  amount: string;
  description: string;

  // Dates
  startDate: string;
  dueDate: string;

  // Repayment method
  repaymentMethod: RepaymentMethod;
  installmentFrequency: InstallmentFrequency;
  numberOfInstallments: string;
  firstPaymentDate: string;
  installmentSchedule: InstallmentSchedule[];

  // Interest
  interestEnabled: boolean;
  interestRate: string;
  interestType: InterestType;
  totalInterest: number;
  totalRepayment: number;

  // Currency
  currency: string;

  // Additional details
  gracePeriod?: string;
  paymentMethod?: string;

  // Reminders
  reminderEnabled: boolean;
  reminderType: "one_time" | "recurring";
  reminderTiming: ReminderTiming;
  reminderCustomDays?: string;
  notificationMethod: NotificationMethod;

  // Attachments
  attachments: AttachmentFile[];

  // Notes and references
  notes: string;
  loanReference: string;

  // Contact specific fields
  contactInfo?: string;

  // Bank specific fields
  bankBranch?: string;
  accountNumber?: string;

  // Group specific fields
  groupMembers?: Array<{ name: string; share: string }>;
}

export interface LoanRecipient {
  id: string;
  name: string;
  type: RecipientType;
  avatar?: string;
  email?: string;
  phone?: string;
  balance?: number;
  lastActivity?: string;
}

export interface LoanCreationProps {
  // Modal control
  visible: boolean;
  onClose: () => void;

  // Data and callbacks
  onCreateLoan: (loanData: LoanFormData) => Promise<void>;

  // Pre-filled data (optional)
  initialData?: Partial<LoanFormData>;
  preselectedRecipient?: LoanRecipient;

  // Customization options
  title?: string;
  showLoanTypeSelection?: boolean;
  allowedRecipientTypes?: RecipientType[];
  defaultLoanType?: LoanType;

  // Recipients data
  recipients?: {
    persons: LoanRecipient[];
    groups: LoanRecipient[];
    banks: LoanRecipient[];
  };

  // UI customization
  theme?: "default" | "compact" | "full";
  headerStyle?: "clean" | "standard";

  // Feature flags
  enableAdvancedOptions?: boolean;
  enableReminders?: boolean;
  enableProgress?: boolean;

  // Loading state
  loading?: boolean;
}

export interface LoanCreationRef {
  resetForm: () => void;
  submitForm: () => Promise<void>;
  validateForm: () => boolean;
  setFieldValue: (field: keyof LoanFormData, value: any) => void;
}

// Form validation types
export interface LoanFormErrors {
  amount?: string;
  selectedRecipient?: string;
  dueDate?: string;
  interestRate?: string;
  description?: string;
  [key: string]: string | undefined;
}

export interface LoanFormValidation {
  errors: LoanFormErrors;
  isValid: boolean;
  validateField: (field: keyof LoanFormData, value: any) => string | undefined;
  validateForm: (data: LoanFormData) => LoanFormErrors;
  clearError: (field: keyof LoanFormData) => void;
  clearAllErrors: () => void;
}

// Quick action presets
export interface QuickLoanPreset {
  id: string;
  label: string;
  amount: string;
  description: string;
  category: "common" | "emergency" | "business";
}

export const QUICK_LOAN_PRESETS: QuickLoanPreset[] = [
  {
    id: "1k",
    label: "1K",
    amount: "1000",
    description: "Small loan",
    category: "common",
  },
  {
    id: "5k",
    label: "5K",
    amount: "5000",
    description: "Medium loan",
    category: "common",
  },
  {
    id: "10k",
    label: "10K",
    amount: "10000",
    description: "Large loan",
    category: "business",
  },
  {
    id: "25k",
    label: "25K",
    amount: "25000",
    description: "Major loan",
    category: "business",
  },
  {
    id: "50k",
    label: "50K",
    amount: "50000",
    description: "Emergency fund",
    category: "emergency",
  },
  {
    id: "100k",
    label: "100K",
    amount: "100000",
    description: "Investment",
    category: "business",
  },
];

// Common loan description suggestions
export const LOAN_DESCRIPTION_SUGGESTIONS = [
  "Home Renovation",
  "Education",
  "Medical",
  "Business",
  "Emergency",
  "Vehicle",
  "Travel",
  "Wedding",
  "Debt Consolidation",
  "Other",
];

// Default form values
export const DEFAULT_LOAN_FORM_DATA: LoanFormData = {
  loanType: "take",
  recipientType: "person",
  selectedRecipient: "",
  amount: "",
  description: "",
  startDate: new Date().toISOString().split("T")[0],
  // Default due date: 3 months from today
  dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],

  // Repayment
  repaymentMethod: "lump_sum",
  installmentFrequency: "monthly",
  numberOfInstallments: "3",
  firstPaymentDate: "",
  installmentSchedule: [],

  // Interest
  interestEnabled: false,
  interestRate: "0",
  interestType: "simple",
  totalInterest: 0,
  totalRepayment: 0,

  currency: "INR",
  gracePeriod: "",
  paymentMethod: "cash",

  // Reminders
  reminderEnabled: false,
  reminderType: "one_time",
  reminderTiming: "3_days",
  reminderCustomDays: "",
  notificationMethod: "push",

  // Attachments
  attachments: [],

  notes: "",
  loanReference: "",
  contactInfo: "",
  bankBranch: "",
  accountNumber: "",
  groupMembers: [],
};

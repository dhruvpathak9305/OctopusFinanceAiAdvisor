export interface CSVRow {
  [key: string]: string | number | null;
}

export interface ParsedBankStatement {
  customerInfo: CustomerInfo;
  accountSummary: AccountSummary;
  accountDetails: AccountDetail[];
  fixedDeposits: FixedDeposit[];
  transactions: BankTransaction[];
  rewardPoints: RewardPoint[];
  accountInfo: AccountInfo[];
  metadata: StatementMetadata;
}

export interface CustomerInfo {
  name?: string;
  customerId?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface AccountSummary {
  statementDate?: string;
  savingsBalance?: number;
  linkedFDBalance?: number;
  totalSavingsBalance?: number;
  totalDeposits?: number;
  currentBalance?: number;
  availableBalance?: number;
  totalFixedDepositsBalance?: number;
  totalRecurringDepositsBalance?: number;
  currentAccountBalance?: number;
}

export interface AccountDetail {
  accountType?: string;
  accountNumber?: string;
  balance?: number;
  currency?: string;
  status?: string;
}

export interface FixedDeposit {
  depositNo?: string;
  openDate?: string;
  amount?: number;
  roi?: number;
  period?: string;
  maturityDate?: string;
  maturityAmount?: number;
  balance?: number;
  currency?: string;
  nomination?: string;
  status?: string;
}

export interface BankTransaction {
  date: string;
  mode?: string;
  particulars: string;
  deposits?: number;
  withdrawals?: number;
  balance?: number;
  reference?: string;
  type: 'credit' | 'debit';
  amount: number;
}

export interface RewardPoint {
  savingsAccountNumber?: string;
  rewardPoints?: number;
  expiryDate?: string;
  tier?: string;
}

export interface AccountInfo {
  accountType?: string;
  accountNumber?: string;
  ifscCode?: string;
  micrCode?: string;
  branch?: string;
  status?: string;
  nominee?: string;
  mandateHolder?: string;
}

export interface StatementMetadata {
  bankName: string;
  statementType: string;
  parsingDate: Date;
  totalTransactions: number;
  totalCredits: number;
  totalDebits: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface CSVParserResult {
  success: boolean;
  data: ParsedBankStatement | null;
  errors: string[];
  warnings: string[];
}

export interface CSVParser {
  canParse(content: string): boolean;
  parse(content: string): Promise<CSVParserResult>;
  getBankName(): string;
  getSupportedFormats(): string[];
}

export interface ParserFactory {
  getParser(content: string): CSVParser | null;
  getSupportedBanks(): string[];
}

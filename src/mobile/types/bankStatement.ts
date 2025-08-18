export interface ParsedTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  account: string;
  merchant?: string;
  reference?: string;
  balance?: number;
}

export interface BankStatementFile {
  name: string;
  uri: string;
  size: number;
  type: string;
  lastModified?: number;
}

export interface ParsingResult {
  success: boolean;
  transactions: ParsedTransaction[];
  totalAmount: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  errors?: string[];
}

export interface ParsingOptions {
  autoCategorize?: boolean;
  detectRecurring?: boolean;
  mergeDuplicates?: boolean;
  validateAmounts?: boolean;
  useAI?: boolean; // Enable/disable AI-powered parsing
}


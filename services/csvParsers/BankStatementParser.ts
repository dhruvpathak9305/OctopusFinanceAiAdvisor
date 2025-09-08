import { BulkTransactionData } from "../bulkTransactionService";

export interface BankStatementConfig {
  bankName: string;
  csvFormat: {
    dateColumn: string[];
    descriptionColumn: string[];
    amountColumn?: string[];
    balanceColumn?: string[];
    withdrawalColumn?: string[];
    depositColumn?: string[];
  };
  dateFormat: string;
  skipRows?: number;
  encoding?: string;
}

// Pre-configured parsers for major Indian banks
export const BANK_CONFIGS: Record<string, BankStatementConfig> = {
  ICICI: {
    bankName: "ICICI Bank",
    csvFormat: {
      dateColumn: ["value date", "transaction date", "date"],
      descriptionColumn: [
        "transaction remarks",
        "description",
        "narration",
        "particulars",
      ],
      amountColumn: ["amount", "transaction amount"],
      withdrawalColumn: ["withdrawal amount", "debit", "withdrawal"],
      depositColumn: ["deposit amount", "credit", "deposit"],
      balanceColumn: ["balance", "available balance", "current balance"],
    },
    dateFormat: "DD/MM/YYYY",
    skipRows: 1,
  },
  HDFC: {
    bankName: "HDFC Bank",
    csvFormat: {
      dateColumn: ["date", "transaction date", "value date"],
      descriptionColumn: ["narration", "description", "transaction details"],
      withdrawalColumn: ["withdrawal amt", "debit amount", "dr"],
      depositColumn: ["deposit amt", "credit amount", "cr"],
      balanceColumn: ["closing balance", "balance"],
    },
    dateFormat: "DD/MM/YY",
    skipRows: 1,
  },
  SBI: {
    bankName: "State Bank of India",
    csvFormat: {
      dateColumn: ["txn date", "value date", "date"],
      descriptionColumn: ["description", "remarks", "transaction details"],
      withdrawalColumn: ["debit", "withdrawal"],
      depositColumn: ["credit", "deposit"],
      balanceColumn: ["balance"],
    },
    dateFormat: "DD MMM YYYY",
    skipRows: 1,
  },
  AXIS: {
    bankName: "Axis Bank",
    csvFormat: {
      dateColumn: ["tran date", "value date", "date"],
      descriptionColumn: ["particulars", "description"],
      withdrawalColumn: ["debit amount", "dr amount"],
      depositColumn: ["credit amount", "cr amount"],
      balanceColumn: ["balance"],
    },
    dateFormat: "DD-MM-YYYY",
    skipRows: 1,
  },
};

export class BankStatementParser {
  private config: BankStatementConfig;
  private headers: string[] = [];
  private columnMap: Record<string, number> = {};

  constructor(bankName?: keyof typeof BANK_CONFIGS) {
    this.config = bankName ? BANK_CONFIGS[bankName] : this.getGenericConfig();
  }

  private getGenericConfig(): BankStatementConfig {
    return {
      bankName: "Generic Bank",
      csvFormat: {
        dateColumn: ["date", "transaction date", "value date", "txn date"],
        descriptionColumn: [
          "description",
          "narration",
          "particulars",
          "details",
          "transaction details",
        ],
        amountColumn: ["amount", "transaction amount", "txn amount"],
        withdrawalColumn: [
          "withdrawal",
          "debit",
          "dr",
          "withdrawal amount",
          "debit amount",
        ],
        depositColumn: [
          "deposit",
          "credit",
          "cr",
          "deposit amount",
          "credit amount",
        ],
        balanceColumn: ["balance", "closing balance", "available balance"],
      },
      dateFormat: "DD/MM/YYYY",
      skipRows: 1,
    };
  }

  /**
   * Auto-detect bank from CSV content
   */
  static detectBank(csvContent: string): keyof typeof BANK_CONFIGS | null {
    const lowerContent = csvContent.toLowerCase();

    if (
      lowerContent.includes("icici") ||
      lowerContent.includes("transaction remarks")
    ) {
      return "ICICI";
    }
    if (lowerContent.includes("hdfc") || lowerContent.includes("narration")) {
      return "HDFC";
    }
    if (lowerContent.includes("sbi") || lowerContent.includes("state bank")) {
      return "SBI";
    }
    if (lowerContent.includes("axis")) {
      return "AXIS";
    }

    return null;
  }

  /**
   * Parse CSV content into transactions
   */
  parseCSV(
    csvContent: string,
    accountId: string,
    userId: string
  ): BulkTransactionData[] {
    const lines = csvContent.trim().split("\n");

    if (lines.length < 2) {
      throw new Error("Invalid CSV: Not enough data rows");
    }

    // Parse headers and create column mapping
    this.parseHeaders(lines[0]);

    const transactions: BulkTransactionData[] = [];
    const startRow = this.config.skipRows || 1;

    for (let i = startRow; i < lines.length; i++) {
      try {
        const transaction = this.parseRow(lines[i], accountId, userId);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        console.warn(`Skipping row ${i + 1}:`, error.message);
      }
    }

    return transactions;
  }

  private parseHeaders(headerLine: string): void {
    this.headers = this.parseCSVLine(headerLine).map((h) =>
      h.toLowerCase().trim()
    );
    this.buildColumnMap();
  }

  private buildColumnMap(): void {
    this.columnMap = {};
    const { csvFormat } = this.config;

    // Map each field type to column index
    this.columnMap.date = this.findColumnIndex(csvFormat.dateColumn);
    this.columnMap.description = this.findColumnIndex(
      csvFormat.descriptionColumn
    );

    if (csvFormat.amountColumn) {
      this.columnMap.amount = this.findColumnIndex(csvFormat.amountColumn);
    }
    if (csvFormat.withdrawalColumn) {
      this.columnMap.withdrawal = this.findColumnIndex(
        csvFormat.withdrawalColumn
      );
    }
    if (csvFormat.depositColumn) {
      this.columnMap.deposit = this.findColumnIndex(csvFormat.depositColumn);
    }
    if (csvFormat.balanceColumn) {
      this.columnMap.balance = this.findColumnIndex(csvFormat.balanceColumn);
    }
  }

  private findColumnIndex(possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = this.headers.findIndex((h) =>
        h.includes(name.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
  }

  private parseRow(
    line: string,
    accountId: string,
    userId: string
  ): BulkTransactionData | null {
    const values = this.parseCSVLine(line);

    if (values.length === 0) return null;

    // Extract basic fields
    const dateStr = this.getColumnValue(values, "date");
    const description = this.getColumnValue(values, "description");

    if (!dateStr || !description) return null;

    // Determine amount and type
    const { amount, type } = this.extractAmountAndType(values);

    if (amount === 0) return null;

    // Parse date
    const parsedDate = this.parseDate(dateStr);

    return {
      user_id: userId,
      name: this.generateTransactionName(description),
      description: description.trim(),
      amount: Math.abs(amount),
      date: parsedDate,
      type,
      ...this.mapAccountFields(type, accountId),
    };
  }

  private extractAmountAndType(values: string[]): {
    amount: number;
    type: "income" | "expense";
  } {
    // Try dedicated withdrawal/deposit columns first
    const withdrawal = this.parseAmount(
      this.getColumnValue(values, "withdrawal")
    );
    const deposit = this.parseAmount(this.getColumnValue(values, "deposit"));

    if (withdrawal > 0) {
      return { amount: withdrawal, type: "expense" };
    }
    if (deposit > 0) {
      return { amount: deposit, type: "income" };
    }

    // Fallback to amount column
    const amount = this.parseAmount(this.getColumnValue(values, "amount"));
    return {
      amount: Math.abs(amount),
      type: amount >= 0 ? "income" : "expense",
    };
  }

  private getColumnValue(values: string[], columnType: string): string {
    const index = this.columnMap[columnType];
    return index >= 0 && index < values.length ? values[index].trim() : "";
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private parseAmount(amountStr: string): number {
    if (!amountStr) return 0;

    // Remove currency symbols and commas
    const cleaned = amountStr
      .replace(/[₹$€£,\s]/g, "")
      .replace(/[()]/g, "") // Handle negative amounts in parentheses
      .trim();

    if (!cleaned) return 0;

    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : amount;
  }

  private parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();

    // Handle different date formats
    const formats = [
      { pattern: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, order: [3, 2, 1] }, // DD/MM/YYYY
      { pattern: /(\d{1,2})\/(\d{1,2})\/(\d{2})/, order: [3, 2, 1] }, // DD/MM/YY
      { pattern: /(\d{1,2})-(\d{1,2})-(\d{4})/, order: [3, 2, 1] }, // DD-MM-YYYY
      { pattern: /(\d{4})-(\d{1,2})-(\d{1,2})/, order: [1, 2, 3] }, // YYYY-MM-DD
    ];

    for (const { pattern, order } of formats) {
      const match = dateStr.match(pattern);
      if (match) {
        const [, p1, p2, p3] = match;
        const year = parseInt(order[0] === 1 ? p1 : order[0] === 2 ? p2 : p3);
        const month = parseInt(order[1] === 1 ? p1 : order[1] === 2 ? p2 : p3);
        const day = parseInt(order[2] === 1 ? p1 : order[2] === 2 ? p2 : p3);

        // Handle 2-digit years
        const fullYear =
          year < 100 ? (year > 50 ? 1900 + year : 2000 + year) : year;

        return new Date(fullYear, month - 1, day).toISOString();
      }
    }

    // Fallback to current date
    return new Date().toISOString();
  }

  private generateTransactionName(description: string): string {
    // Extract meaningful name from description
    const desc = description.trim();

    // Common patterns for transaction names
    const patterns = [
      /UPI\/([^\/]+)/i, // UPI transactions
      /NEFT[^-]*-([^-]+)/i, // NEFT transactions
      /ATD\/(.+)/i, // Auto debit
      /^([^\/]+)/, // First part before slash
    ];

    for (const pattern of patterns) {
      const match = desc.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 50);
      }
    }

    // Fallback to first few words
    return desc.split(/\s+/).slice(0, 3).join(" ").substring(0, 50);
  }

  private mapAccountFields(type: "income" | "expense", accountId: string) {
    if (type === "expense") {
      return {
        source_account_id: accountId,
        source_account_type: "bank",
        source_account_name: this.config.bankName,
        destination_account_type: "other",
        destination_account_name: "External",
      };
    } else {
      return {
        destination_account_id: accountId,
        destination_account_type: "bank",
        destination_account_name: this.config.bankName,
        source_account_type: "other",
        source_account_name: "External",
      };
    }
  }

  /**
   * Get parsing statistics
   */
  getParsingStats(csvContent: string): {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    detectedColumns: string[];
    missingColumns: string[];
  } {
    const lines = csvContent.trim().split("\n");
    this.parseHeaders(lines[0]);

    let validRows = 0;
    let invalidRows = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const dateStr = this.getColumnValue(values, "date");
      const description = this.getColumnValue(values, "description");

      if (dateStr && description) {
        validRows++;
      } else {
        invalidRows++;
      }
    }

    const detectedColumns = Object.keys(this.columnMap).filter(
      (key) => this.columnMap[key] >= 0
    );
    const missingColumns = Object.keys(this.columnMap).filter(
      (key) => this.columnMap[key] < 0
    );

    return {
      totalRows: lines.length - 1,
      validRows,
      invalidRows,
      detectedColumns,
      missingColumns,
    };
  }
}

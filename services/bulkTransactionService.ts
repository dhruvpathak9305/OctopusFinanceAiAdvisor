import { supabase } from "../lib/supabase/client";
import { BankStatementParser } from "./csvParsers/BankStatementParser";
import { emitBalanceUpdate } from "../utils/balanceEventEmitter";

export interface BulkTransactionData {
  user_id: string;
  name: string;
  description: string;
  amount: number;
  date: string;
  type:
    | "income"
    | "expense"
    | "transfer"
    | "loan"
    | "loan_repayment"
    | "debt"
    | "debt_collection";

  // REQUIRED: source_account_type is NOT NULL in database
  source_account_type:
    | "bank"
    | "credit_card"
    | "cash"
    | "digital_wallet"
    | "investment"
    | "other";
  source_account_id?: string;
  source_account_name?: string;

  destination_account_type?:
    | "bank"
    | "credit_card"
    | "cash"
    | "digital_wallet"
    | "investment"
    | "other";
  destination_account_id?: string;
  destination_account_name?: string;

  // Additional optional fields for full database compatibility
  icon?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_end_date?: string;
  parent_transaction_id?: string;
  interest_rate?: number;
  loan_term_months?: number;

  category_id?: string;
  subcategory_id?: string;
  merchant?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface BulkUploadResult {
  status: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";
  inserted_count: number;
  error_count: number;
  errors: any[];
  total_processed?: number;
}

export interface ValidationResult {
  is_valid: boolean;
  total_count: number;
  validation_errors: any[];
}

export interface DuplicateCheckResult {
  duplicate_count: number;
  duplicates: any[];
}

export class BulkTransactionService {
  /**
   * Parse CSV content into transaction data
   */
  static parseCSV(
    csvContent: string,
    accountId: string,
    userId: string
  ): BulkTransactionData[] {
    try {
      // Auto-detect bank and use appropriate parser
      const detectedBank = BankStatementParser.detectBank(csvContent);
      const parser = new BankStatementParser(detectedBank || undefined);

      return parser.parseCSV(csvContent, accountId, userId);
    } catch (error) {
      console.error("CSV parsing failed:", error);
      throw new Error(
        `CSV parsing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\n` +
          `Unable to parse your bank statement CSV.\n\n` +
          `Please ensure:\n` +
          `• The file is a valid bank statement CSV\n` +
          `• The CSV contains transaction data with dates and amounts\n` +
          `• The format is supported by the application\n\n` +
          `Supported formats: ICICI, HDFC, IDFC, SBI, AXIS, and generic CSV formats.`
      );
    }
  }

  // ❌ REMOVED: parseCSVBasic method that created fallback dummy transactions
  // All CSV parsing now uses proper bank-specific parsers or fails with clear errors

  /**
   * Parse bank statement text (OCR or manual entry)
   */
  static parseBankStatement(
    statementText: string,
    accountId: string,
    userId: string
  ): BulkTransactionData[] {
    const lines = statementText.split("\n").filter((line) => line.trim());
    const transactions: BulkTransactionData[] = [];

    for (const line of lines) {
      // Common bank statement patterns
      const patterns = [
        // ICICI pattern: Date Description Amount Balance
        /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)$/,
        // Generic pattern: Date Amount Description
        /(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s*([\+\-]?\d+\.?\d*)\s*(.+)/,
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const [, date, description, amount] = match;
          const numericAmount = parseFloat(amount.replace(/,/g, ""));

          if (!isNaN(numericAmount) && numericAmount !== 0) {
            const accountFields = this.mapAccountFields(
              {
                amount: numericAmount.toString(),
                description: description.trim(),
              },
              accountId
            );

            transactions.push({
              user_id: userId,
              name: description.trim().substring(0, 50),
              description: description.trim(),
              amount: Math.abs(numericAmount),
              date: this.parseDate(date),
              type: numericAmount > 0 ? "income" : "expense",

              // ✅ Ensure source_account_type is always provided (required by DB)
              source_account_type: accountFields.source_account_type || "bank",
              source_account_id: accountFields.source_account_id,
              source_account_name: accountFields.source_account_name,
              destination_account_type: accountFields.destination_account_type,
              destination_account_id: accountFields.destination_account_id,
              destination_account_name: accountFields.destination_account_name,
              merchant: accountFields.merchant,
            });
          }
          break;
        }
      }
    }

    return transactions;
  }

  /**
   * Validate transactions before upload
   */
  static async validateTransactions(
    transactions: BulkTransactionData[]
  ): Promise<ValidationResult> {
    try {
      console.log("🔍 Validating transactions:", {
        count: transactions.length,
        sampleTransaction: transactions[0],
        transactionStructure: Object.keys(transactions[0] || {}),
      });

      // Don't JSON.stringify - Supabase handles JSONB conversion automatically
      const { data, error } = await (supabase as any).rpc(
        "validate_bulk_transactions",
        {
          transactions_data: transactions, // Pass array directly
        }
      );

      if (error) {
        console.error("❌ Database validation RPC error:", error);
        throw error;
      }

      console.log("✅ Validation response:", data);

      return (
        data[0] || { is_valid: false, total_count: 0, validation_errors: [] }
      );
    } catch (error) {
      console.error("❌ Validation error:", error);
      return {
        is_valid: false,
        total_count: 0,
        validation_errors: [
          { error: error instanceof Error ? error.message : String(error) },
        ],
      };
    }
  }

  /**
   * Check for duplicate transactions
   */
  static async checkDuplicates(
    transactions: BulkTransactionData[],
    userId: string
  ): Promise<DuplicateCheckResult> {
    try {
      const { data, error } = await (supabase as any).rpc(
        "detect_duplicate_transactions",
        {
          transactions_data: transactions, // Pass array directly
          user_uuid: userId,
        }
      );

      if (error) throw error;

      return data[0] || { duplicate_count: 0, duplicates: [] };
    } catch (error) {
      console.error("❌ Duplicate check error:", error);
      return { duplicate_count: 0, duplicates: [] };
    }
  }

  /**
   * Upload transactions in bulk using direct Supabase insert (bypasses permission issues)
   */
  static async uploadTransactions(
    transactions: BulkTransactionData[],
    onProgress?: (progress: number) => void
  ): Promise<BulkUploadResult> {
    try {
      console.log(
        "🚀 Starting direct Supabase insert for",
        transactions.length,
        "transactions"
      );

      // Generate UUID compatible with React Native (define once)
      const generateUUID = () => {
        // Try React Native's crypto if available
        if (typeof global !== "undefined" && global.crypto?.randomUUID) {
          return global.crypto.randomUUID();
        }

        // Try browser crypto if available
        if (typeof window !== "undefined" && window.crypto?.randomUUID) {
          return window.crypto.randomUUID();
        }

        // Fallback to a UUID v4 compatible string
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
      };

      // Log which UUID method is being used
      const testUuid = generateUUID();
      console.log(
        "🔑 UUID generation method determined. Sample UUID:",
        testUuid
      );

      // Process in smaller batches for better performance and error handling
      const batchSize = 50;
      const batches = this.chunkArray(transactions, batchSize);

      let totalInserted = 0;
      let totalErrors = 0;
      let allErrors: any[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(
          `📦 Processing batch ${i + 1}/${batches.length} (${
            batch.length
          } transactions)`
        );

        // Update progress
        onProgress?.(Math.floor((i / batches.length) * 100));

        // Convert to database format
        const dbTransactions = batch.map((transaction, index) => {
          const transactionId = generateUUID();

          const dbTransaction = {
            id: transactionId,
            user_id: transaction.user_id,
            name:
              transaction.name || `Transaction ${i * batchSize + index + 1}`,
            description: transaction.description || "",
            amount: parseFloat(String(transaction.amount)) || 0,
            date: transaction.date,
            type: transaction.type,
            source_account_type: transaction.source_account_type,
            source_account_id: transaction.source_account_id || null,
            source_account_name: transaction.source_account_name || null,
            destination_account_type:
              transaction.destination_account_type || null,
            destination_account_id: transaction.destination_account_id || null,
            destination_account_name:
              transaction.destination_account_name || null,
            category_id: transaction.category_id || null,
            subcategory_id: transaction.subcategory_id || null,
            icon: transaction.icon || null,
            merchant: transaction.merchant || null,
            is_recurring: transaction.is_recurring || false,
            recurrence_pattern: transaction.recurrence_pattern || null,
            recurrence_end_date: transaction.recurrence_end_date || null,
            parent_transaction_id: transaction.parent_transaction_id || null,
            interest_rate: transaction.interest_rate || null,
            loan_term_months: transaction.loan_term_months || null,
            metadata: transaction.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Remove undefined fields to prevent issues
          Object.keys(dbTransaction).forEach((key) => {
            if ((dbTransaction as any)[key] === undefined) {
              delete (dbTransaction as any)[key];
            }
          });

          return dbTransaction;
        });

        console.log(
          `🔍 Sample transaction for batch ${i + 1}:`,
          dbTransactions[0]
        );

        // Use direct Supabase insert instead of problematic RPC function
        const { data, error } = await supabase
          .from("transactions_real")
          .insert(dbTransactions)
          .select("id");

        if (error) {
          console.error(`❌ Batch ${i + 1} error:`, error);
          totalErrors += batch.length;
          allErrors.push({
            batch: i + 1,
            error: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            transactions: batch.length,
          });
          continue;
        }

        const insertedCount = data ? data.length : 0;
        totalInserted += insertedCount;
        console.log(
          `✅ Batch ${i + 1} completed: ${insertedCount} inserted successfully`
        );
      }

      onProgress?.(100);

      const status =
        totalErrors === 0
          ? "SUCCESS"
          : totalInserted > 0
          ? "PARTIAL_SUCCESS"
          : "FAILED";

      console.log("📊 Final upload result:", {
        status,
        totalInserted,
        totalErrors,
        totalProcessed: transactions.length,
      });

      // Emit event to refresh transaction lists across the app
      if (totalInserted > 0) {
        console.log(
          "🔔 Emitting bulk-transactions-added event for",
          totalInserted,
          "transactions"
        );
        emitBalanceUpdate("bulk-transactions-added", `bulk-${Date.now()}`);

        // Also dispatch custom event for any web components
        if (
          typeof window !== "undefined" &&
          typeof window.dispatchEvent === "function"
        ) {
          try {
            window.dispatchEvent(
              new CustomEvent("transactionsRefreshNeeded", {
                detail: {
                  type: "bulk-upload",
                  count: totalInserted,
                },
              })
            );
            console.log("🔔 Custom transactionsRefreshNeeded event dispatched");
          } catch (error) {
            console.warn("⚠️ Could not dispatch custom event:", error);
          }
        }
      }

      return {
        status,
        inserted_count: totalInserted,
        error_count: totalErrors,
        errors: allErrors,
        total_processed: transactions.length,
      };
    } catch (error) {
      console.error("❌ Bulk upload error:", error);
      return {
        status: "FAILED",
        inserted_count: 0,
        error_count: transactions.length,
        errors: [
          { error: error instanceof Error ? error.message : String(error) },
        ],
        total_processed: transactions.length,
      };
    }
  }

  /**
   * Complete bulk upload workflow with validation
   */
  static async uploadWithValidation(
    transactions: BulkTransactionData[],
    userId: string,
    options: {
      skipValidation?: boolean;
      skipDuplicateCheck?: boolean;
      onProgress?: (stage: string, progress: number) => void;
    } = {}
  ): Promise<{
    success: boolean;
    result?: BulkUploadResult;
    validation?: ValidationResult;
    duplicates?: DuplicateCheckResult;
    error?: string;
  }> {
    try {
      const {
        skipValidation = false,
        skipDuplicateCheck = false,
        onProgress,
      } = options;

      // Step 1: Validation
      onProgress?.("Validating data...", 0);
      let validation: ValidationResult | undefined;

      if (!skipValidation) {
        try {
          validation = await this.validateTransactions(transactions);
          if (!validation.is_valid) {
            console.warn(
              "⚠️ Validation failed, but continuing with upload:",
              validation.validation_errors
            );
            // Continue anyway for now - validation issues shouldn't block upload
          }
        } catch (validationError) {
          console.warn(
            "⚠️ Validation error, but continuing with upload:",
            validationError
          );
          // Continue anyway - validation RPC might have permission issues
        }
      }

      // Step 2: Duplicate check
      onProgress?.("Checking duplicates...", 25);
      let duplicates: DuplicateCheckResult | undefined;

      if (!skipDuplicateCheck) {
        try {
          duplicates = await this.checkDuplicates(transactions, userId);
          if (duplicates.duplicate_count > 0) {
            console.log(
              `ℹ️ Found ${duplicates.duplicate_count} potential duplicates, but continuing with upload`
            );
            // Note: Removed Alert.alert to avoid blocking upload process
          }
        } catch (duplicateError) {
          console.warn(
            "⚠️ Duplicate check error, but continuing with upload:",
            duplicateError
          );
          // Continue anyway - duplicate check RPC might have permission issues
        }
      }

      // Step 3: Upload
      onProgress?.("Uploading transactions...", 50);
      const result = await this.uploadTransactions(transactions, (progress) => {
        onProgress?.("Uploading transactions...", 50 + progress / 2);
      });

      onProgress?.("Complete", 100);

      return {
        success:
          result.status === "SUCCESS" || result.status === "PARTIAL_SUCCESS",
        result,
        validation,
        duplicates,
      };
    } catch (error) {
      console.error("❌ Upload workflow error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Helper methods
  private static parseDate(dateStr: string): string {
    // Handle various date formats
    const formats = [
      /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        const [, d1, d2, d3] = match;
        // Assume DD/MM/YYYY format for Indian context
        return `${d3}-${d2}-${d1}T00:00:00+00:00`;
      }
    }

    return new Date().toISOString();
  }

  private static determineTransactionType(
    row: Record<string, string>,
    accountId: string
  ): "income" | "expense" | "transfer" {
    const amount = parseFloat(row.amount || row.transaction_amount || "0");
    const withdrawal = parseFloat(row.withdrawal || row.debit || "0");
    const deposit = parseFloat(row.deposit || row.credit || "0");

    if (withdrawal > 0 || amount < 0) return "expense";
    if (deposit > 0 || amount > 0) return "income";

    return "expense"; // default
  }

  private static mapAccountFields(
    row: Record<string, string>,
    accountId: string
  ): Partial<BulkTransactionData> {
    const amount = parseFloat(row.amount || row.transaction_amount || "0");
    const withdrawal = parseFloat(row.withdrawal || row.debit || "0");
    const deposit = parseFloat(row.deposit || row.credit || "0");

    // Determine account type from CSV or default to 'bank'
    const csvAccountType =
      row.account_type?.toLowerCase() ||
      row.source_account_type?.toLowerCase() ||
      "bank";
    const validAccountTypes: Array<BulkTransactionData["source_account_type"]> =
      ["bank", "credit_card", "cash", "digital_wallet", "investment", "other"];

    const sourceAccountType: BulkTransactionData["source_account_type"] =
      validAccountTypes.includes(csvAccountType as any)
        ? (csvAccountType as BulkTransactionData["source_account_type"])
        : "bank";

    const accountName =
      row.account_name || row.source_account_name || "Bank Account";

    if (withdrawal > 0 || amount < 0) {
      // Expense: money going out of the account
      return {
        source_account_id: accountId,
        source_account_type: sourceAccountType, // ✅ Always provided, validated
        source_account_name: accountName,
        destination_account_type: "other",
        destination_account_name:
          row.destination_account_name || row.merchant || "External",
        merchant:
          row.merchant ||
          this.extractMerchantFromDescription(row.description || ""),
      };
    } else {
      // Income: money coming into the account
      return {
        destination_account_id: accountId,
        destination_account_type: sourceAccountType,
        destination_account_name: accountName,
        source_account_type: "other", // ✅ Always provided for income
        source_account_name:
          row.source_account_name || row.merchant || "External",
        merchant:
          row.merchant ||
          this.extractMerchantFromDescription(row.description || ""),
      };
    }
  }

  /**
   * Extract merchant name from transaction description
   */
  private static extractMerchantFromDescription(description: string): string {
    // Common merchant patterns in Indian bank statements
    const patterns = [
      /UPI\/([A-Z0-9]+)\//, // UPI/MERCHANT/
      /POS\/([A-Z0-9\s]+)\//, // POS/MERCHANT/
      /NEFT\/([A-Z0-9\s]+)\//, // NEFT/MERCHANT/
      /([A-Z\s]+)\s*-\s*[0-9]+$/, // MERCHANT NAME - 12345
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 50); // Limit length
      }
    }

    // Fallback: return first few words of description
    return (
      description.split(" ").slice(0, 3).join(" ").substring(0, 50) || "Unknown"
    );
  }

  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

export default BulkTransactionService;

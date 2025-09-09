import { BaseCSVParser } from "./BaseCSVParser";
import { ParsedTransaction, TransactionType } from "./types";

/**
 * ICICI Bank CSV Parser
 * Handles ICICI bank statement formats based on actual CSV structure
 */
export class ICICIParser extends BaseCSVParser {
  static readonly BANK_NAME = "ICICI Bank";

  /**
   * Detect if this CSV is from ICICI Bank
   * Based on actual ICICI CSV format with specific column headers
   */
  canParse(headers: string[], firstRow?: string[]): boolean {
    const headerStr = headers.join("|").toLowerCase();
    const firstRowStr = firstRow?.join("|").toLowerCase() || "";

    // Check for ICICI specific column patterns from actual CSV
    const iciciPatterns = [
      "value date",
      "transaction date",
      "transaction remarks",
      "withdrawal amount",
      "deposit amount",
      "balance",
    ];

    const hasICICIColumns =
      iciciPatterns.filter(
        (pattern) =>
          headerStr.includes(pattern) || firstRowStr.includes(pattern)
      ).length >= 4; // Must have at least 4 ICICI-specific columns

    // Also check for ICICI bank identifier
    const hasICICIIdentifier =
      headerStr.includes("icici") ||
      firstRowStr.includes("icici") ||
      headerStr.includes("s no."); // ICICI uses "S No." column

    return hasICICIColumns && hasICICIIdentifier;
  }

  /**
   * Parse ICICI CSV format based on actual structure
   */
  async parseCSV(csvData: string[][]): Promise<ParsedTransaction[]> {
    const transactions: ParsedTransaction[] = [];

    if (csvData.length < 2) {
      throw new Error("ICICI CSV must have at least header and one data row");
    }

    // Find header row (might not be the first row due to bank header info)
    let headerRowIndex = -1;
    let headers: string[] = [];

    for (let i = 0; i < Math.min(csvData.length, 10); i++) {
      const row = csvData[i];
      const rowStr = row.join("|").toLowerCase();

      // Look for row with transaction table headers
      if (
        rowStr.includes("value date") &&
        rowStr.includes("transaction date") &&
        rowStr.includes("transaction remarks")
      ) {
        headerRowIndex = i;
        headers = row;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error("Could not find ICICI transaction headers in CSV");
    }

    const dataRows = csvData.slice(headerRowIndex + 1);

    // Map headers to indices based on actual ICICI format
    const headerMap = this.createICICIHeaderMap(headers);

    console.log("🏦 ICICI Parser: Processing", dataRows.length, "transactions");
    console.log("📋 ICICI Headers detected:", headers);
    console.log("🗺️ ICICI Header mapping:", headerMap);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      try {
        const transaction = this.parseICICIRow(
          row,
          headerMap,
          headerRowIndex + i + 2
        );
        if (transaction && this.isValidTransaction(transaction)) {
          transactions.push(transaction);
        }
      } catch (error) {
        console.warn(
          `⚠️ ICICI Parser: Error parsing row ${headerRowIndex + i + 2}:`,
          error
        );
        // Continue parsing other rows
      }
    }

    console.log(
      `✅ ICICI Parser: Successfully parsed ${transactions.length} transactions`
    );
    return transactions;
  }

  /**
   * Create header mapping for ICICI columns based on actual format
   */
  private createICICIHeaderMap(headers: string[]): Record<string, number> {
    const headerMap: Record<string, number> = {};

    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();

      // Map based on actual ICICI CSV structure
      if (
        normalizedHeader.includes("s no") ||
        normalizedHeader.includes("s.no")
      ) {
        headerMap.serialNo = index;
      } else if (normalizedHeader.includes("value date")) {
        headerMap.valueDate = index;
      } else if (normalizedHeader.includes("transaction date")) {
        headerMap.transactionDate = index;
      } else if (normalizedHeader.includes("cheque number")) {
        headerMap.chequeNumber = index;
      } else if (normalizedHeader.includes("transaction remarks")) {
        headerMap.remarks = index;
      } else if (normalizedHeader.includes("withdrawal amount")) {
        headerMap.withdrawal = index;
      } else if (normalizedHeader.includes("deposit amount")) {
        headerMap.deposit = index;
      } else if (normalizedHeader.includes("balance")) {
        headerMap.balance = index;
      }
    });

    return headerMap;
  }

  /**
   * Parse individual ICICI row based on actual format
   */
  private parseICICIRow(
    row: string[],
    headerMap: Record<string, number>,
    rowNumber: number
  ): ParsedTransaction | null {
    // Skip empty rows
    if (
      !row ||
      row.length === 0 ||
      row.every((cell) => !cell || !cell.trim())
    ) {
      return null;
    }

    try {
      // Extract date (prefer transaction date over value date)
      const transactionDateStr = this.getColumnValue(
        row,
        headerMap.transactionDate
      );
      const valueDateStr = this.getColumnValue(row, headerMap.valueDate);
      const dateStr = transactionDateStr || valueDateStr;

      if (!dateStr) {
        console.warn(`⚠️ ICICI: No date found in row ${rowNumber}`);
        return null;
      }

      const date = this.parseICICIDate(dateStr);
      if (!date) {
        console.warn(`⚠️ ICICI: Invalid date "${dateStr}" in row ${rowNumber}`);
        return null;
      }

      // Extract transaction remarks (description)
      const remarks =
        this.getColumnValue(row, headerMap.remarks) || "ICICI Transaction";

      // Extract amounts from separate withdrawal/deposit columns
      const withdrawalStr = this.getColumnValue(row, headerMap.withdrawal);
      const depositStr = this.getColumnValue(row, headerMap.deposit);

      const withdrawalAmount = this.parseAmount(withdrawalStr);
      const depositAmount = this.parseAmount(depositStr);

      // Skip rows with no amount
      if (withdrawalAmount === 0 && depositAmount === 0) {
        return null;
      }

      // Determine transaction type and amount
      let type: TransactionType;
      let amount: number;

      if (depositAmount > 0) {
        type = "income";
        amount = depositAmount;
      } else if (withdrawalAmount > 0) {
        type = "expense";
        amount = withdrawalAmount;
      } else {
        return null; // No valid amount
      }

      // Extract balance
      const balance = this.parseAmount(
        this.getColumnValue(row, headerMap.balance)
      );

      // Extract additional info
      const chequeNumber = this.getColumnValue(row, headerMap.chequeNumber);
      const serialNo = this.getColumnValue(row, headerMap.serialNo);

      // Extract merchant from transaction remarks
      const merchant = this.extractICICIMerchant(remarks);

      const transaction: ParsedTransaction = {
        date: date.toISOString().split("T")[0], // YYYY-MM-DD format
        description: remarks.trim(),
        amount,
        type,
        merchant: merchant || "ICICI Transaction",
        category: this.categorizeICICITransaction(remarks, merchant),
        balance,
        reference_number: chequeNumber || serialNo || undefined,
        bank: "ICICI Bank",
        raw_data: {
          original_row: row,
          withdrawal_amount: withdrawalAmount,
          deposit_amount: depositAmount,
          row_number: rowNumber,
          value_date: valueDateStr,
          transaction_date: transactionDateStr,
        },
      };

      return transaction;
    } catch (error) {
      console.error(`❌ ICICI Parser: Error parsing row ${rowNumber}:`, error);
      throw error;
    }
  }

  /**
   * Parse ICICI date formats (DD/MM/YYYY)
   */
  private parseICICIDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    const cleaned = dateStr.trim();

    // ICICI uses DD/MM/YYYY format
    const dmySlash = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmySlash) {
      const [, day, month, year] = dmySlash;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Fallback to standard parsing
    return this.parseDate(cleaned);
  }

  /**
   * Extract merchant name from ICICI transaction remarks
   * Based on actual ICICI transaction patterns
   */
  private extractICICIMerchant(remarks: string): string | null {
    if (!remarks) return null;

    const desc = remarks.trim();

    // ICICI specific patterns from actual transactions
    const patterns = [
      // UPI patterns: UPI/RISHABH/dashingrishabh/UPI/AXIS BANK/...
      /UPI\/([^\/]+)\/[^\/]*\/[^\/]*\/([^\/]+)/,
      // UPI simpler: UPI/MERCHANT_NAME/
      /UPI\/([^\/]+)\//,
      // Card payments
      /POS\s+([^\/\s]+)/,
      /CARD\s+([^\/\s]+)/,
      // ATM
      /ATM\s+([^\/\s]+)/,
      // NEFT/IMPS
      /NEFT[^\w]*([^\/\s]+)/,
      /IMPS[^\w]*([^\/\s]+)/,
      // Online payments
      /RAZORPAY[^\w]*([^\/\s]+)/,
      /PAYTM[^\w]*([^\/\s]+)/,
    ];

    for (const pattern of patterns) {
      const match = desc.match(pattern);
      if (match && match[1]) {
        let merchantName = match[1].trim();

        // For UPI, prefer the second capture group (bank/service) if available
        if (pattern.source.includes("UPI") && match[2]) {
          merchantName = match[2].trim();
        }

        return this.cleanMerchantName(merchantName);
      }
    }

    // If no pattern matches, try to extract first meaningful word
    const words = desc.split(/[\s\/]+/).filter((w) => w.length > 2);
    if (words.length > 1) {
      // Skip common prefixes
      const meaningfulWords = words.filter(
        (w) =>
          !["UPI", "POS", "ATM", "NEFT", "IMPS", "CARD", "BANK"].includes(
            w.toUpperCase()
          )
      );
      if (meaningfulWords.length > 0) {
        return this.cleanMerchantName(meaningfulWords[0]);
      }
    }

    return null;
  }

  /**
   * Categorize ICICI transactions based on remarks
   */
  private categorizeICICITransaction(
    remarks: string,
    merchant: string | null
  ): string {
    const desc = remarks.toLowerCase();

    // ICICI specific categorization patterns
    if (desc.includes("salary") || desc.includes("sal credit")) return "Salary";
    if (desc.includes("dividend") || desc.includes("interest"))
      return "Investment";
    if (desc.includes("atm") || desc.includes("cash")) return "Cash Withdrawal";
    if (
      desc.includes("fuel") ||
      desc.includes("petrol") ||
      desc.includes("diesel")
    )
      return "Transport";
    if (desc.includes("grocery") || desc.includes("supermarket"))
      return "Food & Dining";
    if (desc.includes("medical") || desc.includes("hospital"))
      return "Healthcare";
    if (
      desc.includes("electricity") ||
      desc.includes("gas") ||
      desc.includes("water")
    )
      return "Bills & Utilities";
    if (
      desc.includes("mobile") ||
      desc.includes("airtel") ||
      desc.includes("jio")
    )
      return "Mobile";
    if (desc.includes("insurance")) return "Insurance";
    if (desc.includes("mutual fund") || desc.includes("sip"))
      return "Investment";

    // Use merchant for additional categorization
    if (merchant) {
      const merchantLower = merchant.toLowerCase();
      if (
        merchantLower.includes("amazon") ||
        merchantLower.includes("flipkart")
      )
        return "Shopping";
      if (merchantLower.includes("uber") || merchantLower.includes("ola"))
        return "Transport";
      if (merchantLower.includes("zomato") || merchantLower.includes("swiggy"))
        return "Food & Dining";
      if (
        merchantLower.includes("netflix") ||
        merchantLower.includes("hotstar")
      )
        return "Entertainment";
    }

    return "General";
  }

  /**
   * Get bank name
   */
  getBankName(): string {
    return ICICIParser.BANK_NAME;
  }
}

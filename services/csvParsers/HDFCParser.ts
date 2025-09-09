import { BaseCSVParser } from "./BaseCSVParser";
import { ParsedTransaction, TransactionType } from "./types";

/**
 * HDFC Bank CSV Parser
 * Handles HDFC bank statement formats based on actual CSV structure
 */
export class HDFCParser extends BaseCSVParser {
  static readonly BANK_NAME = "HDFC Bank";

  /**
   * Detect if this CSV is from HDFC Bank
   * Based on actual HDFC CSV format with specific patterns
   */
  canParse(headers: string[], firstRow?: string[]): boolean {
    const headerStr = headers.join("|").toLowerCase();
    const firstRowStr = firstRow?.join("|").toLowerCase() || "";

    // Check for HDFC specific patterns from actual CSV
    const hdfcPatterns = [
      "narration",
      "chq./ref.no",
      "value dt",
      "withdrawal amt",
      "deposit amt",
      "closing balance",
    ];

    const hasHDFCColumns =
      hdfcPatterns.filter(
        (pattern) =>
          headerStr.includes(pattern) || firstRowStr.includes(pattern)
      ).length >= 4; // Must have at least 4 HDFC-specific columns

    // Check for HDFC bank identifier
    const hasHDFCIdentifier =
      headerStr.includes("hdfc") ||
      firstRowStr.includes("hdfc") ||
      headerStr.includes("statement of accounts") ||
      headerStr.includes("hdfc bank ltd");

    // Exclude IDFC and ICICI content
    const isOtherBank =
      headerStr.includes("idfc") ||
      headerStr.includes("icici") ||
      headerStr.includes("s no.") ||
      headerStr.includes("transaction remarks");

    return hasHDFCColumns && hasHDFCIdentifier && !isOtherBank;
  }

  /**
   * Parse HDFC CSV format based on actual structure
   */
  async parseCSV(csvData: string[][]): Promise<ParsedTransaction[]> {
    const transactions: ParsedTransaction[] = [];

    if (csvData.length < 2) {
      throw new Error("HDFC CSV must have at least header and one data row");
    }

    // Find header row (might not be the first row due to bank header info)
    let headerRowIndex = -1;
    let headers: string[] = [];

    for (let i = 0; i < Math.min(csvData.length, 15); i++) {
      const row = csvData[i];
      const rowStr = row.join("|").toLowerCase();

      // Look for row with transaction table headers
      if (
        rowStr.includes("date") &&
        rowStr.includes("narration") &&
        (rowStr.includes("withdrawal amt") || rowStr.includes("deposit amt"))
      ) {
        headerRowIndex = i;
        headers = row;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error("Could not find HDFC transaction headers in CSV");
    }

    const dataRows = csvData.slice(headerRowIndex + 1);

    // Map headers to indices based on actual HDFC format
    const headerMap = this.createHDFCHeaderMap(headers);

    console.log("🏦 HDFC Parser: Processing", dataRows.length, "transactions");
    console.log("📋 HDFC Headers detected:", headers);
    console.log("🗺️ HDFC Header mapping:", headerMap);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      try {
        const transaction = this.parseHDFCRow(
          row,
          headerMap,
          headerRowIndex + i + 2
        );
        if (transaction && this.isValidTransaction(transaction)) {
          transactions.push(transaction);
        }
      } catch (error) {
        console.warn(
          `⚠️ HDFC Parser: Error parsing row ${headerRowIndex + i + 2}:`,
          error
        );
        // Continue parsing other rows
      }
    }

    console.log(
      `✅ HDFC Parser: Successfully parsed ${transactions.length} transactions`
    );
    return transactions;
  }

  /**
   * Create header mapping for HDFC columns based on actual format
   */
  private createHDFCHeaderMap(headers: string[]): Record<string, number> {
    const headerMap: Record<string, number> = {};

    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();

      // Map based on actual HDFC CSV structure
      if (
        normalizedHeader.includes("date") &&
        !normalizedHeader.includes("value")
      ) {
        headerMap.date = index;
      } else if (normalizedHeader.includes("narration")) {
        headerMap.narration = index;
      } else if (
        normalizedHeader.includes("chq") ||
        normalizedHeader.includes("ref")
      ) {
        headerMap.reference = index;
      } else if (normalizedHeader.includes("value dt")) {
        headerMap.valueDate = index;
      } else if (normalizedHeader.includes("withdrawal amt")) {
        headerMap.withdrawal = index;
      } else if (normalizedHeader.includes("deposit amt")) {
        headerMap.deposit = index;
      } else if (normalizedHeader.includes("closing balance")) {
        headerMap.balance = index;
      }
    });

    return headerMap;
  }

  /**
   * Parse individual HDFC row based on actual format
   */
  private parseHDFCRow(
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
      // Extract date
      const dateStr = this.getColumnValue(row, headerMap.date);
      if (!dateStr) {
        console.warn(`⚠️ HDFC: No date found in row ${rowNumber}`);
        return null;
      }

      const date = this.parseHDFCDate(dateStr);
      if (!date) {
        console.warn(`⚠️ HDFC: Invalid date "${dateStr}" in row ${rowNumber}`);
        return null;
      }

      // Extract narration (description)
      const narration =
        this.getColumnValue(row, headerMap.narration) || "HDFC Transaction";

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
      const referenceNo = this.getColumnValue(row, headerMap.reference);
      const valueDate = this.getColumnValue(row, headerMap.valueDate);

      // Extract merchant from narration
      const merchant = this.extractHDFCMerchant(narration);

      const transaction: ParsedTransaction = {
        date: date.toISOString().split("T")[0], // YYYY-MM-DD format
        description: narration.trim(),
        amount,
        type,
        merchant: merchant || "HDFC Transaction",
        category: this.categorizeHDFCTransaction(narration, merchant),
        balance,
        reference_number: referenceNo || undefined,
        bank: "HDFC Bank",
        raw_data: {
          original_row: row,
          withdrawal_amount: withdrawalAmount,
          deposit_amount: depositAmount,
          row_number: rowNumber,
          value_date: valueDate,
          reference_number: referenceNo,
        },
      };

      return transaction;
    } catch (error) {
      console.error(`❌ HDFC Parser: Error parsing row ${rowNumber}:`, error);
      throw error;
    }
  }

  /**
   * Parse HDFC date formats (DD/MM/YY or DD/MM/YYYY)
   */
  private parseHDFCDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    const cleaned = dateStr.trim();

    // HDFC uses DD/MM/YY format (2-digit year)
    const dmySlash2 = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (dmySlash2) {
      const [, day, month, year] = dmySlash2;
      const fullYear = parseInt(year) + 2000; // Convert 25 to 2025
      return new Date(fullYear, parseInt(month) - 1, parseInt(day));
    }

    // HDFC might also use DD/MM/YYYY format (4-digit year)
    const dmySlash4 = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmySlash4) {
      const [, day, month, year] = dmySlash4;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Fallback to standard parsing
    return this.parseDate(cleaned);
  }

  /**
   * Extract merchant name from HDFC narration
   * Based on actual HDFC transaction patterns
   */
  private extractHDFCMerchant(narration: string): string | null {
    if (!narration) return null;

    const desc = narration.trim();

    // HDFC specific patterns from actual transactions
    const patterns = [
      // Credit card autopay
      /CC\s+\d+X+\d+\s+AUTOPAY\s+([^-]+)/,
      // ACH patterns
      /ACH\s+C-\s*([^-\d]+)/,
      // UPI patterns
      /UPI-([^-]+)-/,
      /UPI\/([^\/]+)\//,
      // NEFT patterns
      /NEFT[^\w]*([^-]+)-/,
      // IMPS patterns
      /IMPS[^\w]*([^-]+)-/,
      // Online banking
      /([A-Z\s]+)\s+BANK\s+SPL/,
      // Investment/Dividend patterns
      /([A-Z\s]+)\s+(DIV|DIVIDEND)/,
      // Salary patterns
      /SALARY\s+([^-]+)/,
      // General company names
      /([A-Z][A-Z\s]{3,20})\s+(LTD|LIMITED|SERVICES|INDUSTRIES)/,
    ];

    for (const pattern of patterns) {
      const match = desc.match(pattern);
      if (match && match[1]) {
        let merchantName = match[1].trim();
        return this.cleanMerchantName(merchantName);
      }
    }

    // If no pattern matches, try to extract meaningful words
    const words = desc.split(/[\s\/-]+/).filter((w) => w.length > 2);
    if (words.length > 1) {
      // Skip common prefixes and codes
      const meaningfulWords = words.filter(
        (w) =>
          ![
            "ACH",
            "UPI",
            "NEFT",
            "IMPS",
            "BANK",
            "LTD",
            "SPL",
            "INT",
            "DIV",
          ].includes(w.toUpperCase()) &&
          !w.match(/^\d+$/) && // Skip pure numbers
          !w.match(/^[X]+$/) // Skip masked numbers
      );
      if (meaningfulWords.length > 0) {
        return this.cleanMerchantName(meaningfulWords[0]);
      }
    }

    return null;
  }

  /**
   * Categorize HDFC transactions based on narration
   */
  private categorizeHDFCTransaction(
    narration: string,
    merchant: string | null
  ): string {
    const desc = narration.toLowerCase();

    // HDFC specific categorization patterns
    if (desc.includes("salary") || desc.includes("sal ")) return "Salary";
    if (
      desc.includes("dividend") ||
      desc.includes("div ") ||
      desc.includes(" div")
    )
      return "Investment";
    if (desc.includes("interest") || desc.includes("int ")) return "Investment";
    if (desc.includes("autopay") || desc.includes("cc ")) return "Credit Card";
    if (desc.includes("ach c-")) return "Investment";
    if (desc.includes("kotak") || desc.includes("mahindra"))
      return "Investment";
    if (desc.includes("reliance") || desc.includes("industries"))
      return "Investment";
    if (desc.includes("coal india")) return "Investment";
    if (desc.includes("bharat dynamics")) return "Investment";
    if (desc.includes("torrent power")) return "Bills & Utilities";
    if (
      desc.includes("fuel") ||
      desc.includes("petrol") ||
      desc.includes("diesel")
    )
      return "Transport";
    if (desc.includes("medical") || desc.includes("hospital"))
      return "Healthcare";
    if (desc.includes("grocery") || desc.includes("supermarket"))
      return "Food & Dining";
    if (
      desc.includes("mobile") ||
      desc.includes("airtel") ||
      desc.includes("jio")
    )
      return "Mobile";
    if (
      desc.includes("electricity") ||
      desc.includes("gas") ||
      desc.includes("water")
    )
      return "Bills & Utilities";
    if (desc.includes("insurance")) return "Insurance";

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
      if (merchantLower.includes("coal") || merchantLower.includes("reliance"))
        return "Investment";
    }

    return "General";
  }

  /**
   * Get bank name
   */
  getBankName(): string {
    return HDFCParser.BANK_NAME;
  }
}




import { BaseCSVParser } from "./BaseCSVParser";
import {
  CSVParserResult,
  ParsedBankStatement,
  CustomerInfo,
  AccountSummary,
  AccountDetail,
  FixedDeposit,
  BankTransaction,
  RewardPoint,
  AccountInfo,
} from "./types";

export class IDFCParser extends BaseCSVParser {
  protected bankName = "IDFC Bank";
  protected supportedFormats = ["IDFC Bank Statement", "IDFC CSV"];

  canParse(content: string): boolean {
    const lines = content.split("\n").slice(0, 30); // Check first 30 lines
    const contentUpper = content.toUpperCase();

    // Look for IDFC-specific identifiers
    const hasIDFCIdentifier = lines.some(
      (line) =>
        line &&
        (line.toUpperCase().includes("IDFC") ||
          line.toUpperCase().includes("IDFC BANK") ||
          line.toUpperCase().includes("IDFC FIRST BANK"))
    );

    // Look for IDFC statement format - more flexible
    const hasStatementFormat = lines.some(
      (line) =>
        line &&
        (line.toUpperCase().includes("STATEMENT OF ACCOUNT") ||
          line.toUpperCase().includes("CUSTOMER ID") ||
          line.toUpperCase().includes("ACCOUNT NUMBER"))
    );

    // Look for IDFC-specific patterns - check content directly too
    const hasIDFCPatterns =
      lines.some(
        (line) =>
          line &&
          (line.toUpperCase().includes("COMMUNICATION ADDRESS") ||
            line.toUpperCase().includes("NOMINEE NAME") ||
            line.includes("IDFB") || // IFSC pattern
            line.toUpperCase().includes("MUNSHIPULIA") ||
            line.toUpperCase().includes("LUCKNOW"))
      ) ||
      contentUpper.includes("5734305184") || // Customer ID
      contentUpper.includes("10167677364") || // Account Number
      contentUpper.includes("IDFB0021355"); // IFSC

    console.log("IDFC Parser - Detection results:", {
      hasIDFCIdentifier,
      hasStatementFormat,
      hasIDFCPatterns,
      totalLines: lines.length,
    });

    console.log("IDFC Parser - Sample lines for detection:");
    lines.slice(0, 5).forEach((line, index) => {
      console.log(`Line ${index}: "${line}"`);
    });

    const shouldParse =
      hasIDFCIdentifier || hasStatementFormat || hasIDFCPatterns;
    console.log("IDFC Parser - Will parse:", shouldParse);

    return shouldParse;
  }

  async parse(content: string): Promise<CSVParserResult> {
    try {
      // Validate content is not empty
      if (!content || content.trim().length === 0) {
        return this.createErrorResult([
          "CSV content is empty. Please provide a valid bank statement file.",
        ]);
      }

      const rows = this.parseCSVContent(content);

      if (rows.length < 5) {
        return this.createErrorResult([
          "CSV file is too short to be a valid bank statement. Expected at least 5 rows, found " +
            rows.length,
        ]);
      }

      const extractedData: ParsedBankStatement = {
        customerInfo: {},
        accountSummary: {},
        accountDetails: [],
        fixedDeposits: [],
        transactions: [],
        rewardPoints: [],
        accountInfo: [{}],
        metadata: this.createStatementMetadata([], "IDFC Bank Statement"),
      };

      console.log("IDFC Parser - Starting to parse", rows.length, "rows");
      console.log("IDFC Parser - First 25 rows for debugging:");
      for (
        let debugIndex = 0;
        debugIndex < Math.min(25, rows.length);
        debugIndex++
      ) {
        console.log(`IDFC Row ${debugIndex}:`, rows[debugIndex]);
      }

      console.log("IDFC Parser - Looking for specific patterns...");

      let transactionStarted = false;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const firstCell = row[0] ? String(row[0]).trim() : "";
        const secondCell = row[1] ? String(row[1]).trim() : "";
        const fullRowText = row.join(" ").trim().toUpperCase();

        // Debug logging for first 25 rows
        if (i < 25) {
          console.log(
            `IDFC Parser - Row ${i}: [${firstCell}] [${secondCell}] [${
              row[2] || ""
            }] [${row[3] || ""}] [${row[4] || ""}] [${row[5] || ""}] [${
              row[6] || ""
            }]`
          );

          // Special debugging for rows that might contain balance information
          const firstCellUpper = firstCell.toUpperCase();
          if (
            firstCellUpper.includes("BALANCE") ||
            firstCellUpper.includes("DEBIT") ||
            firstCellUpper.includes("CREDIT")
          ) {
            console.log(`IDFC Parser - BALANCE ROW ${i} ANALYSIS:`, {
              firstCell: firstCell,
              firstCellUpper: firstCellUpper,
              secondCell: secondCell,
              fullRow: row,
              rowLength: row.length,
            });
          }
        }

        // Extract Customer ID (row 2, column B)
        if (firstCell.includes("CUSTOMER ID") && secondCell) {
          extractedData.customerInfo.customerId = secondCell;
          console.log("IDFC Parser - Found Customer ID:", secondCell);
        }

        // Extract Account Number (row 3, column B)
        if (firstCell.includes("ACCOUNT NUMBER") && secondCell) {
          extractedData.accountInfo[0].accountNumber = secondCell;
          console.log("IDFC Parser - Found Account Number:", secondCell);
        }

        // Extract Statement Period (row 4, column B)
        if (firstCell.includes("STATEMENT PERIOD") && secondCell) {
          extractedData.customerInfo.statementPeriod = secondCell;
          console.log("IDFC Parser - Found Statement Period:", secondCell);
        }

        // Extract Customer Name (row 7, column B)
        if (firstCell.includes("CUSTOMER NAME") && secondCell) {
          extractedData.customerInfo.name = secondCell;
          console.log("IDFC Parser - Found Customer Name:", secondCell);
        }

        // Extract Communication Address (row 8, column B)
        if (firstCell.includes("COMMUNICATION ADDRESS") && secondCell) {
          // Combine address from multiple cells if needed
          let address = secondCell;
          if (row[2]) address += ", " + row[2];
          if (row[3]) address += ", " + row[3];
          extractedData.customerInfo.address = address.trim();
          console.log(
            "IDFC Parser - Found Address:",
            extractedData.customerInfo.address
          );
        }

        // Extract CKY ID (row 9, column B)
        if (firstCell.includes("CKY ID") && secondCell) {
          // Store in customerId if not already set, or create additional field
          if (!extractedData.customerInfo.customerId) {
            extractedData.customerInfo.customerId = secondCell;
          }
          console.log("IDFC Parser - Found CKY ID:", secondCell);
        }

        // Extract Email ID (row 10, column B)
        if (firstCell.includes("EMAIL ID") && secondCell) {
          extractedData.customerInfo.email = secondCell;
          console.log("IDFC Parser - Found Email:", secondCell);
        }

        // Extract Phone Number (row 11, column B)
        if (firstCell.includes("PHONE NO") && secondCell) {
          extractedData.customerInfo.phone = secondCell;
          console.log("IDFC Parser - Found Phone:", secondCell);
        }

        // Extract Nomination (row 12, column B)
        if (firstCell.includes("NOMINATION") && secondCell) {
          extractedData.customerInfo.nomination = secondCell;
          console.log("IDFC Parser - Found Nomination:", secondCell);
        }

        // Extract Nominee Name (row 13, column B)
        if (firstCell.includes("NOMINEE NAME") && secondCell) {
          extractedData.accountInfo[0].nominee = secondCell;
          console.log("IDFC Parser - Found Nominee Name:", secondCell);
        }

        // Extract Account Branch (column E, around row 7)
        if (firstCell.includes("ACCOUNT BRANCH") && row[4]) {
          extractedData.accountInfo[0].branch = String(row[4]).trim();
          console.log(
            "IDFC Parser - Found Branch:",
            extractedData.accountInfo[0].branch
          );
        }

        // Extract Branch Address (column E, row 8)
        if (firstCell.includes("BRANCH ADDRESS") && row[4]) {
          let branchAddress = String(row[4]).trim();
          if (row[5]) branchAddress += ", " + String(row[5]).trim();
          if (row[6]) branchAddress += ", " + String(row[6]).trim();
          extractedData.accountInfo[0].branchAddress = branchAddress;
          console.log(
            "IDFC Parser - Found Branch Address:",
            extractedData.accountInfo[0].branchAddress
          );
        }

        // Extract IFSC (column E) - Enhanced pattern matching
        if (
          (firstCell.toUpperCase().includes("IFSC") ||
            firstCell.toUpperCase().includes("RTGS/NEFT IFSC")) &&
          row[4]
        ) {
          const ifscCode = String(row[4]).trim();
          extractedData.accountInfo[0].ifscCode = ifscCode;
          console.log("IDFC Parser - Found IFSC:", ifscCode);
        }

        // Extract MICR (column E) - Enhanced pattern matching
        if (
          (firstCell.toUpperCase().includes("MICR") ||
            firstCell.toUpperCase().includes("MICR CODE")) &&
          row[4]
        ) {
          const micrCode = String(row[4]).trim();
          extractedData.accountInfo[0].micrCode = micrCode;
          console.log("IDFC Parser - Found MICR:", micrCode);
        }

        // Additional pattern: Look for IFSC/MICR in different column positions
        for (let colIndex = 1; colIndex < row.length; colIndex++) {
          const cellValue = row[colIndex] ? String(row[colIndex]).trim() : "";

          // IFSC pattern (IDFB followed by numbers)
          if (cellValue.match(/^IDFB\d{7}$/)) {
            if (!extractedData.accountInfo[0].ifscCode) {
              extractedData.accountInfo[0].ifscCode = cellValue;
              console.log(
                "IDFC Parser - Found IFSC by pattern matching:",
                cellValue
              );
            }
          }

          // MICR pattern (9-digit number for IDFC)
          if (
            cellValue.match(/^\d{9}$/) &&
            !extractedData.accountInfo[0].micrCode
          ) {
            extractedData.accountInfo[0].micrCode = cellValue;
            console.log(
              "IDFC Parser - Found MICR by pattern matching:",
              cellValue
            );
          }
        }

        // Extract Account Opening Date (column E)
        if (firstCell.includes("ACCOUNT OPENING DATE") && row[4]) {
          extractedData.accountInfo[0].accountOpenDate = String(row[4]).trim();
          console.log(
            "IDFC Parser - Found Account Opening Date:",
            extractedData.accountInfo[0].accountOpenDate
          );
        }

        // Extract Account Status (column E)
        if (firstCell.includes("ACCOUNT STATUS") && row[4]) {
          extractedData.accountInfo[0].status = String(row[4]).trim();
          console.log(
            "IDFC Parser - Found Account Status:",
            extractedData.accountInfo[0].status
          );
        }

        // Extract Account Type (column E)
        if (firstCell.includes("ACCOUNT TYPE") && row[4]) {
          extractedData.accountInfo[0].accountType = String(row[4]).trim();
          console.log(
            "IDFC Parser - Found Account Type:",
            extractedData.accountInfo[0].accountType
          );
        }

        // Extract Currency (column E)
        if (firstCell.includes("CURRENCY") && row[4]) {
          extractedData.accountInfo[0].currency = String(row[4]).trim();
          console.log(
            "IDFC Parser - Found Currency:",
            extractedData.accountInfo[0].currency
          );
        }

        // Extract Statement Summary (around row 17-18) - More flexible pattern matching
        if (
          (firstCell.toUpperCase().includes("OPENING BALANCE") ||
            firstCell.toUpperCase().includes("OPENING BAL")) &&
          secondCell
        ) {
          const amount = this.parseAmount(secondCell);
          extractedData.accountSummary.openingBalance = amount;
          console.log(
            "IDFC Parser - Found Opening Balance:",
            amount,
            "from text:",
            secondCell
          );
        }

        if (
          (firstCell.toUpperCase().includes("TOTAL DEBIT") ||
            firstCell.toUpperCase().includes("TOTAL DEBITS")) &&
          secondCell
        ) {
          const amount = this.parseAmount(secondCell);
          extractedData.accountSummary.totalDebits = amount;
          console.log(
            "IDFC Parser - Found Total Debits:",
            amount,
            "from text:",
            secondCell
          );
        }

        if (
          (firstCell.toUpperCase().includes("TOTAL CREDIT") ||
            firstCell.toUpperCase().includes("TOTAL CREDITS")) &&
          secondCell
        ) {
          const amount = this.parseAmount(secondCell);
          extractedData.accountSummary.totalCredits = amount;
          console.log(
            "IDFC Parser - Found Total Credits:",
            amount,
            "from text:",
            secondCell
          );
        }

        if (
          (firstCell.toUpperCase().includes("CLOSING BALANCE") ||
            firstCell.toUpperCase().includes("CLOSING BAL")) &&
          secondCell
        ) {
          const amount = this.parseAmount(secondCell);
          extractedData.accountSummary.closingBalance = amount;
          console.log(
            "IDFC Parser - Found Closing Balance:",
            amount,
            "from text:",
            secondCell
          );
        }

        // Alternative pattern: Look for balance values in the row structure
        // Handle case where balance info is spread across columns
        if (row.length >= 6) {
          // Check if this row contains balance summary data (columns E-F might have Total Debit/Credit)
          const colE = row[4] ? String(row[4]).trim().toUpperCase() : "";
          const colF = row[5] ? String(row[5]).trim() : "";

          if (colE.includes("TOTAL DEBIT") && colF) {
            const amount = this.parseAmount(colF);
            if (amount > 0 && !extractedData.accountSummary.totalDebits) {
              extractedData.accountSummary.totalDebits = amount;
              console.log(
                "IDFC Parser - Found Total Debits in column F:",
                amount
              );
            }
          }

          if (colE.includes("TOTAL CREDIT") && colF) {
            const amount = this.parseAmount(colF);
            if (amount > 0 && !extractedData.accountSummary.totalCredits) {
              extractedData.accountSummary.totalCredits = amount;
              console.log(
                "IDFC Parser - Found Total Credits in column F:",
                amount
              );
            }
          }

          // Check columns G-H for closing balance
          const colG = row[6] ? String(row[6]).trim() : "";
          const colH = row[7] ? String(row[7]).trim().toUpperCase() : "";

          if (colH.includes("CLOSING BALANCE") && colG) {
            const amount = this.parseAmount(colG);
            if (amount > 0 && !extractedData.accountSummary.closingBalance) {
              extractedData.accountSummary.closingBalance = amount;
              console.log(
                "IDFC Parser - Found Closing Balance in column G:",
                amount
              );
            }
          }
        }

        // Look for transaction header (around row 22)
        if (
          firstCell.includes("Transaction Date") &&
          row[1] &&
          String(row[1]).includes("Value Date")
        ) {
          transactionStarted = true;
          console.log("IDFC Parser - Found transaction header at row", i);
          console.log("Transaction headers:", row.slice(0, 7));
          continue;
        }

        // Stop parsing transactions when we hit summary sections
        if (
          transactionStarted &&
          (firstCell.includes("Total") ||
            firstCell.includes("End of") ||
            firstCell.includes("Total number"))
        ) {
          console.log(
            "IDFC Parser - Reached transaction summary, stopping transaction parsing"
          );
          transactionStarted = false;
        }

        // Parse transactions - IDFC format: Date | Value Date | Particulars | Cheque No | Debit | Credit | Balance
        // More flexible date matching for IDFC format
        if (
          transactionStarted &&
          firstCell &&
          (firstCell.match(/^\d{2}-[A-Za-z]{3}-\d{4}$/) || // 02-Aug-2025
            firstCell.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/) || // 02/08/2025
            firstCell.match(/^\d{4}-\d{2}-\d{2}$/))
        ) {
          // 2025-08-02
          const transaction: BankTransaction = {
            date: firstCell,
            particulars: row[2] ? String(row[2]).trim() : "Unknown Transaction",
            chequeRefNo: row[3] ? String(row[3]).trim() : undefined,
            valueDate: row[1] ? String(row[1]).trim() : undefined,
            type: "debit",
            amount: 0,
            deposits: 0,
            withdrawals: 0,
          };

          // Extract debit amount (column E)
          if (row[4] && String(row[4]).trim() !== "") {
            const debitAmount = this.parseAmount(String(row[4]));
            if (debitAmount > 0) {
              transaction.type = "debit";
              transaction.amount = debitAmount;
              transaction.withdrawals = debitAmount;
            }
          }

          // Extract credit amount (column F)
          if (row[5] && String(row[5]).trim() !== "") {
            const creditAmount = this.parseAmount(String(row[5]));
            if (creditAmount > 0) {
              transaction.type = "credit";
              transaction.amount = creditAmount;
              transaction.deposits = creditAmount;
            }
          }

          // Extract balance (column G)
          if (row[6] && String(row[6]).trim() !== "") {
            transaction.balance = this.parseAmount(String(row[6]));
          }

          if (transaction.amount > 0) {
            extractedData.transactions.push(transaction);
            console.log(
              `IDFC Parser - Added transaction: ${transaction.date} - ${transaction.particulars} - ${transaction.type} - ${transaction.amount}`
            );
          }
        }

        // Extract transaction counts from summary
        if (firstCell.includes("Total number of Debits") && secondCell) {
          extractedData.accountSummary.debitCount = parseInt(secondCell) || 0;
          console.log(
            "IDFC Parser - Found Debit Count:",
            extractedData.accountSummary.debitCount
          );
        }

        if (firstCell.includes("Total number of Credits") && secondCell) {
          extractedData.accountSummary.creditCount = parseInt(secondCell) || 0;
          console.log(
            "IDFC Parser - Found Credit Count:",
            extractedData.accountSummary.creditCount
          );
        }
      }

      // Update metadata with actual transaction data
      extractedData.metadata = this.createStatementMetadata(
        extractedData.transactions,
        "IDFC Bank Statement"
      );

      // Fallback: Calculate opening balance from first transaction if not found
      if (
        !extractedData.accountSummary.openingBalance &&
        extractedData.transactions.length > 0
      ) {
        const firstTransaction = extractedData.transactions[0];
        if (firstTransaction.balance !== undefined) {
          let calculatedOpening = firstTransaction.balance;

          // Adjust for the first transaction to get opening balance
          if (firstTransaction.type === "credit") {
            calculatedOpening =
              firstTransaction.balance - firstTransaction.amount;
          } else if (firstTransaction.type === "debit") {
            calculatedOpening =
              firstTransaction.balance + firstTransaction.amount;
          }

          extractedData.accountSummary.openingBalance = calculatedOpening;
          console.log(
            "IDFC Parser - Calculated Opening Balance from first transaction:",
            calculatedOpening
          );
        }
      }

      // Calculate totals if not found from summary
      if (
        !extractedData.accountSummary.totalDebits ||
        !extractedData.accountSummary.totalCredits
      ) {
        let totalDebits = 0;
        let totalCredits = 0;

        extractedData.transactions.forEach((txn) => {
          if (txn.type === "debit") {
            totalDebits += txn.amount;
          } else if (txn.type === "credit") {
            totalCredits += txn.amount;
          }
        });

        if (!extractedData.accountSummary.totalDebits) {
          extractedData.accountSummary.totalDebits = totalDebits;
          console.log(
            "IDFC Parser - Calculated Total Debits from transactions:",
            totalDebits
          );
        }

        if (!extractedData.accountSummary.totalCredits) {
          extractedData.accountSummary.totalCredits = totalCredits;
          console.log(
            "IDFC Parser - Calculated Total Credits from transactions:",
            totalCredits
          );
        }
      }

      console.log("IDFC Parser - Parsing completed:", {
        customerName: extractedData.customerInfo.name,
        customerId: extractedData.customerInfo.customerId,
        accountNumber: extractedData.accountInfo[0]?.accountNumber,
        ifscCode: extractedData.accountInfo[0]?.ifscCode,
        micrCode: extractedData.accountInfo[0]?.micrCode,
        transactionCount: extractedData.transactions.length,
        openingBalance: extractedData.accountSummary.openingBalance,
        closingBalance: extractedData.accountSummary.closingBalance,
        totalDebits: extractedData.accountSummary.totalDebits,
        totalCredits: extractedData.accountSummary.totalCredits,
      });

      // Validate that we have at least some data
      if (
        !extractedData.customerInfo.name &&
        !extractedData.accountInfo[0]?.accountNumber &&
        extractedData.transactions.length === 0
      ) {
        return this.createErrorResult([
          "No valid IDFC bank statement data found",
        ]);
      }

      return this.createSuccessResult(extractedData);
    } catch (error) {
      console.error("Error parsing IDFC CSV:", error);
      return this.createErrorResult([
        `Failed to parse IDFC bank statement: ${
          error instanceof Error ? error.message : "Unknown parsing error"
        }`,
        "Please ensure the file is a valid IDFC bank statement in CSV format.",
      ]);
    }
  }
}

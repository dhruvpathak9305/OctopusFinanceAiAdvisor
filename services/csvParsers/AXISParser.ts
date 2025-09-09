import { BaseCSVParser } from './BaseCSVParser';
import { ParsedTransaction, TransactionType } from './types';

export class AXISParser extends BaseCSVParser {
  static readonly BANK_NAME = 'AXIS Bank';
  
  canParse(headers: string[]): boolean {
    const headerStr = headers.join('').toLowerCase();
    return headerStr.includes('axis') || 
           (headerStr.includes('tran date') && headerStr.includes('cr/dr'));
  }

  async parseCSV(csvData: string[][]): Promise<ParsedTransaction[]> {
    const transactions: ParsedTransaction[] = [];
    if (csvData.length < 2) return transactions;

    const headers = csvData[0];
    const headerMap = this.createHeaderMap(headers);
    
    for (let i = 1; i < csvData.length; i++) {
      const transaction = this.parseRow(csvData[i], headerMap);
      if (transaction) transactions.push(transaction);
    }

    return transactions;
  }

  private createHeaderMap(headers: string[]) {
    const map: any = {};
    headers.forEach((header, index) => {
      const h = header.toLowerCase();
      if (h.includes('tran date') || h.includes('date')) map.date = index;
      if (h.includes('description') || h.includes('particulars')) map.description = index;
      if (h.includes('cr/dr') || h.includes('amount')) map.amount = index;
      if (h.includes('balance')) map.balance = index;
      if (h.includes('chq/ref')) map.reference = index;
    });
    return map;
  }

  private parseRow(row: string[], headerMap: any): ParsedTransaction | null {
    if (!row || row.every(cell => !cell?.trim())) return null;

    const dateStr = row[headerMap.date];
    if (!dateStr) return null;

    const date = this.parseDate(dateStr);
    if (!date) return null;

    const description = row[headerMap.description] || 'AXIS Transaction';
    const amountStr = row[headerMap.amount];
    if (!amountStr) return null;

    const amount = this.parseAmount(amountStr.replace(/[^\d.-]/g, ''));
    if (amount === 0) return null;

    // AXIS uses Cr/Dr indicators or negative amounts
    const type: TransactionType = amountStr.includes('Cr') || amount > 0 ? 'income' : 'expense';

    return {
      date: date.toISOString().split('T')[0],
      description: description.trim(),
      amount: Math.abs(amount),
      type,
      merchant: this.extractMerchant(description) || 'AXIS Transaction',
      category: 'General',
      balance: this.parseAmount(row[headerMap.balance]),
      reference_number: row[headerMap.reference],
      bank: 'AXIS Bank'
    };
  }

  private extractMerchant(description: string): string | null {
    if (!description) return null;
    const patterns = [/UPI-(.+?)-/, /POS-(.+?)-/, /ATM-(.+?)-/, /NEFT-(.+?)-/];
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match?.[1]) return this.cleanMerchantName(match[1]);
    }
    return null;
  }

  getBankName(): string {
    return AXISParser.BANK_NAME;
  }
}

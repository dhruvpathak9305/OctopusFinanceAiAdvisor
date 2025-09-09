import { BaseCSVParser } from './BaseCSVParser';
import { ParsedTransaction, TransactionType } from './types';

export class KOTAKParser extends BaseCSVParser {
  static readonly BANK_NAME = 'Kotak Mahindra Bank';
  
  canParse(headers: string[]): boolean {
    const headerStr = headers.join('').toLowerCase();
    return headerStr.includes('kotak') || 
           (headerStr.includes('transaction date') && headerStr.includes('withdrawal amt'));
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
      if (h.includes('transaction date') || h.includes('date')) map.date = index;
      if (h.includes('description') || h.includes('particulars')) map.description = index;
      if (h.includes('withdrawal amt') || h.includes('debit')) map.debit = index;
      if (h.includes('deposit amt') || h.includes('credit')) map.credit = index;
      if (h.includes('balance')) map.balance = index;
      if (h.includes('init.br') || h.includes('branch')) map.branch = index;
    });
    return map;
  }

  private parseRow(row: string[], headerMap: any): ParsedTransaction | null {
    if (!row || row.every(cell => !cell?.trim())) return null;

    const dateStr = row[headerMap.date];
    if (!dateStr) return null;

    const date = this.parseDate(dateStr);
    if (!date) return null;

    const description = row[headerMap.description] || 'KOTAK Transaction';
    const creditAmount = this.parseAmount(row[headerMap.credit]);
    const debitAmount = this.parseAmount(row[headerMap.debit]);

    if (creditAmount === 0 && debitAmount === 0) return null;

    const type: TransactionType = creditAmount > 0 ? 'income' : 'expense';
    const amount = creditAmount > 0 ? creditAmount : debitAmount;

    return {
      date: date.toISOString().split('T')[0],
      description: description.trim(),
      amount,
      type,
      merchant: this.extractMerchant(description) || 'KOTAK Transaction',
      category: 'General',
      balance: this.parseAmount(row[headerMap.balance]),
      bank: 'Kotak Mahindra Bank'
    };
  }

  private extractMerchant(description: string): string | null {
    if (!description) return null;
    const patterns = [/UPI-(.+?)-/, /POS (.+?) /, /ATM (.+?) /, /NET BANKING (.+?) /];
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match?.[1]) return this.cleanMerchantName(match[1]);
    }
    return null;
  }

  getBankName(): string {
    return KOTAKParser.BANK_NAME;
  }
}

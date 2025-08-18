import { ParserFactory as IParserFactory, CSVParser } from './types';
import { ICICIParser } from './ICICIParser';
import { HDFCParser } from './HDFCParser';

export class ParserFactory implements IParserFactory {
  private static instance: ParserFactory;
  private parsers: CSVParser[];

  private constructor() {
    this.parsers = [
      new ICICIParser(),
      new HDFCParser(),
      // Add more bank parsers here as they are implemented
      // new SBIParser(),
      // new AxisParser(),
    ];
  }

  public static getInstance(): ParserFactory {
    if (!ParserFactory.instance) {
      ParserFactory.instance = new ParserFactory();
    }
    return ParserFactory.instance;
  }

  getParser(content: string): CSVParser | null {
    // Try each parser to see which one can handle this content
    for (const parser of this.parsers) {
      if (parser.canParse(content)) {
        return parser;
      }
    }
    
    // If no specific parser matches, return null
    // You could implement a generic parser here as fallback
    return null;
  }

  getSupportedBanks(): string[] {
    return this.parsers.map(parser => parser.getBankName());
  }

  getAllParsers(): CSVParser[] {
    return [...this.parsers];
  }

  addParser(parser: CSVParser): void {
    // Check if parser already exists
    const exists = this.parsers.some(p => p.getBankName() === parser.getBankName());
    if (!exists) {
      this.parsers.push(parser);
    }
  }

  removeParser(bankName: string): boolean {
    const initialLength = this.parsers.length;
    this.parsers = this.parsers.filter(p => p.getBankName() !== bankName);
    return this.parsers.length < initialLength;
  }

  getParserByBankName(bankName: string): CSVParser | null {
    return this.parsers.find(p => p.getBankName() === bankName) || null;
  }
}

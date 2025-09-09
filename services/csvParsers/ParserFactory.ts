import { ParserFactory as IParserFactory, CSVParser } from "./types";
import { ICICIParser } from "./ICICIParser";
import { HDFCParser } from "./HDFCParser";
import { IDFCParser } from "./IDFCParser";
import { AXISParser } from "./AXISParser";
import { KOTAKParser } from "./KOTAKParser";

export class ParserFactory implements IParserFactory {
  private static instance: ParserFactory;
  private parsers: CSVParser[];

  private constructor() {
    this.parsers = [
      // Order matters: More specific parsers should come first
      new IDFCParser(), // IDFC has very specific patterns, check first
      new ICICIParser(), // ICICI has specific patterns
      new AXISParser(), // AXIS Bank parser
      new KOTAKParser(), // Kotak Mahindra Bank parser
      new HDFCParser(), // HDFC is more generic, check last
      // Add more bank parsers here as they are implemented
      // new SBIParser(),
    ];
  }

  public static getInstance(): ParserFactory {
    if (!ParserFactory.instance) {
      ParserFactory.instance = new ParserFactory();
    }
    return ParserFactory.instance;
  }

  getParser(content: string): CSVParser | null {
    console.log("ParserFactory - Checking parsers for content...");

    // Try each parser to see which one can handle this content
    for (const parser of this.parsers) {
      console.log(`ParserFactory - Testing ${parser.getBankName()} parser...`);
      if (parser.canParse(content)) {
        console.log(`ParserFactory - Selected ${parser.getBankName()} parser!`);
        return parser;
      }
    }

    console.log("ParserFactory - No parser matched, returning null");
    // If no specific parser matches, return null
    // You could implement a generic parser here as fallback
    return null;
  }

  getSupportedBanks(): string[] {
    return this.parsers.map((parser) => parser.getBankName());
  }

  getAllParsers(): CSVParser[] {
    return [...this.parsers];
  }

  addParser(parser: CSVParser): void {
    // Check if parser already exists
    const exists = this.parsers.some(
      (p) => p.getBankName() === parser.getBankName()
    );
    if (!exists) {
      this.parsers.push(parser);
    }
  }

  removeParser(bankName: string): boolean {
    const initialLength = this.parsers.length;
    this.parsers = this.parsers.filter((p) => p.getBankName() !== bankName);
    return this.parsers.length < initialLength;
  }

  getParserByBankName(bankName: string): CSVParser | null {
    return this.parsers.find((p) => p.getBankName() === bankName) || null;
  }
}

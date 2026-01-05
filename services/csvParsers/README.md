# CSV Parser System for Bank Statements

A modular, extensible, and testable CSV parser system designed to handle bank statements from various banks in React Native applications.

## Features

- **Modular Design**: Easy to add new bank parsers
- **Automatic Detection**: Automatically detects bank format and selects appropriate parser
- **Comprehensive Parsing**: Extracts customer info, account details, transactions, fixed deposits, and more
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Error Handling**: Robust error handling with detailed error messages
- **Testing**: Comprehensive test coverage for all components
- **React Native Ready**: Designed specifically for React Native applications

## Supported Banks

Currently supports:
- **ICICI Bank** - Full support for ICICI bank statement format

## Architecture

```
services/csvParsers/
├── types.ts                 # Type definitions and interfaces
├── BaseCSVParser.ts         # Abstract base class for all parsers
├── ICICIParser.ts          # ICICI Bank specific parser
├── ParserFactory.ts        # Factory to select appropriate parser
├── CSVParserService.ts     # Main service integrating with existing system
├── index.ts                # Main export file
└── __tests__/              # Test files
```

## Quick Start

### Basic Usage

```typescript
import CSVParserService from './services/csvParsers';

// Get the service instance
const parserService = CSVParserService.getInstance();

// Parse a bank statement
const result = await parserService.parseBankStatement(csvContent);

if (result.success) {
  console.log('Bank:', result.data?.metadata.bankName);
  console.log('Transactions:', result.data?.transactions.length);
} else {
  console.error('Parsing failed:', result.errors);
}
```

### Integration with Existing System

```typescript
import CSVParserService from './services/csvParsers';

// Parse for transactions compatible with existing system
const transactionResult = await parserService.parseForTransactions(csvContent);

if (transactionResult.success) {
  // Use with existing transaction system
  console.log('Parsed transactions:', transactionResult.transactions);
}
```

## Adding New Bank Support

### 1. Create a New Parser

Create a new parser class extending `BaseCSVParser`:

```typescript
import { BaseCSVParser } from './BaseCSVParser';
import { CSVParserResult, ParsedBankStatement } from './types';

export class HDFCParser extends BaseCSVParser {
  protected bankName = 'HDFC Bank';
  protected supportedFormats = ['HDFC Bank Statement', 'HDFC CSV'];

  canParse(content: string): boolean {
    // Implement logic to detect HDFC format
    return content.includes('HDFC') || content.includes('HDFC BANK');
  }

  async parse(content: string): Promise<CSVParserResult> {
    try {
      // Implement HDFC-specific parsing logic
      const rows = this.parseCSVContent(content);
      
      // Extract data according to HDFC format
      const extractedData: ParsedBankStatement = {
        // ... populate with extracted data
      };

      return this.createSuccessResult(extractedData);
    } catch (error) {
      return this.createErrorResult([`Failed to parse HDFC CSV: ${error}`]);
    }
  }
}
```

### 2. Register the Parser

Add your new parser to the `ParserFactory`:

```typescript
// In ParserFactory.ts
import { HDFCParser } from './HDFCParser';

private constructor() {
  this.parsers = [
    new ICICIParser(),
    new HDFCParser(), // Add your new parser here
  ];
}
```

### 3. Test Your Parser

Create comprehensive tests for your parser:

```typescript
// In __tests__/HDFCParser.test.ts
describe('HDFCParser', () => {
  it('should identify HDFC bank statements correctly', () => {
    const hdfcContent = 'HDFC BANK,STATEMENT OF ACCOUNT';
    expect(parser.canParse(hdfcContent)).toBe(true);
  });

  it('should parse HDFC statements correctly', async () => {
    // Test your parsing logic
  });
});
```

## API Reference

### CSVParserService

#### `parseBankStatement(content: string): Promise<CSVParserResult>`

Parses CSV content and returns detailed bank statement data.

**Returns:**
- `success`: Boolean indicating if parsing was successful
- `data`: Parsed bank statement data (if successful)
- `errors`: Array of error messages (if failed)
- `warnings`: Array of warning messages

#### `parseForTransactions(content: string): Promise<ParsingResult>`

Parses CSV content and returns transactions compatible with existing system.

**Returns:**
- `success`: Boolean indicating if parsing was successful
- `transactions`: Array of parsed transactions
- `totalAmount`: Total amount of all transactions
- `dateRange`: Date range of transactions

#### `getSupportedBanks(): string[]`

Returns list of supported bank names.

#### `isBankSupported(content: string): boolean`

Checks if a specific bank format is supported.

#### `getParserInfo(bankName: string)`

Returns parser information for a specific bank.

### ParsedBankStatement

The main data structure containing all parsed information:

```typescript
interface ParsedBankStatement {
  customerInfo: CustomerInfo;           // Customer details
  accountSummary: AccountSummary;       // Account balances and summary
  accountDetails: AccountDetail[];      // Detailed account information
  fixedDeposits: FixedDeposit[];       // Fixed deposit details
  transactions: BankTransaction[];      // Transaction history
  rewardPoints: RewardPoint[];         // Reward points information
  accountInfo: AccountInfo[];          // Account metadata
  metadata: StatementMetadata;         // Statement metadata
}
```

## React Native Component

Use the `BankStatementViewer` component to display parsed data:

```typescript
import BankStatementViewer from './src/mobile/components/BankStatementViewer';

<BankStatementViewer
  data={parsedData}
  onSaveTransactions={(transactions) => {
    // Handle saving transactions
  }}
  onExport={(data) => {
    // Handle exporting data
  }}
/>
```

## Testing

Run tests for the CSV parser system:

```bash
# Run all CSV parser tests
npm test services/csvParsers

# Run specific test files
npm test ICICIParser.test.ts
npm test ParserFactory.test.ts
npm test CSVParserService.test.ts
```

## Error Handling

The system provides comprehensive error handling:

- **Parser Detection Errors**: When no suitable parser is found
- **Parsing Errors**: When CSV content cannot be parsed
- **Validation Errors**: When parsed data is invalid
- **Format Errors**: When CSV format is not supported

## Performance Considerations

- Parsers are lightweight and efficient
- CSV content is processed line by line to minimize memory usage
- Parsers are cached in the factory for reuse
- Large files are handled gracefully with proper error handling

## Contributing

When adding support for new banks:

1. **Follow the existing pattern** - Extend `BaseCSVParser`
2. **Add comprehensive tests** - Cover all parsing scenarios
3. **Update documentation** - Add bank-specific format examples
4. **Handle edge cases** - Consider various CSV formats and data variations
5. **Maintain backward compatibility** - Don't break existing functionality

## Future Enhancements

- **Generic Parser**: Fallback parser for unknown formats
- **AI-Powered Parsing**: Integration with AI services for better parsing
- **Batch Processing**: Support for multiple files
- **Export Formats**: Support for exporting to various formats
- **Real-time Validation**: Live validation during parsing
- **Performance Metrics**: Parsing speed and accuracy metrics

## Support

For issues or questions:
1. Check the test files for usage examples
2. Review the type definitions for data structures
3. Ensure your CSV format matches the expected structure
4. Test with sample data from your bank

## License

This CSV parser system is part of the Octopus Organizer project.

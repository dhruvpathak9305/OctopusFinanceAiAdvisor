# OpenAI Integration for Bank Statement Parsing

This document describes the OpenAI integration that enhances the bank statement parsing capabilities of the OctopusFinanceAIAdvisor application.

## Overview

The OpenAI integration provides intelligent parsing of bank statement files (CSV, PDF, Excel, Word) using AI-powered text analysis. When enabled, it can extract transaction details with high accuracy and automatically categorize transactions based on merchant names and descriptions.

## Features

- **AI-Powered Parsing**: Uses OpenAI's GPT model to intelligently parse various file formats
- **Automatic Categorization**: Automatically categorizes transactions based on merchant patterns
- **Fallback Support**: Falls back to traditional parsing if AI parsing fails
- **Error Handling**: Graceful error handling ensures the app never breaks
- **Configurable**: Can be enabled/disabled per parsing request

## Architecture

### Services

1. **OpenAIService** (`services/openaiService.ts`)
   - Handles OpenAI API communication
   - Manages API key and configuration
   - Provides CSV parsing with AI

2. **ConfigService** (`services/configService.ts`)
   - Manages application configuration
   - Provides access to OpenAI settings
   - Handles environment variables

3. **BankStatementParserService** (`services/bankStatementParserService.ts`)
   - Main parsing service
   - Integrates with OpenAI service
   - Provides fallback parsing

### Configuration

The OpenAI integration is configured through environment variables or app configuration:

```javascript
// Environment variables
EXPO_PUBLIC_OPENAI_API_KEY=your_api_key_here
EXPO_PUBLIC_OPENAI_BASE_URL=https://openrouter.ai/api/v1
EXPO_PUBLIC_SITE_URL=https://yourdomain.com
EXPO_PUBLIC_SITE_NAME=YourAppName

// App config (app.config.js)
extra: {
  openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'default_key',
  openaiBaseUrl: process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
  openaiSiteUrl: process.env.EXPO_PUBLIC_SITE_URL || 'https://yourdomain.com',
  openaiSiteName: process.env.EXPO_PUBLIC_SITE_NAME || 'YourAppName',
}
```

## Usage

### Basic Usage

```typescript
import BankStatementParserService from '../services/bankStatementParserService';

const parser = BankStatementParserService.getInstance();

// Parse with AI enabled (default)
const result = await parser.parseStatement(csvContent, 'csv', {
  useAI: true, // Enable AI parsing
  autoCategorize: true,
  mergeDuplicates: true,
  validateAmounts: true,
});

// Parse with AI disabled
const result = await parser.parseStatement(csvContent, 'csv', {
  useAI: false, // Disable AI parsing
  autoCategorize: true,
});
```

### Direct OpenAI Service Usage

```typescript
import OpenAIService from '../services/openaiService';

const openaiService = OpenAIService.getInstance();

// Check if service is available
if (openaiService.isAvailable()) {
  const result = await openaiService.parseCSVWithAI(csvContent, 'statement.csv');
  
  if (result.success) {
    console.log(`Parsed ${result.transactions.length} transactions`);
  } else {
    console.log('AI parsing failed, use fallback:', result.error);
  }
}
```

## API Response Format

The OpenAI service returns transactions in this format:

```typescript
interface ParsedTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  account: string;
  merchant?: string;
  reference?: string;
  balance?: number;
}
```

## Error Handling

The integration includes comprehensive error handling:

1. **API Failures**: Falls back to traditional parsing
2. **Invalid Responses**: Validates and filters out invalid transactions
3. **Network Issues**: Graceful degradation
4. **Configuration Errors**: Clear error messages

## Testing

### Unit Tests

```bash
# Run OpenAI service tests
npm test services/__tests__/openaiService.test.ts
```

### Manual Testing

```bash
# Run the test script
node scripts/testOpenAI.ts
```

## Security Considerations

1. **API Key Protection**: API keys are stored in environment variables
2. **Request Validation**: All AI responses are validated before use
3. **Fallback Safety**: Traditional parsing ensures app functionality
4. **Error Logging**: Failed requests are logged for debugging

## Performance

- **Response Time**: AI parsing typically takes 2-5 seconds
- **Fallback Speed**: Traditional parsing is nearly instant
- **Caching**: No caching implemented (can be added for production)
- **Rate Limiting**: Respects OpenAI API rate limits

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Check environment variables
   - Verify API key format
   - Ensure account has credits

2. **Network Errors**
   - Check internet connection
   - Verify base URL is accessible
   - Check firewall settings

3. **Parsing Failures**
   - Review CSV format
   - Check file encoding
   - Verify file content

### Debug Mode

Enable debug logging by checking the console for:
- Service initialization messages
- API request/response logs
- Fallback usage notifications

## Future Enhancements

1. **Batch Processing**: Process multiple files simultaneously
2. **Caching**: Cache parsed results for repeated files
3. **Custom Models**: Support for fine-tuned models
4. **Multi-language**: Support for non-English statements
5. **Advanced Categorization**: Machine learning-based categorization

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify configuration settings
3. Test with the provided test script
4. Review the error handling documentation

## License

This integration follows the same license as the main application.


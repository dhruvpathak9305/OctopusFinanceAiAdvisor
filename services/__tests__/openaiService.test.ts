import OpenAIService from '../openaiService';

// Mock the OpenAI package
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify([
                {
                  date: '2024-01-15',
                  description: 'Salary Deposit',
                  amount: 5000.00,
                  type: 'credit',
                  category: 'Income',
                  merchant: 'Company Name',
                  reference: 'REF123'
                }
              ])
            }
          }]
        })
      }
    }
  }))
}));

// Mock the config service
jest.mock('../configService', () => ({
  default: {
    getInstance: jest.fn().mockReturnValue({
      getOpenAIConfig: jest.fn().mockReturnValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://test.openai.com',
        siteUrl: 'https://test.com',
        siteName: 'TestApp'
      })
    })
  }
}));

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(() => {
    service = OpenAIService.getInstance();
    jest.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = OpenAIService.getInstance();
    const instance2 = OpenAIService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize successfully with valid config', async () => {
    const status = service.getStatus();
    expect(status.initialized).toBe(false);
    
    // Trigger initialization by calling a method
    await service.parseCSVWithAI('test csv content');
    
    const updatedStatus = service.getStatus();
    expect(updatedStatus.initialized).toBe(true);
    expect(updatedStatus.available).toBe(true);
  });

  it('should parse CSV content successfully', async () => {
    const csvContent = 'Date,Description,Amount\n2024-01-15,Salary,5000';
    const result = await service.parseCSVWithAI(csvContent, 'test.csv');
    
    expect(result.success).toBe(true);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].description).toBe('Salary Deposit');
    expect(result.transactions[0].amount).toBe(5000);
    expect(result.transactions[0].type).toBe('credit');
    expect(result.fallbackUsed).toBe(false);
  });

  it('should handle parsing errors gracefully', async () => {
    // Mock OpenAI to throw an error
    const mockOpenAI = require('openai').default;
    mockOpenAI.mockImplementationOnce(() => ({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('API Error'))
        }
      }
    }));

    const service2 = OpenAIService.getInstance();
    const result = await service2.parseCSVWithAI('test content');
    
    expect(result.success).toBe(false);
    expect(result.transactions).toHaveLength(0);
    expect(result.error).toBe('API Error');
    expect(result.fallbackUsed).toBe(true);
  });

  it('should validate and transform transaction data correctly', async () => {
    const csvContent = 'Date,Description,Amount\n2024-01-15,Test Transaction,100';
    const result = await service.parseCSVWithAI(csvContent);
    
    expect(result.success).toBe(true);
    expect(result.transactions[0].id).toMatch(/^ai_parsed_/);
    expect(result.transactions[0].account).toBe('ai_parsed_statement');
  });
});

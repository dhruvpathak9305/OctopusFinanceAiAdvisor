import { LlamaService } from '../llamaService';
import { LLAMA_ERROR_MESSAGES } from '@/config/llama';

// Mock fetch
global.fetch = jest.fn();

describe('LlamaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully generate a response with default model', async () => {
    const mockResponse = { response: 'Test response' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];

    const result = await LlamaService.generateResponse(messages);

    expect(result.content).toBe('Test response');
    expect(result.error).toBeUndefined();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls[0][1].body).toContain('llama2');
  });

  it('should successfully generate a response with a custom model', async () => {
    const mockResponse = { response: 'Test response for GPT-4' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const messages = [
      { role: 'user', content: 'Hello' },
    ];

    const result = await LlamaService.generateResponse(messages, 'gpt-4');

    expect(result.content).toBe('Test response for GPT-4');
    expect(result.error).toBeUndefined();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls[0][1].body).toContain('gpt-4');
  });

  it('should handle connection errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    const messages = [{ role: 'user', content: 'Hello' }];
    const result = await LlamaService.generateResponse(messages);

    expect(result.content).toBe('');
    expect(result.error).toBe(LLAMA_ERROR_MESSAGES.CONNECTION_ERROR);
  });

  it('should handle timeout errors', async () => {
    const controller = new AbortController();
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      controller.abort();
      return Promise.reject(new Error('AbortError'));
    });

    const messages = [{ role: 'user', content: 'Hello' }];
    const result = await LlamaService.generateResponse(messages);

    expect(result.content).toBe('');
    expect(result.error).toBe(LLAMA_ERROR_MESSAGES.TIMEOUT_ERROR);
  });

  it('should handle HTTP errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const messages = [{ role: 'user', content: 'Hello' }];
    const result = await LlamaService.generateResponse(messages);

    expect(result.content).toBe('');
    expect(result.error).toBe(LLAMA_ERROR_MESSAGES.UNKNOWN_ERROR);
  });

  it('should retry on failure', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ response: 'Retry successful' }),
      });

    const messages = [{ role: 'user', content: 'Hello' }];
    const result = await LlamaService.generateResponse(messages);

    expect(result.content).toBe('Retry successful');
    expect(result.error).toBeUndefined();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
}); 
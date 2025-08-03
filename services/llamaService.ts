import { LLAMA_CONFIG, LLAMA_ERROR_MESSAGES } from '@/config/llama';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LlamaResponse {
  content: string;
  error?: string;
}

// Get API endpoint at runtime - simplified for Jest compatibility
const getApiEndpoint = (): string => {
  // Always use the default endpoint for now, can be extended later
  return LLAMA_CONFIG.API_ENDPOINT;
};

export class LlamaService {
  private static async makeRequest(
    endpoint: string,
    body: any,
    timeout: number = LLAMA_CONFIG.TIMEOUT_MS
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private static async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = LLAMA_CONFIG.MAX_RETRIES
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff: wait 2^attempt seconds
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  static async generateResponse(
    messages: ChatMessage[],
    model: string = 'llama3.1:8b'
  ): Promise<LlamaResponse> {
    const apiEndpoint = getApiEndpoint();
    
    try {
      return await this.retryRequest(async () => {
        const response = await this.makeRequest(`${apiEndpoint}/api/generate`, {
          model,
          prompt: this.formatMessagesForLlama(messages),
          stream: false,
          options: {
            temperature: LLAMA_CONFIG.TEMPERATURE,
            num_predict: LLAMA_CONFIG.MAX_TOKENS,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Model "${model}" not found. Please check if the model is available.`);
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        return {
          content: data.response || 'No response generated.',
        };
      });
    } catch (error) {
      console.error('LlamaService error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { content: '', error: LLAMA_ERROR_MESSAGES.TIMEOUT_ERROR };
        }
        if (error.message.includes('fetch')) {
          return { content: '', error: LLAMA_ERROR_MESSAGES.CONNECTION_ERROR };
        }
        return { content: '', error: error.message };
      }
      
      return { content: '', error: LLAMA_ERROR_MESSAGES.UNKNOWN_ERROR };
    }
  }

  private static formatMessagesForLlama(messages: ChatMessage[]): string {
    return messages
      .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
      .join('\n\n') + '\n\nAssistant:';
  }
} 
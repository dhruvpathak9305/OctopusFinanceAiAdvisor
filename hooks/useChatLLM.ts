import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model?: string;
  endpoint?: string;
  initialMessages?: Message[];
}

export function useChatLLM({
  model = 'llama3.1:8b',
  endpoint = '/api/chat',
  initialMessages = []
}: ChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [...messages, { role: 'user', content }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const newMessages = [
        ...messages,
        { role: 'user', content },
        { role: 'assistant', content: data.response }
      ];
      
      setMessages(newMessages);
      return data.response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [messages, model, endpoint]);

  const clearMessages = useCallback(() => {
    setMessages(initialMessages);
    setError(null);
  }, [initialMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
}

export default useChatLLM; 
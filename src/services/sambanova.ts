interface SambaNovaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SambaNovaResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

interface SambaNovaStreamResponse {
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
  }>;
}

class SambaNovaService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_SAMBANOVA_API_KEY || '';
    this.apiUrl = process.env.NEXT_PUBLIC_SAMBANOVA_API_URL || 'https://api.sambanova.ai/v1/chat/completions';
  }

  async sendMessage(userMessage: string, conversationHistory: SambaNovaMessage[] = []): Promise<string> {
    try {
      const systemMessage: SambaNovaMessage = {
        role: "system",
        content:
          "You are a helpful AI health assistant named MediPal. You help users with healthcare questions, medical information, and navigating healthcare services. Be empathetic, professional, and provide accurate health guidance while always advising users to consult healthcare professionals for serious concerns.",
      };

      const messages: SambaNovaMessage[] = [
        systemMessage,
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'Meta-Llama-3.2-3B-Instruct', // You can change this to the model you prefer
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`SambaNova API error: ${response.status} ${response.statusText}`);
      }

      const data: SambaNovaResponse = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        throw new Error('No response from SambaNova API');
      }
    } catch (error) {
      console.error('Error calling SambaNova API:', error);
      
      // Fallback response if API fails
      return "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment, or contact support if the issue persists.";
    }
  }

  async *sendMessageStream(
    userMessage: string, 
    conversationHistory: SambaNovaMessage[] = []
  ): AsyncGenerator<string, void, unknown> {
    try {
      const systemMessage: SambaNovaMessage = {
        role: "system",
        content:
          "You are a helpful AI health assistant named MediPal. You help users with healthcare questions, medical information, and navigating healthcare services. Be empathetic, professional, and provide accurate health guidance while always advising users to consult healthcare professionals for serious concerns.",
      };

      const messages: SambaNovaMessage[] = [
        systemMessage,
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'Meta-Llama-3.2-3B-Instruct',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
          stream: true, // Enable streaming
        }),
      });

      if (!response.ok) {
        throw new Error(`SambaNova API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                return;
              }

              try {
                const parsed: SambaNovaStreamResponse = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  yield content;
                }
              } catch {
                // Skip invalid JSON lines
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error streaming from SambaNova API:', error);
      yield "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.";
    }
  }
}

export const sambaNovaService = new SambaNovaService(); 
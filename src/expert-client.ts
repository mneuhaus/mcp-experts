import { Config, ExpertConfig, ConsultExpertRequest, ExpertResponse } from './types.js';

export class ExpertClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async consultExpert(expertId: string, request: ConsultExpertRequest): Promise<ExpertResponse> {
    const expert = this.config.experts[expertId];
    if (!expert) {
      throw new Error(`Expert '${expertId}' not found in configuration`);
    }

    try {
      const response = await this.callLLM(expert, request);
      
      return {
        expert: expert.name,
        response: response,
      };
    } catch (error) {
      throw new Error(`Failed to consult ${expert.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async callLLM(expert: ExpertConfig, request: ConsultExpertRequest): Promise<string> {
    // For now, we'll use a simple fetch-based approach
    // In production, you'd want to use LiteLLM's Python API or a Node.js equivalent
    
    const [provider, model] = expert.model.split('/', 2);
    const providerConfig = this.config.providers[provider];
    
    if (!providerConfig) {
      throw new Error(`Provider '${provider}' not configured`);
    }

    // Build the messages array
    const messages = [
      {
        role: 'system',
        content: expert.system_prompt
      },
      {
        role: 'user',
        content: this.buildUserMessage(request)
      }
    ];

    // For now, we'll implement a simple OpenAI-compatible API call
    // This would need to be extended to support different providers
    if (provider === 'openai') {
      return await this.callOpenAI(providerConfig, model, messages);
    } else if (provider === 'anthropic') {
      return await this.callAnthropic(providerConfig, model, messages);
    } else if (provider === 'ollama') {
      return await this.callOllama(providerConfig, model, messages);
    } else {
      throw new Error(`Provider '${provider}' not supported yet`);
    }
  }

  private buildUserMessage(request: ConsultExpertRequest): string {
    let message = `Problem: ${request.problem}`;
    
    if (request.context) {
      message += `\n\nContext: ${request.context}`;
    }
    
    if (request.images && request.images.length > 0) {
      message += `\n\nImages provided: ${request.images.length} image(s)`;
      // Note: Image handling would need to be implemented based on the provider's capabilities
    }
    
    return message;
  }

  private async callOpenAI(providerConfig: any, model: string, messages: any[]): Promise<string> {
    const response = await fetch(`${providerConfig.base_url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${providerConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }

  private async callAnthropic(providerConfig: any, model: string, messages: any[]): Promise<string> {
    // Extract system message
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': providerConfig.api_key,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model.replace('anthropic/', ''),
        system: systemMessage,
        messages: userMessages,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.content[0].text;
  }

  private async callOllama(providerConfig: any, model: string, messages: any[]): Promise<string> {
    const response = await fetch(`${providerConfig.base_url}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.replace('ollama/', ''),
        messages: messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.message.content;
  }

  getAvailableExperts(): Record<string, ExpertConfig> {
    return this.config.experts;
  }
}
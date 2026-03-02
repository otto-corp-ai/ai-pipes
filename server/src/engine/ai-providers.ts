import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AICallParams {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}

interface AICallResult {
  output: string;
  inputTokens: number;
  outputTokens: number;
}

export async function callOpenAI(apiKey: string, params: AICallParams): Promise<AICallResult> {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: params.model,
    messages: [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: params.userPrompt },
    ],
    temperature: params.temperature,
    max_tokens: params.maxTokens,
  });
  return {
    output: response.choices[0]?.message?.content || '',
    inputTokens: response.usage?.prompt_tokens || 0,
    outputTokens: response.usage?.completion_tokens || 0,
  };
}

export async function callAnthropic(apiKey: string, params: AICallParams): Promise<AICallResult> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: params.model,
    max_tokens: params.maxTokens,
    system: params.systemPrompt,
    messages: [{ role: 'user', content: params.userPrompt }],
    temperature: params.temperature,
  });
  const textBlock = response.content.find(b => b.type === 'text');
  return {
    output: textBlock ? textBlock.text : '',
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

export async function callGoogle(apiKey: string, params: AICallParams): Promise<AICallResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: params.model,
    systemInstruction: params.systemPrompt,
    generationConfig: {
      temperature: params.temperature,
      maxOutputTokens: params.maxTokens,
    },
  });
  const result = await model.generateContent(params.userPrompt);
  const response = result.response;
  const usage = response.usageMetadata;
  return {
    output: response.text(),
    inputTokens: usage?.promptTokenCount || 0,
    outputTokens: usage?.candidatesTokenCount || 0,
  };
}

export async function callAI(provider: string, apiKey: string, params: AICallParams): Promise<AICallResult> {
  switch (provider) {
    case 'openai': return callOpenAI(apiKey, params);
    case 'anthropic': return callAnthropic(apiKey, params);
    case 'google': return callGoogle(apiKey, params);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

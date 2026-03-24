/**
 * Shared types for the token-kit sample app.
 */

/** A single chat message displayed in the UI */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: number;
  stats?: MessageStats;
}

/** Stats attached to an assistant response */
export interface MessageStats {
  model: string;
  promptTokens: number;
  completionTokens: number;
  tokensDeducted: number;
  latencyMs: number;
}

/** Aggregated session statistics */
export interface SessionStats {
  totalRequests: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokensUsed: number;
  totalTokensDeducted: number;
  totalLatencyMs: number;
  averageLatencyMs: number;
  userBalance: number | null;
  lastModel: string | null;
}

/** Supported LLM models (matches SUPPORTED_MODELS in token-kit backend) */
export const AVAILABLE_MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', tier: 'Economy (1.0×)' },
  { id: 'gpt-4o', label: 'GPT-4o', tier: 'Mid-tier (2.0×)' },
  { id: 'claude-3.5-haiku', label: 'Claude 3.5 Haiku', tier: 'Economy (1.0×)' },
  { id: 'claude-sonnet-4', label: 'Claude Sonnet 4', tier: 'Premium (3.0×)' },
  { id: 'nova-micro', label: 'Amazon Nova Micro', tier: 'Economy (1.0×)' },
  { id: 'nova-lite', label: 'Amazon Nova Lite', tier: 'Economy (1.0×)' },
] as const;

export type ModelId = (typeof AVAILABLE_MODELS)[number]['id'];

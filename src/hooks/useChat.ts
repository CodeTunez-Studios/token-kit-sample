/**
 * useChat — Sends a chat message via the token-kit SDK and updates app state.
 *
 * Copy this hook into your own app as a starting point for SDK integration.
 */

import { useCallback } from 'react';
import TokenKit from '@codetunezstudios/token-kit';
import { useTokenKit } from '../context/TokenKitContext';
import type { ChatMessage, MessageStats } from '../types';

/** Generate a simple unique ID */
const uid = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useChat = () => {
  const { state, addMessage, setLoading, updateStats } = useTokenKit();

  const sendMessage = useCallback(
    async (prompt: string) => {
      const { apiKey, userToken, environment, baseUrl, model, temperature, maxTokens, systemInstructions, stats } = state;

      // Add the user message to the chat
      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
      };
      addMessage(userMsg);
      setLoading(true);

      try {
        // Build the SDK config. A named environment takes priority over a custom
        // base URL; if neither is set the SDK defaults to production.
        const tkConfig: ConstructorParameters<typeof TokenKit>[0] = { apiKey };
        if (environment) tkConfig.environment = environment as 'production' | 'staging' | 'development';
        else if (baseUrl) tkConfig.baseUrl = baseUrl;

        const tk = new TokenKit(tkConfig);

        const startTime = performance.now();

        // Build history from prior turns when multi-turn is enabled
        const history = state.multiTurn
          ? state.messages
              .filter((m) => m.role === 'user' || m.role === 'assistant')
              .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
          : [];

        const messages = [
          ...(systemInstructions.trim()
            ? [{ role: 'system' as const, content: systemInstructions.trim() }]
            : []),
          ...history,
          { role: 'user' as const, content: prompt },
        ];

        const response = await tk.chat(userToken, messages, {
          model,
          maxTokens,
          temperature,
        });

        const latencyMs = Math.round(performance.now() - startTime);

        const msgStats: MessageStats = {
          model: response.model,
          promptTokens: response.tokensUsed.prompt,
          completionTokens: response.tokensUsed.completion,
          tokensDeducted: response.tokensDeducted,
          latencyMs,
        };

        const assistantMsg: ChatMessage = {
          id: uid(),
          role: 'assistant',
          content: response.message.content,
          timestamp: Date.now(),
          stats: msgStats,
        };
        addMessage(assistantMsg);

        const newTotalRequests = stats.totalRequests + 1;
        const newTotalLatency = stats.totalLatencyMs + latencyMs;

        updateStats({
          totalRequests: newTotalRequests,
          totalPromptTokens: stats.totalPromptTokens + response.tokensUsed.prompt,
          totalCompletionTokens: stats.totalCompletionTokens + response.tokensUsed.completion,
          totalTokensUsed: stats.totalTokensUsed + response.tokensUsed.total,
          totalTokensDeducted: stats.totalTokensDeducted + response.tokensDeducted,
          totalLatencyMs: newTotalLatency,
          averageLatencyMs: Math.round(newTotalLatency / newTotalRequests),
          userBalance: response.userBalance ?? stats.userBalance,
          lastModel: response.model,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        const errorMsg: ChatMessage = {
          id: uid(),
          role: 'error',
          content: message,
          timestamp: Date.now(),
        };
        addMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [state, addMessage, setLoading, updateStats]
  );

  return { sendMessage, loading: state.loading };
};

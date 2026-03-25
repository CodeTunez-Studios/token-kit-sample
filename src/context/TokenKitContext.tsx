/**
 * TokenKitContext — Global state for the sample app.
 *
 * Holds SDK credentials, chat history, and session stats in one place.
 * Uses useReducer for predictable state updates — a pattern you can copy
 * directly into your own app.
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { getStoredUserToken } from '@codetunezstudios/token-kit';
import type { ChatMessage, SessionStats, ModelId } from '../types';

export type AppEnvironment = '' | 'production' | 'staging' | 'development';

/** Which ai-tokens.me instance the connect popup will open. */
export type PortalTarget = 'production' | 'local';

export const PORTAL_URLS: Record<PortalTarget, string> = {
  production: 'https://ai-tokens.me',
  local: 'http://localhost:3001',
};

/** Status of the portal connect popup flow. */
export type ConnectStatus = 'idle' | 'connecting' | 'connected';

interface State {
  /** Developer API key */
  apiKey: string;
  /** App clientId — used with connectViaPortal({ clientId }) */
  clientId: string;
  /** End-user token */
  userToken: string;
  /** Which portal to open for the connect flow */
  portalTarget: PortalTarget;
  /** Status of the connect popup flow */
  connectStatus: ConnectStatus;
  /**
   * Named environment shorthand passed to the SDK.
   * Empty string means "default" — baseUrl is used instead.
   */
  environment: AppEnvironment;
  /** API base URL override — only used when environment is empty (default) */
  baseUrl: string;
  /** Selected LLM model */
  model: ModelId;
  /** Temperature (0–2) */
  temperature: number;
  /** Max tokens in response */
  maxTokens: number;
  /** System instructions prepended to every request */
  systemInstructions: string;
  /** Whether to send full conversation history with each request */
  multiTurn: boolean;
  /** Chat messages */
  messages: ChatMessage[];
  /** Whether a request is in flight */
  loading: boolean;
  /** Session-level statistics */
  stats: SessionStats;
}

const initialStats: SessionStats = {
  totalRequests: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  totalTokensUsed: 0,
  totalTokensDeducted: 0,
  totalLatencyMs: 0,
  averageLatencyMs: 0,
  userBalance: null,
  lastModel: null,
};

const initialState: State = {
  apiKey: '',
  clientId: '',
  userToken: '',
  portalTarget: 'production',
  connectStatus: 'idle',
  environment: '',
  baseUrl: '',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 500,
  systemInstructions: '',
  multiTurn: false,
  messages: [],
  loading: false,
  stats: initialStats,
};

type Action =
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_CLIENT_ID'; payload: string }
  | { type: 'SET_USER_TOKEN'; payload: string }
  | { type: 'SET_PORTAL_TARGET'; payload: PortalTarget }
  | { type: 'SET_CONNECT_STATUS'; payload: ConnectStatus }
  | { type: 'SET_ENVIRONMENT'; payload: AppEnvironment }
  | { type: 'SET_BASE_URL'; payload: string }
  | { type: 'SET_MODEL'; payload: ModelId }
  | { type: 'SET_TEMPERATURE'; payload: number }
  | { type: 'SET_MAX_TOKENS'; payload: number }
  | { type: 'SET_SYSTEM_INSTRUCTIONS'; payload: string }
  | { type: 'SET_MULTI_TURN'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_STATS'; payload: Partial<SessionStats> }
  | { type: 'CLEAR_CHAT' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };
    case 'SET_CLIENT_ID':
      return { ...state, clientId: action.payload };
    case 'SET_USER_TOKEN':
      return { ...state, userToken: action.payload };
    case 'SET_PORTAL_TARGET':
      return { ...state, portalTarget: action.payload };
    case 'SET_CONNECT_STATUS':
      return { ...state, connectStatus: action.payload };
    case 'SET_ENVIRONMENT':
      return { ...state, environment: action.payload };
    case 'SET_BASE_URL':
      return { ...state, baseUrl: action.payload };
    case 'SET_MODEL':
      return { ...state, model: action.payload };
    case 'SET_TEMPERATURE':
      return { ...state, temperature: action.payload };
    case 'SET_MAX_TOKENS':
      return { ...state, maxTokens: action.payload };
    case 'SET_SYSTEM_INSTRUCTIONS':
      return { ...state, systemInstructions: action.payload };
    case 'SET_MULTI_TURN':
      return { ...state, multiTurn: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } };
    case 'CLEAR_CHAT':
      return { ...state, messages: [], stats: initialStats };
    default:
      return state;
  }
}

interface TokenKitContextValue {
  state: State;
  setApiKey: (key: string) => void;
  setClientId: (id: string) => void;
  setUserToken: (token: string) => void;
  setPortalTarget: (target: PortalTarget) => void;
  setConnectStatus: (status: ConnectStatus) => void;
  setEnvironment: (env: AppEnvironment) => void;
  setBaseUrl: (url: string) => void;
  setModel: (model: ModelId) => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (max: number) => void;
  setSystemInstructions: (instructions: string) => void;
  setMultiTurn: (enabled: boolean) => void;
  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  updateStats: (stats: Partial<SessionStats>) => void;
  clearChat: () => void;
}

const TokenKitContext = createContext<TokenKitContextValue | null>(null);

export const TokenKitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore a previously connected user token from localStorage on mount
  useEffect(() => {
    const stored = getStoredUserToken();
    if (stored) {
      dispatch({ type: 'SET_USER_TOKEN', payload: stored });
      dispatch({ type: 'SET_CONNECT_STATUS', payload: 'connected' });
    }
  }, []);

  const setApiKey = useCallback((key: string) => dispatch({ type: 'SET_API_KEY', payload: key }), []);
  const setClientId = useCallback((id: string) => dispatch({ type: 'SET_CLIENT_ID', payload: id }), []);
  const setUserToken = useCallback((token: string) => dispatch({ type: 'SET_USER_TOKEN', payload: token }), []);
  const setPortalTarget = useCallback((target: PortalTarget) => dispatch({ type: 'SET_PORTAL_TARGET', payload: target }), []);
  const setConnectStatus = useCallback((status: ConnectStatus) => dispatch({ type: 'SET_CONNECT_STATUS', payload: status }), []);
  const setEnvironment = useCallback((env: AppEnvironment) => dispatch({ type: 'SET_ENVIRONMENT', payload: env }), []);
  const setBaseUrl = useCallback((url: string) => dispatch({ type: 'SET_BASE_URL', payload: url }), []);
  const setModel = useCallback((model: ModelId) => dispatch({ type: 'SET_MODEL', payload: model }), []);
  const setTemperature = useCallback((temp: number) => dispatch({ type: 'SET_TEMPERATURE', payload: temp }), []);
  const setMaxTokens = useCallback((max: number) => dispatch({ type: 'SET_MAX_TOKENS', payload: max }), []);
  const setSystemInstructions = useCallback((instructions: string) => dispatch({ type: 'SET_SYSTEM_INSTRUCTIONS', payload: instructions }), []);
  const setMultiTurn = useCallback((enabled: boolean) => dispatch({ type: 'SET_MULTI_TURN', payload: enabled }), []);
  const addMessage = useCallback((msg: ChatMessage) => dispatch({ type: 'ADD_MESSAGE', payload: msg }), []);
  const setLoading = useCallback((loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }), []);
  const updateStats = useCallback((stats: Partial<SessionStats>) => dispatch({ type: 'UPDATE_STATS', payload: stats }), []);
  const clearChat = useCallback(() => dispatch({ type: 'CLEAR_CHAT' }), []);

  const value: TokenKitContextValue = {
    state,
    setApiKey,
    setClientId,
    setUserToken,
    setPortalTarget,
    setConnectStatus,
    setEnvironment,
    setBaseUrl,
    setModel,
    setTemperature,
    setMaxTokens,
    setSystemInstructions,
    setMultiTurn,
    addMessage,
    setLoading,
    updateStats,
    clearChat,
  };

  return (
    <TokenKitContext.Provider value={value}>
      {children}
    </TokenKitContext.Provider>
  );
};

export const useTokenKit = (): TokenKitContextValue => {
  const context = useContext(TokenKitContext);
  if (!context) {
    throw new Error('useTokenKit must be used within a TokenKitProvider');
  }
  return context;
};

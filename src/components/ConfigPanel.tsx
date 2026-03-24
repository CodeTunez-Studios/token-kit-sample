import React from 'react';
import { useTokenKit } from '../context/TokenKitContext';
import type { AppEnvironment } from '../context/TokenKitContext';
import { AVAILABLE_MODELS, ModelId } from '../types';

/** Sidebar form for SDK credentials and request options. */
export const ConfigPanel: React.FC = () => {
  const {
    state,
    setApiKey,
    setUserToken,
    setEnvironment,
    setBaseUrl,
    setModel,
    setTemperature,
    setMaxTokens,
    setMultiTurn,
  } = useTokenKit();

  const isConfigured = state.apiKey.length > 0 && state.userToken.length > 0;
  const usingNamedEnv = state.environment !== '';

  return (
    <div className="card">
      <h2 className="card-title">API Parameters</h2>

      <div className="form-group">
        <label htmlFor="apiKey">Developer Key</label>
        <input
          id="apiKey"
          type="text"
          placeholder="dev_xxxxxxxx..."
          value={state.apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label htmlFor="userToken">User Token</label>
        <input
          id="userToken"
          type="text"
          placeholder="ut_xxxxxxxx..."
          value={state.userToken}
          onChange={(e) => setUserToken(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label htmlFor="environment">Environment</label>
        <select
          id="environment"
          value={state.environment}
          onChange={(e) => setEnvironment(e.target.value as AppEnvironment)}
        >
          <option value="">Default (Base URL available)</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
      </div>

      {/* Base URL is disabled when a named environment is selected */}
      <div
        className="form-group"
        style={usingNamedEnv ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
      >
        <label htmlFor="baseUrl">API Base URL {usingNamedEnv ? '(overridden by environment)' : '(optional)'}</label>
        <input
          id="baseUrl"
          type="url"
          placeholder="https://api.token-kit.com/v1"
          value={state.baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="model">Model</label>
        <select
          id="model"
          value={state.model}
          onChange={(e) => setModel(e.target.value as ModelId)}
        >
          {AVAILABLE_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} — {m.tier}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="temperature">Temperature: {state.temperature.toFixed(1)}</label>
        <input
          id="temperature"
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={state.temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label htmlFor="maxTokens">Max Tokens: {state.maxTokens}</label>
        <input
          id="maxTokens"
          type="range"
          min="50"
          max="4000"
          step="50"
          value={state.maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={state.multiTurn}
            onChange={(e) => setMultiTurn(e.target.checked)}
          />
          <span>Multi-turn</span>
        </label>
        <span className="form-hint">Send full conversation history with each request</span>
      </div>

      {/* Connection indicator */}
      <div
        className={`connection-status ${isConfigured ? 'connected' : 'disconnected'}`}
        style={{ marginTop: '0.875rem' }}
      >
        <span className="status-dot" />
        {isConfigured ? 'Ready to send' : 'Enter credentials above'}
      </div>
    </div>
  );
};

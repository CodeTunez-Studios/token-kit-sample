import React, { useCallback, useState } from 'react';
import {
  connectViaPortal,
  clearStoredUserToken,
  TokenKitConnectCancelledError,
} from '@codetunezstudios/token-kit';
import { useTokenKit } from '../context/TokenKitContext';
import type { AppEnvironment, PortalTarget } from '../context/TokenKitContext';
import { PORTAL_URLS } from '../context/TokenKitContext';
import { AVAILABLE_MODELS, ModelId } from '../types';

/** Sidebar form for SDK credentials and request options. */
export const ConfigPanel: React.FC = () => {
  const {
    state,
    setApiKey,
    setClientId,
    setUserToken,
    setPortalTarget,
    setConnectStatus,
    setEnvironment,
    setBaseUrl,
    setModel,
    setMultiTurn,
  } = useTokenKit();

  const usingNamedEnv = state.environment !== '';
  const isConnected = state.connectStatus === 'connected';
  const isConnecting = state.connectStatus === 'connecting';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(state.userToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [state.userToken]);

  const handleConnect = useCallback(async () => {
    if (!state.clientId.trim()) {
      alert('Enter your Client ID before connecting.');
      return;
    }
    setConnectStatus('connecting');
    try {
      const token = await connectViaPortal({
        clientId: state.clientId.trim(),
        portalUrl: PORTAL_URLS[state.portalTarget],
      });
      setUserToken(token);
      setConnectStatus('connected');
    } catch (err) {
      if (err instanceof TokenKitConnectCancelledError) {
        // User closed the popup — silently revert to idle
        setConnectStatus('idle');
      } else {
        console.error('Connect error:', err);
        setConnectStatus('idle');
        alert('Connection failed. Check the console for details.');
      }
    }
  }, [state.clientId, state.portalTarget, setConnectStatus, setUserToken]);

  const handleDisconnect = useCallback(() => {
    clearStoredUserToken();
    setUserToken('');
    setConnectStatus('idle');
  }, [setUserToken, setConnectStatus]);

  return (
    <div className="card">
      <h2 className="card-title">API Parameters</h2>

      <div className="form-group">
        <label htmlFor="apiKey">Developer (API) Key</label>
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
        <label htmlFor="environment">tool-kit Environment</label>
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
        <label htmlFor="clientId">Client ID</label>
        <input
          id="clientId"
          type="text"
          placeholder="app_xxxxxxxxxxxxxxxx"
          value={state.clientId}
          onChange={(e) => setClientId(e.target.value)}
          autoComplete="off"
          disabled={isConnected}
        />
      </div>

      <div className="form-group">
        <label>Multi-turn</label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={state.multiTurn}
            onChange={(e) => setMultiTurn(e.target.checked)}
          />
          <span>Send full conversation history each turn</span>
        </label>
      </div>

      {/* ── Connect Section ────────────────────────────────── */}
      <div className="connect-section">
        <div className="connect-section-header">
          <span className="card-title" style={{ margin: 0 }}>User Token</span>
          {isConnected && (
            <span className="connect-badge">connected</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="portalTarget">AI Tokens Portal</label>
          <select
            id="portalTarget"
            value={state.portalTarget}
            onChange={(e) => setPortalTarget(e.target.value as PortalTarget)}
            disabled={isConnected}
          >
            <option value="production">Production — ai-tokens.me</option>
            <option value="local">Local</option>
          </select>
        </div>

        {isConnected ? (
          <>
            <div className="connect-token-row">
              <span className="connect-token-preview" title={state.userToken}>
                {state.userToken.slice(0, 14)}••••
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleCopy}
                title="Copy full token"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              style={{ marginTop: '0.5rem' }}
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-accent btn-block"
            style={{ marginTop: '0.75rem' }}
            onClick={handleConnect}
            disabled={isConnecting || !state.clientId.trim()}
          >
            {isConnecting ? 'Opening portal…' : 'Connect via portal'}
          </button>
        )}

        {/* Manual override — useful when a token is already known */}
        {!isConnected && (
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label htmlFor="userToken">Or paste user token manually</label>
            <input
              id="userToken"
              type="text"
              placeholder="ut_xxxxxxxx..."
              value={state.userToken}
              onChange={(e) => setUserToken(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}
      </div>

    </div>
  );
};

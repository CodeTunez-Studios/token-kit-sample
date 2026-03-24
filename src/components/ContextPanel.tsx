/**
 * ContextPanel — Shows the conversation history being sent to the model
 * when multi-turn mode is enabled.
 */

import React from 'react';
import { useTokenKit } from '../context/TokenKitContext';

export const ContextPanel: React.FC = () => {
  const { state } = useTokenKit();

  const history = state.messages.filter(
    (m) => m.role === 'user' || m.role === 'assistant' || m.role === 'error'
  );

  return (
    <div className="card context-panel">
      <h2 className="card-title">Context Window</h2>
      <p className="context-panel-hint">
        These messages are sent with every request.
      </p>

      {state.systemInstructions.trim() && (
        <div className="context-entry context-entry-system">
          <span className="context-entry-role">system</span>
          <span className="context-entry-content">
            {state.systemInstructions.trim()}
          </span>
        </div>
      )}

      {history.length === 0 ? (
        <p className="context-panel-empty">No messages yet.</p>
      ) : (
        <div className="context-entries">
          {history.map((m) => (
            <div
              key={m.id}
              className={`context-entry context-entry-${m.role}`}
            >
              <span className="context-entry-role">
                {m.role === 'error' ? 'error — not sent' : m.role}
              </span>
              <span className="context-entry-content">{m.content}</span>
            </div>
          ))}
        </div>
      )}

      <div className="context-panel-footer">
        <span className="context-token-count">
          {history.length} turn{history.length !== 1 ? 's' : ''}
          {state.systemInstructions.trim() ? ' + system' : ''}
        </span>
      </div>
    </div>
  );
};

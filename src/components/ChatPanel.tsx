import React, { useState, useRef, useEffect } from 'react';
import { useTokenKit } from '../context/TokenKitContext';
import { useChat } from '../hooks/useChat';

type Tab = 'chat' | 'system';

/**
 * ChatPanel — Main chat interface with a pivot control.
 *
 * "Chat" tab: conversation messages + prompt input.
 * "System Instructions" tab: free-text system prompt sent with every request.
 */
export const ChatPanel: React.FC = () => {
  const { state, clearChat, setSystemInstructions } = useTokenKit();
  const { sendMessage, loading } = useChat();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const isConfigured = state.apiKey.length > 0 && state.userToken.length > 0;
  const canSend = isConfigured && input.trim().length > 0 && !loading;

  // Always scroll to bottom when messages change
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.messages]);

  const handleSend = async () => {
    if (!canSend) return;
    const prompt = input.trim();
    setInput('');
    await sendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card chat-panel">
      {/* Pivot tabs */}
      <div className="chat-tabs">
        <button
          className={`chat-tab ${activeTab === 'chat' ? 'chat-tab-active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`chat-tab ${activeTab === 'system' ? 'chat-tab-active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System Instructions
          {state.systemInstructions.trim() && <span className="chat-tab-dot" />}
        </button>
      </div>

      {activeTab === 'chat' ? (
        <>
          {/* Messages area */}
          {state.messages.length === 0 ? (
            <div className="chat-empty">
              <p>
                Configure your credentials in the sidebar, then type a message to
                start chatting with the LLM via token-kit.
              </p>
            </div>
          ) : (
            <div className="chat-messages" ref={messagesContainerRef}>
              {state.messages.map((msg) => (
                <div key={msg.id} className={`message message-${msg.role}`}>
                  <span className="message-role">
                    {msg.role === 'error' ? '⚠ error' : msg.role}
                    {msg.role === 'user' && (
                      <button
                        className="edit-prompt-btn"
                        title="Edit prompt"
                        onClick={() => setInput(msg.content)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    )}
                  </span>
                  <div className="message-bubble">{msg.content}</div>
                  {msg.stats && (
                    <div className="message-stats">
                      <span>{msg.stats.model}</span>
                      <span>↑ {msg.stats.promptTokens} / ↓ {msg.stats.completionTokens}</span>
                      <span>Cost: {msg.stats.tokensDeducted} TK</span>
                      <span>{msg.stats.latencyMs}ms</span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="message message-assistant">
                  <span className="message-role">assistant</span>
                  <div className="message-bubble">
                    <span className="spinner" /> Thinking…
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input area */}
          <div className="chat-input-area">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConfigured ? 'Prompt (Enter to send)' : 'Configure credentials first'}
              disabled={!isConfigured || loading}
              rows={1}
            />
            <div className="chat-input-area-buttons">
              <button
                className="btn btn-accent"
                onClick={handleSend}
                disabled={!canSend}
              >
                {loading ? 'Sent' : 'Send'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={clearChat}
                disabled={state.messages.length === 0}
                title="Clear conversation"
              >
                Clear
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="system-instructions-panel">
          <p className="system-instructions-hint">
            These instructions are prepended as a system message on every request. Leave blank to omit.
          </p>
          <textarea
            className="system-instructions-input"
            value={state.systemInstructions}
            onChange={(e) => setSystemInstructions(e.target.value)}
            placeholder="e.g. You are a helpful assistant that responds only in bullet points."
            spellCheck
          />
          <div className="system-instructions-actions">
            <button
              className="btn btn-ghost"
              onClick={() => setSystemInstructions('')}
              disabled={!state.systemInstructions.trim()}
            >
              Clear Instructions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

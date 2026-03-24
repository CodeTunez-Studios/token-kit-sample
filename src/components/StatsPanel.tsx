import React from 'react';
import { useTokenKit } from '../context/TokenKitContext';

/** Displays aggregated session statistics. */
export const StatsPanel: React.FC = () => {
  const { state } = useTokenKit();
  const { stats } = state;

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="card stats-bar">
      <span className="stats-bar-title">Session Stats</span>

      <div className="stat-item">
        <span className="stat-label">Requests</span>
        <span className="stat-value">{stats.totalRequests}</span>
      </div>

      <div className="stat-item">
        <span className="stat-label">Avg Latency</span>
        <span className="stat-value">
          {stats.totalRequests > 0 ? `${stats.averageLatencyMs}ms` : '—'}
        </span>
      </div>

      <div className="stat-sep" />

      <div className="stat-item">
        <span className="stat-label">Prompt</span>
        <span className="stat-value">{fmt(stats.totalPromptTokens)}</span>
      </div>

      <div className="stat-item">
        <span className="stat-label">Completion</span>
        <span className="stat-value">{fmt(stats.totalCompletionTokens)}</span>
      </div>

      <div className="stat-item">
        <span className="stat-label">LLM Total</span>
        <span className="stat-value">{fmt(stats.totalTokensUsed)}</span>
      </div>

      <div className="stat-item">
        <span className="stat-label">TK Deducted</span>
        <span className="stat-value warning">{fmt(stats.totalTokensDeducted)}</span>
      </div>

      <div className="stat-sep" />

      <div className="stat-item">
        <span className="stat-label">Balance</span>
        <span className={`stat-value ${stats.userBalance !== null ? 'accent' : ''}`}>
          {stats.userBalance !== null ? fmt(stats.userBalance) : '—'}
        </span>
      </div>

      <div className="stat-item">
        <span className="stat-label">Last Model</span>
        <span className="stat-value">{stats.lastModel ?? '—'}</span>
      </div>
    </div>
  );
};

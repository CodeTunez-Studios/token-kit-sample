import React from 'react';
import { TokenKitProvider, useTokenKit } from './context/TokenKitContext';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { ChatPanel } from './components/ChatPanel';
import { StatsPanel } from './components/StatsPanel';
import { ContextPanel } from './components/ContextPanel';
import './App.css';

const AppLayout: React.FC = () => {
  const { state } = useTokenKit();
  return (
    <div className="app">
      <Header />
      <main className="main">
        <div className={`layout${state.multiTurn ? ' layout-multiturn' : ''}`}>
          <aside className="sidebar">
            <ConfigPanel />
          </aside>
          <section className="content">
            <ChatPanel />
          </section>
          {state.multiTurn && (
            <aside className="context-column">
              <ContextPanel />
            </aside>
          )}
          <div className="stats-row">
            <StatsPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <TokenKitProvider>
    <AppLayout />
  </TokenKitProvider>
);

export default App;

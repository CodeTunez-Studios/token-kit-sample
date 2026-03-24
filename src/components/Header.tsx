import React from 'react';

/**
 * Header — App title bar with links to SDK docs / npm.
 */
export const Header: React.FC = () => (
  <header className="header">
    <div className="header-brand">
      <h1>token-kit</h1>
      <span>sample app</span>
    </div>
    <nav className="header-links">
      <a
        href="https://www.npmjs.com/package/@codetunezstudios/token-kit"
        target="_blank"
        rel="noopener noreferrer"
      >
        npm
      </a>
      <a
        href="https://github.com/codetunez-studios/token-kit"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    </nav>
  </header>
);

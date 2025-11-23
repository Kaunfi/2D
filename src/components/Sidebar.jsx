import React from 'react';

const icons = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6" />
      <line x1="20" y1="20" x2="16.65" y2="16.65" />
    </svg>
  ),
  portfolio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7V5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5V7" />
      <rect x="4" y="7" width="16" height="13" rx="2" />
      <path d="M14 12h4" />
    </svg>
  ),
  stats: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 9 9 13 13 20 6" />
      <polyline points="20 10 20 6 16 6" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
    </svg>
  ),
};

const menuItems = [
  { key: 'search', label: 'Recherche', icon: icons.search },
  { key: 'portfolio', label: 'Portefeuille', icon: icons.portfolio },
  { key: 'stats', label: 'Stats', icon: icons.stats },
];

function Sidebar({ activePage, onNavigate, isCollapsed, onToggle }) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <span className="sidebar__brand">nltr</span>
      </div>
      <nav className="sidebar__nav">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`sidebar__link ${activePage === item.key ? 'is-active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="sidebar__icon" aria-hidden="true">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar__footer">
        <button className="sidebar__toggle" onClick={onToggle} aria-label="Basculer le menu">
          <span className="sidebar__toggle-arrow">{isCollapsed ? '›' : '‹'}</span>
          <span className="sidebar__toggle-text">{isCollapsed ? 'Ouvrir le menu' : 'Fermer le menu'}</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

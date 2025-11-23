import React from 'react';

const menuItems = [
  { key: 'search', label: 'Recherche' },
  { key: 'portfolio', label: 'Portefeuille' },
  { key: 'stats', label: 'Stats' },
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
            <div className="sidebar__pill" />
            <span>{item.label}</span>
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

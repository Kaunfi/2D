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
        <button className="sidebar__toggle" onClick={onToggle} aria-label="Basculer le menu">
          {isCollapsed ? '›' : '‹'}
        </button>
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
    </aside>
  );
}

export default Sidebar;

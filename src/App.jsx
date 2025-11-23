import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import SearchPage from './components/SearchPage.jsx';
import PortfolioPage from './components/PortfolioPage.jsx';
import './styles/app.css';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const DAY_MS = 24 * 60 * 60 * 1000;

const defaultPortfolio = [];

function App() {
  const [activePage, setActivePage] = useState('search');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('portfolio');
    return saved ? JSON.parse(saved) : defaultPortfolio;
  });
  const [lastRefresh, setLastRefresh] = useState(() => {
    const saved = localStorage.getItem('lastRefresh');
    return saved ? Number(saved) : 0;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('lastRefresh', String(lastRefresh));
  }, [lastRefresh]);

  const tokenIds = useMemo(() => portfolio.map((token) => token.id), [portfolio]);

  const fetchPrices = async () => {
    if (!tokenIds.length) return;
    setIsRefreshing(true);
    setError('');

    try {
      const idsParam = tokenIds.join(',');
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`,
      );
      if (!response.ok) {
        throw new Error('Impossible de récupérer les prix actuels.');
      }
      const data = await response.json();

      setPortfolio((prev) =>
        prev.map((token) => ({
          ...token,
          currentPrice: data[token.id]?.usd ?? token.currentPrice ?? 0,
          change24h: data[token.id]?.usd_24h_change ?? token.change24h ?? 0,
        })),
      );
      setLastRefresh(Date.now());
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour des prix.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => {
      fetchPrices();
    }, DAY_MS);

    return () => clearInterval(interval);
  }, [tokenIds.join(',')]);

  const handleAddToken = (token) => {
    if (portfolio.some((entry) => entry.id === token.id)) {
      return;
    }
    setPortfolio((prev) => [
      ...prev,
      {
        ...token,
        quantity: 0,
        invested: 0,
        buyPrice: 0,
        currentPrice: token.currentPrice ?? 0,
        change24h: 0,
      },
    ]);
    setActivePage('portfolio');
  };

  const updateHolding = (id, field, value) => {
    setPortfolio((prev) =>
      prev.map((token) => (token.id === id ? { ...token, [field]: value } : token)),
    );
  };

  const removeToken = (id) => {
    setPortfolio((prev) => prev.filter((token) => token.id !== id));
  };

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />
      <main className="content">
        <header className="content__header">
          <div className="content__title">
            <h1>Crypto Portfolio</h1>
            <p>Gérez vos actifs et suivez leur valeur en temps réel.</p>
          </div>
          <div className="content__actions">
            <button className="refresh-button" onClick={fetchPrices} disabled={isRefreshing}>
              {isRefreshing ? 'Actualisation…' : 'Actualiser les prix'}
            </button>
            <span className="refresh-info">
              Dernière actualisation :
              {lastRefresh
                ? ` ${new Date(lastRefresh).toLocaleString()}`
                : ' aucune donnée encore'}
            </span>
          </div>
        </header>
        {error && <div className="error-banner">{error}</div>}
        {activePage === 'search' ? (
          <SearchPage onAddToken={handleAddToken} existingIds={tokenIds} />
        ) : (
          <PortfolioPage
            portfolio={portfolio}
            onUpdate={updateHolding}
            onRemove={removeToken}
          />
        )}
      </main>
    </div>
  );
}

export default App;

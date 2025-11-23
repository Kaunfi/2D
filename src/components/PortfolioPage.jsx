import React, { useMemo } from 'react';

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(
    Number(value) || 0,
  );
}

function PortfolioRow({ token, onUpdate, onRemove }) {
  const totalValue = (Number(token.quantity) || 0) * (Number(token.currentPrice) || 0);
  const invested = Number(token.invested) || 0;
  const profit = totalValue - invested;

  return (
    <div className="portfolio-row">
      <div className="portfolio-row__asset">
        {token.image && <img src={token.image} alt={token.name} />}
        <div>
          <div className="portfolio-row__name">{token.name}</div>
          <div className="portfolio-row__symbol">{token.symbol}</div>
        </div>
      </div>
      <div className="portfolio-row__inputs">
        <label>
          Quantité
          <input
            type="number"
            min="0"
            value={token.quantity}
            onChange={(e) => onUpdate(token.id, 'quantity', e.target.value)}
          />
        </label>
        <label>
          Montant investi
          <input
            type="number"
            min="0"
            value={token.invested}
            onChange={(e) => onUpdate(token.id, 'invested', e.target.value)}
          />
        </label>
        <label>
          Prix d'achat
          <input
            type="number"
            min="0"
            value={token.buyPrice}
            onChange={(e) => onUpdate(token.id, 'buyPrice', e.target.value)}
          />
        </label>
      </div>
      <div className="portfolio-row__metrics">
        <div>
          <span className="metric-label">Prix actuel</span>
          <strong>{token.currentPrice ? formatCurrency(token.currentPrice) : '—'}</strong>
          <span className={`chip ${token.change24h >= 0 ? 'chip--positive' : 'chip--negative'}`}>
            {token.change24h ? `${token.change24h.toFixed(2)}%` : '0%'}
          </span>
        </div>
        <div>
          <span className="metric-label">Valeur totale</span>
          <strong>{formatCurrency(totalValue)}</strong>
        </div>
        <div>
          <span className="metric-label">P/L</span>
          <strong className={profit >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(profit)}
          </strong>
        </div>
      </div>
      <button className="ghost" onClick={() => onRemove(token.id)} aria-label="Supprimer">
        ✕
      </button>
    </div>
  );
}

function PortfolioPage({ portfolio, onUpdate, onRemove }) {
  const totals = useMemo(() => {
    const currentValue = portfolio.reduce(
      (sum, token) => sum + (Number(token.quantity) || 0) * (Number(token.currentPrice) || 0),
      0,
    );
    const investedValue = portfolio.reduce((sum, token) => sum + (Number(token.invested) || 0), 0);
    return { currentValue, investedValue, profit: currentValue - investedValue };
  }, [portfolio]);

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2>Portefeuille</h2>
          <p>Gérez vos positions et suivez leurs performances.</p>
        </div>
        <div className="totals">
          <div>
            <span className="metric-label">Valeur actuelle</span>
            <strong>{formatCurrency(totals.currentValue)}</strong>
          </div>
          <div>
            <span className="metric-label">Investi</span>
            <strong>{formatCurrency(totals.investedValue)}</strong>
          </div>
          <div>
            <span className="metric-label">P/L</span>
            <strong className={totals.profit >= 0 ? 'positive' : 'negative'}>
              {formatCurrency(totals.profit)}
            </strong>
          </div>
        </div>
      </div>
      {portfolio.length === 0 ? (
        <p className="muted">Ajoutez des tokens depuis la recherche pour démarrer.</p>
      ) : (
        <div className="portfolio-list">
          {portfolio.map((token) => (
            <PortfolioRow key={token.id} token={token} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PortfolioPage;

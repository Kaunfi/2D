import React, { useMemo } from 'react';

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(
    Number(value) || 0,
  );
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y, 'L', x, y, 'Z'].join(' ');
}

function PieChart({ title, data, total }) {
  let cumulativeAngle = 0;

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <h3>{title}</h3>
        <span className="metric-label">Total: {formatCurrency(total)}</span>
      </div>
      {total <= 0 ? (
        <div className="muted stat-card__empty">Aucune donnée à afficher.</div>
      ) : (
        <div className="pie-chart">
          <svg viewBox="0 0 220 220" role="img" aria-label={title}>
            {data.map((item, index) => {
              const startAngle = cumulativeAngle;
              const angle = (item.value / total) * 360;
              cumulativeAngle += angle;
              const endAngle = cumulativeAngle;
              const path = describeArc(110, 110, 100, startAngle, endAngle);

              return <path key={item.label} d={path} fill={item.color} />;
            })}
          </svg>
          <div className="pie-chart__legend">
            {data.map((item) => {
              const percentage = total ? ((item.value / total) * 100).toFixed(1) : '0.0';
              return (
                <div className="legend-row" key={item.label}>
                  <span className="legend-color" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="legend-label">{item.label}</div>
                    <div className="legend-value">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatsTable({ rows }) {
  if (!rows.length) {
    return <p className="muted">Aucun actif dans le portefeuille pour le moment.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="stats-table">
        <thead>
          <tr>
            <th>Actif</th>
            <th>Quantité</th>
            <th>Investi</th>
            <th>Prix actuel</th>
            <th>Valeur actuelle</th>
            <th>Variation 24h</th>
            <th>P/L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((token) => {
            const invested = Number(token.invested) || 0;
            const currentValue = (Number(token.quantity) || 0) * (Number(token.currentPrice) || 0);
            const profit = currentValue - invested;
            return (
              <tr key={token.id}>
                <td className="asset-cell">
                  {token.image && <img src={token.image} alt={token.name} />}
                  <div>
                    <div className="asset-name">{token.name}</div>
                    <div className="asset-symbol">{token.symbol}</div>
                  </div>
                </td>
                <td>{Number(token.quantity) || 0}</td>
                <td>{formatCurrency(invested)}</td>
                <td>{token.currentPrice ? formatCurrency(token.currentPrice) : '—'}</td>
                <td>{formatCurrency(currentValue)}</td>
                <td>
                  <span className={`chip ${token.change24h >= 0 ? 'chip--positive' : 'chip--negative'}`}>
                    {token.change24h ? `${token.change24h.toFixed(2)}%` : '0%'}
                  </span>
                </td>
                <td className={profit >= 0 ? 'positive' : 'negative'}>{formatCurrency(profit)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatsPage({ portfolio }) {
  const totals = useMemo(() => {
    const currentValue = portfolio.reduce(
      (sum, token) => sum + (Number(token.quantity) || 0) * (Number(token.currentPrice) || 0),
      0,
    );
    const investedValue = portfolio.reduce((sum, token) => sum + (Number(token.invested) || 0), 0);
    return { currentValue, investedValue, profit: currentValue - investedValue };
  }, [portfolio]);

  const colors = ['#0f4b8a', '#1b6ca8', '#6bb6ff', '#f4a261', '#2a9d8f', '#b5179e', '#457b9d'];

  const currentDistribution = useMemo(() => {
    return portfolio.map((token, index) => ({
      label: token.name,
      value: (Number(token.quantity) || 0) * (Number(token.currentPrice) || 0),
      color: colors[index % colors.length],
    }));
  }, [portfolio]);

  const investedDistribution = useMemo(() => {
    return portfolio.map((token, index) => ({
      label: token.name,
      value: Number(token.invested) || 0,
      color: colors[index % colors.length],
    }));
  }, [portfolio]);

  return (
    <section className="card stats-page">
      <div className="card__header">
        <div>
          <h2>Statistiques</h2>
          <p>Suivez la répartition et les performances de votre portefeuille.</p>
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

      <div className="charts-grid">
        <PieChart
          title="Répartition par valeur actuelle"
          data={currentDistribution}
          total={totals.currentValue}
        />
        <PieChart title="Répartition des montants investis" data={investedDistribution} total={totals.investedValue} />
      </div>

      <div className="stats-table__title">
        <h3>Détail des actifs</h3>
        <p className="muted">Consultation uniquement, aucune modification possible.</p>
      </div>
      <StatsTable rows={portfolio} />
    </section>
  );
}

export default StatsPage;

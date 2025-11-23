import React, { useMemo } from 'react';

const USD_TO_EUR_RATE = 0.92;

function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(Number(value) || 0);
}

function formatUsd(value) {
  return formatCurrency(value, 'USD');
}

function formatEur(value) {
  return formatCurrency((Number(value) || 0) * USD_TO_EUR_RATE, 'EUR');
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
  const segments = useMemo(() => {
    let cumulativeAngle = 0;

    return data.map((item, index) => {
      const startAngle = cumulativeAngle;
      const angle = total ? (item.value / total) * 360 : 0;
      cumulativeAngle += angle;
      const endAngle = cumulativeAngle;
      const midAngle = startAngle + angle / 2;
      const labelPosition = polarToCartesian(110, 110, 70, midAngle);
      const iconPosition = polarToCartesian(110, 110, 85, midAngle);
      const percentage = total ? (item.value / total) * 100 : 0;

      return {
        key: `${item.label}-${index}`,
        item,
        startAngle,
        endAngle,
        labelPosition,
        iconPosition,
        percentage,
      };
    });
  }, [data, total]);

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <h3>{title}</h3>
        <div className="stat-card__totals">
          <span className="metric-label">Total: {formatUsd(total)}</span>
          <span className="secondary-currency">{formatEur(total)}</span>
        </div>
      </div>
      {total <= 0 ? (
        <div className="muted stat-card__empty">Aucune donnée à afficher.</div>
      ) : (
        <div className="pie-chart">
          <svg viewBox="0 0 220 220" role="img" aria-label={title}>
            {segments.map(({ key, item, startAngle, endAngle }) => {
              const path = describeArc(110, 110, 100, startAngle, endAngle);

              return <path key={key} d={path} fill={item.color} />;
            })}
            {segments.map(({ key, item, iconPosition }) => (
              item.image ? (
                <foreignObject
                  key={`${key}-icon`}
                  x={iconPosition.x - 14}
                  y={iconPosition.y - 14}
                  width="28"
                  height="28"
                >
                  <div className="pie-chart__icon">
                    <img src={item.image} alt={item.label} />
                  </div>
                </foreignObject>
              ) : null
            ))}
            {segments.map(({ key, item, labelPosition, percentage }) => (
              <foreignObject
                key={`${key}-badge`}
                x={labelPosition.x - 60}
                y={labelPosition.y - 16}
                width="120"
                height="32"
              >
                <div className="pie-chart__badge">
                  {item.image && <img src={item.image} alt={item.label} />}
                  <div className="pie-chart__badge-text">
                    <span className="pie-chart__badge-symbol">
                      {item.symbol ? item.symbol.toUpperCase() : item.label}
                    </span>
                    <span className="pie-chart__badge-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </foreignObject>
            ))}
          </svg>
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
            <th>Valeur actuelle (USD)</th>
            <th>Valeur actuelle (EUR)</th>
            <th>Variation 24h</th>
            <th>P/L</th>
            <th>P/L (%)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((token) => {
            const invested = Number(token.invested) || 0;
            const currentValue = (Number(token.quantity) || 0) * (Number(token.currentPrice) || 0);
            const profit = currentValue - invested;
            const profitPercent = invested > 0 ? (profit / invested) * 100 : null;
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
                <td>{formatUsd(invested)}</td>
                <td>{token.currentPrice ? formatUsd(token.currentPrice) : '—'}</td>
                <td>{formatUsd(currentValue)}</td>
                <td>{formatEur(currentValue)}</td>
                <td>
                  <span className={`chip ${token.change24h >= 0 ? 'chip--positive' : 'chip--negative'}`}>
                    {token.change24h ? `${token.change24h.toFixed(2)}%` : '0%'}
                  </span>
                </td>
                <td className={profit >= 0 ? 'positive' : 'negative'}>{formatUsd(profit)}</td>
                <td className={profit >= 0 ? 'positive' : 'negative'}>
                  {profitPercent !== null ? `${profitPercent.toFixed(2)}%` : '—'}
                </td>
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
      image: token.image,
      symbol: token.symbol,
    }));
  }, [portfolio]);

  const investedDistribution = useMemo(() => {
    return portfolio.map((token, index) => ({
      label: token.name,
      value: Number(token.invested) || 0,
      color: colors[index % colors.length],
      image: token.image,
      symbol: token.symbol,
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
            <strong>{formatUsd(totals.currentValue)}</strong>
            <div className="secondary-currency">{formatEur(totals.currentValue)}</div>
          </div>
          <div>
            <span className="metric-label">Investi</span>
            <strong>{formatUsd(totals.investedValue)}</strong>
            <div className="secondary-currency">{formatEur(totals.investedValue)}</div>
          </div>
          <div>
            <span className="metric-label">P/L</span>
            <strong className={totals.profit >= 0 ? 'positive' : 'negative'}>
              {formatUsd(totals.profit)}
            </strong>
            <div className="secondary-currency">{formatEur(totals.profit)}</div>
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

import React, { useState } from 'react';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

function SearchPage({ onAddToken, existingIds }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${COINGECKO_API}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('La recherche a échoué.');
      }
      const data = await response.json();
      setResults(data.coins || []);
    } catch (err) {
      setError(err.message || 'Impossible de contacter l’API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (coin) => {
    onAddToken({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.large || coin.thumb,
      currentPrice: 0,
    });
  };

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2>Recherche de tokens</h2>
          <p>Ajoutez de nouveaux tokens à votre portefeuille.</p>
        </div>
        <form className="search" onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un token (ex: bitcoin)"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Recherche…' : 'Chercher'}
          </button>
        </form>
      </div>
      {error && <div className="error-banner">{error}</div>}
      <div className="results">
        {results.length === 0 && !isLoading && <p className="muted">Aucun résultat pour le moment.</p>}
        {results.map((coin) => (
          <div key={coin.id} className="result-row">
            <div className="result-row__info">
              <img src={coin.large || coin.thumb} alt={coin.name} />
              <div>
                <div className="result-row__name">{coin.name}</div>
                <div className="result-row__symbol">{coin.symbol}</div>
              </div>
            </div>
            <button
              className="outline"
              onClick={() => handleAdd(coin)}
              disabled={existingIds.includes(coin.id)}
            >
              {existingIds.includes(coin.id) ? 'Déjà ajouté' : 'Ajouter'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SearchPage;

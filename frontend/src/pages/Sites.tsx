import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSites } from '../api';
import type { Site } from '../types';

const TYPE_COLORS: Record<string, string> = {
  Falaise: 'badge-falaise',
  Bloc: 'badge-bloc',
  Salle: 'badge-salle',
};

export default function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    getSites()
      .then((res) => setSites(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = sites.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter ? s.type === typeFilter : true;
    return matchSearch && matchType;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1>Sites d'escalade</h1>
        <p>Découvrez les meilleurs spots de grimpe en France</p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 32,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher un site ou une ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, maxWidth: 400 }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'Falaise', 'Bloc', 'Salle'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                border: '1.5px solid',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                borderColor: typeFilter === type ? 'var(--accent)' : 'var(--border)',
                background: typeFilter === type ? 'var(--accent-light)' : 'transparent',
                color: typeFilter === type ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {type || 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
          {filtered.length} site{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Aucun site trouvé</h3>
          <p>Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {filtered.map((site) => (
            <Link key={site.id} to={`/sites/${site.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%' }}>
                {/* Image */}
                <div style={{
                  height: 200,
                  overflow: 'hidden',
                  position: 'relative',
                  background: 'var(--secondary)',
                }}>
                  {site.image_url ? (
                    <img
                      src={site.image_url}
                      alt={site.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ) : (
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      opacity: 0.3,
                    }}>
                      ⛰️
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                  }}>
                    <span className={`badge ${TYPE_COLORS[site.type] || ''}`}>
                      {site.type}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>
                    {site.name}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <path d="M7 0C4.24 0 2 2.24 2 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 115 5a1.5 1.5 0 012 1.5z"/>
                    </svg>
                    {site.location}
                  </p>
                  {site.description && (
                    <p style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {site.description}
                    </p>
                  )}
                  <div style={{
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {site.route_count} voie{Number(site.route_count) !== 1 ? 's' : ''}
                    </span>
                    <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>
                      Voir le topo →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

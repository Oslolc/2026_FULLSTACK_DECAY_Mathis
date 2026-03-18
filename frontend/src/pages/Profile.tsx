import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../api';
import type { Stats } from '../types';

function getGradeColor(grade: string): string {
  const num = parseFloat(grade.replace(/[abc+]/gi, ''));
  if (num < 6) return '#22c55e';
  if (num < 7) return '#eab308';
  if (num < 8) return '#f97316';
  return '#ef4444';
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roleBadgeStyle: Record<string, React.CSSProperties> = {
    admin: { background: 'rgba(233,69,96,0.2)', color: '#e94560', border: '1px solid rgba(233,69,96,0.4)' },
    expert: { background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.4)' },
    user: { background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)' },
  };

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
    : '';

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <h1>Mon Profil</h1>
        <p>Vos informations et statistiques</p>
      </div>

      {/* User card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 32,
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 800,
          color: '#fff',
          flexShrink: 0,
          boxShadow: '0 4px 20px rgba(233,69,96,0.4)',
        }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.username}</h2>
            {user?.role && (
              <span style={{
                padding: '3px 12px',
                borderRadius: 20,
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                ...roleBadgeStyle[user.role],
              }}>
                {user.role}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{user?.email}</p>
          {joinDate && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              Membre depuis {joinDate}
            </p>
          )}
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ alignSelf: 'flex-start' }}
        >
          Déconnexion
        </button>
      </div>

      {/* Stats */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Statistiques</h3>

      {loading ? (
        <div className="spinner" />
      ) : stats ? (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}>
            {[
              { icon: '🧗', label: 'Ascensions totales', value: stats.total.toString() },
              {
                icon: '🏆',
                label: 'Plus difficile',
                value: stats.hardest_grade
                  ? <span style={{ color: getGradeColor(stats.hardest_grade), fontWeight: 800 }}>{stats.hardest_grade}</span>
                  : '—',
              },
              { icon: '📍', label: 'Site favori', value: stats.favorite_site || '—' },
              { icon: '📊', label: 'Cotations diff.', value: stats.grades.length.toString() },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Grade distribution */}
          {stats.grades.length > 0 && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: 24,
              marginBottom: 28,
            }}>
              <h4 style={{ marginBottom: 16, fontWeight: 700 }}>Répartition des cotations grimpées</h4>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {stats.grades.map((g) => (
                  <div key={g.grade} style={{
                    background: getGradeColor(g.grade) + '22',
                    border: `1px solid ${getGradeColor(g.grade)}44`,
                    borderRadius: 8,
                    padding: '8px 16px',
                    textAlign: 'center',
                    minWidth: 70,
                  }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: getGradeColor(g.grade) }}>
                      {g.grade}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {g.count}x
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.total === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📓</div>
              <h3>Aucune statistique pour l'instant</h3>
              <p>Commencez à remplir votre carnet d'ascensions pour voir vos stats ici.</p>
              <a href="/logbook" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
                Aller au carnet
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>Impossible de charger les statistiques.</p>
        </div>
      )}
    </div>
  );
}

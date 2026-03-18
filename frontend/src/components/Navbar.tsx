import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string): React.CSSProperties => ({
    color: isActive(path) ? 'var(--accent)' : 'var(--text-muted)',
    fontWeight: isActive(path) ? 700 : 500,
    fontSize: '0.9rem',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'color 0.2s, background 0.2s',
    background: isActive(path) ? 'var(--accent-light)' : 'transparent',
  });

  return (
    <nav style={{
      background: 'rgba(22, 33, 62, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L2 24h24L14 2z" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M14 8l-6 12h12L14 8z" fill="var(--accent)" opacity="0.4"/>
            <circle cx="14" cy="20" r="1.5" fill="var(--accent)"/>
          </svg>
          <span style={{
            fontWeight: 800,
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #fff 30%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            VerticalLog
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          <Link to="/sites" style={linkStyle('/sites')}>Sites</Link>

          {user ? (
            <>
              <Link to="/logbook" style={linkStyle('/logbook')}>Carnet</Link>
              <Link to="/profile" style={linkStyle('/profile')}>Profil</Link>
              <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: 8 }}>
                {user.username}
                {user.role !== 'user' && (
                  <span style={{
                    marginLeft: 6,
                    fontSize: '0.7rem',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    {user.role}
                  </span>
                )}
              </span>
              <button
                onClick={logout}
                className="btn btn-ghost"
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle('/login')}>Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            padding: 8,
            display: 'none',
          }}
          className="mobile-menu-btn"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
            {menuOpen ? (
              <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            ) : (
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <Link to="/sites" onClick={() => setMenuOpen(false)} style={{ ...linkStyle('/sites'), display: 'block' }}>Sites</Link>
          {user ? (
            <>
              <Link to="/logbook" onClick={() => setMenuOpen(false)} style={{ ...linkStyle('/logbook'), display: 'block' }}>Carnet</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ ...linkStyle('/profile'), display: 'block' }}>Profil</Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="btn btn-ghost" style={{ textAlign: 'left' }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ ...linkStyle('/login'), display: 'block' }}>Connexion</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

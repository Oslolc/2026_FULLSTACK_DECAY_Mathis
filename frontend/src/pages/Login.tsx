import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiLogin(email, password);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'radial-gradient(ellipse at center top, rgba(233,69,96,0.08) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <svg width="48" height="48" viewBox="0 0 28 28" fill="none" style={{ margin: '0 auto 12px' }}>
            <path d="M14 2L2 24h24L14 2z" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M14 8l-6 12h12L14 8z" fill="var(--accent)" opacity="0.4"/>
          </svg>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>VerticalLog</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Bon retour parmi nous !</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24 }}>Connexion</h2>

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="vous@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
          }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              S'inscrire
            </Link>
          </div>

          <div style={{
            marginTop: 16,
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}>
            Compte démo: <code style={{ color: 'var(--accent)' }}>admin@verticallog.fr</code> / <code style={{ color: 'var(--accent)' }}>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

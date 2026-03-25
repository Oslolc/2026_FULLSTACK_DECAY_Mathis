import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getLogbook, addLogbookEntry, updateLogbookEntry, deleteLogbookEntry, getStats, getSites, getRoutesForSite } from '../api';
import StarRating from '../components/StarRating';
import type { LogbookEntry, Stats, Site, ClimbingRoute } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function gradeToNumber(grade: string): number {
  const base = parseFloat(grade);
  const letter = grade.match(/[abc]/i)?.[0]?.toLowerCase() ?? 'a';
  const plus = grade.includes('+') ? 0.15 : 0;
  const letterVal = letter === 'a' ? 0 : letter === 'b' ? 0.33 : 0.66;
  return base + letterVal + plus;
}

function getGradeColor(grade: string): string {
  const MIN = 4.0;
  const MAX = 9.5;
  const val = Math.min(Math.max(gradeToNumber(grade), MIN), MAX);
  const t = (val - MIN) / (MAX - MIN);
  // hue: 130 (green) → 60 (yellow) → 0 (red)
  const hue = Math.round(130 - t * 130);
  const sat = 80 + Math.round(t * 15);
  const light = 52 - Math.round(t * 10);
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

export default function Logbook() {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [routes, setRoutes] = useState<ClimbingRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [addFeeling, setAddFeeling] = useState(3);
  const [addComment, setAddComment] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit
  const [editEntry, setEditEntry] = useState<LogbookEntry | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editFeeling, setEditFeeling] = useState(3);
  const [editComment, setEditComment] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [logRes, statsRes] = await Promise.all([getLogbook(), getStats()]);
      setEntries(logRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    getSites().then((res) => setSites(res.data));
  }, []);

  useEffect(() => {
    if (selectedSite) {
      setRoutes([]);
      setSelectedRoute('');
      getRoutesForSite(Number(selectedSite))
        .then((res) => setRoutes(res.data))
        .catch(console.error);
    }
  }, [selectedSite]);

  const handleAdd = async () => {
    if (!selectedRoute || !addDate) {
      setAddError('Veuillez sélectionner une voie et une date');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      await addLogbookEntry({
        route_id: Number(selectedRoute),
        date: addDate,
        feeling: addFeeling,
        comment: addComment || undefined,
      });
      setShowAdd(false);
      setSelectedSite('');
      setSelectedRoute('');
      setAddComment('');
      setAddFeeling(3);
      fetchData();
    } catch {
      setAddError("Erreur lors de l'ajout");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editEntry) return;
    setEditLoading(true);
    try {
      await updateLogbookEntry(editEntry.id, {
        date: editDate,
        feeling: editFeeling,
        comment: editComment || undefined,
      });
      setEditEntry(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette entrée ?')) return;
    try {
      await deleteLogbookEntry(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (entry: LogbookEntry) => {
    setEditEntry(entry);
    setEditDate(entry.date.split('T')[0]);
    setEditFeeling(entry.feeling || 3);
    setEditComment(entry.comment || '');
  };

  // Chart data
  const monthlyData = {
    labels: stats?.monthly.map((m) => {
      const [year, month] = m.month.split('-');
      return new Date(Number(year), Number(month) - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    }) || [],
    datasets: [{
      label: 'Ascensions',
      data: stats?.monthly.map((m) => Number(m.count)) || [],
      backgroundColor: 'rgba(233, 69, 96, 0.6)',
      borderColor: 'var(--accent)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const gradeColors = stats?.grades.map((g) => getGradeColor(g.grade)) || [];
  const gradeData = {
    labels: stats?.grades.map((g) => g.grade) || [],
    datasets: [{
      data: stats?.grades.map((g) => Number(g.count)) || [],
      backgroundColor: gradeColors.map((c) => c + '99'),
      borderColor: gradeColors,
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#eaeaea', font: { size: 12 } } },
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  if (loading) return <div className="spinner" style={{ minHeight: '60vh' }} />;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Mon Carnet</h1>
          <p>Historique de vos ascensions</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          + Ajouter une ascension
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          {[
            { label: 'Total ascensions', value: stats.total, icon: '🧗' },
            { label: 'Plus difficile', value: stats.hardest_grade || '—', icon: '🏆' },
            { label: 'Site favori', value: stats.favorite_site || '—', icon: '📍' },
          ].map((s) => (
            <div key={s.label} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '20px 24px',
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {stats && (stats.monthly.length > 0 || stats.grades.length > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          marginBottom: 36,
        }}>
          {stats.monthly.length > 0 && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: 24,
            }}>
              <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 700 }}>Ascensions par mois</h3>
              <Bar data={monthlyData} options={chartOptions as object} />
            </div>
          )}
          {stats.grades.length > 0 && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 700, alignSelf: 'flex-start' }}>Répartition par cotation</h3>
              <div style={{ maxWidth: 280 }}>
                <Doughnut
                  data={gradeData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#eaeaea', font: { size: 12 }, padding: 12 },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📓</div>
          <h3>Votre carnet est vide</h3>
          <p>Commencez par ajouter votre première ascension !</p>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary" style={{ marginTop: 20 }}>
            + Première ascension
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Voie</th>
                <th>Cotation</th>
                <th>Site</th>
                <th>Ressenti</th>
                <th>Commentaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {new Date(entry.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ fontWeight: 600 }}>{entry.route_name}</td>
                  <td>
                    <span style={{
                      background: getGradeColor(entry.grade) + '22',
                      color: getGradeColor(entry.grade),
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}>
                      {entry.grade}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{entry.site_name}</td>
                  <td><StarRating value={entry.feeling} readonly /></td>
                  <td style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {entry.comment || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(entry)} className="btn btn-ghost btn-sm">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="btn btn-danger btn-sm">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2>Nouvelle ascension</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div className="modal-body">
              {addError && <div className="alert alert-error">{addError}</div>}

              <div className="form-group">
                <label>Site</label>
                <select className="form-control" value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}>
                  <option value="">Choisir un site...</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Voie</label>
                <select className="form-control" value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} disabled={!selectedSite}>
                  <option value="">Choisir une voie...</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.grade})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={addDate} onChange={(e) => setAddDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Ressenti</label>
                <StarRating value={addFeeling} onChange={setAddFeeling} />
              </div>

              <div className="form-group">
                <label>Commentaire</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Notes sur votre ascension..."
                  value={addComment}
                  onChange={(e) => setAddComment(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAdd(false)} className="btn btn-secondary">Annuler</button>
              <button onClick={handleAdd} className="btn btn-primary" disabled={addLoading}>
                {addLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editEntry && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditEntry(null); }}>
          <div className="modal">
            <div className="modal-header">
              <h2>Modifier l'entrée</h2>
              <button className="modal-close" onClick={() => setEditEntry(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'var(--bg-primary)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 4,
                fontSize: '0.9rem',
              }}>
                <strong>{editEntry.route_name}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{editEntry.grade} · {editEntry.site_name}</span>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Ressenti</label>
                <StarRating value={editFeeling} onChange={setEditFeeling} />
              </div>
              <div className="form-group">
                <label>Commentaire</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setEditEntry(null)} className="btn btn-secondary">Annuler</button>
              <button onClick={handleEdit} className="btn btn-primary" disabled={editLoading}>
                {editLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

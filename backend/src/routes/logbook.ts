import { Router, Request, Response } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/logbook/stats - user stats (auth)
router.get('/stats', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    // Ascensions per month (last 12 months)
    const monthlyResult = await pool.query(
      `SELECT
        TO_CHAR(date, 'YYYY-MM') as month,
        COUNT(*) as count
       FROM logbook
       WHERE user_id = $1
         AND date >= NOW() - INTERVAL '12 months'
       GROUP BY TO_CHAR(date, 'YYYY-MM')
       ORDER BY month`,
      [userId]
    );

    // Grade distribution
    const gradeResult = await pool.query(
      `SELECT cr.grade, COUNT(*) as count
       FROM logbook l
       JOIN climbing_routes cr ON l.route_id = cr.id
       WHERE l.user_id = $1
       GROUP BY cr.grade
       ORDER BY cr.grade`,
      [userId]
    );

    // Total count
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM logbook WHERE user_id = $1',
      [userId]
    );

    // Hardest grade (simple lexicographic sort - works for French grades)
    const hardestResult = await pool.query(
      `SELECT cr.grade
       FROM logbook l
       JOIN climbing_routes cr ON l.route_id = cr.id
       WHERE l.user_id = $1
       ORDER BY cr.grade DESC
       LIMIT 1`,
      [userId]
    );

    // Favorite site
    const favSiteResult = await pool.query(
      `SELECT s.name, COUNT(*) as count
       FROM logbook l
       JOIN climbing_routes cr ON l.route_id = cr.id
       JOIN sites s ON cr.site_id = s.id
       WHERE l.user_id = $1
       GROUP BY s.name
       ORDER BY count DESC
       LIMIT 1`,
      [userId]
    );

    res.json({
      monthly: monthlyResult.rows,
      grades: gradeResult.rows,
      total: parseInt(totalResult.rows[0].total),
      hardest_grade: hardestResult.rows[0]?.grade || null,
      favorite_site: favSiteResult.rows[0]?.name || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/logbook - get user's logbook entries (auth)
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const result = await pool.query(
      `SELECT
        l.id,
        l.date,
        l.feeling,
        l.comment,
        l.created_at,
        cr.id as route_id,
        cr.name as route_name,
        cr.grade,
        cr.style,
        s.id as site_id,
        s.name as site_name,
        s.type as site_type
       FROM logbook l
       JOIN climbing_routes cr ON l.route_id = cr.id
       JOIN sites s ON cr.site_id = s.id
       WHERE l.user_id = $1
       ORDER BY l.date DESC, l.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/logbook - add logbook entry (auth)
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { route_id, date, feeling, comment } = req.body;

  if (!route_id || !date) {
    res.status(400).json({ error: 'route_id and date are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO logbook (user_id, route_id, date, feeling, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, route_id, date, feeling, comment]
    );

    // Return with route and site info
    const full = await pool.query(
      `SELECT
        l.id,
        l.date,
        l.feeling,
        l.comment,
        l.created_at,
        cr.id as route_id,
        cr.name as route_name,
        cr.grade,
        cr.style,
        s.id as site_id,
        s.name as site_name,
        s.type as site_type
       FROM logbook l
       JOIN climbing_routes cr ON l.route_id = cr.id
       JOIN sites s ON cr.site_id = s.id
       WHERE l.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(full.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/logbook/:id - update entry (auth, only own)
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { date, feeling, comment } = req.body;

  try {
    const check = await pool.query('SELECT user_id FROM logbook WHERE id = $1', [id]);

    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    if (check.rows[0].user_id !== userId) {
      res.status(403).json({ error: 'You can only edit your own entries' });
      return;
    }

    await pool.query(
      `UPDATE logbook
       SET date = COALESCE($1, date),
           feeling = COALESCE($2, feeling),
           comment = COALESCE($3, comment)
       WHERE id = $4`,
      [date, feeling, comment, id]
    );

    const full = await pool.query(
      `SELECT
        l.id,
        l.date,
        l.feeling,
        l.comment,
        l.created_at,
        cr.id as route_id,
        cr.name as route_name,
        cr.grade,
        cr.style,
        s.id as site_id,
        s.name as site_name,
        s.type as site_type
       FROM logbook l
       JOIN climbing_routes cr ON l.route_id = cr.id
       JOIN sites s ON cr.site_id = s.id
       WHERE l.id = $1`,
      [id]
    );

    res.json(full.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/logbook/:id - delete entry (auth, only own)
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const check = await pool.query('SELECT user_id FROM logbook WHERE id = $1', [id]);

    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    if (check.rows[0].user_id !== userId) {
      res.status(403).json({ error: 'You can only delete your own entries' });
      return;
    }

    await pool.query('DELETE FROM logbook WHERE id = $1', [id]);
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import pool from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/climbing-routes/site/:siteId - get all routes for a site (public)
router.get('/site/:siteId', async (req: Request, res: Response): Promise<void> => {
  const { siteId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM climbing_routes WHERE site_id = $1 ORDER BY grade, name',
      [siteId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/climbing-routes - create route (auth + expert/admin)
router.post(
  '/',
  authenticateToken,
  requireRole('expert'),
  async (req: Request, res: Response): Promise<void> => {
    const { site_id, name, grade, style, description, video_url } = req.body;

    if (!site_id || !name || !grade) {
      res.status(400).json({ error: 'site_id, name and grade are required' });
      return;
    }

    try {
      const result = await pool.query(
        `INSERT INTO climbing_routes (site_id, name, grade, style, description, video_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [site_id, name, grade, style, description, video_url]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /api/climbing-routes/:id - update route (auth + expert/admin)
router.put(
  '/:id',
  authenticateToken,
  requireRole('expert'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, grade, style, description, video_url } = req.body;

    try {
      const result = await pool.query(
        `UPDATE climbing_routes
         SET name = COALESCE($1, name),
             grade = COALESCE($2, grade),
             style = COALESCE($3, style),
             description = COALESCE($4, description),
             video_url = COALESCE($5, video_url)
         WHERE id = $6
         RETURNING *`,
        [name, grade, style, description, video_url, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Route not found' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /api/climbing-routes/:id - delete route (auth + admin)
router.delete(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        'DELETE FROM climbing_routes WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Route not found' });
        return;
      }

      res.json({ message: 'Route deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

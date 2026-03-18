import { Router, Request, Response } from 'express';
import pool from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/sites - list all sites (public)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.username as created_by_username,
        (SELECT COUNT(*) FROM climbing_routes cr WHERE cr.site_id = s.id) as route_count
       FROM sites s
       LEFT JOIN users u ON s.created_by = u.id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sites/:id - get site with routes (public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const siteResult = await pool.query(
      `SELECT s.*, u.username as created_by_username
       FROM sites s
       LEFT JOIN users u ON s.created_by = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (siteResult.rows.length === 0) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const routesResult = await pool.query(
      'SELECT * FROM climbing_routes WHERE site_id = $1 ORDER BY grade, name',
      [id]
    );

    res.json({
      ...siteResult.rows[0],
      climbing_routes: routesResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/sites - create site (auth + expert/admin)
router.post(
  '/',
  authenticateToken,
  requireRole('expert'),
  async (req: Request, res: Response): Promise<void> => {
    const { name, type, location, description, image_url, latitude, longitude } = req.body;

    if (!name || !type || !location) {
      res.status(400).json({ error: 'Name, type and location are required' });
      return;
    }

    try {
      const result = await pool.query(
        `INSERT INTO sites (name, type, location, description, image_url, latitude, longitude, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [name, type, location, description, image_url, latitude, longitude, req.user!.id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /api/sites/:id - update site (auth + expert/admin)
router.put(
  '/:id',
  authenticateToken,
  requireRole('expert'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, type, location, description, image_url, latitude, longitude } = req.body;

    try {
      const result = await pool.query(
        `UPDATE sites
         SET name = COALESCE($1, name),
             type = COALESCE($2, type),
             location = COALESCE($3, location),
             description = COALESCE($4, description),
             image_url = COALESCE($5, image_url),
             latitude = COALESCE($6, latitude),
             longitude = COALESCE($7, longitude)
         WHERE id = $8
         RETURNING *`,
        [name, type, location, description, image_url, latitude, longitude, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Site not found' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /api/sites/:id - delete site (auth + admin)
router.delete(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const result = await pool.query('DELETE FROM sites WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Site not found' });
        return;
      }

      res.json({ message: 'Site deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

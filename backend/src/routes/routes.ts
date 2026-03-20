import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/climbing-routes/site/:siteId - get all routes for a site (public)
router.get('/site/:siteId', async (req: Request, res: Response): Promise<void> => {
  const { siteId } = req.params;

  try {
    const routes = await prisma.climbingRoute.findMany({
      where: { site_id: parseInt(siteId) },
      orderBy: [{ grade: 'asc' }, { name: 'asc' }],
    });
    res.json(routes);
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
      const route = await prisma.climbingRoute.create({
        data: { site_id: parseInt(site_id), name, grade, style, description, video_url },
      });
      res.status(201).json(route);
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
      const route = await prisma.climbingRoute.update({
        where: { id: parseInt(id) },
        data: {
          ...(name !== undefined && { name }),
          ...(grade !== undefined && { grade }),
          ...(style !== undefined && { style }),
          ...(description !== undefined && { description }),
          ...(video_url !== undefined && { video_url }),
        },
      });
      res.json(route);
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Route not found' });
      } else {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
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
      await prisma.climbingRoute.delete({ where: { id: parseInt(id) } });
      res.json({ message: 'Route deleted successfully' });
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Route not found' });
      } else {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

export default router;

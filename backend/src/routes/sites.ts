import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/sites - list all sites (public)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const sites = await prisma.site.findMany({
      include: {
        user: { select: { username: true } },
        _count: { select: { climbing_routes: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(
      sites.map(({ user, _count, ...s }) => ({
        ...s,
        created_by_username: user?.username ?? null,
        route_count: _count.climbing_routes,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sites/:id - get site with routes (public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const site = await prisma.site.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { username: true } },
        climbing_routes: { orderBy: [{ grade: 'asc' }, { name: 'asc' }] },
      },
    });

    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const { user, ...siteData } = site;
    res.json({ ...siteData, created_by_username: user?.username ?? null });
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
      const site = await prisma.site.create({
        data: { name, type, location, description, image_url, latitude, longitude, created_by: req.user!.id },
      });
      res.status(201).json(site);
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
      const site = await prisma.site.update({
        where: { id: parseInt(id) },
        data: {
          ...(name !== undefined && { name }),
          ...(type !== undefined && { type }),
          ...(location !== undefined && { location }),
          ...(description !== undefined && { description }),
          ...(image_url !== undefined && { image_url }),
          ...(latitude !== undefined && { latitude }),
          ...(longitude !== undefined && { longitude }),
        },
      });
      res.json(site);
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Site not found' });
      } else {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
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
      await prisma.site.delete({ where: { id: parseInt(id) } });
      res.json({ message: 'Site deleted successfully' });
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Site not found' });
      } else {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

export default router;

import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/logbook/stats - user stats (auth)
router.get('/stats', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const monthly = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT TO_CHAR(date, 'YYYY-MM') as month, COUNT(*) as count
      FROM logbook
      WHERE user_id = ${userId} AND date >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month`;

    const grades = await prisma.$queryRaw<Array<{ grade: string; count: bigint }>>`
      SELECT cr.grade, COUNT(*) as count
      FROM logbook l
      JOIN climbing_routes cr ON l.route_id = cr.id
      WHERE l.user_id = ${userId}
      GROUP BY cr.grade
      ORDER BY cr.grade`;

    const total = await prisma.logbook.count({ where: { user_id: userId } });

    const hardestRow = await prisma.$queryRaw<Array<{ grade: string }>>`
      SELECT cr.grade
      FROM logbook l
      JOIN climbing_routes cr ON l.route_id = cr.id
      WHERE l.user_id = ${userId}
      ORDER BY cr.grade DESC
      LIMIT 1`;

    const favSiteRow = await prisma.$queryRaw<Array<{ name: string; count: bigint }>>`
      SELECT s.name, COUNT(*) as count
      FROM logbook l
      JOIN climbing_routes cr ON l.route_id = cr.id
      JOIN sites s ON cr.site_id = s.id
      WHERE l.user_id = ${userId}
      GROUP BY s.name
      ORDER BY count DESC
      LIMIT 1`;

    res.json({
      monthly: monthly.map(r => ({ month: r.month, count: Number(r.count) })),
      grades: grades.map(r => ({ grade: r.grade, count: Number(r.count) })),
      total,
      hardest_grade: hardestRow[0]?.grade || null,
      favorite_site: favSiteRow[0]?.name || null,
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
    const entries = await prisma.logbook.findMany({
      where: { user_id: userId },
      include: { route: { include: { site: true } } },
      orderBy: [{ date: 'desc' }, { created_at: 'desc' }],
    });

    res.json(
      entries.map(({ route, ...l }) => ({
        id: l.id,
        date: (l.date as Date).toISOString().split('T')[0],
        feeling: l.feeling,
        comment: l.comment,
        created_at: l.created_at,
        route_id: route.id,
        route_name: route.name,
        grade: route.grade,
        style: route.style,
        site_id: route.site.id,
        site_name: route.site.name,
        site_type: route.site.type,
      }))
    );
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
    const entry = await prisma.logbook.create({
      data: { user_id: userId, route_id: parseInt(route_id), date: new Date(date), feeling, comment },
      include: { route: { include: { site: true } } },
    });

    const { route, ...l } = entry;
    res.status(201).json({
      id: l.id,
      date: (l.date as Date).toISOString().split('T')[0],
      feeling: l.feeling,
      comment: l.comment,
      created_at: l.created_at,
      route_id: route.id,
      route_name: route.name,
      grade: route.grade,
      style: route.style,
      site_id: route.site.id,
      site_name: route.site.name,
      site_type: route.site.type,
    });
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
    const existing = await prisma.logbook.findUnique({ where: { id: parseInt(id) } });

    if (!existing) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({ error: 'You can only edit your own entries' });
      return;
    }

    const entry = await prisma.logbook.update({
      where: { id: parseInt(id) },
      data: {
        ...(date !== undefined && { date: new Date(date) }),
        ...(feeling !== undefined && { feeling }),
        ...(comment !== undefined && { comment }),
      },
      include: { route: { include: { site: true } } },
    });

    const { route, ...l } = entry;
    res.json({
      id: l.id,
      date: (l.date as Date).toISOString().split('T')[0],
      feeling: l.feeling,
      comment: l.comment,
      created_at: l.created_at,
      route_id: route.id,
      route_name: route.name,
      grade: route.grade,
      style: route.style,
      site_id: route.site.id,
      site_name: route.site.name,
      site_type: route.site.type,
    });
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
    const existing = await prisma.logbook.findUnique({ where: { id: parseInt(id) } });

    if (!existing) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json({ error: 'You can only delete your own entries' });
      return;
    }

    await prisma.logbook.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

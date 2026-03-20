import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { User } from '@prisma/client';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password_hash },
      select: { id: true, username: true, email: true, role: true, created_at: true },
    });

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/auth/login — via Passport LocalStrategy
router.post('/login', (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('local', { session: false }, (err: Error, user: User | false) => {
    if (err) return next(err);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  })(req, res, next);
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, username: true, email: true, role: true, created_at: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

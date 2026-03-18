import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret';

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const roleHierarchy: Record<string, number> = {
      user: 1,
      expert: 2,
      admin: 3,
    };

    const userLevel = roleHierarchy[req.user.role] ?? 0;
    const requiredLevel = roleHierarchy[role] ?? 0;

    if (userLevel < requiredLevel) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

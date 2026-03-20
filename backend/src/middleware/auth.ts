import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import '../config/passport';

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: string;
    }
  }
}

export const authenticateToken = passport.authenticate('jwt', { session: false });

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

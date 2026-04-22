import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  const header = req.header('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401);
    return next(new Error('Unauthorized'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).lean();
    if (!user) {
      res.status(401);
      return next(new Error('Unauthorized'));
    }

    req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
    return next();
  } catch (e) {
    res.status(401);
    return next(new Error('Unauthorized'));
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Unauthorized'));
    }
    if (req.user.role !== role) {
      res.status(403);
      return next(new Error('Forbidden'));
    }
    return next();
  };
}

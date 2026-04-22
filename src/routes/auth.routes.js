import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole } from '../middleware/auth.js';

import { User } from '../models/User.js';

const router = Router();

router.post(
  '/register',
  body('name').isString().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6, max: 200 }),
  body('department').optional().isString().trim().isLength({ max: 100 }),
  body('college').optional().isString().trim().isLength({ max: 100 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, department, college } = req.body;
      const existing = await User.findOne({ email }).lean();
      if (existing) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
      const isFirstUser = (await User.estimatedDocumentCount()) === 0;
      const role = isFirstUser || (adminEmail && email === adminEmail) ? 'admin' : 'student';

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        name,
        email,
        passwordHash,
        role,
        department: department || '',
        college: college || ''
      });

      const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '2h'
      });

      return res.status(201).json({
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          college: user.college
        }
      });
    } catch (e) {
      return next(e);
    }
  }
);

router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 1 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '2h'
      });

      return res.json({
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          college: user.college,
          xp: user.xp || 0
        }
      });
    } catch (e) {
      return next(e);
    }
  }
);


router.put(
  '/promote',
  requireAuth,
  requireRole('admin'),
  body('email').isEmail().normalizeEmail(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.role = 'admin';
      await user.save();

      return res.json({ message: `User ${user.name} (${user.email}) is now an Admin.` });
    } catch (e) {
      return next(e);
    }
  }
);

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        college: user.college,
        xp: user.xp || 0
      }
    });
  } catch (e) {
    return next(e);
  }
});

router.get('/leaderboard', requireAuth, async (req, res, next) => {
  try {
    const topStudents = await User.find({ role: 'student' })
      .sort({ xp: -1 })
      .limit(50)
      .select('name email xp department college')
      .lean();

    // Add rank
    const result = topStudents.map((s, i) => ({
      ...s,
      rank: i + 1,
      // Extract roll no from name if format is 'Name (Roll)'
      shortName: s.name.split('(')[0].trim(),
      rollNo: s.name.match(/\((.*?)\)/)?.[1] || s.email.split('@')[0]
    }));

    return res.json({ leaderboard: result });
  } catch (e) {
    return next(e);
  }
});

// Get current user
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (e) {
    return next(e);
  }
});

export default router;

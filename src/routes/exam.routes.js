import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';

import { requireAuth, requireRole } from '../middleware/auth.js';
import { Exam } from '../models/Exam.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    // Return extra fields for admin (resultsPublished)
    const exams = await Exam.find({}).select('title durationMinutes questions resultsPublished createdAt updatedAt').lean();
    return res.json({ exams });
  } catch (e) {
    return next(e);
  }
});

// Define specific routes BEFORE parameterized routes to avoid route matching issues
router.get('/my-submissions', requireAuth, async (req, res, next) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .populate('examId', 'title resultsPublished')
      .lean();

    const result = submissions.map(s => ({
      id: s._id.toString(),
      examTitle: s.examId.title,
      examId: s.examId._id.toString(),
      score: s.score,
      total: s.total,
      submittedAt: s.submittedAt,
      resultsPublished: s.examId.resultsPublished || false
    }));

    return res.json({ submissions: result });
  } catch (e) {
    return next(e);
  }
});

router.get('/submissions', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const submissions = await Submission.find({})
      .populate('examId', 'title')
      .populate('studentId', 'email')
      .lean();

    // Filter out submissions where exam was deleted
    const validSubmissions = submissions.filter(s => s.examId && s.studentId);

    const result = validSubmissions.map(s => ({
      _id: s._id.toString(),
      examId: s.examId._id.toString(),
      examTitle: s.examId.title,
      studentName: s.studentName,
      studentEmail: s.studentId.email,
      score: s.score,
      total: s.total,
      submittedAt: s.submittedAt,
      violationCount: s.violationCount || 0,
      autoSubmitted: s.autoSubmitted || false
    }));

    return res.json({ submissions: result });
  } catch (e) {
    return next(e);
  }
});

// Delete submission (Allow Retake)
router.delete('/submissions/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    return res.json({ message: 'Submission deleted, student can retake exam' });
  } catch (e) {
    return next(e);
  }
});

// Toggle publish results
router.put('/:id/publish', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { published } = req.body;
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { resultsPublished: published },
      { new: true }
    );
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    return res.json({ message: 'Updated', resultsPublished: exam.resultsPublished });
  } catch (e) {
    return next(e);
  }
});

// Get detailed submission (solution view)
router.get('/sol/:submissionId', requireAuth, async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('examId')
      .lean();

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const exam = submission.examId;
    const isAdmin = req.user.role === 'admin';
    const isOwner = submission.studentId.toString() === req.user.id;

    // Check permissions: Admin OR (Owner AND Exam Published)
    if (!isAdmin) {
      if (!isOwner) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (!exam.resultsPublished) {
        return res.status(403).json({ message: 'Results not published yet' });
      }
    }

    // Construct detailed response
    const details = {
      examTitle: exam.title,
      studentName: submission.studentName,
      score: submission.score,
      total: submission.total,
      questions: exam.questions.map((q, idx) => ({
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        userAnswer: submission.answers[idx]
      }))
    };

    return res.json({ submission: details });
  } catch (e) {
    return next(e);
  }
});

router.get(
  '/:id',
  requireAuth,
  param('id').isMongoId(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const exam = await Exam.findById(req.params.id).lean();
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      const safeExam = {
        id: exam._id.toString(),
        title: exam.title,
        durationMinutes: exam.durationMinutes,
        questions: exam.questions.map((q) => ({ prompt: q.prompt, options: q.options }))
      };

      return res.json({ exam: safeExam });
    } catch (e) {
      return next(e);
    }
  }
);

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  body('title').isString().isLength({ min: 2, max: 200 }),
  body('durationMinutes').isInt({ min: 1, max: 600 }),
  body('questions').isArray({ min: 1, max: 200 }),
  body('questions.*.prompt').isString().isLength({ min: 1, max: 2000 }),
  body('questions.*.options').isArray({ min: 2, max: 10 }),
  body('questions.*.options.*').isString().isLength({ min: 1, max: 300 }),
  body('questions.*.correctIndex').isInt({ min: 0, max: 9 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, durationMinutes, questions } = req.body;
      const exam = await Exam.create({ title, durationMinutes, questions });
      return res.status(201).json({ examId: exam._id.toString() });
    } catch (e) {
      return next(e);
    }
  }
);

router.post(
  '/:id/submit',
  requireAuth,
  param('id').isMongoId(),
  body('answers').isArray(),
  body('answers.*').isInt({ min: -1, max: 9 }),
  body('studentName').isString().trim().isLength({ min: 2, max: 100 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const exam = await Exam.findById(req.params.id).lean();
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      const { answers, studentName, violationCount = 0, autoSubmitted = false } = req.body;
      if (answers.length !== exam.questions.length) {
        return res.status(400).json({ message: 'Answers length mismatch' });
      }

      let score = 0;
      for (let i = 0; i < exam.questions.length; i += 1) {
        if (answers[i] === exam.questions[i].correctIndex) score += 1;
      }

      const submission = await Submission.create({
        examId: exam._id,
        studentId: req.user.id,
        studentName: studentName.trim(),
        answers,
        score,
        total: exam.questions.length,
        submittedAt: new Date(),
        violationCount: violationCount,
        autoSubmitted: autoSubmitted
      });

      return res.status(201).json({ submissionId: submission._id.toString(), score, total: exam.questions.length });
    } catch (e) {
      if (e?.code === 11000) {
        return res.status(409).json({ message: 'Already submitted' });
      }
      return next(e);
    }
  }
);

// Update exam (for editing questions)
router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questions, title, durationMinutes } = req.body;

    const updateData = {};
    if (questions !== undefined) updateData.questions = questions;
    if (title) updateData.title = title;
    if (durationMinutes) updateData.durationMinutes = durationMinutes;

    const exam = await Exam.findByIdAndUpdate(id, updateData, { new: true });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    return res.json({ message: 'Exam updated successfully', exam });
  } catch (e) {
    return next(e);
  }
});

// Delete exam
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByIdAndDelete(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Also delete all submissions for this exam
    await Submission.deleteMany({ examId: id });

    return res.json({ message: 'Exam and all submissions deleted successfully' });
  } catch (e) {
    return next(e);
  }
});

export default router;



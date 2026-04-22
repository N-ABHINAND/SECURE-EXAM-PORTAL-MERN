import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { connectDb } from './utils/connectDb.js';
import { notFound, errorHandler } from './utils/errors.js';
import authRoutes from './routes/auth.routes.js';
import examRoutes from './routes/exam.routes.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: clientOrigin.includes(',') ? clientOrigin.split(',').map(o => o.trim()) : clientOrigin,
    credentials: false
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  })
);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

await connectDb(process.env.MONGODB_URI);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

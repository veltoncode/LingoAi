import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from '../server/routes';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));

app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'LingoNova AI Tutor Engine (Vercel Serverless)',
    timestamp: new Date().toISOString(),
  });
});

// Support both /api/path and /path if Vercel strips the prefix
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;

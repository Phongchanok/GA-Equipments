// server.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import authRouter from './src/routes/auth.js';
import equipmentRouter from './src/routes/equipment.js';
import requestsRouter from './src/routes/requests.js';
import settingsRouter from './src/routes/settings.js';
import exportRouter from './src/routes/export.js';
import { errorHandler } from './src/middleware/error.js';

const app = express();
app.set('trust proxy', 1);

// ---------- CORS ----------
const allowed = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// อนุญาต origin ที่กำหนดไว้ และอนุญาตกรณีไม่มี origin (บาง client/health-check)
const corsOpts = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.length === 0) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

app.use(cors(corsOpts));
app.options('*', cors(corsOpts)); // ตอบ preflight ทุกเส้นทาง

// ---------- Common middlewares ----------
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// ---------- DB connect ----------
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error('MONGODB_URI is required');
await mongoose.connect(mongoUri);

// ---------- Health ----------
app.get('/health', (req, res) => res.json({ ok: true }));

// ---------- Routes ----------
app.use('/auth', authRouter);
app.use('/equipment', equipmentRouter);
app.use('/requests', requestsRouter);
app.use('/settings', settingsRouter);
app.use('/export', exportRouter);

// ---------- Final not-found (ถ้าจำเป็น) ----------
// ใช้ middleware ท้ายสุดโดยไม่ใส่ path แทนการใช้ '*' เพื่อเลี่ยง path-to-regexp
app.use((req, res, next) => {
  if (res.headersSent) return next();
  return res.status(404).json({ error: 'Not found' });
});

// ---------- Error Handler ----------
app.use(errorHandler);

// ---------- Start ----------
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));

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

// --- CORS (รองรับ credentials + preflight) ---
const allowed = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsConfig = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // รองรับ curl / server-to-server
    if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};

// สำคัญ: Express v5 ห้ามใช้ '*' ให้ใช้ '(.*)'
app.options('(.*)', cors(corsConfig));
app.use(cors(corsConfig));

// --- Security/Middlewares ---
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// --- DB connect ---
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error('MONGODB_URI is required');
await mongoose.connect(mongoUri);

// --- Basic root & health ---
app.get('/', (req, res) => {
  res.type('text/plain').send('GA-Equipment API is running');
});
app.get('/health', (req, res) => res.json({ ok: true }));

// --- API routes ---
app.use('/auth', authRouter);
app.use('/equipment', equipmentRouter);
app.use('/requests', requestsRouter);
app.use('/settings', settingsRouter);
app.use('/export', exportRouter);

// --- 404 ที่ปลอดภัย (ไม่ใช้ '*') ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- error handler ---
app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));

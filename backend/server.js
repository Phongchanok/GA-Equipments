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

// เชื่อ reverse proxy (เช่น Render/Heroku/NGINX) เพื่อให้ cookie Secure ทำงานถูกต้อง
app.set('trust proxy', 1);

// ---------- CORS ----------
const allowedArr = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// ใช้ Set ให้เช็คไวขึ้น
const allowedSet = new Set(allowedArr);

// กำหนดตัวเลือก CORS เดียว ใช้ทั้งกับ use() และ options()
const corsOpts = {
  origin(origin, cb) {
    // อนุญาตกรณี same-origin / tools (ไม่มี Origin header)
    if (!origin) return cb(null, true);

    // ถ้าไม่ได้ตั้งค่าอะไรไว้เลย ให้สะท้อน origin กลับ (อนุญาตทั้งหมด)
    if (allowedSet.size === 0) return cb(null, true);

    if (allowedSet.has(origin)) return cb(null, true);

    // ไม่อนุญาต origin นี้
    return cb(new Error(`CORS: ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ตอบ preflight ให้ครบทุกเส้นทาง (สำคัญมากสำหรับ 502 จาก proxy)
app.options('*', cors(corsOpts));
// เปิด CORS สำหรับทุก request จริง
app.use(cors(corsOpts));

// ---------- Security / Utils ----------
app.use(helmet({
  // API อย่างเดียว ไม่เสิร์ฟไฟล์ static ข้ามโดเมน ปล่อยค่า default ก็พอ
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// ---------- DB ----------
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error('MONGODB_URI is required');
await mongoose.connect(mongoUri);

// ---------- Health & Root ----------
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => {
  res.type('text/plain').send('GA Equipment API is up');
});

// ---------- Routes ----------
app.use('/auth', authRouter);
app.use('/equipment', equipmentRouter);
app.use('/requests', requestsRouter);
app.use('/settings', settingsRouter);
app.use('/export', exportRouter);

// ---------- Error handlers ----------
// จัดการ error จาก CORS ไม่ให้ตกไปเป็น 502 (proxy)
app.use((err, req, res, next) => {
  if (err && String(err.message || '').startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }
  return next(err);
});

// ตัว error handler หลักของระบบ
app.use(errorHandler);

// ---------- Boot ----------
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));

// กัน process ล่มเงียบ ๆ
process.on('unhandledRejection', (e) => {
  console.error('unhandledRejection:', e);
});
process.on('uncaughtException', (e) => {
  console.error('uncaughtException:', e);
});

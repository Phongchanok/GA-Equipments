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

// CORS with credentials
const allowed = (process.env.CORS_ORIGIN || '')
.split(',')
.map(s => s.trim())
.filter(Boolean);
app.use(cors({
origin: (origin, cb) => {
if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
return cb(new Error('Not allowed by CORS'));
},
credentials: true
}));

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// DB connect
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error('MONGODB_URI is required');
await mongoose.connect(mongoUri);

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// routes
app.use('/auth', authRouter);
app.use('/equipment', equipmentRouter);
app.use('/requests', requestsRouter);
app.use('/settings', settingsRouter);
app.use('/export', exportRouter);

// error handler
app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));

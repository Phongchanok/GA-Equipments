// src/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { COOKIE_OPTIONS, signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
windowMs: 60 * 1000,
max: 10,
standardHeaders: true,
legacyHeaders: false
});

router.post('/login', loginLimiter, async (req, res) => {
const schema = z.object({ username: z.string().min(1), password: z.string().min(1) });
const { username, password } = schema.parse(req.body);

const user = await User.findOne({ username });
if (!user) return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

const token = signToken({ sub: user._id.toString(), role: user.role, name: user.name, username: user.username });
res.cookie('access_token', token, COOKIE_OPTIONS);
res.json({ user: { id: user._id, name: user.name, role: user.role, username: user.username } });
});

router.post('/logout', (req, res) => {
res.clearCookie('access_token', { ...COOKIE_OPTIONS, maxAge: 0 });
res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
const user = await User.findById(req.user.sub).select('name role username code');
res.json({ user });
});

// Quick inspector verify by code (for the current UI flow)
router.get('/inspectors/verify', async (req, res) => {
const code = String(req.query.code || '').trim();
if (!code) return res.status(400).json({ error: 'code is required' });
const user = await User.findOne({ role: 'inspector', code });
if (!user) return res.status(404).json({ error: 'ไม่พบผู้ตรวจสอบ' });
res.json({ inspector: { id: user._id, name: user.name, code: user.code } });
});

export default router;

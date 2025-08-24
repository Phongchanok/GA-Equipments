// src/routes/requests.js
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import Request from '../models/Request.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
const { page = '1', limit = '20', status = '' } = req.query;
const p = Math.max(parseInt(page, 10) || 1, 1);
const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
const filter = {};
if (status) filter.status = status;
const [items, total] = await Promise.all([
Request.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
Request.countDocuments(filter)
]);
res.json({ items, total, page: p, limit: l });
});

router.post('/', requireAuth, async (req, res) => {
const schema = z.object({ equipment: z.string().min(1), quantity: z.number().int().positive(), location: z.string().min(1), requester: z.string().min(1), note: z.string().optional() });
const body = schema.parse(req.body);
const r = await Request.create(body);
res.status(201).json({ request: r });
});

router.put('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
const schema = z.object({ status: z.enum(['รอตอบรับ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก']) });
const { status } = schema.parse(req.body);
const r = await Request.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
if (!r) return res.status(404).json({ error: 'ไม่พบคำร้องขอ' });
res.json({ request: r });
});

export default router;
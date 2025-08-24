// src/routes/equipment.js
import { Router } from 'express';
import { z } from 'zod';
import Equipment from '../models/Equipment.js';
import Inspection from '../models/Inspection.js';
import Settings from '../models/Settings.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// list
router.get('/', requireAuth, async (req, res) => {
  const { page = '1', limit = '20', query = '', type = '', location = '', status = '' } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const filter = {};
  if (query) filter.$or = [
    { code: new RegExp(query, 'i') },
    { name: new RegExp(query, 'i') }
  ];
  if (type) filter.type = type;
  if (location) filter.location = location;
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    Equipment.find(filter).sort({ code: 1 }).skip((p - 1) * l).limit(l),
    Equipment.countDocuments(filter)
  ]);
  res.json({ items, total, page: p, limit: l });
});

// get by code
router.get('/:code', requireAuth, async (req, res) => {
  const eq = await Equipment.findOne({ code: req.params.code });
  if (!eq) return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
  res.json({ equipment: eq });
});

// create (admin)
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const schema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    type: z.string().min(1),
    location: z.string().min(1),
    status: z.enum(['ปกติ', 'ผิดปกติ', 'รอตรวจสอบ']).optional()
  });
  const data = schema.parse(req.body);
  const exists = await Equipment.findOne({ code: data.code });
  if (exists) return res.status(409).json({ error: 'รหัสอุปกรณ์ซ้ำ' });
  const eq = await Equipment.create(data);
  res.status(201).json({ equipment: eq });
});

// update (admin)
router.put('/:code', requireAuth, requireRole('admin'), async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    status: z.enum(['ปกติ', 'ผิดปกติ', 'รอตรวจสอบ']).optional()
  });
  const patch = schema.parse(req.body);
  const eq = await Equipment.findOneAndUpdate(
    { code: req.params.code },
    { $set: patch },
    { new: true }
  );
  if (!eq) return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
  res.json({ equipment: eq });
});

// delete (admin)
router.delete('/:code', requireAuth, requireRole('admin'), async (req, res) => {
  const r = await Equipment.deleteOne({ code: req.params.code });
  if (r.deletedCount === 0) return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
  await Inspection.deleteMany({ equipmentCode: req.params.code });
  res.json({ ok: true });
});

// inspections: list
router.get('/:code/inspections', requireAuth, async (req, res) => {
  const { page = '1', limit = '20' } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const [items, total] = await Promise.all([
    Inspection.find({ equipmentCode: req.params.code }).sort({ date: -1 }).skip((p - 1) * l).limit(l),
    Inspection.countDocuments({ equipmentCode: req.params.code })
  ]);
  res.json({ items, total, page: p, limit: l });
});

// inspections: create
router.post('/:code/inspections', requireAuth, async (req, res) => {
  const schema = z.object({
    inspectorId: z.string().optional(),
    inspectorName: z.string().optional(),
    items: z.array(z.object({ label: z.string(), status: z.enum(['ปกติ', 'ผิดปกติ']) })),
    overallStatus: z.enum(['ปกติ', 'ผิดปกติ']),
    date: z.string().optional()
  });
  const data = schema.parse(req.body);

  const eq = await Equipment.findOne({ code: req.params.code });
  if (!eq) return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });

  const created = await Inspection.create({
    equipmentCode: req.params.code,
    ...data,
    date: data.date ? new Date(data.date) : new Date()
  });

  // Update equipment status & nextInspection based on settings interval
  eq.status = data.overallStatus;
  eq.lastInspection = created.date;
  const settings = await Settings.findOne();

  // ✅ แก้จาก .get(...) เป็น [] เพราะ inspectionIntervals เก็บเป็น object
  const days = (settings?.inspectionIntervals?.[eq.type]) ?? 30;

  eq.nextInspection = new Date(created.date.getTime() + days * 24 * 60 * 60 * 1000);
  await eq.save();

  res.status(201).json({ inspection: created, equipment: eq });
});

export default router;

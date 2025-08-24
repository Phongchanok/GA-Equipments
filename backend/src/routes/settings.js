// src/routes/settings.js
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import Settings from '../models/Settings.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
let s = await Settings.findOne();
if (!s) {
s = await Settings.create({
equipmentTypes: ['เครื่องปรับอากาศ', 'เครื่องพิมพ์', 'คอมพิวเตอร์', 'เครื่องถ่ายเอกสาร'],
locations: ['ห้องประชุม A', 'ห้องทำงาน B', 'ห้องทำงาน C', 'ห้องแผนก D'],
inspectionIntervals: { 'เครื่องปรับอากาศ': 30, 'เครื่องพิมพ์': 60, 'คอมพิวเตอร์': 90, 'เครื่องถ่ายเอกสาร': 45 },
inspectionChecklists: {}
});
}
res.json({ settings: s });
});

router.put('/', requireAuth, requireRole('admin'), async (req, res) => {
const schema = z.object({
equipmentTypes: z.array(z.string()).optional(),
locations: z.array(z.string()).optional(),
inspectionIntervals: z.record(z.number().int().positive()).optional(),
inspectionChecklists: z.record(z.array(z.object({ item: z.string(), note: z.string().optional() }))).optional()
});
const patch = schema.parse(req.body);
let s = await Settings.findOne();
if (!s) s = new Settings();

if (patch.equipmentTypes) s.equipmentTypes = patch.equipmentTypes;
if (patch.locations) s.locations = patch.locations;
if (patch.inspectionIntervals) s.inspectionIntervals = patch.inspectionIntervals;
if (patch.inspectionChecklists) s.inspectionChecklists = patch.inspectionChecklists;

await s.save();
res.json({ settings: s });
});

export default router;

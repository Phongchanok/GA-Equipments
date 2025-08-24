// src/routes/export.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Equipment from '../models/Equipment.js';
import Request from '../models/Request.js';
import { toCSV } from '../utils/csv.js';

const router = Router();

router.get('/equipment', requireAuth, async (req, res) => {
  const rows = await Equipment.find().sort({ code: 1 }).lean();
  const headers = ['code', 'name', 'type', 'location', 'status', 'lastInspection', 'nextInspection'];
  const csv = toCSV(rows, headers);
  res.setHeader('content-type', 'text/csv; charset=utf-8');
  res.setHeader('content-disposition', 'attachment; filename="equipment.csv"');
  res.send('\ufeff' + csv);
});

router.get('/requests', requireAuth, async (req, res) => {
  const rows = await Request.find().sort({ createdAt: -1 }).lean();
  // ✅ เพิ่มคอลัมน์ note
  const headers = ['date', 'equipment', 'quantity', 'location', 'requester', 'status', 'note'];
  const csv = toCSV(rows, headers);
  res.setHeader('content-type', 'text/csv; charset=utf-8');
  res.setHeader('content-disposition', 'attachment; filename="requests.csv"');
  res.send('\ufeff' + csv);
});

export default router;

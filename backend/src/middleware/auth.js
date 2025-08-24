// src/middleware/auth.js
import jwt from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';

// ถ้ากำหนด CORS_ORIGIN แปลว่าเรียกข้ามโดเมน ให้ตั้ง SameSite=None; Secure=true
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const isCrossSite = allowedOrigins.length > 0;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,                 // บน Render เป็น HTTPS อยู่แล้ว
  sameSite: isCrossSite ? 'none' : 'lax',
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 7 // 7 วัน
};

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

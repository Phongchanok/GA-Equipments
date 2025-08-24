// src/middleware/auth.js
import jwt from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';

// ถ้าตั้งค่า COOKIE_SAMESITE ไว้ให้ตามนั้น, ไม่งั้นถ้ามี cross-site ให้เป็น 'none' เพื่อให้ cookie ส่งข้ามโดเมนได้
const inferredSameSite =
  process.env.COOKIE_SAMESITE ||
  // ถ้ามีการกำหนด CORS_ORIGIN และดูเหมือนข้ามโดเมน ให้ none
  ((process.env.CORS_ORIGIN || '').split(',').some(o => o && !o.includes('localhost')) ? 'none' : 'lax');

export const COOKIE_OPTIONS = {
  httpOnly: true,
  // ถ้า SameSite เป็น none จะต้อง Secure = true เสมอ
  secure: isProd || inferredSameSite === 'none',
  sameSite: inferredSameSite, // 'none' | 'lax' | 'strict'
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 วัน
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

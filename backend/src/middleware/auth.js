// src/middleware/auth.js
import jwt from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';
// ถ้า frontend อยู่คนละโดเมน ให้ตั้ง CROSS_SITE_COOKIES=true ใน env
const crossSite = process.env.CROSS_SITE_COOKIES === 'true';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd && (process.env.COOKIE_SECURE !== 'false'), // บน https เท่านั้นใน prod
  sameSite: crossSite ? 'none' : 'lax',
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

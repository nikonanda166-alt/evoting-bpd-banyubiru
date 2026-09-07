const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbGet } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'banyubiru_bpd_secret_key_2027_2034_secure!';

// Buat token JWT untuk sesi admin (masa aktif 12 jam)
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

// Middleware otentikasi admin
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token otorisasi tidak ditemukan.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ success: false, message: 'Format token otorisasi tidak valid (Gunakan Bearer <token>).' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Sesi login telah kedaluwarsa atau token tidak valid. Silakan login kembali.' });
  }
}

// Verifikasi kredensial admin
async function verifyAdminCredentials(username, password) {
  if (!username || !password) return null;
  const admin = await dbGet('SELECT * FROM admin WHERE username = ?', [username.trim()]);
  if (!admin) return null;

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) return null;

  return { id: admin.id, username: admin.username };
}

module.exports = {
  generateToken,
  requireAdminAuth,
  verifyAdminCredentials
};

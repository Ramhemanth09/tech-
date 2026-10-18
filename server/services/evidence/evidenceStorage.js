import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.resolve(__dirname, '../../../uploads/evidence');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Magic bytes validation for safe document formats (PDF, PNG, JPG, JPEG)
const MAGIC_SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  jpg: [0xff, 0xd8, 0xff],
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
};

export function validateMagicBytes(buffer, extension) {
  const ext = extension.toLowerCase().replace('.', '');
  const signature = MAGIC_SIGNATURES[ext];
  if (!signature) return false;

  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }
  return true;
}

export function maskSerialNumber(serial) {
  if (!serial || typeof serial !== 'string') return '';
  const clean = serial.trim();
  if (clean.length <= 4) return '••••';
  const last4 = clean.slice(-4);
  return `••••-••••-${last4}`;
}

export function generateSecureFilePath(originalName) {
  const safeExt = path.extname(originalName).toLowerCase();
  const randomHex = crypto.randomBytes(16).toString('hex');
  const safeName = `${Date.now()}_${randomHex}${safeExt}`;
  return path.join(UPLOAD_DIR, safeName);
}

export function generateSignedAccessToken(evidenceId, userId, ttlSeconds = 3600) {
  const payload = `${evidenceId}:${userId}:${Date.now() + ttlSeconds * 1000}`;
  const hmac = crypto.createHmac('sha256', process.env.SESSION_SECRET || 'secret_key').update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

export function verifySignedAccessToken(token, evidenceId, userId) {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const [tokenEvidenceId, tokenUserId, expiresAtStr, hmac] = raw.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);

    if (Date.now() > expiresAt) return false;
    if (tokenEvidenceId !== evidenceId.toString()) return false;
    if (tokenUserId !== userId.toString()) return false;

    const expectedHmac = crypto
      .createHmac('sha256', process.env.SESSION_SECRET || 'secret_key')
      .update(`${tokenEvidenceId}:${tokenUserId}:${expiresAtStr}`)
      .digest('hex');

    return expectedHmac === hmac;
  } catch (err) {
    return false;
  }
}

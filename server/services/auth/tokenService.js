import crypto from 'crypto';
import { Token } from '../../models/Token.js';

export async function createExpiringToken(userId, tokenType, expirationMinutes = 60) {
  // Invalidate any existing unused token for this user and type
  await Token.deleteMany({ userId, tokenType, isConsumed: false });

  // Generate a cryptographically secure random token string
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  await Token.create({
    userId,
    tokenHash,
    tokenType,
    expiresAt,
    isConsumed: false,
  });

  return rawToken;
}

export async function verifyAndConsumeToken(rawToken, tokenType) {
  if (!rawToken) {
    return { valid: false, error: 'Token is required' };
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenRecord = await Token.findOne({
    tokenHash,
    tokenType,
    isConsumed: false,
  });

  if (!tokenRecord) {
    return { valid: false, error: 'Invalid or expired token' };
  }

  if (new Date() > tokenRecord.expiresAt) {
    return { valid: false, error: 'Token has expired' };
  }

  // Mark token consumed (single-use)
  tokenRecord.isConsumed = true;
  await tokenRecord.save();

  return { valid: true, userId: tokenRecord.userId };
}

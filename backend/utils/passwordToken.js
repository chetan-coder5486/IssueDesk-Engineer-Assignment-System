import crypto from 'crypto';

// Generate a secure random token and a SHA256-hashed version for storage
export function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hashedToken };
}

// Hash a provided token (used when verifying a token sent by client)
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

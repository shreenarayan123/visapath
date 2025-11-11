import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Hash API key for secure storage
 */
export const hashApiKey = (apiKey: string): string => {
  const salt = process.env.API_KEY_SALT || 'default-salt-change-in-production';
  return crypto
    .createHmac('sha256', salt)
    .update(apiKey)
    .digest('hex');
};

/**
 * Generate a random API key
 */
export const generateApiKey = (): string => {
  return `vsk_${crypto.randomBytes(32).toString('hex')}`;
};

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

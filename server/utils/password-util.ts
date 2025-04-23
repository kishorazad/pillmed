import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Hashes a password using the scrypt algorithm
 * Returns the hash in the format: hash.salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Verifies a password against a hashed password
 * The hashed password should be in the format: hash.salt
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const [hash, salt] = hashedPassword.split('.');
    const hashBuffer = Buffer.from(hash, 'hex');
    const suppliedHashBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(hashBuffer, suppliedHashBuffer);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Log password details for debugging (use only in development)
 */
export function logPasswordDetails(context: string, password: string, hashedPassword: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${context}] Password: ${password.substring(0, 3)}***`);
    console.log(`[${context}] Hashed password format: ${hashedPassword.substring(0, 10)}...${hashedPassword.substring(hashedPassword.length - 10)}`);
    console.log(`[${context}] Hashed password length: ${hashedPassword.length}`);
    const [hash, salt] = hashedPassword.split('.');
    console.log(`[${context}] Hash part length: ${hash.length}, Salt part length: ${salt.length}`);
  }
}
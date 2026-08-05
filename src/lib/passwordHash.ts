import bcrypt from 'bcryptjs';

/**
 * Securely hashes an administrative or staff password using bcrypt with salt.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Synchronously hashes an administrative password using bcrypt.
 */
export function hashPasswordSync(password: string): string {
  if (!password) return '';
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error('Bcrypt password comparison error:', err);
    return false;
  }
}

/**
 * Synchronously compares a plaintext password against a stored bcrypt hash.
 */
export function comparePasswordSync(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  try {
    return bcrypt.compareSync(password, hash);
  } catch (err) {
    console.error('Bcrypt password comparison error:', err);
    return false;
  }
}

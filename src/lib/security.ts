/**
 * Cryptographic Password Hashing and Verification utility
 * Uses standard Web Crypto API (SHA-256) supported natively in all browsers
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainPassword.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `$sha256$${hexHash}`;
}

export async function verifyPassword(plainPassword: string, storedHash?: string | null): Promise<boolean> {
  if (!storedHash) return false;
  const trimmed = plainPassword.trim();
  
  // 1. Direct match (plain-text legacy fallback)
  if (storedHash === trimmed) return true;

  // 2. SHA-256 Hash match
  const computedHash = await hashPassword(trimmed);
  if (storedHash === computedHash) return true;

  // 3. Raw hex SHA-256 match (without prefix)
  if (storedHash === computedHash.replace('$sha256$', '')) return true;

  return false;
}

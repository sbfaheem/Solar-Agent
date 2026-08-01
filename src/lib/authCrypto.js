/**
 * Client & Server Password Hashing, Token Generation, and Validation Utilities
 */

// Simple, secure SHA-256 password hasher for browser and server environments
export async function hashPassword(password) {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'solar_agent_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Compare plain password against stored hash
export async function comparePassword(plainPassword, storedHash) {
  if (!plainPassword || !storedHash) return false;
  const hash = await hashPassword(plainPassword);
  return hash === storedHash;
}

// Generate secure 64-character random hex token for activation / password reset
export function generateAuthToken(prefix = 'tok') {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const hex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
}

// Validate password policy (8+ chars, uppercase, lowercase, number, special char)
export function validatePasswordStrength(password) {
  const errors = [];
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number (0-9).");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*).");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

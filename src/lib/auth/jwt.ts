import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';
const JWT_EXPIRES_IN = '8h';

export interface TokenPayload {
  userId: string;
  email: string;
  perfil: string;
}

/**
 * Generates a JWT for a user.
 * @param payload - The data to include in the token.
 * @returns The generated JWT.
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifies a JWT.
 * @param token - The token to verify.
 * @returns The decoded payload if valid, null otherwise.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('[Auth.verifyToken] Error verifying token:', error);
    return null;
  }
}

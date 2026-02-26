import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

// Cache optionnel pour éviter de re-vérifier le même token
const tokenCache = new Map<string, { payload: JWTPayload; exp: number }>();

export async function signToken(
  payload: Record<string, unknown>,
  expiresIn: string = "30d",
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string, useCache = false) {
  // Vérifier le cache si activé
  if (useCache) {
    const cached = tokenCache.get(token);
    if (cached && Date.now() < cached.exp) {
      return cached.payload;
    }
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    // Mettre en cache si activé
    if (useCache && typeof payload.exp === "number") {
      tokenCache.set(token, { payload, exp: payload.exp * 1000 });
      // Nettoyer le cache périodiquement
      if (tokenCache.size > 1000) {
        const now = Date.now();
        for (const [key, value] of tokenCache.entries()) {
          if (now >= value.exp) tokenCache.delete(key);
        }
      }
    }

    return payload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  // Priorité au cookie HttpOnly
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
    if (match) return match[1];
  }
  
  // Fallback sur Authorization header (pour compatibilité)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);
  
  return null;
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? 'Secure;' : '';
  
  return [
    `accessToken=${accessToken}; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`,
    `refreshToken=${refreshToken}; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`
  ];
}

export function clearAuthCookies() {
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? 'Secure;' : '';
  
  return [
    `accessToken=; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    `refreshToken=; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  ];
}

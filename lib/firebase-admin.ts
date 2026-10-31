import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";

const ADMIN_APP_NAME = "admin";

let adminAuth: Auth | null = null;

// Initialised on first use so that importing this module (e.g. during
// `next build`) doesn't require the service account credentials.
function getAdminAuth(): Auth {
  if (adminAuth) return adminAuth;

  let app: App;
  if (getApps().some((a) => a.name === ADMIN_APP_NAME)) {
    app = getApp(ADMIN_APP_NAME);
  } else if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    // The Auth emulator accepts unsigned tokens, so no credentials are needed.
    app = initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID }, ADMIN_APP_NAME);
  } else {
    app = initializeApp(
      {
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      },
      ADMIN_APP_NAME
    );
  }

  adminAuth = getAuth(app);
  return adminAuth;
}

interface TokenCacheEntry {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  expiry: number;
}

const tokenCache = new Map<string, TokenCacheEntry>();
const TOKEN_CACHE_TTL = 5 * 60 * 1000;
const TOKEN_CACHE_MAX_ENTRIES = 1000;

function pruneTokenCache() {
  const now = Date.now();
  for (const [token, entry] of tokenCache) {
    if (entry.expiry <= now) tokenCache.delete(token);
  }
  // Map iterates in insertion order, so this drops the oldest entries first.
  while (tokenCache.size >= TOKEN_CACHE_MAX_ENTRIES) {
    const oldest = tokenCache.keys().next().value;
    if (oldest === undefined) break;
    tokenCache.delete(oldest);
  }
}

export async function verifyFirebaseToken(token: string) {
  try {
    const cached = tokenCache.get(token);
    if (cached && Date.now() < cached.expiry) {
      return { uid: cached.uid, email: cached.email, name: cached.name, picture: cached.picture };
    }

    const decodedToken = await getAdminAuth().verifyIdToken(token);

    // Never cache past the token's own expiry.
    pruneTokenCache();
    tokenCache.set(token, {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      expiry: Math.min(Date.now() + TOKEN_CACHE_TTL, decodedToken.exp * 1000),
    });

    return decodedToken;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const authError = error as { code: string };
      if (authError.code === 'auth/id-token-expired' || 
          authError.code === 'auth/id-token-revoked' ||
          authError.code === 'auth/session-cookie-expired') {
        console.warn("Firebase token expired, user may need to re-authenticate");
        return null;
      }
    }
    console.error("Error verifying Firebase token:", error);
    return null;
  }
}

export async function getFirebaseUser(uid: string) {
  try {
    const userRecord = await getAdminAuth().getUser(uid);
    return {
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
    };
  } catch (error) {
    console.error("[Firebase Admin] Failed to get user:", error);
    return null;
  }
}

export async function getUserIdFromCookie(cookieValue: string) {
  const decodedToken = await verifyFirebaseToken(cookieValue);
  if (decodedToken) {
    return decodedToken.uid;
  }
  return null;
}

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

const adminApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseAdminConfig, "admin");
const adminAuth = getAuth(adminApp);

interface TokenCacheEntry {
  uid: string;
  expiry: number;
}

const tokenCache = new Map<string, TokenCacheEntry>();
const TOKEN_CACHE_TTL = 5 * 60 * 1000;

export async function verifyFirebaseToken(token: string) {
  try {
    const cached = tokenCache.get(token);
    if (cached && Date.now() < cached.expiry) {
      return { uid: cached.uid };
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    
    tokenCache.set(token, {
      uid: decodedToken.uid,
      expiry: Date.now() + TOKEN_CACHE_TTL,
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

export async function getUserIdFromCookie(cookieValue: string) {
  const decodedToken = await verifyFirebaseToken(cookieValue);
  if (decodedToken) {
    return decodedToken.uid;
  }
  return null;
}

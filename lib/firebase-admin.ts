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

export async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
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

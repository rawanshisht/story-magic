import { cookies } from "next/headers";
import { verifyFirebaseToken, getFirebaseUser } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const firebaseAuth = cookieStore.get("firebase-auth");

  if (!firebaseAuth) {
    return null;
  }

  const decodedToken = await verifyFirebaseToken(firebaseAuth.value);
  if (!decodedToken) {
    return null;
  }

  // Ensure the user record exists in the database and return the DB user ID
  try {
    let email = decodedToken.email;
    let name = decodedToken.name;
    let picture = decodedToken.picture;

    // If email is missing from token, fetch from Firebase Admin
    if (!email) {
      const firebaseUser = await getFirebaseUser(decodedToken.uid);
      if (firebaseUser) {
        email = firebaseUser.email;
        name = name || firebaseUser.displayName;
        picture = picture || firebaseUser.photoURL;
      }
    }

    if (email) {
      const user = await prisma.user.upsert({
        where: { email },
        create: {
          id: decodedToken.uid,
          email,
          name: name || email.split("@")[0],
          image: picture || null,
        },
        update: {},
      });
      return user.id;
    }

    console.error("[Auth] No email found for Firebase UID:", decodedToken.uid);
    return null;
  } catch (error) {
    console.error("[Auth] Failed to ensure user in database:", error);
    return null;
  }
}

export async function requireAuth(): Promise<string | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    redirect("/login");
  }
  return userId;
}

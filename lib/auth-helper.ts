import { cookies } from "next/headers";
import { verifyFirebaseToken } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";

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

  return decodedToken.uid;
}

export async function requireAuth(): Promise<string | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    redirect("/login");
  }
  return userId;
}

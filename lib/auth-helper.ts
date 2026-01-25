import { cookies } from "next/headers";
import { verifyFirebaseToken } from "@/lib/firebase-admin";

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

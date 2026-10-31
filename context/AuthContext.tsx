"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  browserPopupRedirectResolver,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onIdTokenChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearAuthCookie, getPostLoginRedirect, setAuthCookie } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function syncUserToDatabase(user: User, idToken: string) {
  try {
    const response = await fetch("/api/auth/sync-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        name: user.displayName,
        photoURL: user.photoURL,
      }),
    });
    if (!response.ok) {
      console.error("Failed to sync user to database:", response.status);
    }
  } catch (error) {
    console.error("Failed to sync user to database:", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedUid = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fires on sign-in, sign-out and whenever Firebase refreshes the ID token
    // (roughly hourly), which keeps the server-side auth cookie valid.
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          setAuthCookie(idToken);
          if (syncedUid.current !== user.uid) {
            syncedUid.current = user.uid;
            await syncUserToDatabase(user, idToken);
          }
        } catch (error) {
          console.error("Failed to get ID token:", error);
          clearAuthCookie();
        }
      } else {
        syncedUid.current = null;
        clearAuthCookie();
      }

      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set the cookie before navigating so the middleware sees the new session.
  const completeSignIn = async (user: User) => {
    const idToken = await user.getIdToken();
    setAuthCookie(idToken);
    syncedUid.current = user.uid;
    await syncUserToDatabase(user, idToken);
    router.push(getPostLoginRedirect());
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    await completeSignIn(result.user);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await completeSignIn(result.user);
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    if (name) {
      await updateProfile(user, { displayName: name });
    }

    await completeSignIn(user);
  };

  const logout = async () => {
    clearAuthCookie();
    await signOut(auth);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

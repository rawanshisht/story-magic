import { FirebaseError } from "firebase/app";

export const AUTH_COOKIE = "firebase-auth";
// Firebase ID tokens are valid for one hour.
const AUTH_COOKIE_MAX_AGE = 60 * 60;

export function setAuthCookie(idToken: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE}=${idToken}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
}

/**
 * Where to send the user after signing in: the `callbackUrl` set by the
 * middleware if it is a same-site path, otherwise the dashboard.
 */
export function getPostLoginRedirect(): string {
  const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
  if (
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !callbackUrl.startsWith("/\\")
  ) {
    return callbackUrl;
  }
  return "/dashboard";
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-login-credentials": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/weak-password": "Please choose a stronger password (at least 8 characters).",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Please check your connection and try again.",
  "auth/popup-blocked": "The sign-in popup was blocked. Please allow popups for this site.",
  "auth/popup-closed-by-user": "The sign-in popup was closed before finishing.",
  "auth/cancelled-popup-request": "The sign-in popup was closed before finishing.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/operation-not-allowed": "This sign-in method is not enabled.",
  "auth/unauthorized-domain": "Sign-in is not allowed from this domain.",
};

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

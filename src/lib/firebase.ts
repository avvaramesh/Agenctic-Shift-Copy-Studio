import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { UserProfile } from "../types";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive OAuth Scopes & Offline Access for background token refresh
provider.addScope("https://www.googleapis.com/auth/drive.readonly");
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/drive");
// Request offline access so Google returns refresh tokens for long background transfers
provider.setCustomParameters({
  access_type: "offline",
  prompt: "consent",
});

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let cachedTokenExpiry: number | null = null;
let isSigningIn = false;

export const getCachedToken = () => cachedAccessToken;

export const initAuthListener = (
  onSuccess: (profile: UserProfile) => void,
  onFail: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onSuccess({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          accessToken: cachedAccessToken,
          refreshToken: cachedRefreshToken,
          tokenExpiry: cachedTokenExpiry,
          provider: "google",
        });
      } else if (!isSigningIn) {
        // Try getting token if possible or prompt user
        onFail();
      }
    } else {
      cachedAccessToken = null;
      cachedRefreshToken = null;
      cachedTokenExpiry = null;
      onFail();
    }
  });
};

export const signInWithGoogle = async (forceSelectAccount = false): Promise<UserProfile> => {
  try {
    isSigningIn = true;
    if (forceSelectAccount) {
      provider.setCustomParameters({
        access_type: "offline",
        prompt: "select_account consent",
      });
    } else {
      provider.setCustomParameters({
        access_type: "offline",
        prompt: "consent",
      });
    }
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error("Could not retrieve Google OAuth access token from sign-in");
    }

    cachedAccessToken = credential.accessToken;
    // Extract refresh token if available from OAuth credential or user object
    cachedRefreshToken = (credential as any).refreshToken || (result.user as any).refreshToken || null;
    // Access token validity default is 3600 seconds (60 mins)
    cachedTokenExpiry = Date.now() + 3600 * 1000;

    return {
      uid: result.user.uid,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      accessToken: cachedAccessToken,
      refreshToken: cachedRefreshToken,
      tokenExpiry: cachedTokenExpiry,
      provider: "google",
    };
  } catch (error: any) {
    console.error("Firebase Google Auth Sign-in Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogle = async (): Promise<void> => {
  cachedAccessToken = null;
  cachedRefreshToken = null;
  cachedTokenExpiry = null;
  await firebaseSignOut(auth);
};

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  reload
} from "firebase/auth";
import { auth } from "../firebase";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  emailVerified: boolean;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  reloadUser: () => Promise<boolean>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setEmailVerified(user?.emailVerified ?? false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile display name immediately
    if (displayName.trim()) {
      await updateProfile(user, {
        displayName: displayName.trim()
      });
    }

    // Automatically send verification email
    try {
      await sendEmailVerification(user);
    } catch (verErr) {
      console.warn("Could not dispatch initial verification email:", verErr);
    }

    // Refresh state
    await user.reload();
    setCurrentUser(auth.currentUser);
    setEmailVerified(auth.currentUser?.emailVerified ?? false);

    return user;
  };

  const loginWithEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setCurrentUser(userCredential.user);
    setEmailVerified(userCredential.user.emailVerified);
    return userCredential.user;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    setCurrentUser(result.user);
    setEmailVerified(result.user.emailVerified);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setEmailVerified(false);
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found.");
    }
    await sendEmailVerification(auth.currentUser);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const reloadUser = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await reload(auth.currentUser);
    const updated = auth.currentUser;
    setCurrentUser({ ...updated } as User);
    setEmailVerified(updated.emailVerified);
    return updated.emailVerified;
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) throw new Error("No authenticated user found.");
    await updateProfile(auth.currentUser, {
      displayName: displayName.trim(),
      photoURL: photoURL || auth.currentUser.photoURL
    });
    await reloadUser();
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error("No authenticated user found.");
    await updatePassword(auth.currentUser, newPassword);
    await reloadUser();
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error("No authenticated user found.");
    await deleteUser(auth.currentUser);
    setCurrentUser(null);
    setEmailVerified(false);
  };

  const value = {
    currentUser,
    loading,
    emailVerified,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    sendVerificationEmail,
    resetPassword,
    reloadUser,
    updateUserProfile,
    updateUserPassword,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

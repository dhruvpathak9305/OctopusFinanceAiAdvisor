/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Platform, Alert } from "react-native";
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../services/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  authenticateUser, 
  getBiometricCredentials, 
  saveBiometricCredentials 
} from "../services/security/biometricService";

const getStorage = () => {
  if (Platform.OS === "web") {
    return {
      getItem: async (key: string) => {
        try { return localStorage.getItem(key); } catch { return null; }
      },
      setItem: async (key: string, value: string) => {
        try { localStorage.setItem(key, value); } catch (e) { console.log("Storage error:", e); }
      },
      removeItem: async (key: string) => {
        try { localStorage.removeItem(key); } catch (e) { console.log("Storage error:", e); }
      },
    };
  }
  return AsyncStorage;
};

const SESSION_KEY = "octopusUnifiedSession";

// Map technical errors to user-friendly messages
const getUserFriendlyError = (error: Error | string): string => {
  const errorMsg = typeof error === "string" ? error : error.message;
  const lowerError = errorMsg.toLowerCase();

  if (lowerError.includes("network request failed") || lowerError.includes("network error")) {
    return "Unable to connect. Please check your internet connection and try again.";
  }
  if (lowerError.includes("timeout") || lowerError.includes("timed out")) {
    return "Connection timed out. Please check your internet and try again.";
  }
  if (lowerError.includes("offline")) {
    return "You appear to be offline. Please connect to the internet and try again.";
  }
  if (lowerError.includes("invalid login credentials") || lowerError.includes("invalid email or password")) {
    return "Invalid email or password. Please try again.";
  }
  if (lowerError.includes("email not confirmed")) {
    return "Please verify your email before signing in. Check your inbox for the confirmation link.";
  }
  if (lowerError.includes("user not found") || lowerError.includes("no user found")) {
    return "No account found with this email. Please sign up first.";
  }
  if (lowerError.includes("email already registered") || lowerError.includes("already exists")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (lowerError.includes("rate limit") || lowerError.includes("too many requests")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (lowerError.includes("password") && lowerError.includes("weak")) {
    return "Password is too weak. Use at least 8 characters with letters and numbers.";
  }
  if (lowerError.includes("500") || lowerError.includes("internal server error")) {
    return "Something went wrong on our end. Please try again later.";
  }
  if (lowerError.includes("503") || lowerError.includes("service unavailable")) {
    return "Service temporarily unavailable. Please try again in a few minutes.";
  }
  if (errorMsg.length > 100 || lowerError.includes("error") || lowerError.includes("exception")) {
    return "Something went wrong. Please try again.";
  }
  return errorMsg;
};

interface UnifiedAuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  loginWithBiometrics: () => Promise<boolean>;
  clearError: () => void;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // True only during initial check
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const isInitializedRef = useRef(false);

  const storage = getStorage();

  const setSessionMarker = useCallback(async (value: string | null) => {
    try {
      if (value) { await storage.setItem(SESSION_KEY, value); }
      else { await storage.removeItem(SESSION_KEY); }
    } catch (e) { console.log("Session marker error:", e); }
  }, [storage]);

  const handleAuthChange = useCallback(async (event: AuthChangeEvent, currentSession: Session | null) => {
    console.log("UnifiedAuth: Auth state changed:", event);

    if (event === "SIGNED_IN" && currentSession) {
      setSession(currentSession);
      setUser(currentSession.user);
      setIsAuthenticated(true);
      await setSessionMarker("true");
    } else if (event === "SIGNED_OUT") {
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      await setSessionMarker(null);
    } else if (event === "TOKEN_REFRESHED" && currentSession) {
      setSession(currentSession);
      setUser(currentSession.user);
    }
  }, [setSessionMarker]);

  const setupAuthListener = useCallback(() => {
    if (subscriptionRef.current) return;
    console.log("UnifiedAuth: Setting up auth listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    subscriptionRef.current = subscription;
  }, [handleAuthChange]);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initialize = async () => {
      try {
        const hadPreviousSession = await storage.getItem(SESSION_KEY);
        
        if (hadPreviousSession === "true") {
          console.log("UnifiedAuth: Previous session marker found");
          setupAuthListener();
          
          try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession) {
              setSession(currentSession);
              setUser(currentSession.user);
              setIsAuthenticated(true);
              console.log("UnifiedAuth: Session restored");
            } else {
              await setSessionMarker(null);
              console.log("UnifiedAuth: Previous session invalid");
            }
          } catch (err) {
            console.log("UnifiedAuth: Could not restore session (offline?)");
          }
        } else {
          console.log("UnifiedAuth: No previous session, app ready for login");
        }
      } catch (err) {
        console.log("UnifiedAuth: Initialization error");
      } finally {
        setLoading(false); // Initial check complete
      }
    };

    initialize();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [storage, setupAuthListener, setSessionMarker]);

  const clearError = useCallback(() => { setError(null); }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    // Don't set loading - form has its own isSubmitting state
    
    try {
      setupAuthListener();
      console.log("UnifiedAuth: Attempting sign up for:", email);

      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      
      if (signUpError) {
        const userMsg = getUserFriendlyError(signUpError);
        setError(userMsg);
        if (Platform.OS !== "web") {
          Alert.alert("Sign Up Failed", userMsg, [{ text: "OK" }]);
        }
        return false;
      }

      console.log("UnifiedAuth: Sign up successful");
      if (Platform.OS !== "web") {
        Alert.alert("Check Your Email", "We've sent you a confirmation link. Please verify your email to continue.", [{ text: "OK" }]);
      }
      return true;
    } catch (err) {
      const userMsg = getUserFriendlyError(err instanceof Error ? err : "Unknown error");
      setError(userMsg);
      if (Platform.OS !== "web") {
        Alert.alert("Sign Up Failed", userMsg, [{ text: "OK" }]);
      }
      return false;
    }
  }, [setupAuthListener]);

  const signIn = useCallback(async (email: string, password: string, _rememberMe?: boolean): Promise<boolean> => {
    setError(null);
    // Don't set loading - form has its own isSubmitting state
    
    try {
      setupAuthListener();
      console.log("UnifiedAuth: Attempting sign in for:", email);
      await setSessionMarker(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        const userMsg = getUserFriendlyError(signInError);
        setError(userMsg);
        if (Platform.OS !== "web") {
          Alert.alert("Sign In Failed", userMsg, [{ text: "OK" }]);
        }
        return false;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(true);
        await setSessionMarker("true");
        // Save credentials for future biometric login
        if (Platform.OS !== "web") {
           const saved = await saveBiometricCredentials(email, password);
           console.log("UnifiedAuth: Credentials saved for biometrics:", saved);
        }
      }

      console.log("UnifiedAuth: Sign in successful for:", email);
      return true;
    } catch (err) {
      const userMsg = getUserFriendlyError(err instanceof Error ? err : "Unknown error");
      setError(userMsg);
      if (Platform.OS !== "web") {
        Alert.alert("Sign In Failed", userMsg, [{ text: "OK" }]);
      }
      return false;
    }
  }, [setSessionMarker, setupAuthListener]);

  const signOut = useCallback(async (): Promise<boolean> => {
    setError(null);
    
    try {
      console.log("UnifiedAuth: Attempting sign out");
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        const userMsg = getUserFriendlyError(signOutError);
        setError(userMsg);
        if (Platform.OS !== "web") {
          Alert.alert("Sign Out Failed", userMsg, [{ text: "OK" }]);
        }
        return false;
      }

      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      await setSessionMarker(null);

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      console.log("UnifiedAuth: Sign out successful");
      return true;
    } catch (err) {
      const userMsg = getUserFriendlyError(err instanceof Error ? err : "Unknown error");
      setError(userMsg);
      if (Platform.OS !== "web") {
        Alert.alert("Sign Out Failed", userMsg, [{ text: "OK" }]);
      }
      return false;
    }
  }, [setSessionMarker]);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    setError(null);
    
    try {
      console.log("UnifiedAuth: Requesting password reset for:", email);
      const redirectUrl = Platform.OS === "web"
        ? (typeof window !== "undefined" ? window.location.origin : "") + "/reset-password"
        : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      
      if (resetError) {
        const userMsg = getUserFriendlyError(resetError);
        setError(userMsg);
        if (Platform.OS !== "web") {
          Alert.alert("Password Reset Failed", userMsg, [{ text: "OK" }]);
        }
        return false;
      }

      console.log("UnifiedAuth: Password reset email sent");
      if (Platform.OS !== "web") {
        Alert.alert("Reset Link Sent", "Check your email for the password reset link.", [{ text: "OK" }]);
      }
      return true;
    } catch (err) {
      const userMsg = getUserFriendlyError(err instanceof Error ? err : "Unknown error");
      setError(userMsg);
      if (Platform.OS !== "web") {
        Alert.alert("Password Reset Failed", userMsg, [{ text: "OK" }]);
      }
      return false;
    }

  }, []);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      console.log("UnifiedAuth: Attempting account deletion");
      
      const { error } = await supabase.functions.invoke('delete-account');

      if (error) throw error;

      // Sign out after successful deletion
      await signOut();

      if (Platform.OS !== "web") {
        Alert.alert("Account Deleted", "Your account and all data have been permanently deleted.", [{ text: "OK" }]);
      }
      return true;
    } catch (err) {
      const userMsg = getUserFriendlyError(err instanceof Error ? err : "Unknown error");
      setError(userMsg);
      if (Platform.OS !== "web") {
        Alert.alert("Deletion Failed", userMsg, [{ text: "OK" }]);
      }
      return false;
    }
  }, [signOut]);

  const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      console.log("UnifiedAuth: Attempting biometric login");
      
      const credentials = await getBiometricCredentials();
      if (!credentials) {
         setError("No biometric credentials found. Please log in with password first.");
         return false;
      }

      // Authenticate
      const authenticated = await authenticateUser();
      if (!authenticated) {
        return false; // User cancelled or failed
      }
      
      // Attempt login with stored credentials
      return await signIn(credentials.email, credentials.password);

    } catch (err) {
      console.error("Biometric login error", err);
      setError("Biometric login failed.");
      return false;
    }
  }, [signIn]);

  const value: UnifiedAuthContextType = {
    session, user, loading, error, isAuthenticated,
    signUp, signIn, signOut, resetPassword, deleteAccount, loginWithBiometrics, clearError,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export function useUnifiedAuth(): UnifiedAuthContextType {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error("useUnifiedAuth must be used within a UnifiedAuthProvider");
  }
  return context;
}

export default UnifiedAuthContext;

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Platform, Alert } from "react-native";
import { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../services/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage abstraction for cross-platform session persistence
const getStorage = () => {
  if (Platform.OS === "web") {
    return {
      getItem: async (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn("localStorage setItem failed:", e);
        }
      },
      removeItem: async (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn("localStorage removeItem failed:", e);
        }
      },
    };
  }
  return AsyncStorage;
};

const SESSION_KEY = "octopusUnifiedSession";

interface UnifiedAuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Start with false - no loading until user action
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const isInitializedRef = useRef(false);

  const storage = getStorage();

  // Helper to set session marker
  const setSessionMarker = useCallback(async (value: string | null) => {
    try {
      if (value) {
        await storage.setItem(SESSION_KEY, value);
      } else {
        await storage.removeItem(SESSION_KEY);
      }
    } catch (e) {
      console.warn("Failed to set session marker:", e);
    }
  }, [storage]);

  // Handle auth state changes
  const handleAuthChange = useCallback(async (event: AuthChangeEvent, currentSession: Session | null) => {
    console.log("UnifiedAuth: Auth state changed:", event);

    if (event === "SIGNED_IN" && currentSession) {
      setSession(currentSession);
      setUser(currentSession.user);
      setIsAuthenticated(true);
      await setSessionMarker("true");
      setLoading(false);
    } else if (event === "SIGNED_OUT") {
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      await setSessionMarker(null);
      setLoading(false);
    } else if (event === "TOKEN_REFRESHED" && currentSession) {
      setSession(currentSession);
      setUser(currentSession.user);
    }
  }, [setSessionMarker]);

  // Setup auth listener - ONLY called when we know we need it
  const setupAuthListener = useCallback(() => {
    if (subscriptionRef.current) return; // Already set up

    console.log("UnifiedAuth: Setting up auth listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    subscriptionRef.current = subscription;
  }, [handleAuthChange]);

  // Initialize - Check LOCAL storage only, NO network calls
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initialize = async () => {
      try {
        // Check LOCAL storage for previous session marker - NO network call
        const hadPreviousSession = await storage.getItem(SESSION_KEY);
        
        if (hadPreviousSession === "true") {
          console.log("UnifiedAuth: Previous session marker found");
          // Setup listener and try to restore session
          setupAuthListener();
          
          // Try to get session - this might make a network call but only if we had a session
          try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession) {
              setSession(currentSession);
              setUser(currentSession.user);
              setIsAuthenticated(true);
              console.log("UnifiedAuth: Session restored");
            } else {
              // Session expired or invalid
              await setSessionMarker(null);
              console.log("UnifiedAuth: Previous session invalid");
            }
          } catch (err) {
            console.warn("UnifiedAuth: Could not restore session (offline?):", err);
            // Keep session marker - user might be offline
          }
        } else {
          console.log("UnifiedAuth: No previous session, app ready for login");
          // NO auth listener setup - saves resources and prevents network calls
        }
      } catch (err) {
        console.warn("UnifiedAuth: Initialization error:", err);
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Setup auth listener before auth action
      setupAuthListener();
      
      console.log("UnifiedAuth: Attempting sign up for:", email);

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      console.log("UnifiedAuth: Sign up successful");

      if (Platform.OS === "web") {
        console.log("Check your email for confirmation");
      } else {
        Alert.alert(
          "Check your email",
          "We have sent you a confirmation link.",
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred during sign up.";
      console.error("UnifiedAuth: Sign up failed:", msg);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setupAuthListener]);

  const signIn = useCallback(async (email: string, password: string, _rememberMe?: boolean) => {
    try {
      setError(null);
      setLoading(true);
      
      // Setup auth listener before auth action
      setupAuthListener();
      
      console.log("UnifiedAuth: Attempting sign in for:", email);

      await setSessionMarker(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.log("UnifiedAuth: Sign in error:", signInError.message);
        throw signInError;
      }

      // Set session directly since we have it
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(true);
        await setSessionMarker("true");
      }

      console.log("UnifiedAuth: Sign in successful for:", email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid email or password.";
      console.error("UnifiedAuth: Sign in failed:", msg);
      setError(msg);

      if (Platform.OS !== "web") {
        Alert.alert("Login failed", msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSessionMarker, setupAuthListener]);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      console.log("UnifiedAuth: Attempting sign out");

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      // Clear local state
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      await setSessionMarker(null);

      // Clean up subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      console.log("UnifiedAuth: Sign out successful");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred during sign out.";
      console.error("UnifiedAuth: Sign out failed:", msg);
      setError(msg);

      if (Platform.OS !== "web") {
        Alert.alert("Sign out failed", msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSessionMarker]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log("UnifiedAuth: Requesting password reset for:", email);

      const redirectUrl = Platform.OS === "web"
        ? (typeof window !== "undefined" ? window.location.origin : "") + "/reset-password"
        : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) throw resetError;

      console.log("UnifiedAuth: Password reset email sent");

      if (Platform.OS !== "web") {
        Alert.alert(
          "Password reset email sent",
          "Check your email for the password reset link.",
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred while sending the reset email.";
      console.error("UnifiedAuth: Password reset failed:", msg);
      setError(msg);

      if (Platform.OS !== "web") {
        Alert.alert("Password reset failed", msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: UnifiedAuthContextType = {
    session,
    user,
    loading,
    error,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
    clearError,
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

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { Session, User } from "@supabase/supabase-js";
// Note: Navigation removed to avoid react-router-dom dependency in React Native
import { supabase } from "../lib/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Set up the auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state change:", event, currentSession?.user?.email);

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);

      if (event === "SIGNED_IN" && currentSession?.user) {
        // Optional: specific logic on sign in
      } else if (event === "SIGNED_OUT") {
         // Optional: specific logic on sign out
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession?.user?.email);

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      Alert.alert("Check your email", "We've sent you a confirmation link.");
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "An error occurred during sign up.";
      Alert.alert("Sign up failed", msg);
      throw error;
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    try {
      console.log("Attempting sign in for:", email);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("Sign in error:", error.message);
        throw error;
      }

      console.log("Sign in successful for:", email);
    } catch (error: unknown) {
      console.log("Sign in caught error:", error);
      const msg =
        error instanceof Error ? error.message : "Invalid email or password.";
      Alert.alert("Login failed", msg);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting sign out");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log("Sign out successful");
    } catch (error: unknown) {
      console.log("Sign out error:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "An error occurred during sign out.";
      Alert.alert("Sign out failed", msg);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Use a deep link scheme for config, or fallback to generic
      const redirectTo = "octopus-finance://reset-password";
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;

      Alert.alert("Password reset email sent", "Check your email for the password reset link.");
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "An error occurred while sending the reset email.";
      Alert.alert("Password reset failed", msg);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      console.log("Attempting account deletion");
      
      // Call Supabase Edge Function to delete user data + auth account
      const { error } = await supabase.functions.invoke('delete-account');

      if (error) throw error;

      // Force sign out locally
      await signOut();

      Alert.alert("Account deleted", "Your account and all data have been permanently deleted.");
    } catch (error: unknown) {
      console.error("Account deletion error:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "An error occurred during account deletion.";
      Alert.alert("Deletion failed", msg);
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    deleteAccount,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

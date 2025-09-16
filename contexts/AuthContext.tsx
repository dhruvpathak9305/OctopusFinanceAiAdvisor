/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
// Note: Navigation removed to avoid react-router-dom dependency in React Native
import { supabase } from "../lib/supabase/client";
import { useToast } from "../common/hooks/use-toast";

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
  // Navigation removed for React Native compatibility
  const { toast } = useToast();

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
        // Show success message
        setTimeout(() => {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        }, 100);
      } else if (event === "SIGNED_OUT") {
        // Show logout message
        setTimeout(() => {
          toast({
            title: "Logged out",
            description: "You have been successfully logged out.",
          });
        }, 100);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession?.user?.email);

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);

      // Set session marker if we restored a session
      if (currentSession) {
        sessionStorage.setItem("octopusSession", "true");
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link.",
      });
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "An error occurred during sign up.";
      toast({
        title: "Sign up failed",
        description: msg,
        variant: "destructive",
      });
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

      // Clear any existing session marker before new login attempt
      sessionStorage.removeItem("octopusSession");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("Sign in error:", error.message);
        throw error;
      }

      console.log("Sign in successful for:", email);
      // The onAuthStateChange will handle the redirect and session marking
    } catch (error: unknown) {
      console.log("Sign in caught error:", error);
      const msg =
        error instanceof Error ? error.message : "Invalid email or password.";
      toast({
        title: "Login failed",
        description: msg,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting sign out");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log("Sign out successful");
      // Clear session marker on explicit sign out
      sessionStorage.removeItem("octopusSession");
    } catch (error: unknown) {
      console.log("Sign out error:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "An error occurred during sign out.";
      toast({
        title: "Sign out failed",
        description: msg,
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "An error occurred while sending the reset email.";
      toast({
        title: "Password reset failed",
        description: msg,
        variant: "destructive",
      });
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

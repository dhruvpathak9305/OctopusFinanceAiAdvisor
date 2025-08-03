/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase/client";
import { useToast } from "../common/hooks/use-toast";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          // Check if this is a fresh login rather than a session restoration
          const isJustLoggedIn = !sessionStorage.getItem('octopusSession');
          
          // Always redirect to the dashboard on successful login
          setTimeout(() => {
            navigate('/dashboard');
            
            // Only show welcome toast on fresh login, not on session restoration
            if (isJustLoggedIn) {
              toast({
                title: "Welcome back!",
                description: "You have successfully logged in.",
              });
              // Mark that we're in an active session
              sessionStorage.setItem('octopusSession', 'true');
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Clear session marker when signed out
          sessionStorage.removeItem('octopusSession');
          
          // Use setTimeout to avoid potential recursive deadlock
          setTimeout(() => {
            navigate('/');
            toast({
              title: "Logged out",
              description: "You have been successfully logged out.",
            });
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Set session marker if we restored a session
      if (currentSession) {
        sessionStorage.setItem('octopusSession', 'true');
      }
      
      setLoading(false);
    });

    // Check if user was previously authenticated
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

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
      const msg = error instanceof Error ? error.message : "An error occurred during sign up.";
      toast({
        title: "Sign up failed",
        description: msg,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    try {
      // Clear any existing session marker before new login attempt
      sessionStorage.removeItem('octopusSession');
      
      // Instead of using expiresIn option which is not available,
      // we will use the standard session parameters
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // The onAuthStateChange will handle marking a fresh login
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Invalid email or password.";
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear session marker on explicit sign out
      sessionStorage.removeItem('octopusSession');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred during sign out.";
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
      const msg = error instanceof Error ? error.message : "An error occurred while sending the reset email.";
      toast({
        title: "Password reset failed",
        description: msg,
        variant: "destructive",
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    
    // Track fresh login in sessionStorage to enable welcome toast
    sessionStorage.removeItem('octopusSession');
    
    toast({
      title: "Welcome Back!",
      description: "You have successfully logged in!",
      duration: 3000,
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('octopusSession');
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
    login,
    logout,
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

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { router } from "expo-router";
import { supabase } from "../lib/supabase/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WebAuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const WebAuthContext = createContext<WebAuthContextType | undefined>(undefined);

export const WebAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Helper function to manage session marker
  const setSessionMarker = async (value: string | null) => {
    try {
      if (value) {
        await AsyncStorage.setItem('octopusSession', value);
      } else {
        await AsyncStorage.removeItem('octopusSession');
      }
    } catch (error) {
      console.log('Error managing session marker:', error);
    }
  };

  const getSessionMarker = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('octopusSession');
    } catch (error) {
      console.log('Error getting session marker:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Web Auth state change:', event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession?.user);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Clear any existing session marker
          setSessionMarker(null);
          
          // Redirect to dashboard on successful login
          setTimeout(() => {
            router.push('/(dashboard)');
            // Mark that we're in an active session
            setSessionMarker('true');
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          // Clear session marker when signed out
          setSessionMarker(null);
          
          // Redirect to home page
          setTimeout(() => {
            router.push('/');
          }, 100);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Web Initial session check:', currentSession?.user?.email);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);
      
      // Set session marker if we restored a session
      if (currentSession) {
        setSessionMarker('true');
      }
      
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
      
      // Show success message (you can implement a toast system for web)
      console.log('Sign up successful, check your email');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred during sign up.";
      console.error('Sign up failed:', msg);
      throw error;
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    try {
      console.log('Web: Attempting sign in for:', email);
      
      // Clear any existing session marker before new login attempt
      await setSessionMarker(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Web: Sign in error:', error.message);
        throw error;
      }
      
      console.log('Web: Sign in successful for:', email);
      // The onAuthStateChange will handle the redirect and session marking
    } catch (error: unknown) {
      console.log('Web: Sign in caught error:', error);
      const msg = error instanceof Error ? error.message : "Invalid email or password.";
      console.error('Web: Login failed:', msg);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Web: Attempting sign out');
      
      // Check if we have a valid session before attempting to sign out
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log('Web: No active session to sign out from');
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Web: Sign out successful');
      // Clear session marker on explicit sign out
      await setSessionMarker(null);
    } catch (error: unknown) {
      console.log('Web: Sign out error:', error);
      const msg = error instanceof Error ? error.message : "An error occurred during sign out.";
      console.error('Web: Sign out failed:', msg);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      console.log('Password reset email sent');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred while sending the reset email.";
      console.error('Password reset failed:', msg);
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

  return <WebAuthContext.Provider value={value}>{children}</WebAuthContext.Provider>;
};

export function useWebAuth() {
  const context = useContext(WebAuthContext);
  if (context === undefined) {
    throw new Error("useWebAuth must be used within a WebAuthProvider");
  }
  return context;
} 
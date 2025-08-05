import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MobileAuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const MobileAuthContext = createContext<MobileAuthContextType | undefined>(undefined);

export const MobileAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Mobile Auth state change:', event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession?.user);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Clear any existing session marker
          setSessionMarker(null);
          
          Alert.alert(
            'Welcome Back!',
            'You have successfully logged in.',
            [{ text: 'OK' }]
          );
          // Mark that we're in an active session
          setSessionMarker('true');
        } else if (event === 'SIGNED_OUT') {
          // Clear session marker when signed out
          setSessionMarker(null);
          
          Alert.alert(
            'Logged Out',
            'You have been successfully logged out.',
            [{ text: 'OK' }]
          );
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Mobile Initial session check:', currentSession?.user?.email);
      
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
      console.log('Mobile: Attempting sign up for:', email);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('Mobile: Sign up successful for:', email);
      Alert.alert(
        'Check your email',
        'We\'ve sent you a confirmation link.',
        [{ text: 'OK' }]
      );
    } catch (error: unknown) {
      console.log('Mobile: Sign up error:', error);
      const msg = error instanceof Error ? error.message : 'An error occurred during sign up.';
      Alert.alert('Sign up failed', msg);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Mobile: Attempting sign in for:', email);
      
      // Clear any existing session marker before new login attempt
      await setSessionMarker(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Mobile: Sign in error:', error.message);
        throw error;
      }
      
      console.log('Mobile: Sign in successful for:', email);
      // The onAuthStateChange will handle the alert and session marking
    } catch (error: unknown) {
      console.log('Mobile: Sign in caught error:', error);
      const msg = error instanceof Error ? error.message : 'Invalid email or password.';
      Alert.alert('Login failed', msg);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Mobile: Attempting sign out');
      
      // Always attempt to sign out, regardless of current session state
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log('Mobile: Sign out error:', error.message);
        // Even if there's an error, we should clear our local state
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        await setSessionMarker(null);
        
        // Show error to user but don't throw
        Alert.alert('Sign out failed', error.message);
        return;
      }
      
      console.log('Mobile: Sign out successful');
      
      // Clear local state and session marker
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      await setSessionMarker(null);
      
      Alert.alert(
        'Logged Out',
        'You have been successfully logged out.',
        [{ text: 'OK' }]
      );
    } catch (error: unknown) {
      console.log('Mobile: Sign out caught error:', error);
      
      // Clear local state even if there's an error
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      await setSessionMarker(null);
      
      const msg = error instanceof Error ? error.message : 'An error occurred during sign out.';
      Alert.alert('Sign out failed', msg);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Mobile: Attempting password reset for:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      console.log('Mobile: Password reset email sent to:', email);
      Alert.alert(
        'Password reset email sent',
        'Check your email for the password reset link.',
        [{ text: 'OK' }]
      );
    } catch (error: unknown) {
      console.log('Mobile: Password reset error:', error);
      const msg = error instanceof Error ? error.message : 'An error occurred while sending the reset email.';
      Alert.alert('Password reset failed', msg);
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

  return <MobileAuthContext.Provider value={value}>{children}</MobileAuthContext.Provider>;
};

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (context === undefined) {
    throw new Error('useMobileAuth must be used within a MobileAuthProvider');
  }
  return context;
} 
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Platform, Alert } from 'react-native';
import { supabase } from '../lib/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform-specific imports
let router: any = null;
let useNavigate: any = null;
let useToast: any = null;

if (Platform.OS === 'web') {
  // Web-specific imports
  const expoRouter = require('expo-router');
  router = expoRouter.router;
  
  // For web, we'll use a simple toast implementation
  useToast = () => ({
    toast: (options: any) => {
      console.log('Toast:', options.title, options.description);
      // You can implement a proper toast system for web here
    }
  });
} else {
  // Mobile-specific - no additional imports needed
}

interface UnifiedAuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const { toast } = useToast ? useToast() : { toast: null };

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

  // Platform-specific navigation
  const navigateTo = (path: string) => {
    if (Platform.OS === 'web' && router) {
      router.push(path);
    }
    // For mobile, navigation is handled by React Navigation components
  };

  // Platform-specific notifications
  const showNotification = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    if (Platform.OS === 'web' && toast) {
      toast({
        title,
        description: message,
        variant: type === 'error' ? 'destructive' : 'default',
      });
    } else {
      // Mobile uses Alert
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  };

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log(`${Platform.OS} Auth state change:`, event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession?.user);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Clear any existing session marker
          setSessionMarker(null);
          
          if (Platform.OS === 'web') {
            // Redirect to dashboard on successful login (web only)
            setTimeout(() => {
              navigateTo('/(dashboard)');
              showNotification('Welcome back!', 'You have successfully logged in.');
              setSessionMarker('true');
            }, 100);
          } else {
            // Mobile - just show notification
            showNotification('Welcome back!', 'You have successfully logged in.');
            setSessionMarker('true');
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear session marker when signed out
          setSessionMarker(null);
          
          if (Platform.OS === 'web') {
            // Redirect to home page (web only)
            setTimeout(() => {
              navigateTo('/');
              showNotification('Logged out', 'You have been successfully logged out.');
            }, 100);
          } else {
            // Mobile - just show notification
            showNotification('Logged out', 'You have been successfully logged out.');
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log(`${Platform.OS} Initial session check:`, currentSession?.user?.email);
      
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
      console.log(`${Platform.OS}: Attempting sign up for:`, email);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      console.log(`${Platform.OS}: Sign up successful for:`, email);
      showNotification('Check your email', 'We\'ve sent you a confirmation link.');
    } catch (error: unknown) {
      console.log(`${Platform.OS}: Sign up error:`, error);
      const msg = error instanceof Error ? error.message : 'An error occurred during sign up.';
      showNotification('Sign up failed', msg, 'error');
      throw error;
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log(`${Platform.OS}: Attempting sign in for:`, email);
      
      // Clear any existing session marker before new login attempt
      await setSessionMarker(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log(`${Platform.OS}: Sign in error:`, error.message);
        throw error;
      }
      
      console.log(`${Platform.OS}: Sign in successful for:`, email);
      // The onAuthStateChange will handle the notification and session marking
    } catch (error: unknown) {
      console.log(`${Platform.OS}: Sign in caught error:`, error);
      const msg = error instanceof Error ? error.message : 'Invalid email or password.';
      showNotification('Login failed', msg, 'error');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log(`${Platform.OS}: Attempting sign out`);
      
      // Always attempt to sign out, regardless of current session state
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log(`${Platform.OS}: Sign out error:`, error.message);
        // Even if there's an error, we should clear our local state
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        await setSessionMarker(null);
        
        // Show error to user but don't throw
        showNotification('Sign out failed', error.message, 'error');
        return;
      }
      
      console.log(`${Platform.OS}: Sign out successful`);
      
      // Clear local state and session marker
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      await setSessionMarker(null);
      
      showNotification('Logged Out', 'You have been successfully logged out.');
    } catch (error: unknown) {
      console.log(`${Platform.OS}: Sign out caught error:`, error);
      
      // Clear local state even if there's an error
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      await setSessionMarker(null);
      
      const msg = error instanceof Error ? error.message : 'An error occurred during sign out.';
      showNotification('Sign out failed', msg, 'error');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log(`${Platform.OS}: Attempting password reset for:`, email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: Platform.OS === 'web' ? `${window.location.origin}/reset-password` : undefined,
      });
      
      if (error) throw error;
      
      console.log(`${Platform.OS}: Password reset email sent to:`, email);
      showNotification('Password reset email sent', 'Check your email for the password reset link.');
    } catch (error: unknown) {
      console.log(`${Platform.OS}: Password reset error:`, error);
      const msg = error instanceof Error ? error.message : 'An error occurred while sending the reset email.';
      showNotification('Password reset failed', msg, 'error');
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

  return <UnifiedAuthContext.Provider value={value}>{children}</UnifiedAuthContext.Provider>;
};

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
} 
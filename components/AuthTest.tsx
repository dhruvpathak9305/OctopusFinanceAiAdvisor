import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { supabase } from './lib/supabase/client';

export const AuthTest: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('🔍 Auth check - User:', user?.id, 'Error:', error);
      setUser(user);
    } catch (err) {
      console.error('❌ Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      console.log('🔐 Anonymous sign in:', data, error);
      await checkUser();
    } catch (err) {
      console.error('❌ Sign in error:', err);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      console.log('🚪 Sign out:', error);
      await checkUser();
    } catch (err) {
      console.error('❌ Sign out error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Authentication Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <Text style={styles.info}>Loading: {loading.toString()}</Text>
        <Text style={styles.info}>Authenticated: {user ? 'Yes' : 'No'}</Text>
        <Text style={styles.info}>User ID: {user?.id || 'None'}</Text>
        <Text style={styles.info}>Email: {user?.email || 'None'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <Button title="Check User" onPress={checkUser} />
        <Button title="Sign In Anonymously" onPress={signInAnonymously} />
        <Button title="Sign Out" onPress={signOut} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  info: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
});

export default AuthTest;

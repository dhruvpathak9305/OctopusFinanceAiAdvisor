import { useEffect } from "react";
import { router } from "expo-router";
import { useWebAuth } from "../../contexts/WebAuthContext";
import { View, Text, StyleSheet } from "react-native";

interface WebRequireAuthProps {
  children: React.ReactNode;
}

export default function WebRequireAuth({ children }: WebRequireAuthProps) {
  const { user, loading, isAuthenticated } = useWebAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login page and save the current path for after login
      router.push("/login");
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.spinner} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  loadingContent: {
    alignItems: 'center',
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#10B981',
    borderTopColor: 'transparent',
    animationName: 'spin',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
}); 
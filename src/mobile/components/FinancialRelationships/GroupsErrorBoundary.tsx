/**
 * Groups Error Boundary
 * 
 * Catches and handles errors in the Groups section gracefully
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GroupsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[GroupsErrorBoundary] Error caught:', error);
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GroupsErrorBoundary] Error details:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          </View>
          
          <Text style={styles.errorTitle}>
            Oops! Something went wrong
          </Text>
          
          <Text style={styles.errorMessage}>
            We couldn't load your groups. Please try again.
          </Text>
          
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorDetailsText}>
                {this.state.error.message}
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleReset}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.retryIcon} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#111827',
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: '100%',
  },
  errorDetailsText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default GroupsErrorBoundary;


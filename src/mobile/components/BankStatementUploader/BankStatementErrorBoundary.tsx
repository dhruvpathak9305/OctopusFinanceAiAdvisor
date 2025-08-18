import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class BankStatementErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BankStatementErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="warning-outline" size={48} color="#dc3545" />
            </View>
            
            <Text style={styles.errorTitle}>Upload Failed</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'Something went wrong while processing your bank statement'}
            </Text>
            
            <View style={styles.errorActions}>
              <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                <Ionicons name="refresh-outline" size={20} color="white" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.helpButton}>
                <Ionicons name="help-circle-outline" size={20} color="#6c757d" />
                <Text style={styles.helpButtonText}>Get Help</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.errorTips}>
              <Text style={styles.errorTipsTitle}>💡 Troubleshooting tips:</Text>
              <Text style={styles.errorTipItem}>
                • Check if your file format is supported
              </Text>
              <Text style={styles.errorTipItem}>
                • Ensure the file isn't corrupted
              </Text>
              <Text style={styles.errorTipItem}>
                • Try a smaller file size
              </Text>
              <Text style={styles.errorTipItem}>
                • Check your internet connection
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpButton: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  helpButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
  errorTips: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  errorTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  errorTipItem: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
});

export default BankStatementErrorBoundary;

import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class RecentTransactionsErrorBoundary extends Component<Props & { colors: any }, State> {
  constructor(props: Props & { colors: any }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error to console for debugging
    console.error('RecentTransactions ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { colors } = this.props;

    if (this.state.hasError) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>⚠️</Text>
            </View>
            
            <Text style={[styles.errorTitle, { color: colors.text }]}>
              Something went wrong
            </Text>
            
            <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
              The Recent Transactions section encountered an error and couldn't load properly.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={[styles.debugContainer, { backgroundColor: colors.border }]}>
                <Text style={[styles.debugTitle, { color: colors.text }]}>Debug Info:</Text>
                <Text style={[styles.debugText, { color: colors.textSecondary }]}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.retryButton, { borderColor: '#10B981' }]}
              onPress={this.handleRetry}
            >
              <Text style={[styles.retryButtonText, { color: '#10B981' }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide theme colors
const RecentTransactionsErrorBoundaryWrapper: React.FC<Props> = ({ children }) => {
  const { isDark } = useTheme();
  
  const colors = isDark ? {
    background: '#1F2937',
    card: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
  } : {
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };

  return (
    <RecentTransactionsErrorBoundary colors={colors}>
      {children}
    </RecentTransactionsErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    marginBottom: 24,
    padding: 16,
  },
  errorCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  debugContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RecentTransactionsErrorBoundaryWrapper;

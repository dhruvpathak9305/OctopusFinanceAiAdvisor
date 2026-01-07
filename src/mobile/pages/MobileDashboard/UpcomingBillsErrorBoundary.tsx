import React, { Component, ReactNode, isValidElement } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryKey: number;
  retryCount: number;
}

class UpcomingBillsErrorBoundary extends Component<Props & { colors: any }, State> {
  constructor(props: Props & { colors: any }) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryKey: 0,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error to console for debugging (only in development)
    if (__DEV__) {
      console.error('UpcomingBills ErrorBoundary caught an error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Component stack:', errorInfo.componentStack);
    }
    
    // Prevent infinite error loops - if same error occurs after retry, don't update state
    if (this.state.retryCount > 0 && this.state.error?.message === error.message) {
      console.warn('Same error occurred after retry, preventing infinite loop');
      // Still update state to show error, but don't increment retry count
      this.setState({ 
        hasError: true,
        error: __DEV__ ? error : null, 
        errorInfo: __DEV__ ? errorInfo : null 
      });
      return;
    }
    
    // Only store error info in development to avoid exposing stack traces
    this.setState({ 
      hasError: true,
      error: __DEV__ ? error : null, 
      errorInfo: __DEV__ ? errorInfo : null 
    });
  }

  handleRetry = () => {
    const { retryCount, error } = this.state;
    
    // If we've already tried multiple times with the same error, reset completely
    if (retryCount >= 3 && error) {
      console.warn('Max retries reached. Resetting completely:', error.message);
      // Use timestamp for truly unique key to force complete remount
      this.setState({
        retryCount: 0,
        retryKey: Date.now(),
        hasError: false,
        error: null,
        errorInfo: null,
      });
      return;
    }

    // Use timestamp for unique key to force complete remount
    // This ensures the component gets a completely fresh mount
    this.setState(prevState => ({
      retryKey: Date.now(), // Use timestamp instead of incrementing
      retryCount: prevState.retryCount + 1,
      hasError: false,
      error: null,
      errorInfo: null,
    }));
  };

  // Reset retry count when component successfully renders
  componentDidUpdate(prevProps: Props & { colors: any }, prevState: State) {
    // If we had an error before and now we don't, component recovered successfully
    if (prevState.hasError && !this.state.hasError) {
      // Component recovered, reset retry count immediately
      // This allows users to retry again if a new error occurs
      try {
        this.setState({ retryCount: 0, retryKey: 0 });
      } catch (error) {
        console.error('Error resetting retry count:', error);
      }
    }
    
    // Also check if component rendered successfully without errors
    // If we haven't had an error for a while, reset the retry count
    if (!this.state.hasError && this.state.retryCount > 0) {
      // Use a timeout to ensure component is stable before resetting
      setTimeout(() => {
        if (!this.state.hasError && this.state.retryCount > 0) {
          this.setState({ retryCount: 0 });
        }
      }, 2000);
    }
  }

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
              The Upcoming Bills section encountered an error and couldn't load properly. Please try again or contact support if the issue persists.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={[styles.debugContainer, { backgroundColor: colors.border }]}>
                <Text style={[styles.debugTitle, { color: colors.text }]}>Debug Info (Development Only):</Text>
                <Text style={[styles.debugText, { color: colors.textSecondary }]} numberOfLines={3}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.retryButton, 
                { 
                  borderColor: '#10B981',
                  opacity: 1,
                }
              ]}
              onPress={this.handleRetry}
            >
              <Text style={[styles.retryButtonText, { color: '#10B981' }]}>
                {this.state.retryCount >= 3 ? 'Reset & Try Again' : 'Try Again'}
              </Text>
            </TouchableOpacity>
            
            {this.state.retryCount >= 3 && (
              <>
                <Text style={[styles.retryHint, { color: colors.textSecondary, marginTop: 8 }]}>
                  Previous attempts failed. Click "Reset & Try Again" to start fresh.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.retryButton,
                    {
                      borderColor: colors.border,
                      marginTop: 12,
                      backgroundColor: colors.border + '20',
                    }
                  ]}
                  onPress={() => {
                    // Reset everything and try again with a fresh key
                    this.setState({
                      retryCount: 0,
                      retryKey: Date.now(), // Use timestamp for unique key
                      hasError: false,
                      error: null,
                      errorInfo: null,
                    });
                  }}
                >
                  <Text style={[styles.retryButtonText, { color: colors.text }]}>
                    Reset Retry Count
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      );
    }

    // Use key to force remount on retry
    // Wrap children in a View with key to force remount without using cloneElement
    // This is safer and avoids potential issues with component references
    try {
      const children = this.props.children;
      
      // Validate children before rendering
      if (!children) {
        return <View style={{ flex: 1 }} />;
      }
      
      // If children is a valid React element, wrap it
      if (isValidElement(children)) {
        return (
          <View key={`upcoming-bills-retry-${this.state.retryKey}`} style={{ flex: 1 }}>
            {children}
          </View>
        );
      }
      
      // If children is an array, wrap each element
      if (Array.isArray(children)) {
        return (
          <View key={`upcoming-bills-retry-${this.state.retryKey}`} style={{ flex: 1 }}>
            {children.map((child, index) => 
              isValidElement(child) ? child : null
            )}
          </View>
        );
      }
      
      // Fallback: wrap in View
      return (
        <View key={`upcoming-bills-retry-${this.state.retryKey}`} style={{ flex: 1 }}>
          {children}
        </View>
      );
    } catch (error) {
      // If rendering children fails, show error again
      console.error('Error rendering children after retry:', error);
      this.setState({
        hasError: true,
        error: error instanceof Error ? error : new Error('Failed to render after retry'),
        errorInfo: null,
      });
      return null;
    }
  }
}

// Wrapper component to provide theme colors
const UpcomingBillsErrorBoundaryWrapper: React.FC<Props> = ({ children }) => {
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

  // Ensure children is a valid React element before passing to error boundary
  if (!children) {
    return null;
  }

  // Validate that children is a valid React element
  if (!isValidElement(children) && !Array.isArray(children)) {
    console.error('UpcomingBillsErrorBoundaryWrapper: Invalid children type', typeof children);
    return null;
  }

  return (
    <UpcomingBillsErrorBoundary colors={colors}>
      {children}
    </UpcomingBillsErrorBoundary>
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
  retryHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default UpcomingBillsErrorBoundaryWrapper;


import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for Bill Operations
 * Catches errors in bill-related operations and displays a user-friendly error message
 */
export class BillOperationsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('BillOperationsErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              {this.state.error?.message || 'An error occurred while processing your bill operation.'}
            </Text>
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Ensure children is always a valid React element
    // Wrap in Fragment to handle arrays or multiple children
    try {
      const children = this.props.children;
      
      // If children is null/undefined, return empty view
      if (!children) {
        return <View />;
      }
      
      // If children is already a valid element, return it
      if (React.isValidElement(children)) {
        return children;
      }
      
      // If children is an array, wrap in Fragment
      if (Array.isArray(children)) {
        return <>{children}</>;
      }
      
      // Fallback: wrap in View
      return <View>{children}</View>;
    } catch (error) {
      // If rendering fails, show error again
      console.error('Error rendering children in BillOperationsErrorBoundary:', error);
      this.setState({
        hasError: true,
        error: error instanceof Error ? error : new Error('Failed to render children'),
      });
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.title}>Rendering Error</Text>
            <Text style={styles.message}>
              Failed to render component. Please check the console for details.
            </Text>
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0B1426',
  },
  errorCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BillOperationsErrorBoundary;



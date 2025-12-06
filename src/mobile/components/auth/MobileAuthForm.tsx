import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useUnifiedAuth } from '../../../../contexts/UnifiedAuthContext';

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export default function MobileAuthForm() {
  const { signIn, signUp, resetPassword } = useUnifiedAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'signup' && !validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    if (mode === 'login') {
      await signIn(formData.email, formData.password);
      // Alert and error handling done in auth context
    } else if (mode === 'signup') {
      const success = await signUp(formData.email, formData.password);
      if (success) {
        setMode('login'); // Switch to login after successful signup
      }
    } else if (mode === 'forgot') {
      const success = await resetPassword(formData.email);
      if (success) {
        setMode('login'); // Switch to login after password reset sent
      }
    }
    
    setIsSubmitting(false);
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderInput = (
    field: keyof FormData,
    placeholder: string,
    secureTextEntry = false
  ) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={formData[field]}
        onChangeText={(value) => updateFormData(field, value)}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        keyboardType={field === 'email' ? 'email-address' : 'default'}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderForgotPassword = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>
      </View>

      {renderInput('email', 'Enter your email')}

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setMode('login')}
      >
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginSignup = () => (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, mode === 'login' && styles.activeTab]}
          onPress={() => setMode('login')}
        >
          <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'signup' && styles.activeTab]}
          onPress={() => setMode('signup')}
        >
          <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'login' 
            ? 'Sign in to your account' 
            : 'Join OctopusFinancer today'
          }
        </Text>
      </View>

      {renderInput('email', 'Enter your email')}
      {renderInput('password', 'Enter your password', true)}
      
      {mode === 'signup' && renderInput('confirmPassword', 'Confirm your password', true)}

      {mode === 'login' && (
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => setMode('forgot')}
        >
          <Text style={styles.linkText}>Forgot your password?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {mode === 'forgot' ? renderForgotPassword() : renderLoginSignup()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000000',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#10B981',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 
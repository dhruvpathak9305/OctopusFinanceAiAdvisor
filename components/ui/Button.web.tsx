import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      // Web-specific hover effects
      // @ts-ignore - Web-only properties
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        }
      }}
      // @ts-ignore - Web-only properties
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0px)';
        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer', // Web-specific
    transition: 'all 0.2s ease', // Web-specific
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Web-specific shadow
    // @ts-ignore
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  // Variants
  primary: {
    backgroundColor: '#3b82f6',
  },
  secondary: {
    backgroundColor: '#6b7280',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  // Sizes  
  small: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 18,
  },
  // States
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // Text styles
  text: {
    fontWeight: '600',
    userSelect: 'none', // Web-specific
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#3b82f6',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.7,
  },
}); 
/**
 * =============================================================================
 * CREDIT CARD HEADER COMPONENT (ENHANCED)
 * =============================================================================
 * 
 * Enhanced header with animated cashback badge, glow effects, and micro-interactions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../../../contexts/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CreditCardHeaderProps {
  cashbackAmount?: number;
  onCashbackPress?: () => void;
  onPercentPress?: () => void;
  onSettingsPress?: () => void;
}

export const CreditCardHeader: React.FC<CreditCardHeaderProps> = ({
  cashbackAmount = 41,
  onCashbackPress,
  onPercentPress,
  onSettingsPress,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;

  const [cashbackHover, setCashbackHover] = useState(false);
  
  // Animation values
  const cashbackScale = useSharedValue(1);
  const cashbackRotate = useSharedValue(0);
  const settingsRotate = useSharedValue(0);
  const percentRotate = useSharedValue(0);

  const handleCashbackPress = () => {
    setCashbackHover(true);
    // ENHANCED: More visible scale + rotate wiggle
    cashbackScale.value = withSequence(
      withTiming(1.08, { duration: 100, easing: Easing.out(Easing.cubic) }),
      withTiming(0.92, { duration: 100, easing: Easing.in(Easing.cubic) }),
      withSpring(1, { damping: 10, stiffness: 350 })
    );
    cashbackRotate.value = withSequence(
      withTiming(-15, { duration: 100, easing: Easing.out(Easing.cubic) }),
      withTiming(15, { duration: 100, easing: Easing.inOut(Easing.cubic) }),
      withSpring(0, { damping: 12, stiffness: 280 })
    );
    setTimeout(() => setCashbackHover(false), 500);
    onCashbackPress?.();
  };

  const handlePercentPress = () => {
    // Rotation wiggle animation (matching web whileHover: rotate: 5)
    percentRotate.value = withSequence(
      withTiming(5, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withSpring(0, { damping: 15 })
    );
    onPercentPress?.();
  };

  const handleSettingsPress = () => {
    // ENHANCED: Full 90 degree rotation with bounce
    settingsRotate.value = withSequence(
      withSpring(90, {
        damping: 15,
        stiffness: 200,
      }),
      withTiming(0, { duration: 0 })
    );
    onSettingsPress?.();
  };

  const cashbackAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cashbackScale.value },
      { rotate: `${cashbackRotate.value}deg` },
    ],
  }));

  const settingsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${settingsRotate.value}deg` }],
  }));

  const percentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${percentRotate.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      {/* Cashback badge with glow */}
      <AnimatedTouchable
        style={[styles.cashbackBadge, cashbackAnimatedStyle, { borderColor: colors.border }]}
        onPress={handleCashbackPress}
        activeOpacity={0.9}
      >
        {/* Animated glow pulse */}
        {cashbackHover && (
          <View style={styles.glowPulse} />
        )}
        
        <LinearGradient
          colors={['#FFA500', '#FF6B35', '#FF8C32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cashbackIcon}
        >
          <Text style={styles.cashbackIconText}>₹</Text>
        </LinearGradient>
        <Text style={[styles.cashbackAmount, { color: colors.text }]}>
          {cashbackAmount}
        </Text>
      </AnimatedTouchable>

      {/* Right icons with micro-interactions */}
      <View style={styles.rightIcons}>
        <AnimatedTouchable
          style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={handlePercentPress}
          activeOpacity={0.8}
        >
          <Animated.View style={percentAnimatedStyle}>
            <Ionicons name="stats-chart-outline" size={16} color={colors.textSecondary} />
          </Animated.View>
        </AnimatedTouchable>
        <AnimatedTouchable
          style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={handleSettingsPress}
          activeOpacity={0.8}
        >
          <Animated.View style={settingsAnimatedStyle}>
            <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
          </Animated.View>
        </AnimatedTouchable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 50,
    position: 'relative',
    zIndex: 10,
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#FF8C32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  glowPulse: {
    position: 'absolute',
    left: -8,
    right: -8,
    top: -8,
    bottom: -8,
    borderRadius: 32,
    backgroundColor: '#FF8C32',
    opacity: 0.5,
  },
  cashbackIcon: {
    width: 24,
    height: 24,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8C32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  cashbackIconText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  cashbackAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

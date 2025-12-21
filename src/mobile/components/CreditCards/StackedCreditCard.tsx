/**
 * =============================================================================
 * STACKED CREDIT CARD COMPONENT
 * =============================================================================
 * 
 * Cred-inspired stacked card with 3D depth effect, gradients, and press/hold gesture.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CreditCard } from '../../../../contexts/CreditCardContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 180;
const STACK_OFFSET = 14;
const STACK_SCALE = 0.96;

interface StackedCreditCardProps {
  card: CreditCard;
  index: number;
  totalCards: number;
  onPress?: () => void;
  onLongPress?: () => void;
  onPayNow?: () => void;
}

/**
 * Get bank-specific gradient colors
 */
const getBankGradient = (bankName: string): string[] => {
  const bankUpper = (bankName || '').toUpperCase();
  
  if (bankUpper.includes('HDFC')) {
    return ['#FF6B6B', '#4ECDC4', '#95E1D3']; // Orange to teal
  } else if (bankUpper.includes('AXIS')) {
    return ['#667EEA', '#764BA2', '#F093FB']; // Blue to purple to pink
  } else if (bankUpper.includes('ICICI')) {
    return ['#F093FB', '#F5576C']; // Pink to red
  } else if (bankUpper.includes('SBI')) {
    return ['#4FACFE', '#00F2FE']; // Blue gradient
  } else if (bankUpper.includes('KOTAK')) {
    return ['#43E97B', '#38F9D7']; // Green gradient
  } else {
    return ['#6366F1', '#8B5CF6', '#A78BFA']; // Default purple
  }
};

export const StackedCreditCard: React.FC<StackedCreditCardProps> = ({
  card,
  index,
  totalCards,
  onPress,
  onLongPress,
  onPayNow,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;
  
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Calculate stack position
  const stackDepth = totalCards - index - 1;
  const translateY = stackDepth * STACK_OFFSET;
  const scale = Math.pow(STACK_SCALE, stackDepth);
  const zIndex = totalCards - index;

  // Get gradient colors
  const gradientColors = getBankGradient(card.bank || card.institution || '');

  // Format currency with proper Indian format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(amount);
  };

  // Format due date
  const formatDueDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `${day} ${month}`;
  };

  // Calculate days until due
  const getDaysUntilDue = () => {
    if (!card.dueDate) return null;
    const dueDate = new Date(card.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0;

  // Handle long press
  const handleLongPress = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setIsPressed(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      if (onLongPress) {
        onLongPress();
      }
    } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      setIsPressed(false);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Stagger animation on mount with fade
  React.useEffect(() => {
    scaleAnim.setValue(0.8);
    opacityAnim.setValue(0);
    Animated.sequence([
      Animated.delay(index * 150),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const animatedStyle = {
    transform: [
      { translateY },
      { scale: Animated.multiply(scaleAnim, scale) },
    ],
    opacity: Animated.multiply(opacityAnim, Math.max(0.3, 1 - (stackDepth * 0.15))), // Fade cards behind
    zIndex,
  };

  return (
    <GestureHandlerRootView>
      <LongPressGestureHandler
        onHandlerStateChange={handleLongPress}
        minDurationMs={300}
      >
        <Animated.View
        style={[
          styles.cardContainer,
          animatedStyle,
          index === 0 && styles.topCard,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          style={styles.cardTouchable}
        >
          {/* Gradient Background */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Card Content */}
            <View style={styles.cardContent}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                {card.logoUrl ? (
                  <Image source={{ uri: card.logoUrl }} style={styles.bankLogo} />
                ) : (
                  <Text style={styles.bankName}>
                    {card.bank || card.institution || 'Credit Card'}
                  </Text>
                )}
                <View style={styles.cardTypeBadge}>
                  <Text style={styles.cardTypeText}>VISA</Text>
                </View>
              </View>

              {/* Card Number */}
              <View style={styles.cardNumberSection}>
                <View style={styles.cardChip} />
                <Text style={styles.cardNumber}>
                  •••• •••• •••• {String(card.lastFourDigits).padStart(4, '0')}
                </Text>
              </View>

              {/* Cardholder Name */}
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>CARDHOLDER</Text>
                  <Text style={styles.cardValue} numberOfLines={1}>
                    {card.name.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardExpiry}>
                  <Text style={styles.cardLabel}>VALID THRU</Text>
                  <Text style={styles.cardValue}>
                    {card.dueDate ? new Date(card.dueDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Amount Due Overlay */}
            <View style={styles.amountOverlay}>
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>DUE</Text>
                <Text style={styles.amountValue} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(card.currentBalance || 0)}
                </Text>
                <View style={styles.dueDateRow}>
                  <Ionicons
                    name={isOverdue ? 'alert-circle' : isDueSoon ? 'time' : 'calendar'}
                    size={12}
                    color="white"
                  />
                  <Text style={styles.dueDateText} numberOfLines={1}>
                    {isOverdue ? 'OVERDUE' : daysUntilDue !== null ? `DUE ON ${formatDueDate(card.dueDate || '')}` : 'NO DUE DATE'}
                  </Text>
                </View>
              </View>
              
              {/* Pay Now Button */}
              <TouchableOpacity
                style={styles.payNowButton}
                onPress={(e) => {
                  e.stopPropagation();
                  if (onPayNow) onPayNow();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.payNowText}>Pay now</Text>
              </TouchableOpacity>
            </View>

            {/* Long Press Indicator */}
            {index === 0 && !isPressed && (
              <View style={styles.longPressIndicator}>
                <Ionicons name="hand-left-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.longPressText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  PRESS AND HOLD TO SEE CARD SNAPSHOT
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      </LongPressGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  topCard: {
    // Additional styles for top card if needed
  },
  cardTouchable: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  cardContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankLogo: {
    width: 70,
    height: 26,
    resizeMode: 'contain',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  cardTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cardTypeText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.8,
  },
  cardNumberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  cardChip: {
    width: 36,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  cardValue: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  cardExpiry: {
    alignItems: 'flex-end',
  },
  amountOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
    backdropFilter: 'blur(10px)',
  },
  amountSection: {
    flex: 1,
    justifyContent: 'center',
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3,
  },
  payNowButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  payNowText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
  },
  longPressIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 130, // Leave space for amount overlay
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  longPressText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
});


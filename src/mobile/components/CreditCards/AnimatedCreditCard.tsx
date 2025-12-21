/**
 * =============================================================================
 * ANIMATED CREDIT CARD COMPONENT
 * =============================================================================
 * 
 * Credit card component with smooth animations, flip effects, and gestures.
 * Inspired by Cred app's card design.
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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CreditCard } from '../../../../contexts/CreditCardContext';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

interface AnimatedCreditCardProps {
  card: CreditCard;
  onPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  index?: number;
}

export const AnimatedCreditCard: React.FC<AnimatedCreditCardProps> = ({
  card,
  onPress,
  onSwipeLeft,
  onSwipeRight,
  index = 0,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;
  
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // Calculate utilization
  const utilizationPercentage = card.utilizationPercentage || 
    (card.creditLimit > 0 ? Math.round((card.currentBalance / card.creditLimit) * 100) : 0);
  const availableCredit = card.availableCredit || 
    Math.max(0, card.creditLimit - card.currentBalance);

  // Card color based on bank (with fallback)
  const getCardColor = () => {
    // Common bank colors
    const bankColors: { [key: string]: string } = {
      'HDFC': '#EF4444',
      'ICICI': '#F59E0B',
      'SBI': '#3B82F6',
      'AXIS': '#8B5CF6',
      'KOTAK': '#10B981',
    };
    
    const bankUpper = (card.bank || card.institution || '').toUpperCase();
    for (const [bank, color] of Object.entries(bankColors)) {
      if (bankUpper.includes(bank)) {
        return color;
      }
    }
    
    return '#6366F1'; // Default purple
  };

  const cardColor = getCardColor();

  // Animate progress bar on mount
  React.useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: utilizationPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [utilizationPercentage]);

  // Stagger animation on mount
  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Flip animation
  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);
    
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  // Front face interpolation
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Back face interpolation
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  // Swipe actions
  const renderRightActions = () => {
    if (!onSwipeRight) return null;
    
    return (
      <View style={styles.swipeActionContainer}>
        <View style={[styles.swipeAction, { backgroundColor: colors.primary }]}>
          <Ionicons name="card" size={24} color="white" />
          <Text style={styles.swipeActionText}>Pay</Text>
        </View>
      </View>
    );
  };

  const renderLeftActions = () => {
    if (!onSwipeLeft) return null;
    
    return (
      <View style={styles.swipeActionContainer}>
        <View style={[styles.swipeAction, { backgroundColor: '#EF4444' }]}>
          <Ionicons name="lock-closed" size={24} color="white" />
          <Text style={styles.swipeActionText}>Freeze</Text>
        </View>
      </View>
    );
  };

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const scaleStyle = {
    transform: [{ scale: scaleAnimation }],
  };

  return (
    <GestureHandlerRootView>
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        onSwipeableRightOpen={onSwipeRight}
        onSwipeableLeftOpen={onSwipeLeft}
        overshootRight={false}
        overshootLeft={false}
      >
        <Animated.View 
          style={[
            styles.container, 
            scaleStyle,
            {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 5,
            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress || handleFlip}
            style={styles.cardTouchable}
          >
            {/* Front Face */}
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardFront,
                { backgroundColor: cardColor },
                frontAnimatedStyle,
              ]}
            >
              <View style={styles.cardHeader}>
                {card.logoUrl ? (
                  <Image source={{ uri: card.logoUrl }} style={styles.bankLogo} />
                ) : (
                  <Text style={styles.bankName}>{card.bank || card.institution || 'Credit Card'}</Text>
                )}
                <TouchableOpacity onPress={handleFlip} style={styles.flipButton}>
                  <Ionicons name="refresh" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardChip} />
                <Text style={styles.cardNumber}>
                  •••• •••• •••• {card.lastFourDigits}
                </Text>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardLabel}>CARDHOLDER</Text>
                    <Text style={styles.cardValue}>{card.name}</Text>
                  </View>
                  <View style={styles.cardExpiry}>
                    <Text style={styles.cardLabel}>VALID THRU</Text>
                    <Text style={styles.cardValue}>
                      {card.dueDate ? new Date(card.dueDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Back Face */}
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardBack,
                { backgroundColor: cardColor },
                backAnimatedStyle,
              ]}
            >
              <View style={styles.cardBackContent}>
                <View style={styles.magneticStrip} />
                <View style={styles.cvvSection}>
                  <Text style={styles.cvvLabel}>CVV</Text>
                  <View style={styles.cvvBox}>
                    <Text style={styles.cvvValue}>•••</Text>
                  </View>
                </View>
                <View style={styles.backInfo}>
                  <Text style={styles.backInfoText}>
                    Limit: ₹{card.creditLimit.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.backInfoText}>
                    Balance: ₹{card.currentBalance.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.backInfoText}>
                    Available: ₹{availableCredit.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Card Details Section */}
          <View style={[
            styles.detailsSection, 
            { 
              backgroundColor: colors.card,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }
          ]}>
            <View style={styles.limitSection}>
              <View style={styles.limitHeader}>
                <Text style={[styles.limitLabel, { color: colors.text }]}>
                  Limit used
                </Text>
                <Text style={[styles.utilizationPercentage, { color: colors.primary }]}>
                  {utilizationPercentage}%
                </Text>
              </View>

              {/* Animated Progress Bar */}
              <View
                style={[
                  styles.progressBarContainer,
                  { backgroundColor: colors.border },
                ]}
              >
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: utilizationPercentage > 70 ? '#EF4444' : colors.primary,
                      width: progressAnimation.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>

              <View style={styles.usageDetails}>
                <View style={styles.usageLeft}>
                  <Text style={[styles.usedAmount, { color: colors.text }]}>
                    ₹{card.currentBalance.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.availableCredit, { color: colors.textSecondary }]}>
                    ₹{availableCredit.toLocaleString('en-IN')} available
                  </Text>
                </View>
                <Text style={[styles.totalLimit, { color: colors.textSecondary }]}>
                  ₹{card.creditLimit.toLocaleString('en-IN')} limit
                </Text>
              </View>

              {card.dueDate && (
                <View style={styles.dueDateSection}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={card.isOverdue ? '#EF4444' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.dueDate,
                      {
                        color: card.isOverdue ? '#EF4444' : colors.textSecondary,
                        fontWeight: card.isOverdue ? '600' : '400',
                      },
                    ]}
                  >
                    Due: {new Date(card.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {card.daysUntilDue !== undefined && card.daysUntilDue >= 0 && (
                      <Text> ({card.daysUntilDue} days)</Text>
                    )}
                    {card.isOverdue && <Text style={{ color: '#EF4444' }}> - Overdue!</Text>}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardTouchable: {
    borderRadius: 16,
  },
  cardFace: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 20,
    padding: 24,
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bankLogo: {
    width: 60,
    height: 30,
    resizeMode: 'contain',
  },
  bankName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  flipButton: {
    padding: 4,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  cardExpiry: {
    alignItems: 'flex-end',
  },
  cardBackContent: {
    flex: 1,
    paddingTop: 20,
  },
  magneticStrip: {
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 20,
    borderRadius: 4,
  },
  cvvSection: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  cvvLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  cvvBox: {
    width: 60,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cvvValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  backInfo: {
    marginTop: 'auto',
  },
  backInfoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  detailsSection: {
    marginTop: 220,
    padding: 24,
    borderRadius: 20,
  },
  limitSection: {
    marginTop: 12,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  limitLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  utilizationPercentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  usageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageLeft: {
    flex: 1,
  },
  usedAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  availableCredit: {
    fontSize: 14,
  },
  totalLimit: {
    fontSize: 16,
    fontWeight: '500',
  },
  dueDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  dueDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  swipeActionContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeAction: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});


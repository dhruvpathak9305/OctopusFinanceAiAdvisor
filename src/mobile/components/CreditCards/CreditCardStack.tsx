/**
 * =============================================================================
 * CREDIT CARD STACK COMPONENT - CRED INSPIRED
 * =============================================================================
 * 
 * Main container with statement summary header, toggle, and stacked cards
 * Exact replication of provided CardStack component
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCardItem } from './CreditCardItem';
import { CreditCard } from '../../../../contexts/CreditCardContext';

// Local CardData type for sample data
interface CardData {
  id: string;
  bankName: string;
  cardNumber: string;
  holderName: string;
  amount: number;
  dueDate: string;
  variant: string;
  cardNetwork: string;
  creditLimit: number;
  usedCredit: number;
}
import { CardFilterBar } from './CardFilterBar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHARED_STYLES } from './styles/sharedStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sample cards data (matching the provided code)
const cardsData: CardData[] = [
  {
    id: '1',
    bankName: 'AMAZON PAY',
    cardNumber: '8018',
    holderName: 'DHRUV PATHAK',
    amount: 7046.37,
    dueDate: '30 DEC',
    variant: 'amazon',
    cardNetwork: 'visa',
    creditLimit: 150000,
    usedCredit: 45000,
  },
  {
    id: '2',
    bankName: 'HDFC BANK',
    cardNumber: '7622',
    holderName: 'DHRUV PATHAK',
    amount: 3031.0,
    dueDate: '3 JAN',
    variant: 'hdfc',
    cardNetwork: 'mastercard',
    creditLimit: 100000,
    usedCredit: 68000,
  },
  {
    id: '3',
    bankName: 'AXIS BANK',
    cardNumber: '8934',
    holderName: 'DHRUV PATHAK',
    amount: 5618.0,
    dueDate: '30 DEC',
    variant: 'axis',
    cardNetwork: 'mastercard',
    creditLimit: 200000,
    usedCredit: 95000,
  },
];

export const CreditCardStack: React.FC = React.memo(() => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize expensive calculations
  const totalAmount = useMemo(() => 
    cardsData.reduce((sum, card) => sum + card.amount, 0),
    []
  );
  
  const [whole, decimal] = useMemo(() => 
    totalAmount.toFixed(2).split('.'),
    [totalAmount]
  );

  // ENHANCED shimmer animation for total amount - MORE PROMINENT
  const shimmerOpacity = useSharedValue(0);

  useEffect(() => {
    shimmerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1200 }), // Increased from 0.3 to 0.6, faster
        withTiming(0, { duration: 1200 })
      ),
      -1,
      false
    );
    
    return () => {
      shimmerOpacity.value = 0;
    };
  }, [shimmerOpacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    textShadowColor: `rgba(16, 185, 129, ${shimmerOpacity.value})`,
    textShadowRadius: 30,
    textShadowOffset: { width: 0, height: 0 },
  }));

  // ENHANCED arrow down animation - MORE PROMINENT
  const arrowY = useSharedValue(0);

  useEffect(() => {
    arrowY.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 800, easing: Easing.inOut(Easing.ease) }), // Increased from 4 to 8, faster
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    return () => {
      arrowY.value = 0;
    };
  }, [arrowY]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowY.value }],
  }));

  // Calculate minHeight for card stack (matching web exactly) - memoized
  const stackMinHeight = useMemo(() => 
    isExpanded
      ? cardsData.length * 290 + 40  // 290px per card when expanded
      : cardsData.length * 55 + 224, // 55px per card when collapsed + 224px base card height
    [isExpanded]
  );

  return (
    <View style={styles.container}>
      {/* Subtle background gradient overlay for depth - more subtle */}
      <LinearGradient
        colors={['transparent', 'rgba(16, 185, 129, 0.008)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          style={[styles.header]}
          entering={undefined}
        >
          <Text style={styles.statementLabel}>
            Statement due for {cardsData.length} cards
          </Text>
          <View style={styles.totalAmountRow}>
            <Animated.Text style={[styles.totalAmount, shimmerStyle]}>
              ₹{Number(whole).toLocaleString('en-IN')}
            </Animated.Text>
            <Text style={styles.totalAmountDecimal}>.{decimal}</Text>
            <Animated.Text style={[styles.arrowDown, arrowStyle]}>
              ↓
            </Animated.Text>
          </View>
        </Animated.View>

        {/* Divider with gradient - more subtle */}
        <View style={styles.dividerContainer}>
          <LinearGradient
            colors={['transparent', COLORS.border + '80', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dividerGradient}
          />
        </View>

        {/* Switch toggle */}
        <View style={styles.toggleContainer}>
          <Pressable style={[styles.toggleButton, SHARED_STYLES.glassEffect]}>
            <Ionicons name="swap-horizontal" size={14} color={COLORS.mutedForeground} />
            <Text style={styles.toggleText}>switch to recent spends</Text>
          </Pressable>
        </View>

        {/* Cards Stack */}
        <View style={[styles.cardStack, { minHeight: stackMinHeight }]}>
          {cardsData.map((card, index) => (
            <CreditCardItem
              key={card.id}
              card={{
                id: card.id,
                bank: card.bankName,
                institution: card.bankName,
                name: card.holderName,
                lastFourDigits: card.cardNumber,
                currentBalance: card.amount,
                creditLimit: card.creditLimit,
                dueDate: card.dueDate,
              }}
              index={index}
              totalCards={cardsData.length}
              isExpanded={isExpanded}
              onPress={() => setIsExpanded(!isExpanded)}
            />
          ))}
        </View>

        {/* Statement notification - only when collapsed */}
        {!isExpanded && (
          <View style={styles.notificationContainer}>
            <Pressable style={[styles.notification, SHARED_STYLES.glassEffect]}>
              <View style={styles.notificationIcon}>
                <Text style={styles.notificationIconText}>i</Text>
              </View>
              <Text style={styles.notificationText}>december statement generated</Text>
              <Animated.Text style={styles.notificationArrow}>›</Animated.Text>
            </Pressable>
          </View>
        )}

        {/* Bottom spacer for filter bar + bottom nav */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Card Filter Bar - FIXED AT BOTTOM */}
      <CardFilterBar 
        cards={cardsData.map(card => ({
          id: card.id,
          bank: card.bankName,
          institution: card.bankName,
          name: card.holderName,
          lastFourDigits: card.cardNumber,
          currentBalance: card.amount,
          creditLimit: card.creditLimit,
          dueDate: card.dueDate,
        }))}
        cardCount={cardsData.length}
        onCardSelect={() => {}}
        onAddCard={() => {}}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl + 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.lg + 8,
    paddingBottom: SPACING.md + 4,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  statementLabel: {
    fontSize: TYPOGRAPHY.sizes.xs - 1,
    color: COLORS.mutedForeground,
    fontWeight: TYPOGRAPHY.weights.medium,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
    opacity: 0.65,
  },
  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: SPACING.xs - 2,
    gap: 5,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: TYPOGRAPHY.weights.bold || '700',
    color: COLORS.foreground,
    lineHeight: 46,
    letterSpacing: -0.8,
    textShadowColor: 'rgba(16, 185, 129, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  totalAmountDecimal: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.mutedForeground,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginLeft: 0,
    opacity: 0.6,
  },
  arrowDown: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(115, 115, 115, 0.35)',
    marginLeft: 4,
    marginTop: 4,
  },
  dividerContainer: {
    position: 'relative',
    width: '80%',
    alignSelf: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  dividerGradient: {
    height: 1,
  },
  toggleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    marginTop: -SPACING.xs,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.12)',
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleText: {
    fontSize: TYPOGRAPHY.sizes.xs - 1,
    color: COLORS.mutedForeground,
    fontWeight: TYPOGRAPHY.weights.medium,
    letterSpacing: 0.25,
    opacity: 0.75,
    textTransform: 'lowercase',
  },
  cardStack: {
    position: 'relative',
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  notificationContainer: {
    alignItems: 'center',
    marginBottom: 128,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.lg + 2,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  notificationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#10B981',
    fontWeight: TYPOGRAPHY.weights.bold || '700',
  },
  notificationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.mutedForeground,
    fontWeight: TYPOGRAPHY.weights.medium,
    letterSpacing: 0.2,
    opacity: 0.85,
    textTransform: 'lowercase',
  },
  notificationArrow: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: 'rgba(115, 115, 115, 0.4)',
    marginLeft: 4,
  },
});

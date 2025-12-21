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
    textShadowColor: `rgba(255, 140, 50, ${shimmerOpacity.value})`,
    textShadowRadius: 30, // Increased from 20 to 30
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

        {/* Divider with gradient */}
        <View style={styles.dividerContainer}>
          <LinearGradient
            colors={['transparent', COLORS.border, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dividerGradient}
          />
          <LinearGradient
            colors={['transparent', 'rgba(250, 250, 250, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.dividerGradient, { position: 'absolute', top: 0 }]}
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
        <View style={{ height: 180 }} />
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
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  statementLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.mutedForeground,
    fontWeight: TYPOGRAPHY.weights.medium,
    letterSpacing: 0.3,
    textTransform: 'none', // Match image - lowercase
  },
  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  totalAmount: {
    fontSize: 44,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.foreground,
    lineHeight: 48,
  },
  totalAmountDecimal: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.mutedForeground,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginLeft: 2,
  },
  arrowDown: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(115, 115, 115, 0.6)',
    marginLeft: 6,
  },
  dividerContainer: {
    position: 'relative',
    width: '85%',
    alignSelf: 'center',
    marginBottom: 4,
  },
  dividerGradient: {
    height: 1,
  },
  toggleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  toggleText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.mutedForeground,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  cardStack: {
    position: 'relative',
    flex: 1,
  },
  notificationContainer: {
    alignItems: 'center',
    marginBottom: 128, // mb-32 (32 * 4 = 128px)
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  notificationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#60A5FA', // blue-400
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  notificationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.mutedForeground,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  notificationArrow: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: 'rgba(115, 115, 115, 0.6)',
  },
});

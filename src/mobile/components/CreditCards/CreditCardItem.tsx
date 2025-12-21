/**
 * =============================================================================
 * CREDIT CARD ITEM COMPONENT
 * =============================================================================
 * 
 * Individual credit card with expand/collapse animation (inspired by reference design)
 */

import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { CreditCard } from '../../../../contexts/CreditCardContext';
import { CircularProgress } from './CircularProgress';
import { RippleButton } from './RippleButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface CreditCardItemProps {
  card: CreditCard;
  index: number;
  totalCards: number;
  isExpanded: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onPayNow?: () => void;
}

/**
 * Get bank-specific gradient colors (EXACT match with web)
 */
const getBankGradient = (bankName: string): string[] => {
  const bankUpper = (bankName || '').toUpperCase();
  
  if (bankUpper.includes('AMAZON') || bankUpper.includes('AMAZON PAY')) {
    // bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900
    return ['#18181b', '#27272a', '#18181b']; // Dark zinc gradient
  } else if (bankUpper.includes('HDFC')) {
    // bg-gradient-to-b from-orange-400 via-orange-500 to-red-500
    return ['#fb923c', '#f97316', '#ef4444']; // Orange to red (NOT teal!)
  } else if (bankUpper.includes('AXIS')) {
    // bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800
    return ['#27272a', '#3f3f46', '#27272a']; // Dark gray like Amazon
  } else if (bankUpper.includes('ICICI')) {
    return ['#F093FB', '#F5576C']; // Pink to red
  } else {
    return ['#6366F1', '#8B5CF6', '#A78BFA']; // Default purple
  }
};

/**
 * Get chip style (gold for Axis, regular for others)
 */
const getChipStyle = (bankName: string): any => {
  const bankUpper = (bankName || '').toUpperCase();
  if (bankUpper.includes('AXIS')) {
    return [styles.chip, styles.chipGold];
  }
  return styles.chip;
};

/**
 * Get chip line style (gold for Axis, regular for others)
 */
const getChipLineStyle = (bankName: string): any => {
  const bankUpper = (bankName || '').toUpperCase();
  if (bankUpper.includes('AXIS')) {
    return [styles.chipLine, styles.chipLineGold];
  }
  return styles.chipLine;
};

/**
 * Render bank-specific logo
 */
const renderBankLogo = (bankName: string) => {
  const bankUpper = (bankName || '').toUpperCase();
  
  if (bankUpper.includes('AMAZON') || bankUpper.includes('AMAZON PAY')) {
    return (
      <View style={styles.amazonLogoContainer}>
        <Text style={styles.amazonText}>amazon</Text>
        <Text style={[styles.amazonText, styles.amazonPayText]}>pay</Text>
      </View>
    );
  } else if (bankUpper.includes('HDFC')) {
    return (
      <View style={styles.hdfcLogoContainer}>
        <View style={styles.hdfcGrid}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={styles.hdfcGridSquare} />
          ))}
        </View>
        <Text style={styles.hdfcText}>HDFC BANK</Text>
      </View>
    );
  } else if (bankUpper.includes('AXIS')) {
    return (
      <View style={styles.axisLogoContainer}>
        <Text style={styles.axisLetter}>A</Text>
        <Text style={styles.axisText}>AXIS BANK</Text>
      </View>
    );
  }
  
  return (
    <Text style={styles.bankName}>
      {bankName.toUpperCase()}
    </Text>
  );
};

/**
 * Memoized Amazon texture lines component (optimized)
 */
const AmazonTextureLines = React.memo(() => {
  // Pre-generate line positions to avoid creating array on every render
  const linePositions = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => i * 8),
    []
  );

  return (
    <View style={styles.textureOverlay}>
      {linePositions.map((top, i) => (
        <LinearGradient
          key={i}
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.textureLine, { top }]}
        />
      ))}
    </View>
  );
});

/**
 * Memoized Axis card SVG texture component (optimized)
 */
const AxisCardTexture = React.memo(() => (
  <View style={styles.textureOverlay} pointerEvents="none">
    <Svg 
      width={CARD_WIDTH} 
      height={224} 
      viewBox="0 0 400 220" 
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        <SvgLinearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#1e90ff" stopOpacity="1" />
          <Stop offset="100%" stopColor="#4169e1" stopOpacity="1" />
        </SvgLinearGradient>
        <SvgLinearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#ff69b4" stopOpacity="1" />
          <Stop offset="100%" stopColor="#da70d6" stopOpacity="1" />
        </SvgLinearGradient>
      </Defs>
      {/* Blue ribbon */}
      <Path
        d="M 0 180 Q 80 120, 160 150 T 280 100 T 400 140"
        fill="none"
        stroke="url(#blueGradient)"
        strokeWidth="60"
        strokeLinecap="round"
      />
      {/* Pink ribbon */}
      <Path
        d="M 0 200 Q 100 150, 200 180 T 350 120 T 450 160"
        fill="none"
        stroke="url(#pinkGradient)"
        strokeWidth="50"
        strokeLinecap="round"
      />
    </Svg>
  </View>
));

/**
 * Render card texture overlay (memoized)
 */
const renderCardTexture = (bankName: string) => {
  const bankUpper = (bankName || '').toUpperCase();
  
  if (bankUpper.includes('AMAZON') || bankUpper.includes('AMAZON PAY')) {
    return <AmazonTextureLines />;
  }
  
  if (bankUpper.includes('AXIS')) {
    return <AxisCardTexture />;
  }
  
  return null;
};

export const CreditCardItem: React.FC<CreditCardItemProps> = React.memo(({
  card,
  index,
  totalCards,
  isExpanded,
  onPress,
  onLongPress,
  onPayNow,
}) => {
  // Validate index and totalCards to prevent NaN - memoized
  const safeIndex = useMemo(() => 
    (index != null && !isNaN(index)) ? Number(index) : 0,
    [index]
  );
  const safeTotalCards = useMemo(() => 
    (totalCards != null && !isNaN(totalCards)) ? Number(totalCards) : 1,
    [totalCards]
  );

  // Match web positioning exactly - memoized
  const collapsedY = useMemo(() => safeIndex * 55, [safeIndex]);
  const expandedY = useMemo(() => safeIndex * 290, [safeIndex]);

  const translateY = useSharedValue(collapsedY);
  const scale = useSharedValue(1 - safeIndex * 0.02);
  
  // Card entrance animation - staggered fade-in
  const opacity = useSharedValue(0);
  const entranceY = useSharedValue(20);
  
  // Card press animation - scale feedback
  const pressScale = useSharedValue(1);
  
  // Smooth 3D tilt effect (simplified for stability)
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  
  // Card shine animation
  const shinePosition = useSharedValue(-100);
  
  // Memoized press handlers to prevent re-renders
  const handlePressIn = useCallback(() => {
    pressScale.value = withTiming(0.98, { duration: 100 });
    // Subtle random tilt for visual interest
    tiltX.value = withTiming((Math.random() - 0.5) * 3, { duration: 100 });
    tiltY.value = withTiming((Math.random() - 0.5) * 3, { duration: 100 });
  }, [pressScale, tiltX, tiltY]);
  
  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, { damping: 20, stiffness: 300 });
    tiltX.value = withSpring(0, { damping: 20, stiffness: 300 });
    tiltY.value = withSpring(0, { damping: 20, stiffness: 300 });
  }, [pressScale, tiltX, tiltY]);

  // Entrance animation on mount - ENHANCED with spring (with cleanup)
  useEffect(() => {
    const delay = safeIndex * 100; // Stagger by 100ms per card (faster)
    const timeoutId = setTimeout(() => {
      opacity.value = withSpring(1, { damping: 20, stiffness: 90 });
      entranceY.value = withSpring(0, { damping: 20, stiffness: 90 });
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [safeIndex, opacity, entranceY]);

  // Position and scale animation (consolidated)
  useEffect(() => {
    translateY.value = withSpring(isExpanded ? expandedY : collapsedY, {
      damping: 30,
      stiffness: 300,
    });
    scale.value = withSpring(isExpanded ? 1 : 1 - safeIndex * 0.02, {
      damping: 30,
      stiffness: 300,
    });
  }, [isExpanded, safeIndex, expandedY, collapsedY, translateY, scale]);

  // FIXED shine animation effect - COVERS FULL CARD WIDTH
  useEffect(() => {
    shinePosition.value = withRepeat(
      withSequence(
        withTiming(-100, { duration: 0 }), // Start from left
        withTiming(200, { duration: 3000, easing: Easing.inOut(Easing.ease) }) // Extended to 200% for full coverage
      ),
      -1,
      false
    );

    return () => {
      shinePosition.value = -100;
    };
  }, [shinePosition]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value + entranceY.value },
      { scale: scale.value * pressScale.value },
      // Subtle tilt effect (simplified for stability)
      { rotateZ: `${(tiltX.value + tiltY.value) * 0.3}deg` },
    ],
    opacity: opacity.value,
  }));

  const shineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shinePosition.value }],
  }));

  // Memoize expensive calculations
  const bankName = useMemo(() => card.bank || '', [card.bank]);
  const gradientColors = useMemo(() => {
    const colors = getBankGradient(bankName);
    // Ensure at least 2 colors for LinearGradient
    return colors.length >= 2 ? colors as [string, string, ...string[]] : ['#6366F1', '#8B5CF6'];
  }, [bankName]);

  const formatCurrency = useCallback((amount: number) => {
    // Ensure amount is a valid number
    const validAmount = (amount != null && !isNaN(amount)) ? Number(amount) : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(validAmount);
  }, []);

  const formatDueDate = useCallback((dateString: string) => {
    if (!dateString) return 'N/A';
    
    // Handle date strings like "30 DEC" or "3 JAN" (already formatted)
    const monthAbbrs = ['DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV'];
    if (monthAbbrs.some(month => dateString.includes(month))) {
      return dateString.toUpperCase();
    }
    
    // Try to parse as Date
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString || 'N/A';
      }
      const day = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      return `${day} ${month}`;
    } catch (error) {
      return dateString || 'N/A';
    }
  }, []);

  // Calculate credit usage percentage - ensure valid numbers
  const creditLimit = (card.creditLimit != null && !isNaN(card.creditLimit) && card.creditLimit > 0) 
    ? Number(card.creditLimit) 
    : 100000;
  const usedCredit = (card.currentBalance != null && !isNaN(card.currentBalance)) 
    ? Number(card.currentBalance) 
    : 0;
  const usagePercentage = creditLimit > 0 
    ? Math.min((usedCredit / creditLimit) * 100, 100) 
    : 0;

  // Safely format last four digits - handle undefined, null, or empty string
  const lastFourDigits = card.lastFourDigits 
    ? String(card.lastFourDigits).slice(-4).padStart(4, '0')
    : '••••';

  // Calculate safe zIndex - ensure it's a valid number and never NaN
  const safeZIndex = (() => {
    const calculated = safeTotalCards - safeIndex;
    return (calculated != null && !isNaN(calculated) && isFinite(calculated)) 
      ? Math.max(0, Math.round(calculated)) 
      : 0;
  })();
  
  return (
    <Animated.View 
      style={[styles.cardContainer, animatedStyle, { zIndex: safeZIndex }]}
    >
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={onLongPress}
          activeOpacity={1}
        >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Card Shine Animation - ENHANCED */}
          <Animated.View style={[styles.shineOverlay, shineAnimatedStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.25)', 'transparent']} // Increased from 0.1 to 0.25
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shineGradient}
            />
          </Animated.View>
          
          {/* Card Texture/Design Overlay */}
          {useMemo(() => renderCardTexture(bankName), [bankName])}
          
          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Top Row */}
            <View style={styles.topRow}>
              <View>
                {/* Bank Logo */}
                {useMemo(() => renderBankLogo(bankName), [bankName])}
                
                <View style={styles.cardInfoRow}>
                  {/* Card Network Logo */}
                  {((card.bank || '').toUpperCase().includes('HDFC') || (card.bank || '').toUpperCase().includes('AXIS')) && (
                    <View style={styles.mastercardLogos}>
                      <View style={styles.mastercardCircleRed} />
                      <View style={styles.mastercardCircleOrange} />
                    </View>
                  )}
                  {(card.bank || '').toUpperCase().includes('AMAZON') && (
                  <Text style={styles.cardInfo}>VISA</Text>
                  )}
                  <Text style={styles.cardInfo}>•• {lastFourDigits}</Text>
                </View>
              </View>
              <View style={styles.amountSection}>
                <Text style={styles.amountValue}>
                  {formatCurrency(card.currentBalance || 0)}
                </Text>
                <Text style={styles.dueDateText}>
                  DUE ON {formatDueDate(card.dueDate || '')}
                </Text>
              </View>
            </View>

            {/* Chip and Progress indicator (always visible, matching web) */}
              <View style={styles.chipProgressRow}>
              <View style={getChipStyle(card.bank || '')}>
                  <View style={styles.chipInner}>
                    {[...Array(6)].map((_, i) => (
                    <View key={i} style={getChipLineStyle(card.bank || '')} />
                    ))}
                  </View>
                </View>
                
                {/* Credit usage circular progress */}
                <CircularProgress
                  percentage={usagePercentage}
                  size={36}
                  strokeWidth={3}
                >
                  <Text style={styles.progressText}>
                    {Math.round(usagePercentage)}%
                  </Text>
                </CircularProgress>
              </View>

            {/* Bottom Row */}
            <View style={styles.bottomRow}>
              <Text style={styles.holderName}>
                {card.name?.toUpperCase() || 'CARDHOLDER'}
              </Text>
              <RippleButton
                onPress={(e) => {
                  e.stopPropagation();
                  onPayNow?.();
                }}
                style={styles.payNowButton}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F5F5F5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.payNowGradient}
                >
                  <Text style={styles.payNowText}>Pay now</Text>
                </LinearGradient>
              </RippleButton>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
        </View>

        {/* Statement notification below card when expanded (matching web) */}
        {isExpanded && (
          <View style={styles.expandedNotificationContainer}>
            <View style={styles.expandedNotification}>
              <View style={styles.expandedNotificationIcon}>
                <Text style={styles.expandedNotificationIconText}>i</Text>
              </View>
              <Text style={styles.expandedNotificationText}>december statement generated</Text>
              <Text style={styles.expandedNotificationArrow}>›</Text>
            </View>
          </View>
        )}
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo - only re-render if props actually change
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.index === nextProps.index &&
    prevProps.totalCards === nextProps.totalCards &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.card.currentBalance === nextProps.card.currentBalance &&
    prevProps.card.dueDate === nextProps.card.dueDate
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    minHeight: 224, // Match web card height (h-56)
    alignSelf: 'center',
  },
  cardWrapper: {
    flex: 1,
    width: '100%',
  },
  cardTouchable: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
    height: 224, // Match web: h-56 = 224px
    borderRadius: 16,
    overflow: 'hidden',
    // Enhanced shadows matching web card-shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
    // Inner glow effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bankName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  dueDateText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    fontWeight: '500',
  },
  chipProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 16,
  },
  chip: {
    width: 40,
    height: 32,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipGold: {
    backgroundColor: '#fbbf24', // yellow-400
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.3)', // yellow-700 with opacity
  },
  chipInner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1.5,
    padding: 6,
  },
  chipLine: {
    width: 10,
    height: 3,
    backgroundColor: 'rgba(63, 63, 70, 0.4)', // zinc-700 with opacity
    borderRadius: 0.5,
  },
  chipLineGold: {
    backgroundColor: 'rgba(180, 83, 9, 0.4)', // yellow-700 with opacity
  },
  mastercardLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
    width: 28,
    height: 16,
  },
  mastercardCircleRed: {
    position: 'absolute',
    left: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444', // red-500
  },
  mastercardCircleOrange: {
    position: 'absolute',
    left: 12,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fb923c', // orange-400
    opacity: 0.8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },
  payNowButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  payNowGradient: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  payNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
  },
  progressText: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  // FIXED shine animation overlay - COVERS FULL CARD
  shineOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '-100%', // Changed from -50% to -100% for full coverage
    width: '100%', // Changed from 50% to 100% for full card coverage
    opacity: 0.8,
  },
  shineGradient: {
    flex: 1,
    transform: [{ skewX: '-25deg' }],
  },
  // Texture overlay styles
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  textureLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  // Amazon logo styles
  amazonLogoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: 8,
  },
  amazonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  amazonPayText: {
    color: '#fb923c', // orange-400
  },
  // HDFC logo styles
  hdfcLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  hdfcGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 10,
    height: 10,
    gap: 2,
  },
  hdfcGridSquare: {
    width: 4,
    height: 4,
    backgroundColor: '#dc2626', // red-600
  },
  hdfcText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e3a8a', // blue-900
    letterSpacing: 0.3,
  },
  // Axis logo styles
  axisLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  axisLetter: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  axisText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3,
  },
  // Expanded notification styles (below card when expanded)
  expandedNotificationContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  expandedNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  expandedNotificationIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(147, 197, 253, 0.2)', // blue-300 with opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedNotificationIconText: {
    fontSize: 9,
    color: '#93C5FD', // blue-300
    fontWeight: '600',
  },
  expandedNotificationText: {
    fontSize: 12,
    color: 'rgba(115, 115, 115, 1)', // muted-foreground
    fontWeight: '500',
  },
  expandedNotificationArrow: {
    fontSize: 16,
    color: 'rgba(115, 115, 115, 0.6)',
  },
});


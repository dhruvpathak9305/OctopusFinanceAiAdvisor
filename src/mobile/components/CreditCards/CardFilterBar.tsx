/**
 * =============================================================================
 * CARD FILTER BAR COMPONENT
 * =============================================================================
 * 
 * Bottom filter bar with card thumbnails and "Add card" button (inspired by reference design)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CreditCard } from '../../../../contexts/CreditCardContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardFilterBarProps {
  cards?: CreditCard[];
  cardCount?: number;
  selectedCardId?: string | null;
  onCardSelect?: (cardId: string | 'all') => void;
  onAddCard?: () => void;
}

/**
 * Get bank-specific gradient colors for thumbnail (match main card gradients)
 */
const getBankGradient = (bankName: string): string[] => {
  const bankUpper = (bankName || '').toUpperCase();
  
  if (bankUpper.includes('AMAZON') || bankUpper.includes('AMAZON PAY')) {
    return ['#18181b', '#27272a']; // Dark zinc
  } else if (bankUpper.includes('HDFC')) {
    return ['#fb923c', '#ef4444']; // Orange to red
  } else if (bankUpper.includes('AXIS')) {
    return ['#27272a', '#3f3f46']; // Dark gray
  } else if (bankUpper.includes('ICICI')) {
    return ['#F093FB', '#F5576C']; // Pink to red
  } else {
    return ['#6366F1', '#8B5CF6']; // Purple
  }
};

/**
 * Get bank icon/initial for thumbnail
 */
const getBankIcon = (bankName: string): string => {
  const bankUpper = (bankName || '').toUpperCase();
  if (bankUpper.includes('AMAZON')) return 'A';
  if (bankUpper.includes('HDFC')) return 'H';
  if (bankUpper.includes('AXIS')) return 'A';
  if (bankUpper.includes('ICICI')) return 'I';
  return bankName.charAt(0).toUpperCase();
};

export const CardFilterBar: React.FC<CardFilterBarProps> = ({
  cards = [],
  cardCount,
  selectedCardId,
  onCardSelect = () => {},
  onAddCard = () => {},
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;
  
  // Ensure cards is always an array
  const safeCards = Array.isArray(cards) ? cards : [];
  
  // Use cardCount if provided, otherwise use cards.length
  const displayCount = cardCount != null ? cardCount : safeCards.length;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        {/* ALL Button */}
        <TouchableOpacity
          style={[
            styles.allButton,
            selectedCardId === null && {
              backgroundColor: colors.primary + '20',
              borderColor: colors.primary,
            },
            selectedCardId !== null && {
              backgroundColor: 'transparent',
              borderColor: colors.border,
            },
          ]}
          onPress={() => onCardSelect('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.allButtonText,
              {
                color: selectedCardId === null ? colors.primary : colors.textSecondary,
                fontWeight: selectedCardId === null ? '700' : '500',
              },
            ]}
          >
            ALL <Text style={{ color: colors.textSecondary }}>({displayCount})</Text>
          </Text>
        </TouchableOpacity>

        {/* Card Thumbnails */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsContainer}
        >
          {safeCards.map((card, index) => {
            const isSelected = selectedCardId === card.id;
            const gradientColors = getBankGradient(card.bank || card.institution || '');
            const bankIcon = getBankIcon(card.bank || card.institution || '');

            return (
              <AnimatedTouchable
                key={card.id || index}
                style={[
                  styles.thumbnail,
                  isSelected && {
                    borderColor: colors.primary,
                    borderWidth: 2.5,
                  },
                  !isSelected && {
                    borderColor: 'transparent',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => card.id && onCardSelect(card.id)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.thumbnailGradient}
                >
                  <Text style={styles.thumbnailText}>{bankIcon}</Text>
                </LinearGradient>
              </AnimatedTouchable>
            );
          })}
        </ScrollView>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Add Card Button */}
        <AnimatedTouchable
          style={[
            styles.addButton,
            {
              borderColor: colors.border,
              backgroundColor: 'transparent',
            },
          ]}
          onPress={onAddCard}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={14} color={colors.textSecondary} />
          <Text style={[styles.addButtonText, { color: colors.textSecondary }]}>
            Add card
          </Text>
        </AnimatedTouchable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 85, // Proper spacing above bottom nav (matching web)
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.95)', // Pure black matching image
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 40, // Below bottom nav (50) but above content
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  allButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 70,
    backgroundColor: 'transparent',
  },
  allButtonText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  thumbnail: {
    width: 32,
    height: 32,
    borderRadius: 16, // Fully circular
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 24,
    opacity: 0.3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 5,
    backgroundColor: 'transparent',
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});



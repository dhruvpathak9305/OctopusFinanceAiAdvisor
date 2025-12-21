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
              backgroundColor: '#10B981' + '20',
              borderColor: '#10B981',
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
                color: selectedCardId === null ? '#10B981' : colors.textSecondary,
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
            const gradientColors = getBankGradient(card.bank || '');
            const bankIcon = getBankIcon(card.bank || '');

            return (
              <AnimatedTouchable
                key={card.id || index}
                style={[
                  styles.thumbnail,
                  isSelected && {
                    borderColor: '#10B981',
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
                  colors={gradientColors as [string, string, ...string[]]}
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
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
            },
          ]}
          onPress={onAddCard}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={14} color="#10B981" />
          <Text style={[styles.addButtonText, { color: '#10B981' }]}>
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1F2937', // Dark gray matching Financial Dashboard cards
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 40, // Below bottom nav (50) but above content
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 65,
    backgroundColor: 'transparent',
  },
  allButtonText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  thumbnail: {
    width: 30,
    height: 30,
    borderRadius: 15, // Fully circular
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
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
    height: 22,
    opacity: 0.25,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  addButtonText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});



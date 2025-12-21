/**
 * =============================================================================
 * CARD SELECTOR COMPONENT
 * =============================================================================
 * 
 * Bottom overlay bar with card thumbnails and selection.
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
import { useTheme } from '../../../../contexts/ThemeContext';
import { CreditCard } from '../../../../contexts/CreditCardContext';

interface CardSelectorProps {
  cards: CreditCard[];
  selectedCardId?: string | null;
  onCardSelect: (cardId: string) => void;
  onAddCard: () => void;
}

/**
 * Get bank-specific gradient colors for thumbnail
 */
const getBankGradient = (bankName: string): string[] => {
  const bankUpper = (bankName || '').toUpperCase();
  
  if (bankUpper.includes('HDFC')) {
    return ['#FF6B6B', '#4ECDC4'];
  } else if (bankUpper.includes('AXIS')) {
    return ['#667EEA', '#764BA2'];
  } else if (bankUpper.includes('ICICI')) {
    return ['#F093FB', '#F5576C'];
  } else if (bankUpper.includes('SBI')) {
    return ['#4FACFE', '#00F2FE'];
  } else {
    return ['#6366F1', '#8B5CF6'];
  }
};

export const CardSelector: React.FC<CardSelectorProps> = ({
  cards,
  selectedCardId,
  onCardSelect,
  onAddCard,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.content}>
        {/* All Cards Label */}
        <TouchableOpacity
          style={[
            styles.allButton,
            !selectedCardId && { backgroundColor: colors.primary },
          ]}
          onPress={() => onCardSelect('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.allButtonText,
              { color: !selectedCardId ? 'white' : colors.text },
            ]}
          >
            ALL ({cards.length})
          </Text>
        </TouchableOpacity>

        {/* Card Thumbnails */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsContainer}
        >
          {cards.map((card, index) => {
            const isSelected = selectedCardId === card.id;
            const gradientColors = getBankGradient(card.bank || card.institution || '');

            return (
              <TouchableOpacity
                key={card.id || index}
                style={styles.thumbnailWrapper}
                onPress={() => card.id && onCardSelect(card.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.thumbnail,
                    isSelected && styles.thumbnailSelected,
                    isSelected && { borderColor: colors.primary },
                  ]}
                >
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.thumbnailGradient}
                  >
                    <Text style={styles.thumbnailText}>
                      {card.lastFourDigits}
                    </Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Add Card Button */}
        <TouchableOpacity
          style={[styles.addButton, { borderColor: colors.border }]}
          onPress={onAddCard}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>
            Add card
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    minWidth: 75,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  allButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  thumbnailWrapper: {
    marginRight: 4,
  },
  thumbnail: {
    width: 52,
    height: 34,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: 'transparent',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailSelected: {
    borderWidth: 2,
  },
  thumbnailGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});


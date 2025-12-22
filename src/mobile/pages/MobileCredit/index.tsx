/**
 * =============================================================================
 * MOBILE CREDIT CARDS PAGE - BEAUTIFUL & CONSISTENT
 * =============================================================================
 * 
 * Consistent header design matching Accounts and Net Worth pages
 * Beautiful credit cards display with green/teal theme
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CreditCardStack } from '../../components/CreditCards/CreditCardStack';
import { CreditCardBottomNav } from '../../components/CreditCards/CreditCardBottomNav';

interface MobileCreditProps {
  hideHeaderAndNav?: boolean;
}

const MobileCredit: React.FC<MobileCreditProps> = ({ hideHeaderAndNav = false }) => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const colors = isDark 
    ? require('../../../../contexts/ThemeContext').darkTheme 
    : require('../../../../contexts/ThemeContext').lightTheme;

  return (
    <>
      {!hideHeaderAndNav && (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Consistent Header - Matching Accounts and Net Worth */}
          <View
            style={[
              styles.header,
              { backgroundColor: colors.card, borderBottomColor: colors.border },
            ]}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Money
              </Text>
            </View>
            {/* Cashback Badge and Settings Icons - Right side */}
            <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.cashbackBadge, { borderColor: colors.primary + '40' }]}
            onPress={() => console.log('Cashback pressed')}
          >
            <LinearGradient
              colors={['#10B981', '#14B8A6', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cashbackIcon}
            >
              <Text style={styles.cashbackIconText}>₹</Text>
            </LinearGradient>
            <Text style={[styles.cashbackAmount, { color: colors.text }]}>
              41
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: `${colors.primary}15` }]}
            onPress={() => console.log('Analytics pressed')}
          >
            <Ionicons name="analytics" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: `${colors.border}30` }]}
            onPress={() => console.log('Settings pressed')}
          >
            <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Width Navigation Buttons - Consistent across all Money pages */}
      <View
        style={[
          styles.fullNavContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View
          style={[styles.fullNavButtonGroup, { backgroundColor: colors.card }]}
        >
            <TouchableOpacity
              style={[styles.fullNavButton]}
              onPress={() => (navigation as any).navigate("MobileAccounts")}
            >
              <Ionicons name="wallet" size={14} color={colors.textSecondary} />
              <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
                Accounts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.fullNavButton,
                styles.activeFullNav,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="card" size={14} color="white" />
              <Text style={[styles.fullNavText, { color: "white" }]}>
                Credit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fullNavButton]}
              onPress={() => (navigation as any).navigate("MobileNetWorth")}
            >
              <Ionicons
                name="trending-up"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={[styles.fullNavText, { color: colors.textSecondary }]}>
                Net
              </Text>
            </TouchableOpacity>
        </View>
      </View>
        </View>
      )}
      
      <View style={hideHeaderAndNav ? { flex: 1 } : [styles.container, { backgroundColor: colors.background }]}>
        {/* Card Stack - Has its own ScrollView */}
        <CreditCardStack />
        
        {/* Bottom Navigation */}
        <CreditCardBottomNav
          activeTab="cards"
          onHomePress={() => console.log('Home pressed')}
          onCardsPress={() => console.log('Cards pressed')}
          onUPIPress={() => console.log('UPI pressed')}
          onRewardsPress={() => console.log('Rewards pressed')}
          onMorePress={() => console.log('More pressed')}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  cashbackIcon: {
    width: 20,
    height: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
  },
  cashbackIconText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  cashbackAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fullNavContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fullNavButtonGroup: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
  },
  fullNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 5,
  },
  activeFullNav: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  fullNavText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default MobileCredit;

/**
 * =============================================================================
 * UNIFIED MONEY PAGE - Accounts, Credit, Net Worth
 * =============================================================================
 * 
 * Single page with persistent header and navigation
 * Only content area changes when switching tabs
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../contexts/ThemeContext';
import MobileAccounts from '../MobileAccounts';
import MobileCredit from '../MobileCredit';
// @ts-ignore - TypeScript import issue
import MobileNetWorth from '../MobileNetWorth';

type MoneyTab = 'accounts' | 'credit' | 'net';

type MoneyRouteParams = {
  initialTab?: MoneyTab;
  showAddAssetModal?: boolean;
};

type MoneyRouteProp = RouteProp<{ Money: MoneyRouteParams }, 'Money'>;

const MoneyPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<MoneyRouteProp>();
  const { isDark } = useTheme();
  const colors = isDark 
    ? require('../../../../contexts/ThemeContext').darkTheme 
    : require('../../../../contexts/ThemeContext').lightTheme;
  
  // Get initial tab from route params, default to 'accounts'
  const initialTab = route.params?.initialTab || 'accounts';
  const [activeTab, setActiveTab] = useState<MoneyTab>(initialTab);

  // Update tab if route params change
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  // Keep all components mounted but only show the active one using opacity
  // This prevents full page re-renders - components stay in memory and state is preserved
  const renderContent = () => {
    return (
      <>
        <View 
          style={[
            styles.tabContent, 
            { 
              opacity: activeTab === 'accounts' ? 1 : 0,
              zIndex: activeTab === 'accounts' ? 1 : 0,
              pointerEvents: activeTab === 'accounts' ? 'auto' : 'none',
            }
          ]}
        >
          <MobileAccounts hideHeaderAndNav />
        </View>
        <View 
          style={[
            styles.tabContent, 
            { 
              opacity: activeTab === 'credit' ? 1 : 0,
              zIndex: activeTab === 'credit' ? 1 : 0,
              pointerEvents: activeTab === 'credit' ? 'auto' : 'none',
            }
          ]}
        >
          <MobileCredit hideHeaderAndNav />
        </View>
        <View 
          style={[
            styles.tabContent, 
            { 
              opacity: activeTab === 'net' ? 1 : 0,
              zIndex: activeTab === 'net' ? 1 : 0,
              pointerEvents: activeTab === 'net' ? 'auto' : 'none',
            }
          ]}
        >
          <MobileNetWorth hideHeaderAndNav showAddAssetModal={route.params?.showAddAssetModal} />
        </View>
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Consistent Header - Always visible */}
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
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Manage your accounts and cards
          </Text>
        </View>
        {/* Cashback Badge and Settings Icons - Right side (only show on credit tab) */}
        {activeTab === 'credit' && (
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
              style={[styles.headerIconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => console.log('Analytics pressed')}
            >
              <Ionicons name="stats-chart-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => console.log('Settings pressed')}
            >
              <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Full Width Navigation Buttons - Always visible */}
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
            style={[
              styles.fullNavButton,
              activeTab === 'accounts' && [
                styles.activeFullNav,
                { backgroundColor: colors.primary },
              ],
            ]}
            onPress={() => setActiveTab('accounts')}
          >
            <Ionicons 
              name="wallet" 
              size={14} 
              color={activeTab === 'accounts' ? 'white' : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.fullNavText, 
                { color: activeTab === 'accounts' ? 'white' : colors.textSecondary }
              ]}
            >
              Accounts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.fullNavButton,
              activeTab === 'credit' && [
                styles.activeFullNav,
                { backgroundColor: colors.primary },
              ],
            ]}
            onPress={() => setActiveTab('credit')}
          >
            <Ionicons 
              name="card" 
              size={14} 
              color={activeTab === 'credit' ? 'white' : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.fullNavText, 
                { color: activeTab === 'credit' ? 'white' : colors.textSecondary }
              ]}
            >
              Credit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.fullNavButton,
              activeTab === 'net' && [
                styles.activeFullNav,
                { backgroundColor: colors.primary },
              ],
            ]}
            onPress={() => setActiveTab('net')}
          >
            <Ionicons
              name="trending-up"
              size={14}
              color={activeTab === 'net' ? 'white' : colors.textSecondary}
            />
            <Text 
              style={[
                styles.fullNavText, 
                { color: activeTab === 'net' ? 'white' : colors.textSecondary }
              ]}
            >
              Net
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Content Area - Only this changes */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
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
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  tabContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

export default MoneyPage;


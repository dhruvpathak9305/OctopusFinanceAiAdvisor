/**
 * =============================================================================
 * MOBILE CREDIT CARDS PAGE - CRED INSPIRED
 * =============================================================================
 * 
 * Exact replication of the provided Cred-inspired design
 * Dark theme with ambient particles, glassmorphism, and smooth animations
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCardHeader } from '../../components/CreditCards/CreditCardHeader';
import { CreditCardStack } from '../../components/CreditCards/CreditCardStack';
import { CreditCardBottomNav } from '../../components/CreditCards/CreditCardBottomNav';
import { ParticleField } from '../../components/CreditCards/ParticleField';
import { COLORS } from '../../components/CreditCards/styles/sharedStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MobileCredit: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <CreditCardHeader
          cashbackAmount={41}
          onCashbackPress={() => console.log('Cashback pressed')}
          onPercentPress={() => console.log('Percent pressed')}
          onSettingsPress={() => console.log('Settings pressed')}
        />
        
        {/* Card Stack */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000', // Pure black matching image
  },
  container: {
    flex: 1,
    maxWidth: 448, // max-w-md (28rem = 448px)
    alignSelf: 'center',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000000', // Pure black background matching image
  },
});

export default MobileCredit;

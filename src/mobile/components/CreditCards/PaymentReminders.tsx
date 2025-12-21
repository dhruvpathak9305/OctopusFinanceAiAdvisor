/**
 * =============================================================================
 * PAYMENT REMINDERS COMPONENT
 * =============================================================================
 * 
 * Smart reminders and auto-pay configuration.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useCreditCards } from '../../../../contexts/CreditCardContext';

export const PaymentReminders: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? require('../../../../contexts/ThemeContext').darkTheme : require('../../../../contexts/ThemeContext').lightTheme;
  const { creditCards } = useCreditCards();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);

  // Get cards with due dates
  const cardsWithDueDates = creditCards.filter(card => card.dueDate);

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Payment Reminders</Text>

      {/* Reminder Settings */}
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Payment Reminders
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get notified 3 days and 1 day before due date
              </Text>
            </View>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={setRemindersEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="card-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Auto-pay
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Automatically pay minimum amount on due date
              </Text>
            </View>
          </View>
          <Switch
            value={autoPayEnabled}
            onValueChange={setAutoPayEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      {/* Card-specific Reminders */}
      {cardsWithDueDates.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Reminders</Text>
          {cardsWithDueDates.map((card) => {
            const dueDate = new Date(card.dueDate!);
            const today = new Date();
            const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <View key={card.id} style={[styles.cardReminder, { backgroundColor: colors.background }]}>
                <View style={styles.cardReminderContent}>
                  <Text style={[styles.cardReminderName, { color: colors.text }]}>
                    {card.name}
                  </Text>
                  <Text style={[styles.cardReminderDate, { color: colors.textSecondary }]}>
                    Due: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {daysDiff >= 0 && ` (${daysDiff} days)`}
                  </Text>
                </View>
                <Switch
                  value={remindersEnabled}
                  onValueChange={() => {}}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  cardReminder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardReminderContent: {
    flex: 1,
  },
  cardReminderName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardReminderDate: {
    fontSize: 12,
  },
});


import React from "react";
import { Alert } from "react-native";
import {
  SettingsSection,
  SettingsItem,
  SettingsSeparator,
} from "../components";
import { ThemeColors } from "../types";

interface FinancialManagementSectionProps {
  colors: ThemeColors;
}

const FinancialManagementSection: React.FC<FinancialManagementSectionProps> = ({
  colors,
}) => {
  return (
    <SettingsSection title="Financial Management" colors={colors}>
      <SettingsItem
        icon="wallet"
        title="Account Management"
        subtitle="Bank accounts, credit cards, investment accounts"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Accounts",
            "Manage your financial accounts, set up automatic syncing, and configure account categories."
          )
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="calculator"
        title="Budget Categories"
        subtitle="Income, expenses, and custom categories"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Budget Categories",
            "Configure budget categories, set spending limits, and customize the 50/30/20 rule."
          )
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="trending-up"
        title="Net Worth Tracking"
        subtitle="Assets, liabilities, and investment tracking"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Net Worth",
            "Set up asset tracking, liability management, and investment portfolio monitoring."
          )
        }
      />
      <SettingsSeparator colors={colors} />
      <SettingsItem
        icon="receipt"
        title="Transaction Settings"
        subtitle="Auto-categorization, CSV import, recurring transactions"
        colors={colors}
        onPress={() =>
          Alert.alert(
            "Transactions",
            "Configure automatic transaction categorization, CSV import settings, and recurring transaction management."
          )
        }
      />
    </SettingsSection>
  );
};

export default FinancialManagementSection;

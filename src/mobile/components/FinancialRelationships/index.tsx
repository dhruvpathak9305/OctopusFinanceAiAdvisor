import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTheme as useNavTheme } from "@react-navigation/native";
import { useTheme, darkTheme, lightTheme } from "../../../../contexts/ThemeContext";
import FinancialDashboard from "./FinancialDashboard";
import FinancialDashboardSkeleton from "./FinancialDashboardSkeleton";
import RelationshipList from "./RelationshipList";
import RelationshipDetail from "./RelationshipDetail";
import LoanSummaryTab from "./LoanSummaryTab";
// Development/testing component - not exported for production
// import SkeletonDemo from "./SkeletonDemo";

const Tab = createMaterialTopTabNavigator();

interface FinancialRelationshipsProps {
  userId: string;
}

const FinancialRelationships: React.FC<FinancialRelationshipsProps> = ({
  userId,
}) => {
  const { isDark } = useTheme();
  const navTheme = useNavTheme();
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<
    string | null
  >(null);
  const [selectedIsGroup, setSelectedIsGroup] = useState<boolean>(false);

  const handleSelectRelationship = (relationshipId: string, isGroup: boolean = false) => {
    setSelectedRelationshipId(relationshipId);
    setSelectedIsGroup(isGroup);
  };

  const handleBack = () => {
    setSelectedRelationshipId(null);
    setSelectedIsGroup(false);
  };

  const handleCreateLoan = () => {
    // In a real implementation, this would navigate to a loan creation screen
    console.log("Create loan");
  };

  const handleRequestPayment = () => {
    // In a real implementation, this would navigate to a payment request screen
    console.log("Request payment");
  };

  const handleRecordPayment = () => {
    // In a real implementation, this would navigate to a payment recording screen
    console.log("Record payment");
  };

  const handleViewLoanDetails = (loanId: string) => {
    // In a real implementation, this would navigate to a loan detail screen
    console.log("View loan details for:", loanId);
  };

  // If a relationship is selected, show the detail view
  if (selectedRelationshipId) {
    return (
      <RelationshipDetail
        relationshipId={selectedRelationshipId}
        isGroup={selectedIsGroup}
        onCreateLoan={handleCreateLoan}
        onRequestPayment={handleRequestPayment}
        onRecordPayment={handleRecordPayment}
        onBack={handleBack}
      />
    );
  }

  const currentTheme = isDark ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: isDark ? "#9CA3AF" : "#6B7280",
        tabBarStyle: {
          backgroundColor: currentTheme.card,
          borderTopWidth: isDark ? 0 : 1,
          borderTopColor: currentTheme.border,
          elevation: isDark ? 0 : 2,
          shadowColor: isDark ? "transparent" : "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#10B981",
          height: 3,
        },
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: 14,
        },
      }}
    >
      <Tab.Screen name="Dashboard">
        {() => (
          <FinancialDashboard
            userId={userId}
            onCreateLoan={handleCreateLoan}
            onRequestPayment={handleRequestPayment}
            onViewRelationships={() => {}}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Relationships">
        {() => (
          <RelationshipList
            onSelectRelationship={handleSelectRelationship}
            onAddRelationship={() => {}}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Loans">
        {() => (
          <LoanSummaryTab
            userId={userId}
            onViewLoanDetails={handleViewLoanDetails}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export {
  FinancialRelationships,
  FinancialDashboard,
  FinancialDashboardSkeleton,
  RelationshipList,
  RelationshipDetail,
  LoanSummaryTab,
};
export default FinancialRelationships;

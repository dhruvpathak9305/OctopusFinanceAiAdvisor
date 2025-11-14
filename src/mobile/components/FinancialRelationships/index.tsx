import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTheme as useNavTheme } from "@react-navigation/native";
import { useTheme, darkTheme } from "../../../../contexts/ThemeContext";
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

  // Use the dark theme but with specific adjustments to match the main dashboard
  const colors = {
    ...darkTheme,
    ...navTheme.colors,
    card: "#1F2937", // Darker card background to match the main dashboard
    primary: "#10B981", // Green primary color for buttons and accents
    success: "#10B981", // Green success color
    text: "#FFFFFF", // White text
    textSecondary: "#9CA3AF", // Gray secondary text
  };

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

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: {
          backgroundColor: "#1F2937",
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#10B981",
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

import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { FinancialRelationships } from "../components/FinancialRelationships";
import { supabase } from "../../../lib/supabase/client";

const FinancialRelationshipsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Get the current user's ID
    const getCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user:", error);
        return;
      }

      if (data.user) {
        setUserId(data.user.id);
      }
    };

    getCurrentUser();
  }, []);

  if (!userId) {
    // You could show a loading indicator here
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FinancialRelationships userId={userId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default FinancialRelationshipsScreen;

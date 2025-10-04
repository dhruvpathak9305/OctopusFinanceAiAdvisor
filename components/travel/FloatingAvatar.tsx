import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  onPress: () => void;
}

const FloatingAvatar: React.FC<Props> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.shadowWrap}>
        <LinearGradient
          colors={["#3B82F6", "#10B981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.emoji}>✈️</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "60%",
    left: 0,
    right: 0,
    alignItems: "center",
    marginTop: -45,
    zIndex: 20,
    pointerEvents: "box-none",
  },
  shadowWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
    borderRadius: 45,
  },
  gradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 40,
    textAlign: "center",
  },
});

export default FloatingAvatar;

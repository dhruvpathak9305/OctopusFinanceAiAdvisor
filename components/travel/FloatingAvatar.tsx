import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  onPress: () => void;
}

const FloatingAvatar: React.FC<Props> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.shadowWrap}>
        <Image
          source={require("../../assets/icon.png")}
          style={styles.image as any}
          resizeMode="cover"
        />
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
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#f0f0f0",
  },
});

export default FloatingAvatar;

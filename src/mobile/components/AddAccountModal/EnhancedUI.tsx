import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Vibration,
  AccessibilityInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AnimatedButtonProps {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: any;
  testID?: string;
  accessibilityLabel?: string;
  hapticFeedback?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  disabled = false,
  children,
  style,
  testID,
  accessibilityLabel,
  hapticFeedback = true,
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (hapticFeedback) {
      Vibration.vibrate(50);
    }
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message: string;
  colors: any;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  colors,
}) => {
  const fadeValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeValue]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          opacity: fadeValue,
        },
      ]}
      accessibilityLabel="Loading screen"
      accessibilityLiveRegion="polite"
    >
      <View
        style={[
          {
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
            minWidth: 200,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            {
              marginTop: 12,
              fontSize: 16,
              color: colors.text,
              textAlign: "center",
            },
          ]}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: string;
  colors: any;
  testID?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  colors,
  testID,
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const rotateValue = React.useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Rotation animation
    Animated.sequence([
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Scale animation
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    Vibration.vibrate(30);
    onPress();
  };

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }, { rotate: spin }],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: colors.primary,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          },
        ]}
        testID={testID}
        accessibilityLabel="Floating action button"
        accessibilityRole="button"
      >
        <Ionicons name={icon as any} size={24} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

interface ProgressIndicatorProps {
  step: number;
  totalSteps: number;
  colors: any;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  step,
  totalSteps,
  colors,
}) => {
  const progressValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progressValue, {
      toValue: step / totalSteps,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step, totalSteps, progressValue]);

  return (
    <View
      style={{
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        overflow: "hidden",
        marginBottom: 16,
      }}
      accessibilityLabel={`Progress: step ${step} of ${totalSteps}`}
    >
      <Animated.View
        style={[
          {
            height: "100%",
            backgroundColor: colors.primary,
            borderRadius: 2,
            width: progressValue.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
};

interface SuccessAnimationProps {
  visible: boolean;
  onComplete: () => void;
  colors: any;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  visible,
  onComplete,
  colors,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(scaleValue, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(onComplete);
        }, 1500);
      });
    }
  }, [visible, scaleValue, opacityValue, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1001,
          opacity: opacityValue,
        },
      ]}
      accessibilityLabel="Success notification"
      accessibilityLiveRegion="polite"
    >
      <Animated.View
        style={[
          {
            backgroundColor: colors.background,
            borderRadius: 50,
            width: 100,
            height: 100,
            justifyContent: "center",
            alignItems: "center",
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <Ionicons name="checkmark" size={60} color={colors.primary} />
      </Animated.View>
    </Animated.View>
  );
};

import { StyleSheet, View } from "react-native";
import React, { useCallback, useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

interface PulsatingDotWithRippleProps {
  size?: number;
  color?: string;
  duration?: number;
  pulseScale?: number;
  isDisabled?: boolean;
}

export const PulsatingDotWithRipple: React.FC<PulsatingDotWithRippleProps> = ({
  size = 6,
  color = "#F0A210",
  duration = 2200,
  pulseScale = 2.5,
  isDisabled = false,
}) => {
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);

  const animatedCircle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    };
  });

  const startRippleAnimation = useCallback(() => {
    // Cancel any existing animations first
    cancelAnimation(scaleValue);
    cancelAnimation(opacityValue);

    // Reset values
    scaleValue.value = 1;
    opacityValue.value = 1;

    // Start new animations
    scaleValue.value = withRepeat(withTiming(pulseScale, { duration }), -1);
    opacityValue.value = withRepeat(
      withTiming(0, { duration, easing: Easing.quad }),
      -1,
    );
  }, [pulseScale, duration, opacityValue, scaleValue]);

  useEffect(() => {
    if (!isDisabled) {
      startRippleAnimation();
    } else {
      cancelAnimation(scaleValue);
      cancelAnimation(opacityValue);
      scaleValue.value = 1;
      opacityValue.value = 1;
    }

    return () => {
      cancelAnimation(scaleValue);
      cancelAnimation(opacityValue);
    };
  }, [startRippleAnimation, isDisabled, scaleValue, opacityValue]);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          animatedCircle,
          styles.innerCircle,
          {
            backgroundColor: color,
            borderRadius: size / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rippleView: {
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    margin: 2,
  },
  innerCircle: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
});

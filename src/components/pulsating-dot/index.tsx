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
  const opacityValue = useSharedValue(0.6);

  const startRippleAnimation = useCallback(() => {
    cancelAnimation(scaleValue);
    cancelAnimation(opacityValue);

    scaleValue.value = 1;
    opacityValue.value = 0.6;

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
      opacityValue.value = 0;
    }

    return () => {
      cancelAnimation(scaleValue);
      cancelAnimation(opacityValue);
    };
  }, [startRippleAnimation, isDisabled, scaleValue, opacityValue]);

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  const rippleSize = size * pulseScale;

  return (
    <View
      pointerEvents="none"
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!isDisabled && (
        <Animated.View
          pointerEvents="none"
          style={[
            rippleStyle,
            {
              position: "absolute",
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
        />
      )}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

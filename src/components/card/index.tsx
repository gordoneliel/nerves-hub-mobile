import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { trigger } from "react-native-haptic-feedback";
import { radius, spacing } from "../tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { colors } from "../../theme/colors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const { colors: themeColors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!onPress) return;
    trigger("impactLight");
    scale.value = withTiming(0.98, { duration: 100 });
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (!onPress) return;
    scale.value = withTiming(1, { duration: 100 });
  }, [onPress, scale]);

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: themeColors.backgroundSecondary,
            borderColor: themeColors.border,
          },
          animatedStyle,
        ]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.backgroundSecondary,
          borderColor: themeColors.border,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    paddingTop: spacing.lg,
    paddingBottom: 18,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    borderCurve: "continuous",
    boxShadow: [
      {
        color: `${colors.gray["600"]}08`,
        offsetX: 1,
        offsetY: 4,
        blurRadius: 8,
        spreadDistance: 2,
      },
      {
        color: `${colors.gray["600"]}20`,
        offsetX: 0,
        offsetY: 0,
        blurRadius: 1,
        spreadDistance: 0,
      },
    ],
  },
});

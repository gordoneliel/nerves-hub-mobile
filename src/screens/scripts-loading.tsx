import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { spacing, radius } from "../components/tokens";
import { useTheme } from "../theme/ThemeProvider";

function Bone({
  width,
  height,
  borderRadius = 6,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const { colors, isDark } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: isDark ? colors.backgroundTertiary : "#E0E0E0",
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

function SkeletonCard() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header: script name + Run tag */}
      <View style={styles.cardHeader}>
        <Bone width={120} height={16} borderRadius={4} />
        <Bone width={50} height={22} borderRadius={11} />
      </View>

      {/* Script text preview (4 lines) */}
      <View style={{ gap: 4, marginTop: 8 }}>
        <Bone width="90%" height={12} borderRadius={3} />
        <Bone width="75%" height={12} borderRadius={3} />
        <Bone width="85%" height={12} borderRadius={3} />
        <Bone width="40%" height={12} borderRadius={3} />
      </View>

      {/* Date */}
      <Bone
        width={90}
        height={11}
        borderRadius={3}
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

export function ScriptsLoading() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      scrollEnabled={false}
    >
      {/* Org / Product label */}
      <Bone width={100} height={13} borderRadius={4} />

      {/* Cards */}
      <View style={{ marginTop: spacing.lg }}>
        <SkeletonCard />
        <View style={{ height: 3 }} />
        <SkeletonCard />
        <View style={{ height: 3 }} />
        <SkeletonCard />
        <View style={{ height: 3 }} />
        <SkeletonCard />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: radius.xxl,
    paddingTop: spacing.lg,
    paddingBottom: 18,
    paddingHorizontal: spacing.lg,
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

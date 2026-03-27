import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { spacing, radius } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";

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
      {/* Identifier row */}
      <View style={styles.identifierRow}>
        <Bone width={24} height={24} borderRadius={8} />
        <Bone width={140} height={16} borderRadius={4} />
      </View>

      {/* Detail rows */}
      <View style={styles.details}>
        <Bone width="60%" height={14} borderRadius={4} />
        <Bone width="45%" height={14} borderRadius={4} />
      </View>

      {/* Tags row */}
      <View style={styles.tagsRow}>
        <Bone width={64} height={22} borderRadius={11} />
        <Bone width={48} height={22} borderRadius={11} />
      </View>
    </View>
  );
}

export function DevicesLoading() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContent}>
          <Bone width={120} height={24} borderRadius={6} />
          <Bone
            width={160}
            height={14}
            borderRadius={4}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Search bar */}
        <View style={styles.searchWrapper}>
          <Bone width="100%" height={52} borderRadius={12} />
        </View>

        {/* Cards */}
        <SkeletonCard />
        <View style={{ height: 3 }} />
        <SkeletonCard />
        <View style={{ height: 3 }} />
        <SkeletonCard />
        <View style={{ height: 3 }} />
        <SkeletonCard />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 120,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  card: {
    borderRadius: radius.xxl,
    paddingTop: spacing.lg,
    paddingBottom: 18,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
  },
  identifierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  details: {
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: 3,
  },
});

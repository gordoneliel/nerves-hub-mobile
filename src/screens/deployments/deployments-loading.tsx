import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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
      {/* Header: name + active/inactive tag */}
      <View style={styles.headerRow}>
        <Bone width={120} height={16} borderRadius={4} />
        <Bone width={70} height={22} borderRadius={11} />
      </View>

      {/* Firmware version */}
      <View style={styles.metaRow}>
        <Bone width={55} height={11} borderRadius={3} />
        <Bone width={50} height={12} borderRadius={4} />
      </View>

      {/* Platform */}
      <View style={styles.metaRow}>
        <Bone width={55} height={11} borderRadius={3} />
        <Bone width={35} height={12} borderRadius={4} />
      </View>

      {/* Architecture */}
      <View style={styles.metaRow}>
        <Bone width={75} height={11} borderRadius={3} />
        <Bone width={30} height={12} borderRadius={4} />
      </View>

      {/* Bottom info: device count + releases */}
      <View style={styles.bottomRow}>
        <Bone width={70} height={12} borderRadius={4} />
        <Bone width={60} height={12} borderRadius={4} />
      </View>

      {/* Tags */}
      <View style={styles.tagsRow}>
        <Bone width={60} height={22} borderRadius={11} />
      </View>
    </View>
  );
}

export function DeploymentsLoading() {
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
    paddingHorizontal: spacing[18],
  },
  card: {
    borderRadius: radius.xxl,
    paddingTop: spacing.lg,
    paddingBottom: 18,
    paddingHorizontal: spacing.lg,
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  bottomRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
});

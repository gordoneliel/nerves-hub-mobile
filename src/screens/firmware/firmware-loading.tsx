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
      {/* Header: version + signed badge */}
      <View style={styles.headerRow}>
        <Bone width={80} height={16} borderRadius={4} />
        <Bone width={52} height={20} borderRadius={4} />
      </View>

      {/* Description */}
      <Bone
        width="80%"
        height={12}
        borderRadius={4}
        style={{ marginTop: 6 }}
      />

      {/* Meta grid: platform, architecture, author */}
      <View style={styles.metaGrid}>
        <View style={{ gap: 3 }}>
          <Bone width={55} height={11} borderRadius={3} />
          <Bone width={35} height={12} borderRadius={4} />
        </View>
        <View style={{ gap: 3 }}>
          <Bone width={75} height={11} borderRadius={3} />
          <Bone width={30} height={12} borderRadius={4} />
        </View>
        <View style={{ gap: 3 }}>
          <Bone width={45} height={11} borderRadius={3} />
          <Bone width={20} height={12} borderRadius={4} />
        </View>
      </View>

      {/* UUID */}
      <Bone
        width="60%"
        height={10}
        borderRadius={3}
        style={{ marginTop: 8 }}
      />

      {/* Date */}
      <Bone
        width={90}
        height={11}
        borderRadius={3}
        style={{ marginTop: 6 }}
      />
    </View>
  );
}

export function FirmwareLoading() {
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    marginTop: 6,
  },
});

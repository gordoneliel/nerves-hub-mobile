import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { radius } from "../../../components/tokens";
import { useTheme } from "../../../theme/ThemeProvider";

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

function SkeletonSection({
  labelWidth = 80,
  children,
}: {
  labelWidth?: number;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Bone
        width={labelWidth}
        height={11}
        borderRadius={3}
        style={{ marginHorizontal: 18 }}
      />
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function DeviceDetailLoading() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        scrollEnabled={false}
      >
        {/* Header: dot + identifier */}
        <View style={styles.header}>
          <Bone width={24} height={24} borderRadius={8} />
          <Bone width={200} height={30} borderRadius={6} />
        </View>

        {/* Badge row: product + platform + version */}
        <View style={styles.badgeRow}>
          <Bone width={90} height={22} borderRadius={11} />
          <Bone width={50} height={22} borderRadius={11} />
          <Bone width={60} height={22} borderRadius={11} />
        </View>

        {/* Tags row */}
        <View style={styles.tagsRow}>
          <Bone width={70} height={22} borderRadius={11} />
          <Bone width={55} height={22} borderRadius={11} />
        </View>

        {/* Action buttons row */}
        <View style={styles.actionsRow}>
          <Bone width={90} height={32} borderRadius={16} />
          <Bone width={80} height={32} borderRadius={16} />
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Updates section */}
        <SkeletonSection labelWidth={60}>
          <View style={styles.toggleRow}>
            <View style={{ gap: 4, flex: 1 }}>
              <Bone width={130} height={15} borderRadius={4} />
              <Bone width={200} height={12} borderRadius={4} />
            </View>
            <Bone width={50} height={30} borderRadius={15} />
          </View>
        </SkeletonSection>

        {/* Deployment group section */}
        <SkeletonSection labelWidth={120}>
          <Bone width={100} height={15} borderRadius={4} />
          <Bone
            width={140}
            height={12}
            borderRadius={4}
            style={{ marginTop: 6 }}
          />
          <Bone
            width={80}
            height={12}
            borderRadius={4}
            style={{ marginTop: 6 }}
          />
        </SkeletonSection>

        {/* Firmware upgrade section */}
        <SkeletonSection labelWidth={130}>
          <Bone width={120} height={15} borderRadius={4} />
          <Bone
            width={160}
            height={12}
            borderRadius={4}
            style={{ marginTop: 6 }}
          />
        </SkeletonSection>

        {/* Device info section */}
        <SkeletonSection labelWidth={80}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.infoRow}>
              <Bone width={80} height={12} borderRadius={4} />
              <Bone width={120} height={13} borderRadius={4} />
            </View>
          ))}
        </SkeletonSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 120,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 6,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 18,
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 24,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 18,
    marginBottom: 18,
  },
  section: {
    marginBottom: 12,
    gap: 6,
  },
  card: {
    borderRadius: radius.xxl,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginHorizontal: 18,
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
});

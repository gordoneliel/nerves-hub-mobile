import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

import { spacing } from "../../components/tokens";
import { useTheme, type ThemeMode } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";

const themeModes: { label: string; value: ThemeMode }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export default function AppearanceScreen() {
  const { colors, mode, setMode } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.section}>
        <Typography
          type="caption"
          fontSize={11}
          textTransform="uppercase"
          letterSpacing={1}
          paddingBottom={spacing.xs}
          color={colors.textTertiary}
        >
          Theme
        </Typography>
        <SegmentedControl
          values={themeModes.map(({ label }) => label)}
          selectedIndex={themeModes.findIndex(({ value }) => value === mode)}
          onChange={(event) => {
            const index = event.nativeEvent.selectedSegmentIndex;
            setMode(themeModes[index].value);
          }}
        />
        <Typography
          type="body"
          fontSize={13}
          color={colors.textTertiary}
          marginTop={spacing.sm}
        >
          {mode === "system"
            ? "Following your device's system appearance."
            : `Using ${mode} mode.`}
        </Typography>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.lg,
  },
});

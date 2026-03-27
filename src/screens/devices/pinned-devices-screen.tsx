import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import useThemedStyles from "../../theme/useThemedStyles";
import { ColorTheme } from "../../theme/colors";
import { Typography } from "../../components/typography";
import { EmptyView } from "../../components/ui";
import { Spacing } from "../../theme/spacing";

export default function PinnedDevicesScreen() {
  const { colors } = useTheme();
  const themedStyles = useThemedStyles(createStyles);

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.header}>
        <Typography
          type="header"
          fontSize={26}
          fontWeight="600"
          lineHeight={28}
        >
          Pinned Devices
        </Typography>
      </View>
      <EmptyView
        title="No Pinned Devices"
        message="Tap the star icon on a device to pin it here for quick access."
      />
    </View>
  );
}

const createStyles = (colors: ColorTheme, spacing: Spacing) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 140,
      paddingHorizontal: spacing[18],
      paddingBottom: spacing[12],
    },
  });

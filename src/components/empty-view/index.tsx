import React from "react";
import { StyleSheet, View } from "react-native";
import useThemedStyles from "../../theme/useThemedStyles";
import type { ColorTheme } from "../../theme/colors";
import type { Spacing } from "../../theme/spacing";
import type { BorderRadius } from "../../theme/border-radius";
import { Typography } from "../typography";

export function EmptyView({
  title = "Nothing here",
  message,
  icon,
}: {
  title?: string;
  message?: string;
  icon?: React.ReactElement;
}) {
  const themedStyles = useThemedStyles(createStyles);

  return (
    <View style={themedStyles.center}>
      {icon && <View style={themedStyles.icon}>{icon}</View>}
      <Typography
        type="subheader"
        textAlign="center"
        fontSize={20}
        fontWeight="600"
      >
        {title}
      </Typography>
      {message && (
        <Typography
          type="body"
          fontSize={12}
          marginTop={8}
          lineHeight={18}
          textAlign="center"
          color={themedStyles.message.color}
        >
          {message}
        </Typography>
      )}
    </View>
  );
}

const createStyles = (
  colors: ColorTheme,
  spacing: Spacing,
  borderRadius: BorderRadius,
) =>
  StyleSheet.create({
    center: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing[24],
      paddingVertical: spacing[36],
      borderRadius: borderRadius.xxxl,
      borderCurve: "continuous",
      backgroundColor: colors.backgroundSecondary,
    },
    icon: {
      marginBottom: spacing[6],
    },
    message: {
      color: colors.textSecondary,
    },
  });

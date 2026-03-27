import React, { forwardRef } from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

import useThemedStyles from "../../theme/useThemedStyles";
import { ColorTheme } from "../../theme/colors";

export interface TypographyProps extends TextStyle {
  children?: React.ReactNode | undefined;
  fontType?: "regular" | "mono" | "native" | "display";
  numberOfLines?: number;
  type?:
    | "default"
    | "header"
    | "subheader"
    | "body"
    | "caption"
    | "destructive";
  onPress?: () => void;
  ellipsizeMode?: "tail" | "middle" | "head" | "clip";
}

export const Typography = forwardRef<Text, TypographyProps>(
  (
    {
      children,
      fontType = "regular",
      numberOfLines,
      type = "default",
      onPress,
      ellipsizeMode,
      ...props
    },
    ref,
  ) => {
    const themedStyles = useThemedStyles(createStyles);

    function fontForType() {
      switch (fontType) {
        case "mono":
          return { fontFamily: "Monoton-Regular" };
        case "regular":
          return { fontFamily: "Plus Jakarta Sans" };
        case "native":
          return { fontFamily: "SF Pro" };
        case "display":
          return { fontFamily: "Sora" };
      }
    }

    return (
      <Text
        ref={ref}
        onPress={onPress}
        allowFontScaling={false}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        style={[fontForType(), themedStyles[type], props]}
      >
        {children}
      </Text>
    );
  },
);

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    default: { color: colors.textHeader },
    header: { color: colors.textHeader },
    subheader: { color: colors.textSubHeader },
    body: { color: colors.textBody },
    caption: { color: colors.textCaption },
    destructive: { color: colors.textDestructive },
  });

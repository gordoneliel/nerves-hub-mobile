import { StyleSheet } from "react-native";
import { colors, ColorTheme } from "../../theme/colors";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";

export const BUTTON_SIZES = {
  none: { height: 19, borderRadius: 0, fontSize: 14, paddingHorizontal: 0 },
  xxs: { height: 28, borderRadius: 14, fontSize: 12, paddingHorizontal: 12 },
  xs: { height: 32, borderRadius: 16, fontSize: 12.5, paddingHorizontal: 12 },
  sm: { height: 38, borderRadius: 19, fontSize: 13, paddingHorizontal: 12 },
  md: { height: 50, borderRadius: 25, fontSize: 14, paddingHorizontal: 18 },
  lg: { height: 56, borderRadius: 27, fontSize: 14, paddingHorizontal: 12 },
  xl: { height: 60, borderRadius: 30, fontSize: 14.4, paddingHorizontal: 24 },
} as const;

export const getButtonVariants = (theme: ColorTheme) => ({
  primary: {
    backgroundColor: theme.accent,
    textColor: colors.blue["000"],
    borderColor: "#102C4C00",
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: "rgb(242, 242, 242)",
    textColor: "#0C1202E5",
    borderColor: "white",
    borderWidth: 1,
  },
  tertiary: {
    backgroundColor: theme.backgroundSecondary,
    textColor: theme.textBody,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  link: {
    backgroundColor: "transparent",
    textColor: theme.textBody,
    borderColor: "transparent",
    borderWidth: 0,
  },
  destructive: {
    backgroundColor: colors.red[400],
    textColor: colors.red[700],
    borderColor: colors.red[200],
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    backgroundColor: theme.backgroundSecondary,
    textColor: theme.textBody,
    borderColor: theme.backgroundSecondary,
    borderWidth: 1,
  },
});

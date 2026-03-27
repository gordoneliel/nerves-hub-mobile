import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "./ThemeProvider";
import type { ColorTheme } from "./colors";
import type { Spacing } from "./spacing";
import type { BorderRadius } from "./border-radius";
/**
 * A hook that creates theme-aware styles.
 *
 * @param styleFactory A function that creates styles based on theme colors
 * @returns An object containing memoized styles that update when the theme changes
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  styleFactory: (
    colors: ColorTheme,
    spacing: Spacing,
    borderRadius: BorderRadius,
  ) => T,
): T {
  const { colors, spacing, borderRadius } = useTheme();

  // Memoize styles to prevent unnecessary recreations
  const styles = useMemo(() => {
    return StyleSheet.create(styleFactory(colors, spacing, borderRadius));
  }, [colors, spacing, borderRadius, styleFactory]);

  return styles;
}

export default useThemedStyles;

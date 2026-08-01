import React from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { Typography } from "../typography";
import { useTheme } from "../../theme/ThemeProvider";

interface SuggestionBarProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

/**
 * A horizontal, scrollable row of tappable suggestion chips. Designed to sit
 * just above a text input (e.g. the device console) as a typing aid.
 * `keyboardShouldPersistTaps="always"` keeps the keyboard up so a tap inserts
 * the suggestion without first dismissing focus.
 */
export function SuggestionBar({ suggestions, onSelect }: SuggestionBarProps) {
  const { colors } = useTheme();

  if (suggestions.length === 0) return null;

  return (
    <ScrollView
      horizontal
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.content}
    >
      {suggestions.map((suggestion) => (
        <Pressable
          key={suggestion}
          onPress={() => onSelect(suggestion)}
          style={({ pressed }) => [
            styles.chip,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Typography
            type="body"
            fontType="mono"
            fontSize={11}
            lineHeight={13}
            color={colors.textPrimary}
          >
            {suggestion}
          </Typography>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // flexGrow: 0 so the horizontal ScrollView only takes its content height.
  bar: { flexGrow: 0 },
  content: {
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 3,
    alignItems: "center",
  },
  chip: {
    height: 26,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: "continuous",
  },
});

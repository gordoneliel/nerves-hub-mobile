import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { trigger } from "react-native-haptic-feedback";
import ContextMenu, { ContextMenuAction } from "react-native-context-menu-view";
import { LiquidGlassView } from "@callstack/liquid-glass";

import { LoadingIndicator } from "../loading-indicator";
import { Typography } from "../typography";
import { useTheme } from "../../theme/ThemeProvider";

export type DropDownItem<T> = {
  id: string;
  label: string;
  value?: T;
  iconLeft?: React.ReactElement | null | undefined;
  iconRight?: React.ReactElement | null | undefined;
};

export type DropDownSection<T> = {
  title: string;
  items: DropDownItem<T>[];
};

interface DropdownProps<T> {
  items?: DropDownItem<T>[];
  sections?: DropDownSection<T>[];
  defaultSelectedItemId?: string | null;
  isLoading?: boolean;
  disabled?: boolean;
  onSelect?: (item: DropDownItem<T>) => void;
  isDefaultOpen?: boolean;
  placeholderLabel?: string;
  pill?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  expandedPosition?: "left" | "center" | "right";
  hasBorder?: boolean;
  hasShadow?: boolean;
  backgroundColor?: string | null;
  fullWidth?: boolean;
  fullItemsWidth?: boolean;
  showSectionItemCount?: boolean;
}

export function Dropdown<T>({
  items,
  sections,
  defaultSelectedItemId,
  onSelect,
  isLoading = false,
  disabled = false,
  pill = false,
  placeholderLabel,
  size = "md",
  hasBorder = true,
  hasShadow = true,
  backgroundColor = null,
  fullWidth = true,
}: DropdownProps<T>) {
  const theme = useTheme();
  const { colors: themeColors } = theme;
  const resolvedBg = backgroundColor ?? themeColors.backgroundSecondary;
  const resolvedBorder = themeColors.inputBorder;

  // Get all items from either items prop or sections prop
  const allItems = useMemo(() => {
    if (sections) {
      return sections.flatMap((section) => section.items);
    }
    return items || [];
  }, [items, sections]);

  const defaultSelectedItem = allItems.find(
    (item) => item.id === defaultSelectedItemId,
  );
  const [selectedItem, setSelectedItem] = useState<DropDownItem<T> | null>(
    defaultSelectedItem || null,
  );

  // Build context menu actions from items/sections
  const { actions, flatItems } = useMemo(() => {
    if (sections) {
      const flat: DropDownItem<T>[] = [];
      const menuActions: ContextMenuAction[] = sections
        .filter((section) => section.items.length > 0)
        .map((section) => {
          const children: ContextMenuAction[] = section.items.map((item) => {
            flat.push(item);
            return {
              title: item.label,
              selected: item.id === selectedItem?.id,
            };
          });
          return {
            title: section.title,
            inlineChildren: true,
            actions: children,
          };
        });
      return { actions: menuActions, flatItems: flat };
    }

    const flat = allItems;
    const menuActions: ContextMenuAction[] = allItems.map((item) => ({
      title: item.label,
      selected: item.id === selectedItem?.id,
    }));
    return { actions: menuActions, flatItems: flat };
  }, [allItems, sections, selectedItem?.id]);

  const handlePress = useCallback(
    (e: any) => {
      const { index } = e.nativeEvent;
      const item = flatItems[index];
      if (item) {
        trigger("selection", {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        });
        setSelectedItem(item);
        onSelect?.(item);
      }
    },
    [flatItems, onSelect],
  );

  return (
    <ContextMenu
      actions={actions}
      onPress={handlePress}
      dropdownMenuMode
      disabled={disabled}
    >
      <LiquidGlassView
        interactive
        effect="regular"
        colorScheme={theme.mode}
        style={[
          styles.container,
          disabled && styles.disabled,
          hasBorder && [styles.bordered, { borderColor: resolvedBorder }],
          hasShadow && styles.shadow,
          { backgroundColor: resolvedBg },
          size === "xs" && { height: 36, borderRadius: 10 },
          size === "sm" && { height: 40, borderRadius: 14 },
          size === "md" && { height: 52, borderRadius: 18 },
          size === "lg" && { height: 60 },
          pill && styles.pill,
          fullWidth && { flex: 1 },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.iconLeftWithLabel}>
            {selectedItem?.iconLeft}
            <Typography
              fontWeight={500}
              fontSize={size === "xs" ? 14 : 14}
              lineHeight={0}
              numberOfLines={1}
              ellipsizeMode="tail"
              type="header"
              fontType="native"
            >
              {selectedItem ? selectedItem?.label : placeholderLabel}
            </Typography>
          </View>
          {isLoading ? (
            <LoadingIndicator size={14} />
          ) : (
            <Text style={[styles.arrow, { color: themeColors.textCaption }]}>
              ▼
            </Text>
          )}
        </View>
      </LiquidGlassView>
    </ContextMenu>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    justifyContent: "center",
  },
  shadow: {
    shadowOffset: { width: 0.5, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  bordered: {
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
  },
  disabled: {
    opacity: 0.5,
  },
  pill: { borderRadius: 26 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  iconLeftWithLabel: {
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
    minWidth: 0,
  },
  arrow: {
    fontSize: 10,
    marginLeft: 10,
  },
});

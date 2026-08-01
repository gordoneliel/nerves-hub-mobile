import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  /** Prefix label shown before the selected value, e.g. "Status" → "Status: Online" */
  label?: string;
  /** Icon always shown before the label */
  icon?: React.ReactElement;
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
  label,
  icon,
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

  // Sync internal selection when the controlling prop changes (e.g. parent
  // resets the form or programmatically changes the selected id). We track
  // the previous prop with a ref so uncontrolled consumers, whose
  // `defaultSelectedItemId` never changes, keep their locally chosen item.
  // Also bail out when the currently selected item's id already matches —
  // otherwise duplicate-id sections (e.g. an SSID appearing in both a stored
  // and a templates section) would snap the visual selection to the first
  // match instead of the one the user actually picked.
  const prevDefaultIdRef = useRef(defaultSelectedItemId);
  useEffect(() => {
    if (prevDefaultIdRef.current === defaultSelectedItemId) return;
    prevDefaultIdRef.current = defaultSelectedItemId;
    if (selectedItem?.id === defaultSelectedItemId) return;
    setSelectedItem(
      allItems.find((item) => item.id === defaultSelectedItemId) ?? null,
    );
  }, [defaultSelectedItemId, allItems, selectedItem?.id]);

  // Build context menu actions from items/sections.
  // `visibleSections` matches the order passed to ContextMenu (empty sections
  // are dropped), which is how `indexPath[0]` from the native event maps back
  // to the right section.
  const { actions, visibleSections } = useMemo(() => {
    if (sections) {
      const visible = sections.filter((section) => section.items.length > 0);
      const menuActions: ContextMenuAction[] = visible.map((section) => ({
        title: section.title,
        inlineChildren: true,
        actions: section.items.map((item) => ({
          title: item.label,
          selected: item.id === selectedItem?.id,
        })),
      }));
      return { actions: menuActions, visibleSections: visible };
    }

    const menuActions: ContextMenuAction[] = allItems.map((item) => ({
      title: item.label,
      selected: item.id === selectedItem?.id,
    }));
    return { actions: menuActions, visibleSections: null };
  }, [allItems, sections, selectedItem?.id]);

  const handlePress = useCallback(
    (e: any) => {
      const { index, indexPath } = e.nativeEvent;
      // The native event sends a section-local `index` plus an `indexPath`
      // of [sectionIdx, itemIdx]. With sections we MUST use indexPath,
      // otherwise we'd look up the wrong item (e.g. tapping the first
      // scanned network would resolve to the first stored network).
      let item: DropDownItem<T> | undefined;
      if (
        visibleSections &&
        Array.isArray(indexPath) &&
        indexPath.length >= 2
      ) {
        item = visibleSections[indexPath[0]]?.items[indexPath[1]];
      } else {
        item = allItems[index];
      }
      if (item) {
        trigger("selection", {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        });
        setSelectedItem(item);
        onSelect?.(item);
      }
    },
    [visibleSections, allItems, onSelect],
  );

  // Compute height + radius once so the ContextMenu's lift mask matches the
  // chip's actual rounded shape (otherwise iOS lifts a rectangular mask and
  // the rounded corners reveal the preview background behind it).
  const height =
    size === "xs" ? 36 : size === "sm" ? 40 : size === "md" ? 52 : 60;
  const borderRadius = pill
    ? 26
    : size === "xs"
      ? 10
      : size === "sm"
        ? 14
        : size === "md"
          ? 18
          : 14;

  return (
    <ContextMenu
      actions={actions}
      onPress={handlePress}
      dropdownMenuMode
      disabled={disabled}
      // Suppress system preview chrome that fights the chip's own design:
      // transparent background kills the white rectangle flashing behind the
      // lift; disableShadow stops the system drop shadow from stacking on
      // top of styles.shadow; borderRadius rounds the lift mask to match.
      previewBackgroundColor="transparent"
      disableShadow
      borderRadius={borderRadius}
    >
      <LiquidGlassView
        // `interactive` removed — it competes with ContextMenu's long-press
        // gesture and contributed to the brief double-lift at press start.
        effect="regular"
        colorScheme={theme.mode}
        style={[
          styles.container,
          disabled && styles.disabled,
          hasBorder && [styles.bordered, { borderColor: resolvedBorder }],
          hasShadow && styles.shadow,
          { backgroundColor: resolvedBg, height, borderRadius },
          fullWidth && styles.flex1,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.iconLeftWithLabel}>
            {icon}
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
              {selectedItem && label ? `${label}: ` : null}
              {selectedItem && label ? (
                <Typography
                  fontWeight={600}
                  fontSize={size === "xs" ? 14 : 14}
                  lineHeight={0}
                  type="header"
                  fontType="native"
                >
                  {selectedItem.label}
                </Typography>
              ) : (
                (selectedItem?.label ?? placeholderLabel)
              )}
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
  flex1: { flex: 1 },
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

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../components/button";
import { Card } from "../../components/card";
import {
  Dropdown,
  type DropDownItem,
} from "../../components/dropdown";
import { TextInput } from "../../components/text-input";
import { spacing } from "../../components/tokens";
import { Typography } from "../../components/typography";
import { useFirmware, type DeviceFilters } from "../../hooks/useApi";
import { useTheme } from "../../theme/ThemeProvider";
import { useDeviceListControls } from "./device-list-controls";

const ALL_ITEM: DropDownItem<string> = {
  id: "all",
  label: "All",
};

const CONNECTION_ITEMS: DropDownItem<string>[] = [
  ALL_ITEM,
  { id: "connected", label: "Connected", value: "connected" },
  { id: "disconnected", label: "Disconnected", value: "disconnected" },
  { id: "not_seen", label: "Never Seen", value: "not_seen" },
];

const UPDATE_ITEMS: DropDownItem<string>[] = [
  ALL_ITEM,
  { id: "enabled", label: "Enabled", value: "enabled" },
  { id: "disabled", label: "Disabled", value: "disabled" },
  { id: "penalty-box", label: "Penalty Box", value: "penalty-box" },
];

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Typography type="caption" fontSize={12} color={colors.textSecondary}>
        {label}
      </Typography>
      {children}
    </View>
  );
}

export default function DeviceFiltersScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { filters, applyFilters } = useDeviceListControls();
  const [draft, setDraft] = useState<DeviceFilters>(filters);
  const firmwareQuery = useFirmware();

  const { firmwareItems, platformItems } = useMemo(() => {
    const firmwares = firmwareQuery.data?.data ?? [];
    const versions = [
      ...new Set(firmwares.map((fw) => fw.version).filter(Boolean)),
    ].sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { numeric: true }),
    );
    const platforms = [
      ...new Set(firmwares.map((fw) => fw.platform).filter(Boolean)),
    ].sort((a, b) => String(a).localeCompare(String(b)));

    return {
      firmwareItems: [
        ALL_ITEM,
        ...versions.map((version) => ({
          id: String(version),
          label: String(version),
          value: String(version),
        })),
      ],
      platformItems: [
        ALL_ITEM,
        ...platforms.map((platform) => ({
          id: String(platform),
          label: String(platform),
          value: String(platform),
        })),
      ],
    };
  }, [firmwareQuery.data]);

  const select = <K extends keyof DeviceFilters>(key: K) =>
    (item: DropDownItem<string>) =>
      setDraft((current) => ({
        ...current,
        [key]: item.value || undefined,
      }));

  const resetDraft = () => setDraft({});
  const apply = () => {
    applyFilters(draft);
    navigation.goBack();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <Typography
        type="body"
        fontSize={13}
        color={colors.textSecondary}
        paddingBottom={spacing.md}
      >
        Filters are applied across the complete device fleet, not only the
        devices currently loaded on screen.
      </Typography>

      <Card style={styles.card}>
        <FilterField label="Connection">
          <Dropdown
            items={CONNECTION_ITEMS}
            defaultSelectedItemId={draft.connection ?? "all"}
            placeholderLabel="All"
            onSelect={select("connection")}
            size="sm"
          />
        </FilterField>

        <FilterField label="Firmware Updates">
          <Dropdown
            items={UPDATE_ITEMS}
            defaultSelectedItemId={draft.updates ?? "all"}
            placeholderLabel="All"
            onSelect={select("updates")}
            size="sm"
          />
        </FilterField>

        <FilterField label="Firmware Version">
          <Dropdown
            items={firmwareItems}
            defaultSelectedItemId={draft.firmware_version ?? "all"}
            placeholderLabel="All"
            onSelect={select("firmware_version")}
            isLoading={firmwareQuery.isLoading}
            size="sm"
          />
        </FilterField>

        <FilterField label="Platform">
          <Dropdown
            items={platformItems}
            defaultSelectedItemId={draft.platform ?? "all"}
            placeholderLabel="All"
            onSelect={select("platform")}
            isLoading={firmwareQuery.isLoading}
            size="sm"
          />
        </FilterField>

        <FilterField label="Tags">
          <TextInput
            value={draft.tags ?? ""}
            placeholder="production, west-coast"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            disabled={draft.has_no_tags === "true"}
            onChangeText={(tags) =>
              setDraft((current) => ({
                ...current,
                tags: tags || undefined,
                has_no_tags: tags ? undefined : current.has_no_tags,
              }))
            }
          />
        </FilterField>

        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Typography type="subheader" fontSize={15} fontWeight="600">
              Untagged devices only
            </Typography>
            <Typography type="body" fontSize={12} color={colors.textSecondary}>
              Excludes devices that have one or more tags.
            </Typography>
          </View>
          <Switch
            value={draft.has_no_tags === "true"}
            onValueChange={(enabled) =>
              setDraft((current) => ({
                ...current,
                has_no_tags: enabled ? "true" : undefined,
                tags: enabled ? undefined : current.tags,
              }))
            }
          />
        </View>
      </Card>

      <View style={styles.actions}>
        <Button label="Apply Filters" fullWidth onPress={apply} />
        <Button
          label="Reset"
          type="tertiary"
          fullWidth
          onPress={resetDraft}
          disabled={Object.keys(draft).length === 0}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: { gap: spacing.lg },
  field: { gap: spacing.xs },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  switchCopy: { flex: 1, gap: 2 },
  actions: { gap: spacing.sm, paddingTop: spacing.lg },
});

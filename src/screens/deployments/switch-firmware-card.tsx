import React, { useCallback, useMemo } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card } from "../../components/ui";
import { Button } from "../../components/button";
import { Dropdown, type DropDownItem } from "../../components/dropdown";
import { useFirmware } from "../../hooks/useApi";
import type { Firmware } from "../../api/generated/schemas";

import BoltIcon from "../../../assets/icons/bolt.svg";

interface SwitchFirmwareCardProps {
  deploymentName: string;
}

export function SwitchFirmwareCard({
  deploymentName,
}: SwitchFirmwareCardProps) {
  const { colors } = useTheme();
  const firmwareQuery = useFirmware();

  const firmwareItems = useMemo<DropDownItem<string>[]>(() => {
    const fws = firmwareQuery.data?.data ?? [];
    return fws.map((fw: Firmware) => ({
      id: fw.uuid ?? String(fw.version),
      label:
        `v${fw.version ?? "?"} — ${fw.platform ?? ""} ${fw.architecture ?? ""}`.trim(),
      value: fw.uuid!,
    }));
  }, [firmwareQuery.data]);

  const handleSwitch = useCallback(() => {
    Alert.alert(
      "Coming Soon",
      "Switching deployment firmware from the mobile app is not yet supported.",
    );
  }, []);

  if (firmwareItems.length === 0) return null;

  return (
    <View style={styles.section}>
      <Typography
        type="caption"
        fontSize={11}
        textTransform="uppercase"
        letterSpacing={1}
        paddingBottom={spacing.xs}
        paddingHorizontal={spacing.lg}
        color={colors.textTertiary}
      >
        Switch Firmware
      </Typography>
      <Card>
        <View style={styles.row}>
          <Dropdown
            items={firmwareItems}
            isLoading={firmwareQuery.isLoading}
            placeholderLabel="Select firmware..."
            size="sm"
            fullWidth
            onSelect={() => {}}
          />
          <Button
            label="Switch"
            size="sm"
            type="primary"
            onPress={handleSwitch}
            iconLeft={<BoltIcon width={14} height={14} color="#fff" />}
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
});

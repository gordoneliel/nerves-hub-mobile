import React from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../../components/tokens";
import { timeAgo } from "../../../utils/timeAgo";
import { useTheme } from "../../../theme/ThemeProvider";
import { Typography } from "../../../components/typography";
import { Card } from "../../../components/ui";
import type { Device } from "../../../api/generated/schemas";

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  const { colors } = useTheme();
  if (!value) return null;
  return (
    <View style={styles.metaRow}>
      <Typography type="caption" fontSize={12} color={colors.textTertiary}>
        {label}
      </Typography>
      <Typography
        type="body"
        fontType="mono"
        fontSize={13}
        fontWeight="500"
        flexShrink={1}
        textAlign="right"
        color={colors.textPrimary}
      >
        {value}
      </Typography>
    </View>
  );
}

interface DeviceInfoCardProps {
  device: Device;
}

export function DeviceInfoCard({ device }: DeviceInfoCardProps) {
  const { colors } = useTheme();

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
        Info
      </Typography>
      <Card>
        <MetaRow label="Organization" value={device.org_name} />
        <MetaRow label="Product" value={device.product_name} />
        <MetaRow label="Version" value={device.version} />
        <MetaRow
          label="Platform"
          value={device.firmware_metadata?.platform}
        />
        <MetaRow
          label="Architecture"
          value={device.firmware_metadata?.architecture}
        />
        <MetaRow
          label="Latest connection"
          value={
            device.last_communication
              ? `${new Date(device.last_communication).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} (${timeAgo(device.last_communication)})`
              : null
          }
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
});

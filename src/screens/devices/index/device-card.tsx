import React, { memo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import ContextMenu from "react-native-context-menu-view";

import { spacing } from "../../../components/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { Typography } from "../../../components/typography";
import { Tag } from "../../../components/tag";
import { Card } from "../../../components/card";
import { PulsatingDotWithRipple } from "../../../components/pulsating-dot";
import { Button } from "../../../components/button";
import type { Device } from "../../../api/generated/schemas";

import EllipsisIcon from "../../../../assets/icons/ellipsis.svg";
import HashIcon from "../../../../assets/icons/hashtag.svg";
import CheckShieldIcon from "../../../../assets/icons/check-shield.svg";
import TargetIcon from "../../../../assets/icons/cog.svg";
import PlatformIcon from "../../../../assets/icons/platform.svg";

export type DeviceMenuAction = "reboot" | "reconnect" | "identify" | "tags";

export type DeviceCardProps = {
  device: Device;
  onPress?: (device: Device) => void;
  onEllipsisPress?: (device: Device) => void;
  onMenuAction?: (device: Device, action: DeviceMenuAction) => void;
};

const MENU_ACTIONS: {
  title: string;
  systemIcon: string;
  key: DeviceMenuAction;
}[] = [
  { title: "Reboot", systemIcon: "arrow.clockwise", key: "reboot" },
  { title: "Reconnect", systemIcon: "wifi", key: "reconnect" },
  { title: "Identify", systemIcon: "scope", key: "identify" },
  { title: "Edit Tags", systemIcon: "tag", key: "tags" },
];

export const DeviceCard = memo(DeviceCardRaw, (prev, next) => {
  return (
    prev.device.identifier === next.device.identifier &&
    prev.device.online === next.device.online &&
    prev.device.connection_status === next.device.connection_status &&
    prev.device.version === next.device.version &&
    prev.device.description === next.device.description &&
    prev.device.tags === next.device.tags &&
    prev.device.deployment_group?.name === next.device.deployment_group?.name &&
    prev.device.deployment_group?.platform ===
      next.device.deployment_group?.platform &&
    prev.onPress === next.onPress &&
    prev.onMenuAction === next.onMenuAction
  );
});

function DeviceCardRaw({ device, onPress, onMenuAction }: DeviceCardProps) {
  const { colors: themeColors } = useTheme();

  const handlePress = useCallback(() => {
    onPress?.(device);
  }, [onPress, device]);

  const handleMenuAction = useCallback(
    (e: { nativeEvent: { index: number } }) => {
      const action = MENU_ACTIONS[e.nativeEvent.index];
      if (action) onMenuAction?.(device, action.key);
    },
    [onMenuAction, device],
  );

  const tags = Array.isArray(device.tags)
    ? device.tags
    : typeof device.tags === "string"
      ? device.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

  return (
    <Card onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.identifierRow}>
          <View
            style={[
              styles.identifierIcon,
              { backgroundColor: themeColors.backgroundTertiary },
            ]}
          >
            <HashIcon
              width={14}
              height={14}
              color={themeColors.textSecondary}
            />
          </View>
          <Typography
            type="header"
            fontSize={14}
            fontWeight="600"
            lineHeight={24}
            color={themeColors.textPrimary}
          >
            {String(device.identifier)}
          </Typography>
        </View>

        <ContextMenu
          title={`${device.identifier}`}
          actions={MENU_ACTIONS.map(({ title, systemIcon }) => ({
            title,
            systemIcon,
          }))}
          onPress={handleMenuAction}
          dropdownMenuMode
        >
          <Button
            type="icon"
            size="xs"
            iconLeft={
              <EllipsisIcon
                width={18}
                height={18}
                color={themeColors.textTertiary}
              />
            }
          />
        </ContextMenu>
      </View>

      <View style={styles.details}>
        {device.version && (
          <DetailRow
            label="Version"
            value={device.version}
            icon={
              <CheckShieldIcon
                width={16}
                height={16}
                color={themeColors.textTertiary}
              />
            }
          />
        )}
        {device.deployment_group?.name && (
          <DetailRow
            label="Deployment"
            value={device.deployment_group.name}
            icon={
              <TargetIcon
                width={16}
                height={16}
                color={themeColors.textTertiary}
              />
            }
          />
        )}
        {device.firmware_metadata?.platform && (
          <DetailRow
            label="Platform"
            value={device.firmware_metadata.platform}
            icon={
              <PlatformIcon
                width={16}
                height={16}
                color={themeColors.textTertiary}
              />
            }
          />
        )}
      </View>

      <View style={styles.tagsRow}>
        <Tag
          label={
            device.connection_status === "connected" ? "Online" : "Offline"
          }
          size="sm"
          colorScheme="white"
          hasShadow
          hasBorder
          iconLeft={{
            component: PulsatingDotWithRipple,
            props: {
              isDisabled: device.connection_status !== "connected",
              size: 7,
              color:
                device.connection_status === "connected"
                  ? "#9ACD32"
                  : "#E0E3E6",
            },
          }}
        />

        {tags.map((tag) => (
          <Tag key={tag} label={tag} colorScheme="white" size="sm" hasBorder />
        ))}
      </View>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  const { colors: themeColors } = useTheme();
  return (
    <View style={styles.detailItem}>
      {icon}
      <View style={styles.detailText}>
        {/*<Typography fontSize={12} fontWeight={500} color={themeColors.textSecondary}>
          {label}
        </Typography>*/}
        <Typography
          fontSize={13}
          fontWeight={500}
          color={themeColors.textSecondary}
          lineHeight={18}
        >
          {value}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  identifierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  identifierIcon: {
    padding: 5,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  details: {
    flexDirection: "column",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    gap: 4,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: 3,
  },
});

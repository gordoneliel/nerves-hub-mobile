import React, { memo, useCallback } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import ContextMenu from "react-native-context-menu-view";

import useThemedStyles from "../../../theme/useThemedStyles";
import type { ColorTheme } from "../../../theme/colors";
import type { Spacing } from "../../../theme/spacing";
import { Typography } from "../../../components/typography";
import { Tag } from "../../../components/tag";
import { Card } from "../../../components/card";
import { PulsatingDotWithRipple } from "../../../components/pulsating-dot";
import { Button } from "../../../components/button";
import type { Device } from "../../../api/generated/schemas";

import EllipsisIcon from "../../../../assets/icons/ellipsis.svg";
import CheckShieldIcon from "../../../../assets/icons/check-shield.svg";
import TargetIcon from "../../../../assets/icons/cog.svg";
import PlatformIcon from "../../../../assets/icons/platform.svg";

export type DeviceMenuAction =
  | "reboot"
  | "reconnect"
  | "identify"
  | "tags"
  | "delete";

export type DeviceCardProps = {
  device: Device;
  style?: StyleProp<ViewStyle>;
  onPress?: (device: Device) => void;
  onEllipsisPress?: (device: Device) => void;
  onMenuAction?: (device: Device, action: DeviceMenuAction) => void;
};

export const MENU_ACTIONS: {
  title: string;
  systemIcon: string;
  key: DeviceMenuAction;
  destructive?: boolean;
}[] = [
  { title: "Reboot", systemIcon: "arrow.clockwise", key: "reboot" },
  { title: "Reconnect", systemIcon: "wifi", key: "reconnect" },
  { title: "Identify", systemIcon: "scope", key: "identify" },
  { title: "Edit Tags", systemIcon: "tag", key: "tags" },
  { title: "Delete", systemIcon: "trash", key: "delete", destructive: true },
] as const;

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
    prev.onMenuAction === next.onMenuAction &&
    prev.style === next.style
  );
});

function DeviceCardRaw({
  device,
  style,
  onPress,
  onMenuAction,
}: DeviceCardProps) {
  const themedStyles = useThemedStyles(createStyles);

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
    <Card onPress={handlePress} style={style}>
      <View style={themedStyles.header}>
        <View style={themedStyles.identifierRow}>
          <View style={themedStyles.identifierIcon}>
            <PulsatingDotWithRipple
              isDisabled={device.connection_status !== "connected"}
              color={
                device.connection_status === "connected" ? "#9ACD32" : "#E0E3E6"
              }
              size={6}
            />
          </View>
          <Typography
            type="header"
            fontSize={14}
            fontWeight="600"
            lineHeight={24}
            color={themedStyles.textPrimary.color}
          >
            {String(device.identifier)}
          </Typography>
        </View>

        <ContextMenu
          title={`${device.identifier}`}
          actions={MENU_ACTIONS.map(({ title, systemIcon, destructive }) => ({
            title,
            systemIcon,
            destructive,
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
                color={themedStyles.textTertiary.color}
              />
            }
          />
        </ContextMenu>
      </View>

      <View style={themedStyles.details}>
        {device.version && (
          <DetailRow
            label="Version"
            value={device.version}
            icon={
              <CheckShieldIcon
                width={16}
                height={16}
                color={themedStyles.textTertiary.color}
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
                color={themedStyles.textTertiary.color}
              />
            }
          />
        )}
      </View>

      <View style={themedStyles.tagsRow}>
        <Tag
          label={device.product_name ?? ""}
          size="sm"
          colorScheme="white"
          hasBorder
          hasShadow
          iconLeft={{
            component: PlatformIcon,
            props: {
              width: 14,
              height: 14,
              color: themedStyles.textSecondary.color,
            },
          }}
        />

        {device.deployment_group?.name && (
          <Tag
            label={device.deployment_group.name}
            size="sm"
            colorScheme="white"
            hasBorder
            hasShadow
            iconLeft={{
              component: TargetIcon,
              props: {
                width: 14,
                height: 14,
                color: themedStyles.textSecondary.color,
              },
            }}
          />
        )}

        {(Array.isArray(device.tags)
          ? device.tags
          : typeof device.tags === "string"
            ? device.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : []
        ).map((tag) => (
          <Tag
            key={tag}
            label={`# ${tag}`}
            colorScheme="white"
            hasBorder
            size="sm"
          />
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
  const themedStyles = useThemedStyles(createDetailStyles);
  return (
    <View style={themedStyles.detailItem}>
      {icon}
      <View style={themedStyles.detailText}>
        <Typography
          fontSize={13}
          fontWeight={500}
          color={themedStyles.textSecondary.color}
          lineHeight={18}
        >
          {value}
        </Typography>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorTheme, spacing: Spacing) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    identifierRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[4],
      marginBottom: spacing[6],
    },
    identifierIcon: {
      padding: 5,
      borderRadius: 8,
      borderCurve: "continuous",
      borderWidth: 0.2,
      borderColor: colors.borderLight,
      backgroundColor: colors.backgroundSecondary,
      overflow: "visible",
    },
    details: {
      flexDirection: "column",
      flexWrap: "wrap",
      gap: spacing[4],
      marginTop: spacing[4],
      marginBottom: spacing[6],
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[4],
      marginTop: 3,
    },
    textPrimary: {
      color: colors.textPrimary,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textTertiary: {
      color: colors.textTertiary,
    },
  });

const createDetailStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    detailText: {
      gap: 4,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
  });

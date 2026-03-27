import React from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import type { StaticScreenProps } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card, ErrorView, LoadingView } from "../../components/ui";
import { Tag } from "../../components/tag";
import { Button } from "../../components/button";
import { PulsatingDotWithRipple } from "../../components/pulsating-dot";
import { useDevice } from "../../hooks/useApi";
import {
  useRebootDevice,
  useReconnectDevice,
} from "../../api/generated/devices/devices";
import { customInstance } from "../../api/mutator/custom-instance";
import { useOrgProduct } from "../../context/OrgProductContext";
import { Divider } from "../../components/divider";
import { DeploymentGroupCard } from "./deployment-group-card";

import PowerIcon from "../../../assets/icons/power.svg";
import WifiIcon from "../../../assets/icons/wifi-light.svg";
import TargetIcon from "../../../assets/icons/target.svg";
import ConsoleIcon from "../../../assets/icons/console.svg";
type Props = StaticScreenProps<{ identifier: string; deviceId: number }>;

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

export default function DeviceDetailScreen({ route }: Props) {
  const { identifier, deviceId } = route.params;
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { orgId, productId } = useOrgProduct();
  const { data, isLoading, isError, refetch } = useDevice(identifier);
  const device = data?.data;

  const reboot = useRebootDevice();
  const reconnect = useReconnectDevice();

  const confirmAction = (label: string, onConfirm: () => void) => {
    Alert.alert(
      label,
      `Are you sure you want to ${label.toLowerCase()} this device?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: label, style: "destructive", onPress: onConfirm },
      ],
    );
  };

  const handleReboot = () =>
    confirmAction("Reboot", () =>
      reboot.mutate(
        { orgName: orgId!, productName: productId!, identifier },
        {
          onSuccess: () => Alert.alert("Success", "Reboot command sent."),
          onError: () => Alert.alert("Error", "Failed to reboot device."),
        },
      ),
    );

  const handleReconnect = () =>
    confirmAction("Reconnect", () =>
      reconnect.mutate(
        { orgName: orgId!, productName: productId!, identifier },
        {
          onSuccess: () => Alert.alert("Success", "Reconnect command sent."),
          onError: () => Alert.alert("Error", "Failed to reconnect device."),
        },
      ),
    );

  const handleNavigateToConsole = () =>
    navigation.navigate("DeviceConsole", { id: deviceId });

  const handleIdentify = () =>
    confirmAction("Identify", () =>
      customInstance({
        url: `/orgs/${orgId}/products/${productId}/devices/${identifier}/identify`,
        method: "POST",
      })
        .then(() => Alert.alert("Success", "Identify command sent."))
        .catch(() => Alert.alert("Error", "Failed to identify device.")),
    );

  if (isLoading) return <LoadingView message="Loading device…" />;
  if (isError || !device)
    return (
      <ErrorView message="Failed to load device" onRetry={() => refetch()} />
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Tag
            label={
              device.connection_status === "connected" ? "Online" : "Offline"
            }
            colorScheme="white"
            hasBorder
            hasShadow
            size="sm"
            iconLeft={{
              component: PulsatingDotWithRipple,
              props: {
                size: 6,
                color:
                  device.connection_status === "connected"
                    ? "#9ACD32"
                    : "#E0E3E6",
              },
            }}
          />
          <Typography
            type="header"
            fontSize={26}
            fontWeight="600"
            lineHeight={28}
          >
            {String(device.identifier)}
          </Typography>
        </View>

        <View style={styles.badgeRow}>
          {device.version && (
            <Tag
              label={`v${device.version}`}
              size="sm"
              colorScheme="white"
              hasBorder
            />
          )}

          {device.firmware_metadata?.platform && (
            <Tag
              label={`Platform ${device.firmware_metadata.platform}`}
              size="sm"
              colorScheme="white"
              hasBorder
            />
          )}

          {device.firmware_metadata?.product && (
            <Tag
              label={`Product ${device.firmware_metadata.product}`}
              size="sm"
              colorScheme="white"
              hasBorder
            />
          )}

          {device.firmware_metadata?.architecture && (
            <Tag
              label={`Architecture ${device.firmware_metadata.architecture}`}
              size="sm"
              colorScheme="white"
              hasBorder
            />
          )}

          {device.updates_enabled === false && (
            <Tag
              label="Updates disabled"
              size="sm"
              colorScheme="white"
              hasBorder
            />
          )}
        </View>

        <ScrollView
          style={styles.actionsRow}
          alwaysBounceVertical={false}
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={styles.actionButton}
        >
          <Button
            label="Console"
            type="tertiary"
            size="sm"
            onPress={handleNavigateToConsole}
            style={styles.actionButton}
            iconLeft={
              <ConsoleIcon
                width={17}
                height={17}
                color={colors.textSecondary}
              />
            }
          />

          <Button
            label={reboot.isPending ? "Rebooting…" : "Reboot"}
            type="tertiary"
            size="sm"
            onPress={handleReboot}
            disabled={reboot.isPending}
            isLoading={reboot.isPending}
            style={styles.actionButton}
            iconLeft={
              <PowerIcon width={18} height={18} color={colors.textSecondary} />
            }
          />
          <Button
            label={reconnect.isPending ? "Reconnecting…" : "Reconnect"}
            type="tertiary"
            size="sm"
            onPress={handleReconnect}
            disabled={reconnect.isPending}
            isLoading={reconnect.isPending}
            style={styles.actionButton}
            iconLeft={
              <WifiIcon width={16} height={16} color={colors.textSecondary} />
            }
          />
          <Button
            label="Identify"
            type="tertiary"
            size="sm"
            onPress={handleIdentify}
            style={styles.actionButton}
            iconLeft={
              <TargetIcon width={17} height={17} color={colors.textSecondary} />
            }
          />
        </ScrollView>
        <Divider
          horizontalMargin={spacing.lg}
          verticalMargin={{ top: 0, bottom: spacing.lg }}
        />

        <DeploymentGroupCard
          currentDeploymentGroupId={device.deployment_group?.name}
          deviceIdentifier={identifier}
        />

        {device.updates_blocked_until && (
          <View style={styles.section}>
            <Typography
              type="caption"
              fontSize={11}
              textTransform="uppercase"
              letterSpacing={1}
              paddingBottom={spacing.xs}
              paddingHorizontal={spacing.lg}
              marginLeft={spacing.lg}
              color={colors.textTertiary}
            >
              Penalty Box
            </Typography>
            <Card>
              <MetaRow
                label="Blocked until"
                value={new Date(device.updates_blocked_until).toLocaleString()}
              />
            </Card>
          </View>
        )}

        {(device.last_communication || device.org_name) && (
          <View style={styles.section}>
            <Typography
              type="caption"
              fontSize={11}
              textTransform="uppercase"
              letterSpacing={1}
              paddingBottom={spacing.xs}
              paddingHorizontal={spacing.lg}
              color={colors.textTertiary}
              marginLeft={spacing.lg}
            >
              Info
            </Typography>
            <Card>
              <MetaRow label="Organization" value={device.org_name} />
              <MetaRow label="Product" value={device.product_name} />
              <MetaRow
                label="Last seen"
                value={
                  device.last_communication
                    ? new Date(device.last_communication).toLocaleString()
                    : null
                }
              />
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 120,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.md,
    flex: 1,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    paddingBottom: 24,
  },
  actionButton: {
    gap: 6,
  },
});

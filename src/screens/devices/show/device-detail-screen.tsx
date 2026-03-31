import React, { useCallback, useLayoutEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, View } from "react-native";
import type { StaticScreenProps } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

import useThemedStyles from "../../../theme/useThemedStyles";
import type { ColorTheme } from "../../../theme/colors";
import type { Spacing } from "../../../theme/spacing";
import { Typography } from "../../../components/typography";
import { Card, ErrorView, LoadingView } from "../../../components/ui";
import { Tag } from "../../../components/tag";
import { Button } from "../../../components/button";
import { PulsatingDotWithRipple } from "../../../components/pulsating-dot";
import { useDevice } from "../../../hooks/useApi";
import {
  useRebootDevice,
  useReconnectDevice,
} from "../../../api/generated/devices/devices";
import { customInstance } from "../../../api/mutator/custom-instance";
import { useOrgProduct } from "../../../context/OrgProductContext";
import { Divider } from "../../../components/divider";
import { DeploymentGroupCard } from "./deployment-group-card";
import { FirmwareUpgradeCard } from "./firmware-upgrade-card";
import { DeviceInfoCard } from "./device-info-card";

import PowerIcon from "../../../../assets/icons/power.svg";
import WifiIcon from "../../../../assets/icons/wifi-light.svg";
import TargetIcon from "../../../../assets/icons/target.svg";
import ConsoleIcon from "../../../../assets/icons/console.svg";
import CheckShieldIcon from "../../../../assets/icons/check-shield.svg";
import StackIcon from "../../../../assets/icons/stack.svg";
import PlatformIcon from "../../../../assets/icons/platform.svg";

type Props = StaticScreenProps<{ identifier: string; deviceId: number }>;

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  const themedStyles = useThemedStyles(createStyles);
  if (!value) return null;
  return (
    <View style={themedStyles.metaRow}>
      <Typography
        type="caption"
        fontSize={12}
        color={themedStyles.textTertiary.color}
      >
        {label}
      </Typography>
      <Typography
        type="body"
        fontType="mono"
        fontSize={13}
        fontWeight="500"
        flexShrink={1}
        textAlign="right"
        color={themedStyles.textPrimary.color}
      >
        {value}
      </Typography>
    </View>
  );
}

export default function DeviceDetailScreen({ route }: Props) {
  const { identifier, deviceId } = route.params;
  const themedStyles = useThemedStyles(createStyles);
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

  const handleNavigateToConsole = () => {
    Alert.alert(
      "Coming Soon",
      "Device console is still in the works! We will update the app when its reaady.",
    );
  };

  const handleIdentify = () => {
    Alert.alert(
      "Coming Soon",
      "Identify devices is still in the works! We will update the app when its reaady.",
    );
  };

  const handleDelete = () => {
    Alert.alert(
      `Delete ${identifier}`,
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            customInstance({
              url: `/orgs/${orgId}/products/${productId}/devices/${identifier}`,
              method: "DELETE",
            })
              .then(() => navigation.goBack())
              .catch(() => Alert.alert("Error", "Failed to delete device.")),
        },
      ],
    );
  };

  const handleEditTags = useCallback(() => {
    const tagList = Array.isArray(device?.tags)
      ? device.tags
      : typeof device?.tags === "string"
        ? device.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
    navigation.navigate("EditDeviceTags", {
      identifier,
      currentTags: tagList,
    });
  }, [device, identifier, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerRightItems: () => [
        {
          type: "menu" as const,
          icon: {
            type: "sfSymbol" as const,
            name: "ellipsis",
          },
          menu: {
            items: [
              {
                type: "action" as const,
                label: "Reboot",
                icon: { type: "sfSymbol" as const, name: "arrow.clockwise" },
                state: "off" as const,
                onPress: handleReboot,
              },
              {
                type: "action" as const,
                label: "Reconnect",
                icon: { type: "sfSymbol" as const, name: "wifi" },
                state: "off" as const,
                onPress: handleReconnect,
              },
              {
                type: "action" as const,
                label: "Identify",
                icon: { type: "sfSymbol" as const, name: "scope" },
                state: "off" as const,
                onPress: handleIdentify,
              },
              {
                type: "action" as const,
                label: "Edit Tags",
                icon: { type: "sfSymbol" as const, name: "tag" },
                state: "off" as const,
                onPress: handleEditTags,
              },
              {
                type: "action" as const,
                label: "Delete",
                icon: { type: "sfSymbol" as const, name: "trash" },
                state: "off" as const,
                destructive: true,
                onPress: handleDelete,
              },
            ],
          },
        },
      ],
    });
  }, [
    navigation,
    handleReboot,
    handleReconnect,
    handleIdentify,
    handleEditTags,
    handleDelete,
  ]);

  if (isLoading) return <LoadingView message="Loading device…" />;
  if (isError || !device)
    return (
      <ErrorView message="Failed to load device" onRetry={() => refetch()} />
    );

  return (
    <View style={themedStyles.container}>
      <ScrollView contentContainerStyle={themedStyles.content}>
        <View style={themedStyles.header}>
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
            fontSize={26}
            fontWeight="600"
            lineHeight={30}
          >
            {String(device.identifier)}
          </Typography>
        </View>

        <ScrollView
          horizontal
          style={themedStyles.badgeRow}
          contentContainerStyle={themedStyles.actionButton}
        >
          {device.firmware_metadata?.product && (
            <Tag
              label={device.firmware_metadata.product}
              size="sm"
              colorScheme="white"
              hasBorder
              iconLeft={{
                component: StackIcon,
                props: {
                  width: 14,
                  height: 14,
                  color: themedStyles.textTertiary.color,
                },
              }}
            />
          )}

          {device.firmware_metadata?.platform && (
            <Tag
              label={device.firmware_metadata.platform}
              size="sm"
              colorScheme="white"
              hasBorder
              iconLeft={{
                component: PlatformIcon,
                props: {
                  width: 14,
                  height: 14,
                  color: themedStyles.textTertiary.color,
                },
              }}
            />
          )}

          {device.version && (
            <Tag
              label={`v${device.version}`}
              size="sm"
              colorScheme="white"
              hasBorder
              iconLeft={{
                component: CheckShieldIcon,
                props: {
                  width: 14,
                  height: 14,
                  color: themedStyles.textTertiary.color,
                },
              }}
            />
          )}
        </ScrollView>

        {/* Tags */}
        <ScrollView
          style={themedStyles.tagsScrollView}
          alwaysBounceVertical={false}
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={themedStyles.actionButton}
        >
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
        </ScrollView>

        <ScrollView
          style={themedStyles.actionsRow}
          alwaysBounceVertical={false}
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={themedStyles.actionButton}
        >
          <Button
            label="Console"
            type="tertiary"
            size="sm"
            onPress={handleNavigateToConsole}
            style={themedStyles.actionButton}
            iconLeft={
              <ConsoleIcon
                width={17}
                height={17}
                color={themedStyles.textSecondary.color}
              />
            }
          />

          <Button
            label="Certificates"
            type="tertiary"
            size="sm"
            onPress={() =>
              navigation.navigate("DeviceCertificates", { identifier })
            }
            style={themedStyles.actionButton}
            iconLeft={
              <CheckShieldIcon
                width={17}
                height={17}
                color={themedStyles.textSecondary.color}
              />
            }
          />
        </ScrollView>

        <Divider
          horizontalMargin={18}
          verticalMargin={{ top: 0, bottom: 18 }}
        />

        <View style={themedStyles.cardListWrapper}>
          <UpdatesToggleCard
            deviceIdentifier={identifier}
            updatesEnabled={device.updates_enabled !== false}
            onToggled={refetch}
          />

          <DeploymentGroupCard
            currentDeploymentGroupId={device.deployment_group?.name}
            deviceIdentifier={identifier}
          />

          <FirmwareUpgradeCard
            deviceIdentifier={identifier}
            currentVersion={device.version}
            currentPlatform={device.firmware_metadata?.platform}
            currentArchitecture={device.firmware_metadata?.architecture}
          />

          {device.updates_blocked_until && (
            <View style={themedStyles.section}>
              <Typography
                type="caption"
                fontSize={11}
                textTransform="uppercase"
                letterSpacing={1}
                paddingBottom={4}
                paddingHorizontal={18}
                color={themedStyles.textTertiary.color}
              >
                Penalty Box
              </Typography>
              <Card>
                <MetaRow
                  label="Blocked until"
                  value={new Date(
                    device.updates_blocked_until,
                  ).toLocaleString()}
                />
              </Card>
            </View>
          )}

          <DeviceInfoCard device={device} />
        </View>
      </ScrollView>
    </View>
  );
}

function UpdatesToggleCard({
  deviceIdentifier,
  updatesEnabled,
  onToggled,
}: {
  deviceIdentifier: string;
  updatesEnabled: boolean;
  onToggled: () => void;
}) {
  const themedStyles = useThemedStyles(createStyles);
  const { orgId, productId } = useOrgProduct();
  const [enabled, setEnabled] = useState(updatesEnabled);
  const [toggling, setToggling] = useState(false);

  const handleToggle = useCallback(
    async (value: boolean) => {
      if (!orgId || !productId) return;
      setEnabled(value);
      setToggling(true);
      try {
        await customInstance({
          url: `/orgs/${orgId}/products/${productId}/devices/${deviceIdentifier}`,
          method: "PUT",
          data: { device: { updates_enabled: value } },
        });
        onToggled();
      } catch {
        setEnabled(!value);
        Alert.alert("Error", "Failed to update device.");
      } finally {
        setToggling(false);
      }
    },
    [orgId, productId, deviceIdentifier, onToggled],
  );

  return (
    <View style={themedStyles.section}>
      <Typography
        type="caption"
        fontSize={11}
        textTransform="uppercase"
        letterSpacing={1}
        paddingBottom={4}
        paddingHorizontal={18}
        color={themedStyles.textTertiary.color}
      >
        Updates
      </Typography>
      <Card>
        <View style={themedStyles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Typography
              type="body"
              fontSize={15}
              fontWeight="600"
              color={themedStyles.textPrimary.color}
            >
              Firmware updates
            </Typography>
            <Typography
              type="body"
              fontSize={12}
              color={themedStyles.textSecondary.color}
              marginTop={2}
            >
              {enabled
                ? "Device will receive firmware updates"
                : "Device will not receive firmware updates"}
            </Typography>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            disabled={toggling}
            trackColor={{ true: themedStyles.accent.color }}
          />
        </View>
      </Card>
    </View>
  );
}

const createStyles = (colors: ColorTheme, spacing: Spacing) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingTop: 120,
      paddingBottom: 120,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing[18],
      paddingTop: spacing[18],
      paddingBottom: spacing[12],
      gap: spacing[6],
    },
    identifierIcon: {
      padding: 6,
      borderRadius: 8,
      borderCurve: "continuous",
      borderWidth: 0.2,
      borderColor: colors.borderLight,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[4],
      paddingHorizontal: spacing[18],
      marginBottom: spacing[4],
    },
    section: {
      marginBottom: spacing[12],
      paddingHorizontal: spacing[18],
      flex: 1,
      gap: spacing[6],
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing[4],
    },
    actionsRow: {
      flexDirection: "row",
      gap: spacing[6],
      paddingHorizontal: spacing[18],
      paddingTop: spacing[4],
      paddingBottom: spacing[24],
    },
    tagsScrollView: {
      flexDirection: "row",
      gap: spacing[6],
      paddingHorizontal: spacing[18],
      marginBottom: spacing[24],
    },
    actionButton: {
      gap: spacing[4],
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing[6],
    },
    cardListWrapper: {
      gap: spacing[12],
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
    accent: {
      color: colors.accent,
    },
  });

import React, { useCallback, useLayoutEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card } from "../../components/ui";
import { Tag } from "../../components/tag";
import type { StaticScreenProps } from "@react-navigation/native";
import { SwitchFirmwareCard } from "./switch-firmware-card";
import type { DeploymentGroup } from "../../api/generated/schemas";
import { useOrgProduct } from "../../context/OrgProductContext";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListDeploymentGroupsQueryKey,
  updateDeploymentGroup,
  useDeleteDeploymentGroup,
} from "../../api/generated/deployment-groups/deployment-groups";

import CheckCircleIcon from "../../../assets/icons/check-circle.svg";
import CloseIcon from "../../../assets/icons/close-big.svg";

type Props = StaticScreenProps<{ deployment: DeploymentGroup }>;

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

export default function DeploymentDetailScreen({ route }: Props) {
  const dg = route.params.deployment;
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { orgId, productId } = useOrgProduct();
  const queryClient = useQueryClient();
  const [active, setActive] = useState(dg.is_active ?? dg.state === "on");
  const [toggling, setToggling] = useState(false);
  const deleteDeployment = useDeleteDeploymentGroup();

  const isActive = active;
  const tags = dg.conditions?.tags ?? [];
  const currentRelease = dg.current_release;
  const releasesCount = dg.releases_count;
  const deltaUpdatable = dg.delta_updatable;
  const archiveUuid = dg.archive_uuid;

  const handleToggle = useCallback(() => {
    const nextState = !isActive;
    const label = nextState ? "Activate" : "Deactivate";
    Alert.alert(
      `${label} ${dg.name}`,
      `Are you sure you want to ${label.toLowerCase()} this deployment?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: label,
          style: nextState ? "default" : "destructive",
          onPress: async () => {
            if (!orgId || !productId || !dg.name) return;
            setToggling(true);
            try {
              await updateDeploymentGroup(orgId, productId, dg.name, {
                deployment: { state: nextState ? "on" : "off" },
              });
              setActive(nextState);
              queryClient.invalidateQueries({
                queryKey: getListDeploymentGroupsQueryKey(orgId, productId),
              });
            } catch {
              Alert.alert(
                "Error",
                `Failed to ${label.toLowerCase()} deployment.`,
              );
            } finally {
              setToggling(false);
            }
          },
        },
      ],
    );
  }, [isActive, orgId, productId, dg.name, queryClient]);

  const handleDelete = useCallback(() => {
    if (!orgId || !productId || !dg.name) return;
    Alert.alert(
      `Delete ${dg.name}`,
      "Are you sure you want to delete this deployment? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteDeployment.mutate(
              { orgName: orgId, productName: productId, name: dg.name! },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: getListDeploymentGroupsQueryKey(orgId, productId),
                  });
                  navigation.goBack();
                },
                onError: () =>
                  Alert.alert("Error", "Failed to delete deployment."),
              },
            );
          },
        },
      ],
    );
  }, [orgId, productId, dg.name, deleteDeployment, queryClient, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: dg.name,
      unstable_headerRightItems: () => [
        {
          type: "button",
          label: isActive ? "Deactivate" : "Activate",
          icon: {
            type: "sfSymbol",
            name: isActive ? "pause.fill" : "play.fill",
          },
          onPress: handleToggle,
          disabled: toggling,
        },
        {
          type: "button",
          icon: {
            type: "sfSymbol",
            name: "trash",
          },
          onPress: handleDelete,
        },
      ],
    });
  }, [navigation, isActive, handleToggle, handleDelete, toggling]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.statusRow}>
        <Tag
          label={isActive ? "Active" : "Inactive"}
          colorScheme="white"
          hasBorder
          hasShadow
          size="sm"
          adjustIconPadding
          iconLeft={{
            component: isActive ? CheckCircleIcon : CloseIcon,
            props: {
              width: isActive ? 16 : 14,
              height: isActive ? 16 : 14,
              color: isActive ? "#9ACD32" : "#E0E3E6",
              fill: isActive ? "#9ACD32" : "#E0E3E6",
            },
          }}
        />
      </View>

      {currentRelease?.firmware && (
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
            Firmware
          </Typography>
          <Card>
            <MetaRow
              label="Version"
              value={currentRelease.firmware.version ? `v${currentRelease.firmware.version}` : null}
            />
            <MetaRow label="Platform" value={currentRelease.firmware.platform} />
            <MetaRow label="Architecture" value={currentRelease.firmware.architecture} />
            <MetaRow label="UUID" value={currentRelease.firmware.uuid} />
          </Card>
        </View>
      )}

      {(dg.conditions?.version || tags.length > 0) && (
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
            Conditions
          </Typography>
          <Card>
            <MetaRow label="Version" value={dg.conditions?.version} />
            <MetaRow label="Tag matching" value={dg.conditions?.tag_operator?.toUpperCase()} />
            {tags.length > 0 && (
              <View style={styles.tagsMetaRow}>
                <Typography
                  type="caption"
                  fontSize={12}
                  color={colors.textTertiary}
                >
                  Tags
                </Typography>
                <View style={styles.tagsWrap}>
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      label={`#${tag}`}
                      size="sm"
                      colorScheme="white"
                      hasBorder
                    />
                  ))}
                </View>
              </View>
            )}
          </Card>
        </View>
      )}

      {currentRelease && (
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
            Current Release
          </Typography>
          <Card>
            <MetaRow
              label="Release #"
              value={
                currentRelease.number != null
                  ? `${currentRelease.number}`
                  : null
              }
            />
            <MetaRow
              label="Firmware"
              value={
                currentRelease.firmware?.version
                  ? `v${currentRelease.firmware.version}`
                  : null
              }
            />
            <MetaRow
              label="Platform"
              value={currentRelease.firmware?.platform}
            />
            <MetaRow
              label="Architecture"
              value={currentRelease.firmware?.architecture}
            />
            <MetaRow label="UUID" value={currentRelease.firmware?.uuid} />
            <MetaRow
              label="Released"
              value={
                currentRelease.inserted_at
                  ? new Date(currentRelease.inserted_at).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      },
                    )
                  : null
              }
            />
          </Card>
        </View>
      )}

      <SwitchFirmwareCard deploymentName={dg.name!} />

      {dg.notes ? (
        <View style={styles.section}>
          <Typography type="caption" fontSize={11} textTransform="uppercase" letterSpacing={1} paddingBottom={spacing.xs} paddingHorizontal={spacing.lg} color={colors.textTertiary}>Notes</Typography>
          <Card><Typography type="body" fontSize={13} color={colors.textSecondary}>{dg.notes}</Typography></Card>
        </View>
      ) : null}

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
          {dg.device_count != null && (
            <MetaRow label="Devices" value={`${dg.device_count}`} />
          )}
          {releasesCount != null && (
            <MetaRow label="Releases" value={`${releasesCount}`} />
          )}
          <MetaRow label="State" value={isActive ? "Active" : "Inactive"} />
          {deltaUpdatable != null && (
            <MetaRow
              label="Delta updates"
              value={deltaUpdatable ? "Enabled" : "Disabled"}
            />
          )}
          {archiveUuid && <MetaRow label="Archive UUID" value={archiveUuid} />}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  statusRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  tagsMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.xs,
    flexShrink: 1,
  },
});

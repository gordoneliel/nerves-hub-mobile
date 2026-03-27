import React, { useCallback, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card, LoadingView } from "../../components/ui";
import { Tag } from "../../components/tag";
import { Dropdown, type DropDownItem } from "../../components/dropdown";
import CheckCircleIcon from "../../../assets/icons/check-circle.svg";
import CloseIcon from "../../../assets/icons/close-big.svg";
import StackIcon from "../../../assets/icons/stack.svg";
import TrashIcon from "../../../assets/icons/trash.svg";
import { useDeployments } from "../../hooks/useApi";
import { useUpdateDevice } from "../../api/generated/devices/devices";
import { useOrgProduct } from "../../context/OrgProductContext";
import type { DeploymentGroup } from "../../api/generated/schemas";
import { Button } from "../../components/button";

interface DeploymentGroupCardProps {
  currentDeploymentGroupId?: string | null;
  deviceIdentifier: string;
}

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

export function DeploymentGroupCard({
  currentDeploymentGroupId,
  deviceIdentifier,
}: DeploymentGroupCardProps) {
  const { colors } = useTheme();
  const { orgId, productId } = useOrgProduct();
  const { data, isLoading } = useDeployments();
  const updateDevice = useUpdateDevice();
  const selectedGroupIdRef = useRef<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const deploymentGroups = data?.data ?? [];
  const current = deploymentGroups.find(
    (dg) => dg.name === currentDeploymentGroupId,
  );

  if (isLoading) {
    return <LoadingView message="Loading deployments…" />;
  }

  const isActive = current?.is_active ?? current?.state === "on";

  const dropdownItems: DropDownItem<DeploymentGroup>[] = deploymentGroups.map(
    (dg) => ({
      id: dg.name ?? String(dg.id),
      label: dg.name ?? "Unnamed",
      value: dg,
    }),
  );

  const handleSelect = useCallback((item: DropDownItem<DeploymentGroup>) => {
    selectedGroupIdRef.current = item.id;
    setSelectedGroupId(item.id);
  }, []);

  const handleRemove = () => {
    Alert.alert(
      "Coming Soon",
      "Removing a device from a deployment is not ready yet!",
    );
    // if (!currentDeploymentGroupId || !orgId || !productId) return;
    // Alert.alert(
    //   "Remove Deployment",
    //   "Are you sure you want to remove this device from its deployment group?",
    //   [
    //     { text: "Cancel", style: "cancel" },
    //     {
    //       text: "Remove",
    //       style: "destructive",
    //       onPress: () => {
    //         updateDevice.mutate(
    //           {
    //             orgName: orgId,
    //             productName: productId,
    //             identifier: deviceIdentifier,
    //             data: { device: { deployment_group_id: 0 } },
    //           },
    //           {
    //             onSuccess: () => Alert.alert("Success", "Device removed from deployment group."),
    //             onError: () => Alert.alert("Error", "Failed to remove deployment group."),
    //           },
    //         );
    //       },
    //     },
    //   ],
    // );
  };

  const handleAssign = () => {
    Alert.alert(
      "Coming Soon",
      "Assinging a device to a deployment is not ready yet!",
    );

    // const groupName = selectedGroupIdRef.current;
    // if (groupName == null || !orgId || !productId) return;
    // const selected = deploymentGroups.find((dg) => dg.name === groupName);
    // if (!selected) return;
    // console.log("Group: ", groupName, "id:", selected.id);

    // updateDevice.mutate(
    //   {
    //     orgName: orgId,
    //     productName: productId,
    //     identifier: deviceIdentifier,
    //     data: { device: { deployment_group_id: selected.id } },
    //   },
    //   {
    //     onSuccess: () => Alert.alert("Success", "Deployment group updated."),
    //     onError: () =>
    //       Alert.alert("Error", "Failed to update deployment group."),
    //   },
    // );
  };

  return (
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
        Deployment
      </Typography>
      <Card>
        {current ? (
          <>
            <View style={styles.headerRow}>
              <Typography
                type="body"
                fontSize={15}
                fontWeight="600"
                color={colors.textPrimary}
                flexShrink={1}
              >
                {current.name}
              </Typography>
              <Tag
                label={isActive ? "Active" : "Inactive"}
                size="sm"
                colorScheme="white"
                hasBorder
                iconLeft={{
                  component: isActive ? CheckCircleIcon : CloseIcon,
                  props: {
                    width: isActive ? 14 : 12,
                    height: isActive ? 14 : 12,
                    color: isActive ? "#9ACD32" : "#E0E3E6",
                    fill: isActive ? "#9ACD32" : "#E0E3E6",
                  },
                }}
              />
            </View>
            <MetaRow label="Version" value={current.firmware?.version} />
            <MetaRow
              label="Platform"
              value={current.conditions?.tags?.join(", ")}
            />
            <MetaRow
              label="Device count"
              value={String(current.device_count ?? 0)}
            />
          </>
        ) : (
          <View style={styles.emptyRow}>
            <StackIcon width={28} height={28} color={colors.textCaption} />
            <Typography type="body" fontSize={14} color={colors.textCaption}>
              No deployment assigned
            </Typography>
          </View>
        )}
        {dropdownItems.length > 0 && (
          <View style={styles.dropdownRow}>
            <Dropdown
              items={dropdownItems}
              defaultSelectedItemId={current?.name}
              size="sm"
              placeholderLabel={
                current ? "Switch deployment" : "Select deployment"
              }
              fullWidth
              fullItemsWidth
              onSelect={handleSelect}
            />
            <Button
              label="Assign"
              size="sm"
              type="tertiary"
              disabled={selectedGroupId == null}
              isLoading={updateDevice.isPending && !currentDeploymentGroupId}
              onPress={handleAssign}
            />
            {current && (
              <Button
                size="sm"
                type="icon"
                iconLeft={
                  <TrashIcon
                    width={16}
                    height={16}
                    color={colors.textDestructive}
                  />
                }
                isLoading={updateDevice.isPending && !!currentDeploymentGroupId}
                onPress={handleRemove}
              />
            )}
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  emptyRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  dropdownRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
    gap: 6,
  },
});

import React, { useCallback, useLayoutEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card } from "../../components/ui";
import { Tag } from "../../components/tag";
import type { StaticScreenProps } from "@react-navigation/native";
import type { DeploymentGroup } from "../../api/generated/schemas";
import { useOrgProduct } from "../../context/OrgProductContext";
import { customInstance } from "../../api/mutator/custom-instance";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListDeploymentGroupsQueryKey,
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
              await customInstance({
                url: `/orgs/${orgId}/products/${productId}/deployments/${dg.name}`,
                method: "PUT",
                data: { deployment: { state: nextState ? "on" : "off" } },
              });
              setActive(nextState);
              queryClient.invalidateQueries({
                queryKey: getListDeploymentGroupsQueryKey(orgId, productId),
              });
            } catch {
              Alert.alert("Error", `Failed to ${label.toLowerCase()} deployment.`);
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
      unstable_headerRightItems: () => [
        {
          type: "button",
          label: isActive ? "Deactivate" : "Activate",
          icon: {
            type: "sfSymbol",
            name: isActive ? "pause.circle" : "play.circle",
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={styles.header}>
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
          <Typography
            type="header"
            fontSize={26}
            fontWeight="600"
            lineHeight={28}
          >
            {dg.name}
          </Typography>
        </View>

        {dg.firmware && (
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
                value={dg.firmware.version ? `v${dg.firmware.version}` : null}
              />
              <MetaRow label="Platform" value={dg.firmware.platform} />
              <MetaRow label="Architecture" value={dg.firmware.architecture} />
              <MetaRow label="Author" value={dg.firmware.author} />
              <MetaRow label="UUID" value={dg.firmware.uuid} />
              <MetaRow label="FWUP Version" value={dg.firmware.fwup_version} />
              <MetaRow label="VCS" value={dg.firmware.vcs_identifier} />
              <MetaRow
                label="Signed"
                value={dg.firmware.signed ? "Yes" : "No"}
              />
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
              marginLeft={spacing.lg}
              color={colors.textTertiary}
            >
              Conditions
            </Typography>
            <Card>
              <MetaRow label="Version" value={dg.conditions?.version} />
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
          >Info</Typography>
          <Card>
            {dg.device_count != null && (
              <MetaRow label="Devices" value={`${dg.device_count}`} />
            )}
            <MetaRow label="State" value={dg.state} />
            <MetaRow
              label="Created"
              value={
                dg.inserted_at
                  ? new Date(dg.inserted_at).toLocaleString()
                  : null
              }
            />
            <MetaRow
              label="Updated"
              value={
                dg.updated_at ? new Date(dg.updated_at).toLocaleString() : null
              }
            />
          </Card>
        </View>
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
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
    gap: spacing.md
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

import React, { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card } from "../../components/ui";
import { Button } from "../../components/button";
import { Dropdown, type DropDownItem } from "../../components/dropdown";
import { useFirmware } from "../../hooks/useApi";
import { useOrgProduct } from "../../context/OrgProductContext";
import {
  getGetDeploymentGroupQueryKey,
  getListDeploymentGroupsQueryKey,
  updateDeploymentGroup,
} from "../../api/generated/deployment-groups/deployment-groups";
import type { Firmware } from "../../api/generated/schemas";

import BoltIcon from "../../../assets/icons/bolt.svg";

interface SwitchFirmwareCardProps {
  deploymentName: string;
}

export function SwitchFirmwareCard({
  deploymentName,
}: SwitchFirmwareCardProps) {
  const { colors } = useTheme();
  const { orgId, productId } = useOrgProduct();
  const queryClient = useQueryClient();
  const firmwareQuery = useFirmware();
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!selectedUuid || !orgId || !productId) return;
    Alert.alert(
      "Switch Firmware",
      "This creates a new deployment release with the selected firmware. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await updateDeploymentGroup(orgId, productId, deploymentName, {
                deployment: { firmware: selectedUuid },
              });
              queryClient.invalidateQueries({
                queryKey: getGetDeploymentGroupQueryKey(
                  orgId,
                  productId,
                  deploymentName,
                ),
              });
              queryClient.invalidateQueries({
                queryKey: getListDeploymentGroupsQueryKey(orgId, productId),
              });
              Alert.alert("Success", "Deployment firmware updated.");
            } catch {
              Alert.alert("Error", "Failed to switch deployment firmware.");
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  }, [selectedUuid, orgId, productId, deploymentName, queryClient]);

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
            onSelect={(item: DropDownItem<string>) =>
              setSelectedUuid(item.value ?? null)
            }
          />
          <Button
            label="Switch"
            size="sm"
            type="primary"
            onPress={handleSwitch}
            disabled={!selectedUuid}
            isLoading={isSubmitting}
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

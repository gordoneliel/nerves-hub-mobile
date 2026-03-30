import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { spacing } from "../../../components/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { Typography } from "../../../components/typography";
import { Card, LoadingView } from "../../../components/ui";
import { Tag } from "../../../components/tag";
import { Dropdown, type DropDownItem } from "../../../components/dropdown";
import { Button } from "../../../components/button";
import { useFirmware } from "../../../hooks/useApi";
import { customInstance } from "../../../api/mutator/custom-instance";
import { useOrgProduct } from "../../../context/OrgProductContext";
import type { Firmware } from "../../../api/generated/schemas";

import BoltIcon from "../../../../assets/icons/bolt.svg";
import StackIcon from "../../../../assets/icons/stack.svg";

interface FirmwareUpgradeCardProps {
  deviceIdentifier: string;
  currentVersion?: string | null;
  currentPlatform?: string | null;
  currentArchitecture?: string | null;
}

export function FirmwareUpgradeCard({
  deviceIdentifier,
  currentVersion,
  currentPlatform,
  currentArchitecture,
}: FirmwareUpgradeCardProps) {
  const { colors } = useTheme();
  const { orgId, productId } = useOrgProduct();
  const { data, isLoading } = useFirmware();
  const [selectedFirmware, setSelectedFirmware] = useState<Firmware | null>(
    null,
  );
  const [upgrading, setUpgrading] = useState(false);

  const allFirmwares = data?.data ?? [];

  // Filter to compatible firmwares (matching platform & architecture if known)
  const compatibleFirmwares = allFirmwares.filter((fw) => {
    if (currentPlatform && fw.platform && fw.platform !== currentPlatform)
      return false;
    if (
      currentArchitecture &&
      fw.architecture &&
      fw.architecture !== currentArchitecture
    )
      return false;
    return true;
  });

  if (isLoading) {
    return <LoadingView message="Loading firmware..." />;
  }

  const dropdownItems: DropDownItem<Firmware>[] = compatibleFirmwares.map(
    (fw) => ({
      id: fw.uuid ?? String(fw.version),
      label: `v${fw.version ?? "?"} - ${fw.platform ?? ""}`.trim(),
      value: fw,
    }),
  );

  const handleSelect = useCallback((item: DropDownItem<Firmware>) => {
    setSelectedFirmware(item.value ?? null);
  }, []);

  const handleUpgrade = useCallback(() => {
    if (!orgId || !productId || !selectedFirmware?.uuid) return;
    Alert.alert(
      "Push Firmware",
      `Upgrade ${deviceIdentifier} to v${selectedFirmware.version}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upgrade",
          onPress: async () => {
            setUpgrading(true);
            try {
              await customInstance({
                url: `/orgs/${orgId}/products/${productId}/devices/${deviceIdentifier}/upgrade`,
                method: "POST",
                data: { uuid: selectedFirmware.uuid },
              });
              Alert.alert("Success", "Upgrade command sent.");
            } catch {
              Alert.alert("Error", "Failed to send upgrade command.");
            } finally {
              setUpgrading(false);
            }
          },
        },
      ],
    );
  }, [orgId, productId, deviceIdentifier, selectedFirmware]);

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
        Firmware Upgrade
      </Typography>
      <Card>
        {currentVersion ? (
          <View style={styles.currentRow}>
            <Typography type="body" fontSize={13} color={colors.textSecondary}>
              Current version
            </Typography>
            <Tag
              label={`v${currentVersion}`}
              size="sm"
              colorScheme="white"
              hasBorder
            />
          </View>
        ) : null}

        {compatibleFirmwares.length > 0 ? (
          <View style={styles.upgradeRow}>
            <Dropdown
              items={dropdownItems}
              size="sm"
              placeholderLabel="Select firmware..."
              fullWidth
              fullItemsWidth
              onSelect={handleSelect}
            />
            <Button
              label="Upgrade"
              size="sm"
              type="primary"
              disabled={!selectedFirmware}
              isLoading={upgrading}
              onPress={handleUpgrade}
              iconLeft={<BoltIcon width={14} height={14} color="#fff" />}
            />
          </View>
        ) : (
          <View style={styles.emptyRow}>
            <StackIcon width={28} height={28} color={colors.textCaption} />
            <Typography type="body" fontSize={14} color={colors.textCaption}>
              No compatible firmware available
            </Typography>
          </View>
        )}
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
  currentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  upgradeRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    gap: 6,
    justifyContent: "space-between",
  },
  emptyRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
});

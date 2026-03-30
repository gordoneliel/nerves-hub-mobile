import React, { useLayoutEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card } from "../../components/ui";
import { Tag } from "../../components/tag";
import type { StaticScreenProps } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { Firmware } from "../../api/generated/schemas";
import { useDeleteFirmware } from "../../api/generated/firmwares/firmwares";
import { useOrgProduct } from "../../context/OrgProductContext";
import TrashIcon from "../../../assets/icons/trash.svg";

type Props = StaticScreenProps<{ firmware: Firmware }>;

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

export default function FirmwareDetailScreen({ route }: Props) {
  const fw = route.params.firmware;
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { orgId, productId } = useOrgProduct();
  const deleteFirmware = useDeleteFirmware();

  const handleDelete = () => {
    Alert.alert(
      "Delete Firmware",
      `Are you sure you want to delete firmware v${fw.version ?? "?"}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (!orgId || !productId || !fw.uuid) return;
            deleteFirmware.mutate(
              { orgName: orgId, productName: productId, uuid: fw.uuid },
              {
                onSuccess: () => navigation.goBack(),
                onError: () =>
                  Alert.alert("Error", "Failed to delete firmware."),
              },
            );
          },
        },
      ],
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        deleteFirmware.isPending ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <TrashIcon width={22} height={22} color={colors.danger} />
          </TouchableOpacity>
        ),
    });
  }, [navigation, colors, orgId, productId, fw.uuid, deleteFirmware.isPending]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Typography
            type="header"
            fontSize={26}
            fontWeight="600"
            lineHeight={28}
            flexShrink={1}
          >
            v{fw.version ?? "?"}
          </Typography>
          {fw.signed && (
            <Tag
              label="Signed"
              size="sm"
              colorScheme="white"
              hasBorder
              hasShadow
            />
          )}
        </View>

        {fw.description ? (
          <Typography
            type="body"
            fontSize={13}
            color={colors.textSecondary}
            paddingHorizontal={spacing.lg}
            marginBottom={spacing.md}
          >
            {fw.description}
          </Typography>
        ) : null}

        <View style={styles.section}>
          <SectionLabel title="Details" />
          <Card>
            <MetaRow label="Platform" value={fw.platform} />
            <MetaRow label="Architecture" value={fw.architecture} />
            <MetaRow label="Author" value={fw.author} />
            <MetaRow label="FWUP Version" value={fw.fwup_version} />
            <MetaRow label="Signed" value={fw.signed ? "Yes" : "No"} />
          </Card>
        </View>

        {(fw.uuid || fw.vcs_identifier) && (
          <View style={styles.section}>
            <SectionLabel title="Identifiers" />
            <Card>
              <MetaRow label="UUID" value={fw.uuid} />
              <MetaRow label="VCS" value={fw.vcs_identifier} />
            </Card>
          </View>
        )}

        {fw.misc && (
          <View style={styles.section}>
            <SectionLabel title="Misc" />
            <Card>
              <Typography
                type="body"
                fontType="mono"
                fontSize={12}
                color={colors.textSecondary}
              >
                {fw.misc}
              </Typography>
            </Card>
          </View>
        )}

        {(fw.inserted_at || fw.updated_at) && (
          <View style={styles.section}>
            <SectionLabel title="Timestamps" />
            <Card>
              <MetaRow
                label="Created"
                value={
                  fw.inserted_at
                    ? new Date(fw.inserted_at).toLocaleString()
                    : null
                }
              />
              <MetaRow
                label="Updated"
                value={
                  fw.updated_at
                    ? new Date(fw.updated_at).toLocaleString()
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

function SectionLabel({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Typography
      type="caption"
      fontSize={11}
      textTransform="uppercase"
      letterSpacing={1}
      paddingBottom={spacing.xs}
      paddingHorizontal={spacing.lg}
      color={colors.textTertiary}
    >
      {title}
    </Typography>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
});

import React, { useLayoutEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card } from "../../components/ui";
import type { StaticScreenProps } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { Firmware } from "../../api/generated/schemas";
import { useDeleteFirmware } from "../../api/generated/firmwares/firmwares";
import { useOrgProduct } from "../../context/OrgProductContext";
import ReactNativeBlobUtil from "react-native-blob-util";
import { useAuth } from "../../context/AuthContext";

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
  const { instanceUrl, token } = useAuth();
  const deleteFirmware = useDeleteFirmware();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!instanceUrl || !token || !orgId || !productId || !fw.uuid) return;
    setDownloading(true);
    try {
      const result = await ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: "fw",
      }).fetch(
        "GET",
        `${instanceUrl}/api/orgs/${encodeURIComponent(orgId)}/products/${encodeURIComponent(productId)}/firmwares/${encodeURIComponent(fw.uuid)}/download`,
        { Authorization: `token ${token}` },
      );
      await ReactNativeBlobUtil.ios.openDocument(result.path());
    } catch {
      Alert.alert("Download Failed", "The firmware file could not be downloaded.");
    } finally {
      setDownloading(false);
    }
  };

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
      title: `v${fw.version ?? "?"}`,
      unstable_headerRightItems: () => [
        {
          type: "button",
          icon: { type: "sfSymbol", name: "arrow.down.circle" },
          onPress: handleDownload,
          disabled: downloading,
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
  }, [navigation, colors, orgId, productId, fw.uuid, deleteFirmware.isPending, downloading, token, instanceUrl]);

  return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.section}>
          <SectionLabel title="Details" />
          <Card>
            <MetaRow label="Platform" value={fw.platform} />
            <MetaRow label="Architecture" value={fw.architecture} />
            <MetaRow label="Author" value={fw.author} />
          </Card>
        </View>

        {fw.uuid && (
          <View style={styles.section}>
            <SectionLabel title="Identifiers" />
            <Card>
              <MetaRow label="UUID" value={fw.uuid} />
            </Card>
          </View>
        )}

      </ScrollView>
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
    paddingBottom: spacing.xl,
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

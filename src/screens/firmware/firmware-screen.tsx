import React, { useCallback } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card, EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { useFirmware } from "../../hooks/useApi";
import type { Firmware } from "../../api/generated/schemas";

export default function FirmwareScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const firmwareQuery = useFirmware();

  if (firmwareQuery.isLoading)
    return <LoadingView message="Loading firmware…" />;
  if (firmwareQuery.isError)
    return (
      <ErrorView
        message="Failed to load firmware"
        onRetry={() => firmwareQuery.refetch()}
      />
    );

  const firmwares = [...(firmwareQuery.data?.data ?? [])].sort((a, b) => {
    const da = a.inserted_at ? new Date(a.inserted_at).getTime() : 0;
    const db = b.inserted_at ? new Date(b.inserted_at).getTime() : 0;
    return db - da;
  });

  const renderFirmware = ({ item }: { item: Firmware }) => (
    <Card
      onPress={() => navigation.navigate("FirmwareDetail", { firmware: item })}
    >
      <View style={styles.headerRow}>
        <Typography
          fontSize={16}
          fontWeight="600"
          lineHeight={28}
          color={colors.textPrimary}
        >
          {item.version ?? "?"}
        </Typography>
        <View style={styles.badges}>
          {item.signed && (
            <View
              style={[
                styles.signedBadge,
                { backgroundColor: colors.successSubtle },
              ]}
            >
              <Typography type="caption" fontSize={11} color={colors.success}>
                Signed
              </Typography>
            </View>
          )}
        </View>
      </View>

      {item.description ? (
        <Typography
          type="body"
          fontSize={12}
          marginTop={spacing.xs}
          color={colors.textSecondary}
        >
          {item.description}
        </Typography>
      ) : null}

      <View style={styles.metaGrid}>
        {item.platform && <MetaItem label="Platform" value={item.platform} />}
        {item.architecture && (
          <MetaItem label="Arch" value={item.architecture} />
        )}
        {item.author && <MetaItem label="Author" value={item.author} />}
      </View>

      {item.uuid && (
        <Typography
          type="caption"
          fontType="mono"
          fontSize={10}
          marginTop={spacing.sm}
          color={colors.textTertiary}
        >
          {item.uuid}
        </Typography>
      )}

      {item.inserted_at && (
        <Typography
          type="caption"
          fontSize={11}
          marginTop={spacing.xs}
          color={colors.textTertiary}
        >
          {new Date(item.inserted_at).toLocaleDateString()}
        </Typography>
      )}
    </Card>
  );

  function renderListHeader() {
    return (
      <View style={styles.listHeader}>
        <View style={styles.titleRow}>
          <Typography
            type="header"
            fontSize={24}
            fontWeight="600"
            lineHeight={28}
            marginBottom={4}
          >
            Firmware
          </Typography>
          {firmwares.length > 0 && (
            <View
              style={{
                backgroundColor: colors.backgroundTertiary,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Typography type="body" fontSize={15} color={colors.textTertiary}>
                {firmwares.length}
              </Typography>
            </View>
          )}
        </View>
        <Typography type="body" fontSize={13} color={colors.textTertiary}>
          Uploaded firmware images for this product
        </Typography>
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      data={firmwares}
      keyExtractor={(item) => item.uuid ?? String(Math.random())}
      renderItem={renderFirmware}
      contentInsetAdjustmentBehavior="automatic"
      ListEmptyComponent={
        <EmptyView
          title="No Firmware"
          message="No firmware has been uploaded for this product."
        />
      }
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
      refreshControl={
        <RefreshControl
          refreshing={firmwareQuery.isRefetching}
          onRefresh={() => firmwareQuery.refetch()}
          tintColor={colors.textTertiary}
        />
      }
    />
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metaItem}>
      <Typography type="caption" fontSize={11} color={colors.textTertiary}>
        {label}
      </Typography>
      <Typography
        type="body"
        fontType="mono"
        fontWeight="500"
        fontSize={12}
        color={colors.textSecondary}
      >
        {value}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: 120,
    paddingHorizontal: spacing.lg,
  },
  listHeader: {
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badges: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  signedBadge: {
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  metaItem: {
    gap: 2,
  },
});

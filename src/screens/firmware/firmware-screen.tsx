import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useThemedStyles from "../../theme/useThemedStyles";
import type { ColorTheme } from "../../theme/colors";
import type { Spacing } from "../../theme/spacing";
import { Typography } from "../../components/typography";
import { Card, EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { useFirmware } from "../../hooks/useApi";
import type { Firmware } from "../../api/generated/schemas";

import PackageIcon from "../../../assets/icons/package.svg";

export default function FirmwareScreen() {
  const themedStyles = useThemedStyles(createStyles);
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

  const isEmpty = firmwares.length <= 0;

  const renderFirmware = ({ item }: { item: Firmware }) => (
    <Card
      onPress={() => navigation.navigate("FirmwareDetail", { firmware: item })}
    >
      <View style={themedStyles.headerRow}>
        <Typography
          fontSize={16}
          fontWeight="600"
          lineHeight={28}
          color={themedStyles.textPrimary.color}
        >
          {item.version ?? "?"}
        </Typography>
        <View style={themedStyles.badges}>
          {item.signed && (
            <View style={themedStyles.signedBadge}>
              <Typography
                type="caption"
                fontSize={11}
                color={themedStyles.success.color}
              >
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
          marginTop={4}
          color={themedStyles.textSecondary.color}
        >
          {item.description}
        </Typography>
      ) : null}

      <View style={themedStyles.metaGrid}>
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
          marginTop={8}
          color={themedStyles.textTertiary.color}
        >
          {item.uuid}
        </Typography>
      )}

      {item.inserted_at && (
        <Typography
          type="caption"
          fontSize={11}
          marginTop={4}
          color={themedStyles.textTertiary.color}
        >
          {new Date(item.inserted_at).toLocaleDateString()}
        </Typography>
      )}
    </Card>
  );

  return (
    <FlatList
      style={themedStyles.container}
      data={firmwares}
      keyExtractor={(item) => item.uuid ?? String(Math.random())}
      renderItem={renderFirmware}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      ListEmptyComponent={
        <EmptyView
          icon={
            <PackageIcon
              width={32}
              height={32}
              color={themedStyles.textTertiary.color}
            />
          }
          title="No Firmware"
          message="No firmware has been uploaded for this product."
        />
      }
      contentContainerStyle={
        isEmpty ? themedStyles.listEmpty : themedStyles.list
      }
      ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
      refreshControl={
        <RefreshControl
          refreshing={firmwareQuery.isRefetching}
          onRefresh={() => firmwareQuery.refetch()}
          tintColor={themedStyles.textTertiary.color}
        />
      }
    />
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  const themedStyles = useThemedStyles(createMetaStyles);
  return (
    <View style={themedStyles.metaItem}>
      <Typography
        type="caption"
        fontSize={11}
        color={themedStyles.textTertiary.color}
      >
        {label}
      </Typography>
      <Typography
        type="body"
        fontType="mono"
        fontWeight="500"
        fontSize={12}
        color={themedStyles.textSecondary.color}
      >
        {value}
      </Typography>
    </View>
  );
}

const createStyles = (colors: ColorTheme, spacing: Spacing) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      paddingTop: spacing[12],
      paddingBottom: 120,
      paddingHorizontal: spacing[18],
    },
    listEmpty: {
      // alignItems: "center",
      paddingTop: spacing[24],
      paddingHorizontal: spacing[24],
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    badges: {
      flexDirection: "row",
      gap: spacing[6],
    },
    signedBadge: {
      borderRadius: 4,
      paddingHorizontal: spacing[6],
      paddingVertical: 2,
      backgroundColor: colors.successSubtle,
    },
    metaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing[18],
      marginTop: spacing[6],
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
    success: {
      color: colors.success,
    },
  });

const createMetaStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    metaItem: {
      gap: 2,
    },
    textTertiary: {
      color: colors.textTertiary,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
  });

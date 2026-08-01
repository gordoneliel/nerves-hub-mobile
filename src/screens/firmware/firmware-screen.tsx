import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useThemedStyles from "../../theme/useThemedStyles";
import type { ColorTheme } from "../../theme/colors";
import { spacing, type Spacing } from "../../theme/spacing";
import { Typography } from "../../components/typography";
import { Card, EmptyView, ErrorView } from "../../components/ui";
import { FirmwareLoading } from "./firmware-loading";
import { useFirmware } from "../../hooks/useApi";
import { useOrgProduct } from "../../context/OrgProductContext";
import { useRefresh } from "../../hooks/useRefresh";
import type { Firmware } from "../../api/generated/schemas";

import PackageIcon from "../../../assets/icons/package.svg";

export default function FirmwareScreen() {
  const themedStyles = useThemedStyles(createStyles);
  const navigation = useNavigation<any>();
  const { orgId, productId } = useOrgProduct();
  const firmwareQuery = useFirmware();
  const { refreshing, onRefresh } = useRefresh(() => firmwareQuery.refetch());

  if (firmwareQuery.isLoading)
    return <FirmwareLoading />;
  if (firmwareQuery.isError)
    return (
      <ErrorView
        message="Failed to load firmware"
        onRetry={() => firmwareQuery.refetch()}
      />
    );

  const firmwares = firmwareQuery.data?.data ?? [];

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
      </View>

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
      ListHeaderComponent={
        <Typography
          type="body"
          fontSize={13}
          color={themedStyles.textSecondary.color}
          paddingBottom={spacing[18]}
        >
          {orgId} / {productId}
        </Typography>
      }
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
      refreshing={refreshing}
      onRefresh={onRefresh}
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

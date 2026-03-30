import React, { useLayoutEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { spacing } from "../../../components/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { Typography } from "../../../components/typography";
import { Card } from "../../../components/card";
import { Tag } from "../../../components/tag";
import { EmptyView, ErrorView, LoadingView } from "../../../components/ui";
import { useOrgProduct } from "../../../context/OrgProductContext";
import { useListDeviceCertificates } from "../../../api/generated/device-certificates/device-certificates";
import type { DeviceCertificate } from "../../../api/generated/schemas";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpired(notAfter?: string) {
  if (!notAfter) return false;
  return new Date(notAfter) < new Date();
}

export default function DeviceCertificatesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { orgId, productId } = useOrgProduct();
  const route = useRoute<any>();
  const identifier: string = route.params?.identifier ?? "";

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${identifier} Certificates` });
  }, [navigation, identifier]);

  const query = useListDeviceCertificates(
    orgId ?? "",
    productId ?? "",
    identifier,
    {
      query: {
        enabled: !!orgId && !!productId && !!identifier,
        staleTime: 30_000,
      },
    },
  );

  const certs = query.data?.data ?? [];

  if (query.isLoading) return <LoadingView message="Loading certificates..." />;
  if (query.isError)
    return (
      <ErrorView
        message="Failed to load device certificates"
        onRetry={() => query.refetch()}
      />
    );

  const renderCert = ({ item }: { item: DeviceCertificate }) => {
    const expired = isExpired(item.not_after);
    return (
      <Card>
        <View style={styles.row}>
          <View style={styles.info}>
            <Typography
              type="subheader"
              fontSize={14}
              fontWeight="600"
              fontType="mono"
              lineHeight={20}
              numberOfLines={1}
            >
              {item.serial}
            </Typography>
            <Typography
              type="body"
              fontSize={12}
              color={colors.textSecondary}
              marginTop={2}
            >
              Valid: {formatDate(item.not_before)} —{" "}
              {formatDate(item.not_after)}
            </Typography>
          </View>
          <Tag
            label={expired ? "Expired" : "Valid"}
            size="sm"
            colorScheme="white"
            hasBorder
          />
        </View>
      </Card>
    );
  };

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      data={certs}
      keyExtractor={(item) => item.serial ?? ""}
      renderItem={renderCert}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
      ListEmptyComponent={
        <EmptyView
          title="No Certificates"
          message="This device has no certificates."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  info: {
    flex: 1,
  },
});

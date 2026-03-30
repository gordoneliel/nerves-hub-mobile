import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card } from "../../components/card";
import { Tag } from "../../components/tag";
import { EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { useOrgProduct } from "../../context/OrgProductContext";
import { useListCACertificates } from "../../api/generated/ca-certificates/ca-certificates";
import type { CACertificate } from "../../api/generated/schemas";

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

export default function CACertificatesScreen() {
  const { colors } = useTheme();
  const { orgId } = useOrgProduct();

  const query = useListCACertificates(orgId ?? "", {
    query: { enabled: !!orgId, staleTime: 30_000 },
  });

  const certs = query.data?.data ?? [];

  if (query.isLoading) return <LoadingView message="Loading certificates..." />;
  if (query.isError)
    return (
      <ErrorView
        message="Failed to load CA certificates"
        onRetry={() => query.refetch()}
      />
    );

  const renderCert = ({ item }: { item: CACertificate }) => {
    const expired = isExpired(item.not_after);
    return (
      <Card>
        <View style={styles.row}>
          <View style={styles.info}>
            <Typography
              type="subheader"
              fontSize={16}
              fontWeight="600"
              lineHeight={22}
            >
              {item.description || `Serial ${item.serial}`}
            </Typography>
            <Typography
              type="body"
              fontSize={12}
              color={colors.textSecondary}
              marginTop={2}
            >
              Valid: {formatDate(item.not_before)} — {formatDate(item.not_after)}
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={certs}
        keyExtractor={(item) => String(item.serial ?? "")}
        renderItem={renderCert}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Typography
              type="header"
              fontSize={24}
              fontWeight="600"
              lineHeight={28}
              marginBottom={spacing.xs}
            >
              CA Certificates
            </Typography>
            <Typography
              type="body"
              fontSize={14}
              color={colors.textSecondary}
            >
              {orgId}
            </Typography>
          </View>
        }
        ListEmptyComponent={
          <EmptyView
            title="No CA Certificates"
            message="This organization has no CA certificates."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: 130,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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

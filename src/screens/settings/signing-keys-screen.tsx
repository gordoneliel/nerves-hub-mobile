import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card } from "../../components/card";
import { EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { useOrgProduct } from "../../context/OrgProductContext";
import { useListSigningKeys } from "../../api/generated/signing-keys/signing-keys";
import type { SigningKey } from "../../api/generated/schemas";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SigningKeysScreen() {
  const { colors } = useTheme();
  const { orgId } = useOrgProduct();

  const query = useListSigningKeys(orgId ?? "", {
    query: { enabled: !!orgId, staleTime: 30_000 },
  });

  const keys = query.data?.data ?? [];

  if (query.isLoading) return <LoadingView message="Loading signing keys..." />;
  if (query.isError)
    return (
      <ErrorView
        message="Failed to load signing keys"
        onRetry={() => query.refetch()}
      />
    );

  const renderKey = ({ item }: { item: SigningKey }) => (
    <Card>
      <Typography type="subheader" fontSize={16} fontWeight="600" lineHeight={22}>
        {item.name}
      </Typography>
      {item.key && (
        <Typography
          type="body"
          fontType="mono"
          fontSize={11}
          color={colors.textSecondary}
          marginTop={spacing.xs}
          numberOfLines={2}
          ellipsizeMode="middle"
        >
          {item.key}
        </Typography>
      )}
      <Typography
        type="caption"
        fontSize={11}
        color={colors.textTertiary}
        marginTop={spacing.xs}
      >
        Created {formatDate(item.inserted_at)}
      </Typography>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={keys}
        keyExtractor={(item) => item.name ?? ""}
        renderItem={renderKey}
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
              Signing Keys
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
            title="No Signing Keys"
            message="This organization has no signing keys."
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
});

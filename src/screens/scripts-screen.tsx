import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { spacing } from "../components/tokens";
import { useTheme } from "../theme/ThemeProvider";
import { Typography } from "../components/typography";
import { Card } from "../components/card";
import { EmptyView, ErrorView, LoadingView } from "../components/ui";
import { useScripts } from "../hooks/useApi";
import type { Script } from "../api/generated/schemas";

export default function ScriptsScreen() {
  const { colors } = useTheme();
  const scriptsQuery = useScripts();

  if (scriptsQuery.isLoading)
    return <LoadingView message="Loading scripts…" />;
  if (scriptsQuery.isError)
    return (
      <ErrorView
        message="Failed to load scripts"
        onRetry={() => scriptsQuery.refetch()}
      />
    );

  const scripts = scriptsQuery.data?.data ?? [];

  const renderScript = ({ item }: { item: Script }) => (
    <Card>
      <Typography type="subheader" fontSize={16} fontWeight="600">
        {item.name ?? "Untitled"}
      </Typography>

      {item.text ? (
        <Typography
          type="body"
          fontType="mono"
          fontSize={12}
          marginTop={spacing.xs}
          color={colors.textSecondary}
          numberOfLines={4}
        >
          {item.text}
        </Typography>
      ) : null}

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
      <Typography
        type="header"
        fontSize={24}
        fontWeight="600"
        lineHeight={28}
        marginBottom={4}
        paddingHorizontal={spacing.lg}
        paddingBottom={spacing.md}
      >
        Scripts
      </Typography>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={scripts}
        keyExtractor={(item) => String(item.id ?? item.name ?? Math.random())}
        renderItem={renderScript}
        ListHeaderComponent={renderListHeader}
        style={{ flex: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyView
              title="No Scripts"
              message="No support scripts have been created for this product."
            />
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    paddingTop: 120,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

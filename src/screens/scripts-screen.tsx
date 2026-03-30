import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { spacing } from "../components/tokens";
import { useTheme } from "../theme/ThemeProvider";
import { Typography } from "../components/typography";
import { Card } from "../components/card";
import { Tag } from "../components/tag";
import { EmptyView, ErrorView, LoadingView } from "../components/ui";
import { useScripts } from "../hooks/useApi";
import type { Script } from "../api/generated/schemas";

import SendIcon from "../../assets/icons/send.svg";

export default function ScriptsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const scriptsQuery = useScripts();

  if (scriptsQuery.isLoading) return <LoadingView message="Loading scripts…" />;
  if (scriptsQuery.isError)
    return (
      <ErrorView
        message="Failed to load scripts"
        onRetry={() => scriptsQuery.refetch()}
      />
    );

  const scripts = scriptsQuery.data?.data ?? [];

  const renderScript = ({ item }: { item: Script }) => (
    <Card onPress={() => navigation.navigate("RunScript", { script: item })}>
      <View style={styles.cardHeader}>
        <Typography
          type="subheader"
          fontSize={16}
          fontWeight="600"
          flexShrink={1}
        >
          {item.name ?? "Untitled"}
        </Typography>
        <Tag
          label="Run"
          size="sm"
          colorScheme="white"
          hasBorder
          iconLeft={{
            component: SendIcon,
            props: { width: 10, height: 10, color: colors.accent },
          }}
        />
      </View>

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
        paddingBottom={spacing.md}
      >
        Scripts
      </Typography>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      data={scripts}
      keyExtractor={(item) => String(item.id ?? item.name ?? Math.random())}
      renderItem={renderScript}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={scriptsQuery.isRefetching}
          onRefresh={() => scriptsQuery.refetch()}
          tintColor={colors.textTertiary}
        />
      }
      ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <EmptyView
            title="No Scripts"
            message="No support scripts have been created for this product."
          />
        </View>
      }
      contentContainerStyle={[styles.list, scripts.length === 0 && styles.listEmpty]}
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
  listEmpty: {
    flexGrow: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

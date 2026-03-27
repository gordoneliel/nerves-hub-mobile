import React, { useLayoutEffect } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { spacing } from "../../components/tokens";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card, EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { Tag } from "../../components/tag";
import { useDeployments } from "../../hooks/useApi";
import type { DeploymentGroup } from "../../api/generated/schemas";
import CheckCircleIcon from "../../../assets/icons/check-circle.svg";
import CloseIcon from "../../../assets/icons/close-big.svg";

export default function DeploymentsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const deploymentsQuery = useDeployments();

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerRightItems: () => [
        {
          type: "button",
          icon: { type: "sfSymbol", name: "plus" },
          onPress: () => navigation.navigate("NewDeployment"),
        },
      ],
    });
  }, [navigation]);

  if (deploymentsQuery.isLoading)
    return <LoadingView message="Loading deployments…" />;
  if (deploymentsQuery.isError)
    return (
      <ErrorView
        message="Failed to load deployments"
        onRetry={() => deploymentsQuery.refetch()}
      />
    );

  const deployments = [...(deploymentsQuery.data?.data ?? [])].sort((a, b) => {
    if (a.is_active && !b.is_active) return -1;
    if (!a.is_active && b.is_active) return 1;
    return 0;
  });

  const renderDeployment = ({ item }: { item: DeploymentGroup }) => {
    const isActive = item.is_active ?? item.state === "on";
    const tags = item.conditions?.tags ?? [];

    return (
      <Card
        onPress={() =>
          navigation.navigate("DeploymentDetail", { deployment: item })
        }
      >
        <View style={styles.headerRow}>
          <Typography
            fontSize={16}
            fontWeight="600"
            lineHeight={28}
            color={colors.textPrimary}
          >
            {item.name}
          </Typography>
          <Tag
            label={isActive ? "Active" : "Inactive"}
            colorScheme="white"
            adjustIconPadding
            hasBorder
            size="sm"
            iconLeft={{
              component: isActive ? CheckCircleIcon : CloseIcon,
              props: {
                width: isActive ? 16 : 14,
                height: isActive ? 16 : 14,
                color: isActive ? "#9ACD32" : "#E0E3E6",
                fill: isActive ? "#9ACD32" : "#E0E3E6",
              },
            }}
          />
        </View>

        {item.firmware?.version && (
          <View style={styles.firmwareRow}>
            <Typography
              type="caption"
              fontSize={11}
              color={colors.textTertiary}
            >
              Firmware
            </Typography>
            <Typography
              type="body"
              fontType="mono"
              fontSize={12}
              color={colors.textSecondary}
            >
              v{item.firmware.version}
            </Typography>
          </View>
        )}

        {item.firmware?.platform && (
          <View style={styles.conditionRow}>
            <Typography
              type="caption"
              fontSize={11}
              color={colors.textTertiary}
            >
              Platform
            </Typography>
            <Typography
              type="body"
              fontType="mono"
              fontSize={12}
              color={colors.textSecondary}
            >
              {item.firmware.platform}
            </Typography>
          </View>
        )}

        {item.firmware?.architecture && (
          <View style={styles.conditionRow}>
            <Typography
              type="caption"
              fontSize={11}
              color={colors.textTertiary}
            >
              Architecture
            </Typography>
            <Typography
              type="body"
              fontType="mono"
              fontSize={12}
              color={colors.textSecondary}
            >
              {item.firmware.architecture}
            </Typography>
          </View>
        )}

        {item.conditions?.version && (
          <View style={styles.conditionRow}>
            <Typography
              type="caption"
              fontSize={11}
              color={colors.textTertiary}
            >
              Version
            </Typography>
            <Typography
              type="body"
              fontType="mono"
              fontSize={12}
              color={colors.textSecondary}
            >
              {item.conditions.version}
            </Typography>
          </View>
        )}

        <View style={styles.bottomInfoRow}>
        <Typography
          type="body"
          fontSize={12}
          marginTop={spacing.sm}
          color={colors.textTertiary}
        >
          {item.device_count ?? 0} device
          {(item.device_count ?? 0) !== 1 ? "s" : ""}
        </Typography>

        <Typography
          type="body"
          fontSize={12}
          marginTop={spacing.sm}
          color={colors.textTertiary}
        >
          {item.releases_count ?? 0} release
          {(item.releases_count ?? 0) !== 1 ? "s" : ""}
        </Typography>
        </View>

        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <Tag
                key={tag}
                label={`#${tag}`}
                size="sm"
                colorScheme="white"
                hasBorder
              />
            ))}
          </View>
        )}
      </Card>
    );
  };

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
            Deployments
          </Typography>
          {deployments.length > 0 && (
            <View style={{backgroundColor: colors.backgroundTertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8}}>
            <Typography type="body" fontSize={15} color={colors.textTertiary}>
              {deployments.length}
            </Typography>
            </View>
          )}
        </View>
        <Typography type="body" fontSize={13} color={colors.textTertiary}>
          Manage firmware rollout to groups of devices
        </Typography>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        style={{ flex: 1 }}
        data={deployments}
        keyExtractor={(item) => String(item.id ?? item.name)}
        renderItem={renderDeployment}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          <EmptyView
            title="No Deployments"
            message="No deployment groups exist for this product."
          />
        }
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
        refreshControl={
          <RefreshControl
            refreshing={deploymentsQuery.isRefetching}
            onRefresh={() => deploymentsQuery.refetch()}
            tintColor={colors.textTertiary}
            progressViewOffset={120}
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
    paddingTop: 120,
    paddingBottom: 120,
    flexGrow: 1
  },
  listHeader: {
    paddingHorizontal: spacing.lg,
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
  firmwareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  bottomInfoRow: {
    flexDirection: "row",
    gap: 6
  }
});

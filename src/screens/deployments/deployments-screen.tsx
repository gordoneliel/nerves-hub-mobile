import { useLayoutEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useThemedStyles from "../../theme/useThemedStyles";
import type { ColorTheme } from "../../theme/colors";
import type { Spacing } from "../../theme/spacing";
import { Typography } from "../../components/typography";
import { Card, EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { Tag } from "../../components/tag";
import { useDeployments } from "../../hooks/useApi";
import { useRefresh } from "../../hooks/useRefresh";
import type { DeploymentGroup } from "../../api/generated/schemas";
import CheckCircleIcon from "../../../assets/icons/check-circle.svg";
import CloseIcon from "../../../assets/icons/close-big.svg";
import RocketIcon from "../../../assets/icons/rocket.svg";

export default function DeploymentsScreen() {
  const themedStyles = useThemedStyles(createStyles);
  const navigation = useNavigation<any>();
  const deploymentsQuery = useDeployments();
  const { refreshing, onRefresh } = useRefresh(() => deploymentsQuery.refetch());

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
        <View style={themedStyles.headerRow}>
          <Typography
            fontSize={16}
            fontWeight="600"
            lineHeight={28}
            color={themedStyles.textPrimary.color}
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
          <View style={themedStyles.firmwareRow}>
            <Typography
              type="caption"
              fontSize={11}
              color={themedStyles.textTertiary.color}
            >
              Firmware
            </Typography>
            <Typography
              type="body"
              fontType="mono"
              fontSize={12}
              color={themedStyles.textSecondary.color}
            >
              v{item.firmware.version}
            </Typography>
          </View>
        )}

        {item.firmware?.platform && (
          <View style={themedStyles.conditionRow}>
            <Typography
              type="caption"
              fontSize={11}
              color={themedStyles.textTertiary.color}
            >
              Platform
            </Typography>
            <Typography
              type="body"
              fontType="mono"
              fontSize={12}
              color={themedStyles.textSecondary.color}
            >
              {item.firmware.platform}
            </Typography>
          </View>
        )}

        {item.firmware?.architecture && (
          <View style={themedStyles.conditionRow}>
            <Typography
              type="caption"
              fontSize={11}
              color={themedStyles.textTertiary.color}
            >
              Architecture
            </Typography>
            <Typography
              type="body"
              fontType="mono"
              fontSize={12}
              color={themedStyles.textSecondary.color}
            >
              {item.firmware.architecture}
            </Typography>
          </View>
        )}

        {item.conditions?.version && (
          <View style={themedStyles.conditionRow}>
            <Typography
              type="caption"
              fontSize={11}
              color={themedStyles.textTertiary.color}
            >
              Version
            </Typography>
            <Typography
              type="body"
              fontType="mono"
              fontSize={12}
              color={themedStyles.textSecondary.color}
            >
              {item.conditions.version}
            </Typography>
          </View>
        )}

        <View style={themedStyles.bottomInfoRow}>
          <Typography
            type="body"
            fontSize={12}
            marginTop={8}
            color={themedStyles.textTertiary.color}
          >
            {item.device_count ?? 0} device
            {(item.device_count ?? 0) !== 1 ? "s" : ""}
          </Typography>

          <Typography
            type="body"
            fontSize={12}
            marginTop={8}
            color={themedStyles.textTertiary.color}
          >
            {item.releases_count ?? 0} release
            {(item.releases_count ?? 0) !== 1 ? "s" : ""}
          </Typography>
        </View>

        {tags.length > 0 && (
          <View style={themedStyles.tagsRow}>
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

  const isEmpty = deployments.length <= 0;

  return (
    <FlatList
      style={themedStyles.container}
      data={deployments}
      keyExtractor={(item) => String(item.id ?? item.name)}
      renderItem={renderDeployment}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      ListEmptyComponent={
        <EmptyView
          icon={
            <RocketIcon
              width={32}
              height={32}
              color={themedStyles.textTertiary.color}
            />
          }
          title="No Deployments"
          message="No deployment groups exist for this product."
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
    firmwareRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[6],
      marginTop: spacing[6],
    },
    conditionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[6],
      marginTop: spacing[4],
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing[4],
      marginTop: spacing[6],
    },
    bottomInfoRow: {
      flexDirection: "row",
      gap: 6,
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

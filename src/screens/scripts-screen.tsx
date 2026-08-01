import React, { useLayoutEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useThemedStyles from "../theme/useThemedStyles";
import type { ColorTheme } from "../theme/colors";
import { spacing, type Spacing } from "../theme/spacing";
import { Typography } from "../components/typography";
import { Card } from "../components/card";
import { Tag } from "../components/tag";
import { EmptyView, ErrorView } from "../components/ui";
import { ScriptsLoading } from "./scripts-loading";
import { useScripts } from "../hooks/useApi";
import { useOrgProduct } from "../context/OrgProductContext";
import { useRefresh } from "../hooks/useRefresh";
import type { SupportScriptMinimal } from "../api/generated/schemas";

import SendIcon from "../../assets/icons/send.svg";
import ScriptIcon from "../../assets/icons/script.svg";

export default function ScriptsScreen() {
  const themedStyles = useThemedStyles(createStyles);
  const navigation = useNavigation<any>();
  const { orgId, productId } = useOrgProduct();
  const scriptsQuery = useScripts();
  const { refreshing, onRefresh } = useRefresh(() => scriptsQuery.refetch());

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerRightItems: () => [
        {
          type: "button",
          icon: { type: "sfSymbol", name: "plus" },
          onPress: () => navigation.navigate("ScriptEditor", {}),
        },
      ],
    });
  }, [navigation]);

  if (scriptsQuery.isLoading) return <ScriptsLoading />;
  if (scriptsQuery.isError)
    return (
      <ErrorView
        message="Failed to load scripts"
        onRetry={() => scriptsQuery.refetch()}
      />
    );

  const scripts = scriptsQuery.data?.data ?? [];

  const renderScript = ({ item }: { item: SupportScriptMinimal }) => (
    <Card onPress={() => navigation.navigate("RunScript", { scriptId: item.id })}>
      <View style={themedStyles.cardHeader}>
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
            props: { width: 10, height: 10, color: themedStyles.accent.color },
          }}
        />
      </View>

      {item.tags ? (
        <Typography
          type="body"
          fontType="mono"
          fontSize={12}
          marginTop={4}
          color={themedStyles.textSecondary.color}
          numberOfLines={2}
        >
          {item.tags}
        </Typography>
      ) : null}
    </Card>
  );

  return (
    <FlatList
      style={themedStyles.container}
      data={scripts}
      keyExtractor={(item) => String(item.id ?? item.name ?? Math.random())}
      renderItem={renderScript}
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
      refreshing={refreshing}
      onRefresh={onRefresh}
      ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
      ListEmptyComponent={
        <EmptyView
          icon={
            <ScriptIcon
              width={32}
              height={32}
              color={themedStyles.textTertiary.color}
            />
          }
          title="No Scripts"
          message="No support scripts have been created for this product."
        />
      }
      contentContainerStyle={
        scripts.length <= 0 ? themedStyles.listEmpty : themedStyles.list
      }
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
      paddingBottom: 120,
      paddingHorizontal: spacing[18],
    },
    listEmpty: {
      // alignItems: "center",
      // paddingTop: spacing[24],
      paddingHorizontal: spacing[24],
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    accent: {
      color: colors.accent,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textTertiary: {
      color: colors.textTertiary,
    },
  });

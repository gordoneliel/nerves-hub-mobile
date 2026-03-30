import React, { useLayoutEffect, useMemo, useState } from "react";
import { SectionList, StyleSheet, View } from "react-native";

import { spacing } from "../components/tokens";
import { Card } from "../components/card";
import { useTheme } from "../theme/ThemeProvider";
import { Typography } from "../components/typography";
import { SearchInput } from "../components/search-input";
import { EmptyView, ErrorView, LoadingView } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useOrgProduct } from "../context/OrgProductContext";
import { useListOrgs } from "../api/generated/organizations/organizations";
import { useNavigation } from "@react-navigation/native";

import StackIcon from "../../assets/icons/stack.svg";

export default function OrgProductSelector() {
  const { colors } = useTheme();
  const { token } = useAuth();
  const navigation = useNavigation();
  const { selectOrgAndProduct, orgId, productId } = useOrgProduct();
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerRightItems: () => [
        {
          type: "button",
          icon: { type: "sfSymbol", name: "xmark" },
          onPress: () => navigation.goBack(),
        },
      ],
    });
  }, [navigation]);

  const { data, isLoading, isError, refetch } = useListOrgs(
    { include: "products" },
    { query: { enabled: !!token, staleTime: 30_000 } },
  );

  const orgs = data?.data ?? [];

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? orgs.filter((org) => org.name?.toLowerCase().includes(q))
      : orgs;
    return filtered.map((org) => ({
      title: org.name ?? "",
      orgName: org.name ?? "",
      data: org.products ?? [],
    }));
  }, [orgs, search]);

  return (
    <SectionList
      style={[styles.container, { backgroundColor: colors.background }]}
      sections={
        isLoading || isError || (sections.length === 0 && !search)
          ? []
          : sections
      }
      keyExtractor={(item, index) => `${item.name}-${index}`}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      stickySectionHeadersEnabled={false}
      keyboardShouldPersistTaps="always"
      ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
      ListHeaderComponent={
        orgs.length > 1 ? (
          <View style={styles.inputContainer}>
            <SearchInput
              placeholder="Filter organizations"
              autoCapitalize="none"
              onChangeText={setSearch}
            />
          </View>
        ) : null
      }
      ListEmptyComponent={
        isLoading ? (
          <LoadingView message="Loading..." />
        ) : isError ? (
          <ErrorView message="Failed to load organizations" onRetry={refetch} />
        ) : search ? (
          <EmptyView
            title="No Results"
            message={`No organizations matching "${search}".`}
          />
        ) : sections.length === 0 ? (
          <EmptyView
            title="No Organizations"
            message="You don't belong to any organizations yet."
          />
        ) : null
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Typography
            type="caption"
            fontSize={13}
            textTransform="uppercase"
            letterSpacing={1}
            fontWeight={500}
            color={colors.textTertiary}
          >
            {section.title}
          </Typography>
          <Typography type="caption" fontSize={14} color={colors.textCaption}>
            {section.data.length}{" "}
            {section.data.length === 1 ? "product" : "products"}
          </Typography>
        </View>
      )}
      renderItem={({ item: product, section }) => {
        const isSelected =
          section.orgName === orgId && product.name === productId;
        return (
          <Card
            onPress={() => {
              selectOrgAndProduct(section.orgName, product.name ?? "");
              navigation.goBack();
            }}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <StackIcon
                  width={18}
                  height={18}
                  color={isSelected ? colors.accent : colors.textTertiary}
                />
                <Typography
                  type="subheader"
                  fontSize={16}
                  fontWeight="600"
                  lineHeight={24}
                  color={isSelected ? colors.accent : colors.textPrimary}
                >
                  {product.name}
                </Typography>
              </View>
              <Typography
                type="header"
                fontSize={22}
                color={colors.textTertiary}
              >
                ›
              </Typography>
            </View>
          </Card>
        );
      }}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? (
          <Typography
            type="body"
            fontSize={13}
            paddingHorizontal={spacing.lg}
            paddingVertical={spacing.sm}
            color={colors.textTertiary}
          >
            No products
          </Typography>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
});

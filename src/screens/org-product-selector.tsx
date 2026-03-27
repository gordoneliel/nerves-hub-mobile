import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing } from "../components/tokens";
import { Card } from "../components/card";
import { useTheme } from "../theme/ThemeProvider";
import { Typography } from "../components/typography";
import { SearchInput } from "../components/search-input";
import { Button } from "../components/button";
import { EmptyView, ErrorView, LoadingView } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useOrgProduct } from "../context/OrgProductContext";
import { useListOrgs } from "../api/generated/organizations/organizations";
import { useNavigation } from "@react-navigation/native";
import type { Product } from "../api/generated/schemas";

export default function OrgProductSelector() {
  const { colors } = useTheme();
  const { token, logout } = useAuth();
  const navigation = useNavigation();
  const { selectOrgAndProduct, resetOrgAndProduct } = useOrgProduct();

  const handleLogout = useCallback(() => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          resetOrgAndProduct();
          await logout();
        },
      },
    ]);
  }, [logout, resetOrgAndProduct]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "",
      headerTransparent: true,
      headerRight: () => (
        <Button
          label="Log out"
          size="xs"
          onPress={handleLogout}
        />
      ),
    });
  }, [navigation, handleLogout]);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useListOrgs(
    { include: "products" },
    { query: { enabled: !!token, staleTime: 30_000 } },
  );

  const orgs = data?.data ?? [];

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? orgs.filter((org) => org.name?.toLowerCase().includes(q)) : orgs;
    return filtered.map((org) => ({
      title: org.name ?? "",
      orgName: org.name ?? "",
      data: org.products ?? [],
    }));
  }, [orgs, search]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Typography type="header" fontSize={26} fontWeight="600" lineHeight={28} paddingBottom={spacing.md}>
          Select Product
        </Typography>
      </View>

      {isLoading ? (
        <LoadingView message="Loading organizations…" />
      ) : isError ? (
        <ErrorView message="Failed to load organizations" onRetry={refetch} />
      ) : sections.length === 0 && !search ? (
        <EmptyView
          title="No Organizations"
          message="You don't belong to any organizations yet."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
          ListHeaderComponent={
            orgs.length > 1 ? (
              <View style={styles.inputContainer}>
                <SearchInput placeholder="Filter organizations"  autoCapitalize="none" onChangeText={setSearch} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            search ? (
              <EmptyView
                title="No Results"
                message={`No organizations matching "${search}".`}
              />
            ) : null
          }
          renderSectionHeader={({ section }) => (
            <Typography
              type="caption"
              fontSize={11}
              textTransform="uppercase"
              letterSpacing={1}
              paddingHorizontal={spacing.lg}
              paddingTop={spacing.md}
              paddingBottom={spacing.xs}
              color={colors.textTertiary}
            >
              {section.title}
            </Typography>
          )}
          renderItem={({ item: product, section }) => (
            <Card
              onPress={() => {
                selectOrgAndProduct(section.orgName, product.name ?? "");
                navigation.goBack();
              }}
            >
              <View style={styles.cardContent}>
                <Typography type="subheader" fontSize={18} fontWeight="600" lineHeight={28}>
                  {product.name}
                </Typography>
                <Typography type="header" fontSize={26} color={colors.textTertiary}>
                  ›
                </Typography>
              </View>
            </Card>
          )}
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

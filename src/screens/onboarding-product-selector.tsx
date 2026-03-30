import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  SectionList,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";

import { spacing } from "../components/tokens";
import { Card } from "../components/card";
import { useTheme } from "../theme/ThemeProvider";
import { Typography } from "../components/typography";
import { SearchInput } from "../components/search-input";
import { Button } from "../components/button";
import { EmptyView, ErrorView, LoadingView } from "../components/ui";
import { NervesHubLogo } from "../components/NervesHubLogo";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useOrgProduct } from "../context/OrgProductContext";
import { useListOrgs } from "../api/generated/organizations/organizations";
import { customInstance } from "../api/mutator/custom-instance";

import StackIcon from "../../assets/icons/stack.svg";

export default function OnboardingProductSelector() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { token, logout } = useAuth();
  const { selectOrgAndProduct, resetOrgAndProduct } = useOrgProduct();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  // Animated logo
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(10);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.back(1.5)),
    });
    logoOpacity.value = withTiming(1, { duration: 400 });
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    titleTranslateY.value = withDelay(
      200,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }),
    );
    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

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
      headerTransparent: true,
      title: "",
      unstable_headerRightItems: () => [
        {
          type: "button",
          label: "Log out",
          icon: { type: "sfSymbol", name: "rectangle.portrait.and.arrow.right" },
          onPress: handleLogout,
        },
      ],
    });
  }, [navigation, handleLogout]);

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

  const handleCreateProduct = useCallback(() => {
    const firstOrg = orgs[0]?.name;
    if (!firstOrg) return;
    Alert.prompt(
      "New Product",
      `Create a product in ${firstOrg}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: async (name?: string) => {
            const trimmed = name?.trim();
            if (!trimmed) return;
            try {
              await customInstance({
                url: `/orgs/${firstOrg}/products`,
                method: "POST",
                data: { name: trimmed },
              });
              refetch();
            } catch (err: any) {
              const msg =
                err?.response?.data?.errors ||
                err?.message ||
                "Failed to create product.";
              Alert.alert(
                "Error",
                typeof msg === "string" ? msg : JSON.stringify(msg),
              );
            }
          },
        },
      ],
      "plain-text",
      "",
      "default",
    );
  }, [orgs, refetch]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[
          `${colors.accent}50`,
          `${colors.accent}25`,
          `${colors.accent}05`,
          "transparent",
        ]}
        style={styles.gradientFixed}
      />
      {isLoading ? (
        <LoadingView message="Loading organizations..." />
      ) : isError ? (
        <ErrorView message="Failed to load organizations" onRetry={refetch} />
      ) : sections.length === 0 && !search ? (
        <View style={styles.emptyCenter}>
          <EmptyView
            title="No Organizations"
            message="You don't belong to any organizations yet."
          />
        </View>
      ) : sections.every((s) => s.data.length === 0) && !search ? (
        <View style={styles.emptyCenter}>
          <EmptyView
            title="No Products"
            message="Your organizations don't have any products yet."
            action={
              <Button
                label="Create Product"
                type="primary"
                size="md"
                fullWidth
                onPress={handleCreateProduct}
                iconLeft={<StackIcon width={16} height={16} color="#fff" />}
              />
            }
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <Animated.View
                style={[
                  styles.logoRow,
                  { paddingTop: insets.top },
                  logoAnimStyle,
                ]}
              >
                <NervesHubLogo size={42} />
              </Animated.View>
              <Animated.View style={titleAnimStyle}>
                <Typography
                  type="header"
                  fontSize={26}
                  fontWeight="600"
                  lineHeight={32}
                  paddingBottom={spacing.xs}
                >
                  Select a Product
                </Typography>
              </Animated.View>
              <Animated.View style={subtitleAnimStyle}>
                <Typography
                  type="body"
                  fontSize={14}
                  color={colors.textSecondary}
                  lineHeight={20}
                  paddingBottom={spacing.lg}
                >
                  Choose the product you want to manage, you can always switch
                  later.
                </Typography>
              </Animated.View>
              {orgs.length > 1 ? (
                <View style={styles.inputContainer}>
                  <SearchInput
                    placeholder="Filter organizations"
                    autoCapitalize="none"
                    onChangeText={setSearch}
                  />
                </View>
              ) : null}
            </View>
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
              <Typography
                type="caption"
                fontSize={14}
                color={colors.textCaption}
              >
                {section.data.length}{" "}
                {section.data.length === 1 ? "product" : "products"}
              </Typography>
            </View>
          )}
          renderItem={({ item: product, section }) => (
            <Card
              style={{ marginHorizontal: spacing.lg }}
              onPress={() =>
                selectOrgAndProduct(section.orgName, product.name ?? "")
              }
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <StackIcon width={18} height={18} color={colors.accent} />
                  <Typography
                    type="subheader"
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={24}
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

      {/*<View style={styles.footer}>
        <Button
          label="Log out"
          type="tertiary"
          size="lg"
          fullWidth
          onPress={handleLogout}
        />
      </View>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  gradientFixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 450,
    zIndex: 0,
  },
  logoRow: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    paddingBottom: spacing.md,
  },
  list: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});

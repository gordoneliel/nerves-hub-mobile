import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  isLiquidGlassSupported,
  LiquidGlassContainerView,
} from "@callstack/liquid-glass";

import { spacing } from "../../../components/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { Typography } from "../../../components/typography";
import { EmptyView, ErrorView, LoadingView } from "../../../components/ui";
import { useOrgProduct } from "../../../context/OrgProductContext";
import { useInfiniteDevices } from "../../../hooks/useApi";
import { useDevicesChannel } from "../../../hooks/useDevicesChannel";
import {
  useRebootDevice,
  useReconnectDevice,
} from "../../../api/generated/devices/devices";
import { customInstance } from "../../../api/mutator/custom-instance";
import type { Device } from "../../../api/generated/schemas";
import { Button } from "../../../components/button";
// import { SearchInput } from "../../../components/search-input";
import { Dropdown, type DropDownItem } from "../../../components/dropdown";
import { ARCHITECTURES } from "../../../utils/architectures";
import { DeviceCard, type DeviceMenuAction } from "./device-card";
import { DevicesLoading } from "./devices-loading";

import SwitchIcon from "../../../../assets/icons/products.svg";
import StarOutlineIcon from "../../../../assets/icons/star-outline.svg";
import SearchIcon from "../../../../assets/icons/search.svg";
import RadioTowerIcon from "../../../../assets/icons/radio-tower.svg";
import PlatformIcon from "../../../../assets/icons/platform.svg";
import CogIcon from "../../../../assets/icons/cog.svg";
import StackIcon from "../../../../assets/icons/stack.svg";

type ListHeaderProps = {
  orgId: string | null;
  productId: string | null;
  colors: any;
  statusItems: DropDownItem<string>[];
  platformItems: DropDownItem<string>[];
  deploymentItems: DropDownItem<string>[];
  architectureItems: DropDownItem<string>[];
  onStatusFilter: (value: string | null) => void;
  onPlatformFilter: (value: string | null) => void;
  onDeploymentFilter: (value: string | null) => void;
  onArchitectureFilter: (value: string | null) => void;
};

const ListHeader = React.memo(function ListHeader({
  orgId,
  productId,
  colors,
  statusItems,
  platformItems,
  deploymentItems,
  architectureItems,
  onStatusFilter,
  onPlatformFilter,
  onDeploymentFilter,
  onArchitectureFilter,
}: ListHeaderProps) {
  return (
    <>
      <View style={styles.headerContent}>
        <Typography
          type="header"
          fontSize={24}
          fontWeight="600"
          lineHeight={28}
          marginBottom={4}
        >
          Devices
        </Typography>
        <Typography type="body" fontSize={14} color={colors.textSecondary}>
          {orgId} / {productId}
        </Typography>
      </View>
      {/*<View style={styles.searchWrapper}>
        <SearchInput placeholder="Search devices" />
      </View>*/}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        <Dropdown
          label="Status"
          items={statusItems}
          placeholderLabel="Status"
          icon={
            <RadioTowerIcon
              width={16}
              height={16}
              color={colors.textTertiary}
            />
          }
          size="xs"
          fullWidth={false}
          pill
          onSelect={(item) => onStatusFilter(item.value || null)}
        />
        <Dropdown
          label="Platform"
          items={platformItems}
          placeholderLabel="Platform"
          icon={
            <PlatformIcon width={14} height={14} color={colors.textTertiary} />
          }
          size="xs"
          fullWidth={false}
          pill
          onSelect={(item) => onPlatformFilter(item.value || null)}
        />
        <Dropdown
          label="Arch"
          items={architectureItems}
          placeholderLabel="Arch"
          icon={<CogIcon width={14} height={14} color={colors.textTertiary} />}
          size="xs"
          fullWidth={false}
          pill
          onSelect={(item) => onArchitectureFilter(item.value || null)}
        />
        <Dropdown
          label="Deployment"
          items={deploymentItems}
          placeholderLabel="Deployment"
          icon={
            <StackIcon width={14} height={14} color={colors.textTertiary} />
          }
          size="xs"
          fullWidth={false}
          pill
          onSelect={(item) => onDeploymentFilter(item.value || null)}
        />
      </ScrollView>
    </>
  );
});

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function DevicesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { orgId, productId } = useOrgProduct();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const devicesQuery = useInfiniteDevices(debouncedSearch || undefined);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [deploymentFilter, setDeploymentFilter] = useState<string | null>(null);
  const [architectureFilter, setArchitectureFilter] = useState<string | null>(
    null,
  );

  // Real-time updates
  useDevicesChannel();

  function navigateToOrgProductSwitcher() {
    navigation.navigate("OrgProductModal");
  }

  const HeaderLeft = useMemo(() => {
    if (isLiquidGlassSupported) {
      return () => (
        <TouchableOpacity onPress={navigateToOrgProductSwitcher}>
          <SwitchIcon
            pointerEvents="none"
            width={22}
            height={22}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      );
    }

    return () => (
      <Button
        type="icon"
        size="xs"
        iconLeft={
          <SwitchIcon width={18} height={18} color={colors.textPrimary} />
        }
        onPress={navigateToOrgProductSwitcher}
      />
    );
  }, [navigateToOrgProductSwitcher]);

  function navigateToPinnedDevices() {
    navigation.navigate("PinnedDevices");
  }

  const HeaderRight = useMemo(() => {
    if (isLiquidGlassSupported) {
      return () => (
        <LiquidGlassContainerView style={styles.barItemGroup}>
          <TouchableOpacity onPress={navigateToPinnedDevices}>
            <SearchIcon
              pointerEvents="none"
              width={22}
              height={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          ]
        </LiquidGlassContainerView>
      );
    }

    return () => (
      <Button
        type="icon"
        size="xs"
        iconLeft={
          <StarOutlineIcon width={18} height={18} color={colors.textPrimary} />
        }
        onPress={navigateToPinnedDevices}
      />
    );
  }, [navigateToPinnedDevices]);

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerLeftItems: () => [
        {
          type: "button",
          icon: {
            type: "sfSymbol",
            name: "repeat",
          },
          onPress: navigateToOrgProductSwitcher,
        },
      ],
      unstable_headerRightItems: () => [
        {
          type: "button",
          icon: {
            type: "sfSymbol",
            name: "plus",
          },
          onPress: () => {
            navigation.navigate("NewDevice");
          },
        },
        {
          type: "button",
          icon: {
            type: "sfSymbol",
            name: "magnifyingglass",
          },
          onPress: () => {
            navigation.navigate("DeviceSearch");
          },
        },
        // {
        //   type: "button",
        //   label: "Pinned",
        //   icon: {
        //     type: "sfSymbol",
        //     name: "star",
        //     fill: "red",
        //   },
        //   onPress: navigateToPinnedDevices,
        // },
      ],
    });
  }, [navigation, HeaderLeft, HeaderRight]);

  const reboot = useRebootDevice();
  const reconnect = useReconnectDevice();

  const handleMenuAction = useCallback(
    (device: Device, action: DeviceMenuAction) => {
      const identifier = String(device.identifier!);
      const confirm = (label: string, onConfirm: () => void) =>
        Alert.alert(
          label,
          `Are you sure you want to ${label.toLowerCase()} this device?`,
          [
            { text: "Cancel", style: "cancel" },
            { text: label, style: "destructive", onPress: onConfirm },
          ],
        );

      switch (action) {
        case "reboot":
          confirm(`Reboot ${identifier}`, () =>
            reboot.mutate(
              { orgName: orgId!, productName: productId!, identifier },
              {
                onSuccess: () => Alert.alert("Success", "Reboot command sent."),
                onError: () => Alert.alert("Error", "Failed to reboot device."),
              },
            ),
          );
          break;
        case "reconnect":
          confirm(`Reconnect ${identifier}`, () =>
            reconnect.mutate(
              { orgName: orgId!, productName: productId!, identifier },
              {
                onSuccess: () =>
                  Alert.alert("Success", "Reconnect command sent."),
                onError: () =>
                  Alert.alert("Error", "Failed to reconnect device."),
              },
            ),
          );
          break;
        case "identify":
          confirm(`Identify ${identifier}`, () =>
            customInstance({
              url: `/orgs/${orgId}/products/${productId}/devices/${identifier}/identify`,
              method: "POST",
            })
              .then(() => Alert.alert("Success", "Identify command sent."))
              .catch(() => Alert.alert("Error", "Failed to identify device.")),
          );
          break;
        case "tags": {
          const tagList = Array.isArray(device.tags)
            ? device.tags
            : typeof device.tags === "string"
              ? device.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [];
          navigation.navigate("EditDeviceTags", {
            identifier,
            currentTags: tagList,
          });
          break;
        }
        case "delete":
          Alert.alert(
            `Delete ${identifier}`,
            "Are you sure? This cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () =>
                  customInstance({
                    url: `/orgs/${orgId}/products/${productId}/devices/${identifier}`,
                    method: "DELETE",
                  })
                    .then(() => {
                      devicesQuery.refetch();
                    })
                    .catch(() =>
                      Alert.alert("Error", "Failed to delete device."),
                    ),
              },
            ],
          );
          break;
      }
    },
    [orgId, productId, reboot, reconnect, navigation, devicesQuery],
  );

  const allDevices =
    devicesQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  // Derive filter options from loaded devices
  const statusItems = useMemo<DropDownItem<string>[]>(
    () => [
      { id: "all", label: "All statuses", value: null as any },
      { id: "connected", label: "Online", value: "connected" },
      { id: "disconnected", label: "Offline", value: "disconnected" },
    ],
    [],
  );

  const platformItems = useMemo<DropDownItem<string>[]>(() => {
    const platforms = new Set(
      allDevices
        .map((d) => d.firmware_metadata?.platform)
        .filter(Boolean) as string[],
    );
    return [
      { id: "all", label: "All platforms", value: null as any },
      ...[...platforms].map((p) => ({ id: p, label: p, value: p })),
    ];
  }, [allDevices]);

  const deploymentItems = useMemo<DropDownItem<string>[]>(() => {
    const groups = new Set(
      allDevices
        .map((d) => d.deployment_group?.name)
        .filter(Boolean) as string[],
    );
    return [
      { id: "all", label: "All deployments", value: null as any },
      ...[...groups].map((g) => ({ id: g, label: g, value: g })),
    ];
  }, [allDevices]);

  const architectureItems = useMemo<DropDownItem<string>[]>(
    () => [
      { id: "all", label: "All", value: null as any },
      ...ARCHITECTURES.map((a) => ({ id: a, label: a, value: a })),
    ],
    [],
  );

  // Apply client-side filters
  const devices = useMemo(() => {
    let filtered = allDevices;
    if (statusFilter) {
      filtered = filtered.filter((d) => d.connection_status === statusFilter);
    }
    if (platformFilter) {
      filtered = filtered.filter(
        (d) => d.firmware_metadata?.platform === platformFilter,
      );
    }
    if (deploymentFilter) {
      filtered = filtered.filter(
        (d) => d.deployment_group?.name === deploymentFilter,
      );
    }
    if (architectureFilter) {
      filtered = filtered.filter(
        (d) => d.firmware_metadata?.architecture === architectureFilter,
      );
    }
    return filtered;
  }, [
    allDevices,
    statusFilter,
    platformFilter,
    deploymentFilter,
    architectureFilter,
  ]);

  const handleStatusFilter = useCallback(
    (v: string | null) => setStatusFilter(v),
    [],
  );
  const handlePlatformFilter = useCallback(
    (v: string | null) => setPlatformFilter(v),
    [],
  );
  const handleDeploymentFilter = useCallback(
    (v: string | null) => setDeploymentFilter(v),
    [],
  );
  const handleArchitectureFilter = useCallback(
    (v: string | null) => setArchitectureFilter(v),
    [],
  );

  const listHeader = useMemo(
    () => (
      <ListHeader
        orgId={orgId}
        productId={productId}
        colors={colors}
        statusItems={statusItems}
        platformItems={platformItems}
        deploymentItems={deploymentItems}
        architectureItems={architectureItems}
        onStatusFilter={handleStatusFilter}
        onPlatformFilter={handlePlatformFilter}
        onDeploymentFilter={handleDeploymentFilter}
        onArchitectureFilter={handleArchitectureFilter}
      />
    ),
    [
      orgId,
      productId,
      colors,
      statusItems,
      platformItems,
      deploymentItems,
      architectureItems,
      handleStatusFilter,
      handlePlatformFilter,
      handleDeploymentFilter,
      handleArchitectureFilter,
    ],
  );

  if (devicesQuery.isLoading) return <DevicesLoading />;
  if (devicesQuery.isError)
    return (
      <ErrorView
        message="Failed to load devices"
        onRetry={() => devicesQuery.refetch()}
      />
    );

  const renderDevice = ({ item }: { item: Device }) => (
    <DeviceCard
      device={item}
      onPress={(device) =>
        navigation.navigate("DeviceDetail", {
          deviceId: device.id!,
          identifier: String(device.identifier!),
        })
      }
      onMenuAction={handleMenuAction}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={devices}
        keyExtractor={(item) => String(item.identifier)}
        renderItem={renderDevice}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={
              devicesQuery.isRefetching && !devicesQuery.isFetchingNextPage
            }
            onRefresh={() => devicesQuery.refetch()}
            progressViewOffset={120}
            tintColor={colors.textTertiary}
          />
        }
        ListEmptyComponent={
          <EmptyView
            title="No Devices"
            message={
              search
                ? "No devices match your search."
                : "No devices found for this product."
            }
          />
        }
        onEndReached={() => {
          if (devicesQuery.hasNextPage && !devicesQuery.isFetchingNextPage) {
            devicesQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
        ListFooterComponent={
          devicesQuery.isFetchingNextPage ? (
            <ActivityIndicator
              style={styles.loadingFooter}
              color={colors.accent}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  barItemGroup: {
    flexDirection: "row",
    gap: 4,
  },
  list: {
    paddingTop: 120,
    paddingBottom: 120,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  filtersRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  loadingFooter: {
    paddingVertical: spacing.lg,
  },
});

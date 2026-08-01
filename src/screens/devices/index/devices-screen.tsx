import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { spacing } from "../../../components/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { Typography } from "../../../components/typography";
import { EmptyView, ErrorView } from "../../../components/ui";
import { useOrgProduct } from "../../../context/OrgProductContext";
import { useInfiniteDevices, useAllOrgProducts } from "../../../hooks/useApi";
import { useRefresh } from "../../../hooks/useRefresh";
import {
  useRebootDevice,
  useReconnectDevice,
  useClearDevicePenalty,
  deleteDevice,
} from "../../../api/generated/devices/devices";
import type { Device } from "../../../api/generated/schemas";
import { storage, STORAGE_KEYS } from "../../../utils/storage";
import { DeviceCard, type DeviceMenuAction } from "./device-card";
import { DevicesLoading } from "./devices-loading";
import { useDeviceListControls } from "../../../features/device-filters/device-list-controls";
import { useDeviceHeaderControls } from "../../../features/device-filters/use-device-header-controls";

export default function DevicesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { orgId, productId, selectOrgAndProduct } = useOrgProduct();
  const { filters, sort, activeFilterCount } = useDeviceListControls();
  const { sortItem, filterItem } = useDeviceHeaderControls(navigation);
  const devicesQuery = useInfiniteDevices(filters, sort);
  const allOrgProducts = useAllOrgProducts();
  const { refreshing, onRefresh } = useRefresh(() => devicesQuery.refetch());

  const orgProductMenuItems = useMemo(() => {
    return allOrgProducts.data.map((orgGroup) => ({
      type: "submenu" as const,
      label: orgGroup.org,
      icon: { type: "sfSymbol" as const, name: "building.2" as const },
      inline: true,
      items: orgGroup.products.map((product) => ({
        type: "action" as const,
        label: product.name,
        icon: { type: "sfSymbol" as const, name: "shippingbox" as const },
        state:
          orgId === orgGroup.org && productId === product.name
            ? ("on" as const)
            : ("off" as const),
        onPress: () => selectOrgAndProduct(orgGroup.org, product.name),
      })),
    }));
  }, [allOrgProducts.data, orgId, productId, selectOrgAndProduct]);

  useLayoutEffect(() => {
    navigation.setOptions({
      unstable_headerLeftItems: () => [
        {
          type: "menu" as const,
          icon: {
            type: "sfSymbol" as const,
            name: "shippingbox",
          },
          changesSelectionAsPrimaryAction: false,
          menu: {
            items: orgProductMenuItems,
          },
        },
      ],
      unstable_headerRightItems: () => [
        sortItem,
        filterItem,
        {
          type: "button",
          label: "Add Device",
          icon: {
            type: "sfSymbol",
            name: "plus",
          },
          sharesBackground: false,
          onPress: () => {
            navigation.navigate("NewDevice");
          },
        },
        {
          type: "button",
          label: "Search Devices",
          icon: {
            type: "sfSymbol",
            name: "magnifyingglass",
          },
          sharesBackground: false,
          onPress: () => {
            navigation.navigate("DeviceSearch");
          },
        },
      ],
    });
  }, [navigation, orgProductMenuItems, sortItem, filterItem]);

  const reboot = useRebootDevice();
  const reconnect = useReconnectDevice();
  const clearPenalty = useClearDevicePenalty();

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
        case "clearPenalty":
          Alert.alert(
            "Clear Update Penalty",
            `Remove the temporary firmware update block for ${identifier}?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Clear",
                onPress: () =>
                  clearPenalty.mutate(
                    { orgName: orgId!, productName: productId!, identifier },
                    {
                      onSuccess: () => {
                        Alert.alert(
                          "Success",
                          "The update penalty was cleared.",
                        );
                        devicesQuery.refetch();
                      },
                      onError: () =>
                        Alert.alert(
                          "Error",
                          "Failed to clear the update penalty.",
                        ),
                    },
                  ),
              },
            ],
          );
          break;
        case "pin": {
          const key = `${orgId}/${productId}/${identifier}`;
          storage.addItem(STORAGE_KEYS.PINNED_DEVICES, key);
          Alert.alert("Pinned", `${identifier} was added to Pinned Devices.`);
          break;
        }
        case "tags": {
          const tagList = device.tags ?? [];
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
                  deleteDevice(orgId!, productId!, identifier)
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
    [
      orgId,
      productId,
      reboot,
      reconnect,
      clearPenalty,
      navigation,
      devicesQuery,
    ],
  );

  const devices =
    devicesQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  const listHeader = useMemo(
    () => (
      <Typography
        type="body"
        fontSize={13}
        color={colors.textSecondary}
        paddingHorizontal={spacing.lg}
        paddingBottom={spacing.md}
      >
        {orgId} / {productId}
      </Typography>
    ),
    [orgId, productId, colors],
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
      style={{ marginHorizontal: spacing.lg }}
      onPress={(device) =>
        navigation.navigate("DeviceDetail", {
          identifier: String(device.identifier!),
        })
      }
      onMenuAction={handleMenuAction}
    />
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      data={devices}
      keyExtractor={(item) => String(item.identifier)}
      renderItem={renderDevice}
      contentContainerStyle={styles.list}
      ListHeaderComponent={listHeader}
      contentInsetAdjustmentBehavior="automatic"
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={
        <View style={styles.emptyViewWrapper}>
          <EmptyView
            title="No Devices"
            message={
              activeFilterCount > 0
                ? "No devices match the applied filters."
                : "No devices found for this product."
            }
          />
        </View>
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
    paddingBottom: 40,
  },
  emptyViewWrapper: {
    marginHorizontal: spacing.lg,
  },
  headerContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  loadingFooter: {
    paddingVertical: spacing.lg,
  },
});

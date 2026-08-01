import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import useThemedStyles from "../../theme/useThemedStyles";
import { ColorTheme } from "../../theme/colors";
import { Typography } from "../../components/typography";
import { EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { Spacing } from "../../theme/spacing";
import { DeviceCard, type DeviceMenuAction } from "./index/device-card";
import { useOrgProduct } from "../../context/OrgProductContext";
import {
  getDevice,
  getGetDeviceQueryKey,
  useClearDevicePenalty,
} from "../../api/generated/devices/devices";
import { storage, STORAGE_KEYS } from "../../utils/storage";
import type { Device } from "../../api/generated/schemas";

export default function PinnedDevicesScreen() {
  const themedStyles = useThemedStyles(createStyles);
  const navigation = useNavigation<any>();
  const { orgId, productId } = useOrgProduct();
  const queryClient = useQueryClient();
  const clearPenalty = useClearDevicePenalty();
  const [pinnedKeys, setPinnedKeys] = useState<string[]>([]);

  const refreshPins = useCallback(() => {
    setPinnedKeys(storage.getArray<string>(STORAGE_KEYS.PINNED_DEVICES));
  }, []);

  useFocusEffect(refreshPins);

  const identifiers = pinnedKeys
    .map((key) => key.split("/"))
    .filter(([org, product, identifier]) =>
      org === orgId && product === productId && !!identifier,
    )
    .map(([, , identifier]) => identifier);

  const queries = useQueries({
    queries: identifiers.map((identifier) => ({
      queryKey: getGetDeviceQueryKey(orgId ?? "", productId ?? "", identifier),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getDevice(orgId ?? "", productId ?? "", identifier, signal),
      enabled: !!orgId && !!productId,
    })),
  });
  const devices = queries.flatMap((query) =>
    query.data?.data ? [query.data.data] : [],
  );
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);

  const handleMenuAction = useCallback(
    (device: Device, action: DeviceMenuAction) => {
      if (!orgId || !productId || !device.identifier) return;

      if (action === "clearPenalty") {
        Alert.alert(
          "Clear Update Penalty",
          `Clear the update penalty for ${device.identifier}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Clear",
              onPress: () =>
                clearPenalty.mutate(
                  {
                    orgName: orgId,
                    productName: productId,
                    identifier: device.identifier!,
                  },
                  {
                    onSuccess: () => {
                      Alert.alert("Success", "The update penalty was cleared.");
                      queryClient.invalidateQueries({
                        queryKey: getGetDeviceQueryKey(
                          orgId,
                          productId,
                          device.identifier!,
                        ),
                      });
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
        return;
      }

      if (action !== "unpin") return;
      const key = `${orgId}/${productId}/${device.identifier}`;
      storage.setArray(
        STORAGE_KEYS.PINNED_DEVICES,
        storage
          .getArray<string>(STORAGE_KEYS.PINNED_DEVICES)
          .filter((entry) => entry !== key),
      );
      refreshPins();
    },
    [orgId, productId, refreshPins, clearPenalty, queryClient],
  );

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.header}>
        <Typography
          type="header"
          fontSize={26}
          fontWeight="600"
          lineHeight={28}
        >
          Pinned Devices
        </Typography>
      </View>
      {isLoading ? (
        <LoadingView message="Loading pinned devices..." />
      ) : isError ? (
        <ErrorView message="Failed to load pinned devices" />
      ) : devices.length === 0 ? (
        <EmptyView
          title="No Pinned Devices"
          message="Use a device's menu to pin it here for quick access."
        />
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(device) => String(device.identifier)}
          renderItem={({ item }) => (
            <DeviceCard
              device={item}
              isPinned
              onPress={(device) =>
                navigation.navigate("DeviceDetail", {
                  identifier: String(device.identifier),
                })
              }
              onMenuAction={handleMenuAction}
            />
          )}
          contentContainerStyle={themedStyles.list}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ColorTheme, spacing: Spacing) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 140,
      paddingHorizontal: spacing[18],
      paddingBottom: spacing[12],
    },
    list: {
      paddingHorizontal: spacing[18],
      paddingBottom: spacing[24],
    },
  });

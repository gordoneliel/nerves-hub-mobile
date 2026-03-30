import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput as NativeTextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { EmptyView, LoadingView } from "../../components/ui";
import { SearchInput } from "../../components/search-input";
import { DeviceCard } from "./index/device-card";
import { useInfiniteDevices } from "../../hooks/useApi";
import { useOrgProduct } from "../../context/OrgProductContext";
import { spacing } from "../../components/tokens";
import type { Device } from "../../api/generated/schemas";

import SearchIcon from "../../../assets/icons/search.svg";

export default function DeviceSearchScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { orgId, productId } = useOrgProduct();
  const searchRef = useRef<NativeTextInput>(null);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const devicesQuery = useInfiniteDevices();

  useEffect(() => {
    const timer = setTimeout(() => searchRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChangeText = useCallback((text: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(text), 300);
  }, []);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const allDevices =
    devicesQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  const devices = search
    ? allDevices.filter((d) => {
        const q = search.toLowerCase();
        return (
          d.identifier?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          (Array.isArray(d.tags)
            ? d.tags.some((t: string) => t.toLowerCase().includes(q))
            : String(d.tags ?? "")
                .toLowerCase()
                .includes(q))
        );
      })
    : [];

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      data={devices}
      keyExtractor={(item) => String(item.identifier)}
      contentInsetAdjustmentBehavior="automatic"
      renderItem={({ item }: { item: Device }) => (
        <DeviceCard
          device={item}
          onPress={(device) =>
            navigation.navigate("DeviceDetail", {
              identifier: String(device.identifier),
            })
          }
        />
      )}
      ListHeaderComponent={
        <View style={styles.searchWrapper}>
          <Typography
            type="body"
            fontSize={13}
            color={colors.textSecondary}
            marginBottom={spacing.lg}
          >
            {orgId} / {productId}
          </Typography>
          <SearchInput
            ref={searchRef}
            placeholder="Search devices"
            onChangeText={handleChangeText}
            clearButtonMode="while-editing"
          />
        </View>
      }
      ListEmptyComponent={
        devicesQuery.isLoading ? (
          <LoadingView message="Searching…" />
        ) : search ? (
          <View style={styles.emptyWrapper}>
            <EmptyView
              icon={
                <SearchIcon
                  width={32}
                  height={32}
                  color={colors.textTertiary}
                />
              }
              title="No Results"
              message="No devices match your search."
            />
          </View>
        ) : (
          <View style={styles.emptyWrapper}>
            <EmptyView
              icon={
                <SearchIcon
                  width={32}
                  height={32}
                  color={colors.textTertiary}
                />
              }
              title="Search Devices"
              message="Type to search by device identifier."
            />
          </View>
        )
      }
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
      onEndReached={() => {
        if (devicesQuery.hasNextPage && !devicesQuery.isFetchingNextPage) {
          devicesQuery.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        devicesQuery.isFetchingNextPage ? (
          <ActivityIndicator
            style={styles.loadingFooter}
            color={colors.accent}
          />
        ) : null
      }
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    paddingBottom: spacing.md,
  },
  list: {
    paddingBottom: 120,
    paddingHorizontal: spacing.lg,
  },
  emptyWrapper: {
    paddingVertical: spacing.xxl,
  },
  loadingFooter: {
    paddingVertical: spacing.lg,
  },
});

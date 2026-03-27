import React, { useEffect, useRef, useState } from "react";
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
import { DeviceCard } from "./device-card";
import { useInfiniteDevices } from "../../hooks/useApi";
import { spacing } from "../../components/tokens";
import type { Device } from "../../api/generated/schemas";

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function DeviceSearchScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const searchRef = useRef<NativeTextInput>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const devicesQuery = useInfiniteDevices(
    debouncedSearch || undefined,
  );

  useEffect(() => {
    const timer = setTimeout(() => searchRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const devices =
    devicesQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={devices}
        keyExtractor={(item) => String(item.identifier)}
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
          <View style={styles.header}>
            <Typography
              type="header"
              fontSize={26}
              fontWeight="600"
              lineHeight={28}
            >
              Search
            </Typography>
            <View style={styles.searchWrapper}>
              <SearchInput
                ref={searchRef}
                placeholder="Search devices"
                value={search}
                onChangeText={setSearch}
                clearButtonMode="while-editing"
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          devicesQuery.isLoading ? (
            <LoadingView message="Searching…" />
          ) : debouncedSearch ? (
            <EmptyView
              title="No Results"
              message="No devices match your search."
            />
          ) : (
            <EmptyView
              title="Search Devices"
              message="Type to search by device identifier."
            />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 140,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchWrapper: {
    marginTop: spacing.md,
  },
  list: {
    paddingBottom: 120,
  },
  loadingFooter: {
    paddingVertical: spacing.lg,
  },
});

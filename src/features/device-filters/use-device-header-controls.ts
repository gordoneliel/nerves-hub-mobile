import { useMemo } from "react";
import type { NativeStackHeaderItem } from "@react-navigation/native-stack";

import type { DeviceSort } from "../../hooks/useApi";
import { useDeviceListControls } from "./device-list-controls";

type SortOption = {
  label: string;
  icon: string;
  value: DeviceSort;
};

const SORT_OPTIONS: SortOption[] = [
  {
    label: "Identifier A–Z",
    icon: "textformat.abc",
    value: { field: "identifier", direction: "asc" },
  },
  {
    label: "Identifier Z–A",
    icon: "textformat.abc",
    value: { field: "identifier", direction: "desc" },
  },
  {
    label: "Recently Connected",
    icon: "clock.arrow.circlepath",
    value: { field: "connection_established_at", direction: "asc" },
  },
  {
    label: "Least Recently Connected",
    icon: "clock",
    value: { field: "connection_established_at", direction: "desc" },
  },
];

export function useDeviceHeaderControls(navigation: any) {
  const { sort, setSort, activeFilterCount } = useDeviceListControls();

  return useMemo(() => {
    const sortItem: NativeStackHeaderItem = {
      type: "menu",
      label: "Sort Devices",
      accessibilityLabel: "Sort devices",
      icon: { type: "sfSymbol", name: "arrow.up.arrow.down" },
      changesSelectionAsPrimaryAction: false,
      sharesBackground: false,
      menu: {
        title: "Sort Devices",
        items: SORT_OPTIONS.map((option) => ({
          type: "action" as const,
          label: option.label,
          icon: { type: "sfSymbol" as const, name: option.icon as any },
          state:
            option.value.field === sort.field &&
            option.value.direction === sort.direction
              ? ("on" as const)
              : ("off" as const),
          onPress: () => setSort(option.value),
        })),
      },
    };

    const filterItem: NativeStackHeaderItem = {
      type: "button",
      label: "Filter Devices",
      accessibilityLabel: "Filter devices",
      icon: {
        type: "sfSymbol",
        name:
          activeFilterCount > 0
            ? "line.3.horizontal.decrease.circle.fill"
            : "line.3.horizontal.decrease.circle",
      },
      badge:
        activeFilterCount > 0 ? { value: activeFilterCount } : undefined,
      selected: activeFilterCount > 0,
      sharesBackground: false,
      onPress: () => navigation.navigate("DeviceFilters"),
    };

    return { sortItem, filterItem };
  }, [activeFilterCount, navigation, setSort, sort]);
}

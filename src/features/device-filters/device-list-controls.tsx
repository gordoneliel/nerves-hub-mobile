import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useOrgProduct } from "../../context/OrgProductContext";
import {
  DEFAULT_DEVICE_SORT,
  type DeviceFilters,
  type DeviceSort,
} from "../../hooks/useApi";

type DeviceListControlsValue = {
  filters: DeviceFilters;
  sort: DeviceSort;
  activeFilterCount: number;
  applyFilters: (filters: DeviceFilters) => void;
  setSort: (sort: DeviceSort) => void;
};

const DeviceListControlsContext =
  createContext<DeviceListControlsValue | null>(null);

const normalizeFilters = (filters: DeviceFilters): DeviceFilters => {
  const tags = filters.tags
    ?.split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(",");

  return Object.fromEntries(
    Object.entries({ ...filters, tags: tags || undefined }).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ) as DeviceFilters;
};

export function DeviceListControlsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgId, productId } = useOrgProduct();
  const [filters, setFilters] = useState<DeviceFilters>({});
  const [sort, setSort] = useState<DeviceSort>(DEFAULT_DEVICE_SORT);

  // A product switch starts with a clean fleet view. This also prevents a
  // firmware or platform value from one product hiding every device in the
  // next product.
  useEffect(() => {
    setFilters({});
    setSort(DEFAULT_DEVICE_SORT);
  }, [orgId, productId]);

  const applyFilters = useCallback((nextFilters: DeviceFilters) => {
    setFilters(normalizeFilters(nextFilters));
  }, []);

  const value = useMemo<DeviceListControlsValue>(
    () => ({
      filters,
      sort,
      activeFilterCount: Object.keys(filters).length,
      applyFilters,
      setSort,
    }),
    [filters, sort, applyFilters],
  );

  return (
    <DeviceListControlsContext.Provider value={value}>
      {children}
    </DeviceListControlsContext.Provider>
  );
}

export function useDeviceListControls() {
  const value = useContext(DeviceListControlsContext);
  if (!value) {
    throw new Error(
      "useDeviceListControls must be used within DeviceListControlsProvider",
    );
  }
  return value;
}

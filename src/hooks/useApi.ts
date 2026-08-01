import { useInfiniteQuery } from "@tanstack/react-query";
import { useGetMe } from "../api/generated/users/users";
import {
  listDevices,
  getListDevicesQueryKey,
  useGetDevice,
} from "../api/generated/devices/devices";
import type { ListDevicesParams } from "../api/generated/schemas";
import { useListFirmwares } from "../api/generated/firmwares/firmwares";
import { useListDeploymentGroups } from "../api/generated/deployment-groups/deployment-groups";
import { useListScripts } from "../api/generated/scripts/scripts";
import { useAuth } from "../context/AuthContext";
import { useOrgProduct } from "../context/OrgProductContext";

/**
 * Thin wrappers around the Orval-generated hooks that inject
 * org/product from context and enforce auth guards.
 */

export { useAllOrgProducts } from "./useAllOrgProducts";
export type { OrgWithProducts } from "./useAllOrgProducts";

// ── User ─────────────────────────────────────────────────────────

export function useMe() {
  const { token } = useAuth();
  return useGetMe({ query: { enabled: !!token, staleTime: 30_000 } });
}

// ── Devices ──────────────────────────────────────────────────────

const PAGE_SIZE = 25;

/** Server-side device filters (NervesHub `filters[...]`). */
export type DeviceFilters = {
  search?: string;
  connection?: "connected" | "disconnected" | "not_seen";
  platform?: string;
  tags?: string;
  has_no_tags?: "true";
  firmware_version?: string;
  updates?: "enabled" | "disabled" | "penalty-box";
};

export type DeviceSort = {
  field: "identifier" | "connection_established_at";
  direction: "asc" | "desc";
};

export const DEFAULT_DEVICE_SORT: DeviceSort = {
  field: "identifier",
  direction: "asc",
};

export function useInfiniteDevices(
  filters: DeviceFilters = {},
  sort: DeviceSort = DEFAULT_DEVICE_SORT,
) {
  const { token } = useAuth();
  const { orgId: org, productId: product } = useOrgProduct();

  // Drop empty values so they don't pollute the query key or the request.
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v != null && v !== ""),
  );
  const hasFilters = Object.keys(activeFilters).length > 0;

  return useInfiniteQuery({
    // Keep the generated key prefix so list invalidations (edit tags, deploy
    // changes, …) still match, then append the active filters so each filter
    // combination caches separately.
    queryKey: [
      ...getListDevicesQueryKey(org ?? "", product ?? ""),
      activeFilters,
      sort,
    ],
    queryFn: ({ pageParam, signal }) =>
      listDevices(
        org ?? "",
        product ?? "",
        {
          pagination: { page: pageParam, page_size: PAGE_SIZE },
          sort: sort.field,
          sort_direction: sort.direction,
          ...(hasFilters ? { filters: activeFilters } : {}),
        } as ListDevicesParams,
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage.pagination;
      if (!p || !p.page_number || !p.total_pages) return undefined;
      return p.page_number < p.total_pages ? p.page_number + 1 : undefined;
    },
    enabled: !!token && !!org && !!product,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useDevice(identifier: string) {
  const { token } = useAuth();
  const { orgId: org, productId: product } = useOrgProduct();
  return useGetDevice(org ?? "", product ?? "", identifier, {
    query: {
      enabled: !!token && !!org && !!product && !!identifier,
      staleTime: 30_000,
    },
  });
}

// ── Firmware ─────────────────────────────────────────────────────

export function useFirmware() {
  const { token } = useAuth();
  const { orgId: org, productId: product } = useOrgProduct();
  return useListFirmwares(org ?? "", product ?? "", {
    query: {
      enabled: !!token && !!org && !!product,
      staleTime: 30_000,
    },
  });
}

// ── Deployments ──────────────────────────────────────────────────

export function useDeployments() {
  const { token } = useAuth();
  const { orgId: orgId, productId: productId } = useOrgProduct();
  return useListDeploymentGroups(orgId ?? "", productId ?? "", {
    query: {
      enabled: !!token && !!orgId && !!productId,
      staleTime: 30_000,
    },
  });
}

// ── Scripts ─────────────────────────────────────────────────────

export function useScripts() {
  const { token } = useAuth();
  const { orgId: org, productId: product } = useOrgProduct();
  return useListScripts(org ?? "", product ?? "", {
    pagination: { page: 1, page_size: 100 },
  }, {
    query: {
      enabled: !!token && !!org && !!product,
      staleTime: 30_000,
    },
  });
}

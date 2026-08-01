import { useListOrgs } from "../api/generated/organizations/organizations";
import { useAuth } from "../context/AuthContext";

export interface OrgWithProducts {
  org: string;
  products: { name: string; id?: number }[];
}

export function useAllOrgProducts() {
  const { token } = useAuth();
  const orgsQuery = useListOrgs(
    { include: "products" },
    { query: { enabled: !!token, staleTime: 30_000 } },
  );

  const data: OrgWithProducts[] = (orgsQuery.data?.data ?? [])
    .map((o) => ({
      org: o.name ?? "",
      products: (o.products ?? []).map((p) => ({
        name: p.name ?? "",
      })),
    }))
    .filter((g) => g.org && g.products.length > 0);

  return {
    data,
    isLoading: orgsQuery.isLoading,
    isError: orgsQuery.isError,
    refetch: orgsQuery.refetch,
  };
}

import { useQueries } from "@tanstack/react-query";
import {
  listProducts,
  getListProductsQueryKey,
} from "../api/generated/products/products";
import { useOrgs } from "./useOrgs";

export interface OrgWithProducts {
  org: string;
  products: { name: string; id?: number }[];
}

export function useAllOrgProducts() {
  const orgsQuery = useOrgs();
  const orgs = orgsQuery.data?.data ?? [];

  console.log("ORgs: ", orgs);

  const productQueries = useQueries({
    queries: orgs.map((o) => ({
      queryKey: getListProductsQueryKey(o.name),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        listProducts(o.name, signal),
      staleTime: 30_000,
    })),
  });

  const isLoading =
    orgsQuery.isLoading || productQueries.some((q) => q.isLoading);
  const isError = orgsQuery.isError || productQueries.some((q) => q.isError);

  const data: OrgWithProducts[] = orgs
    .map((o, i) => ({
      org: o.name,
      products: (productQueries[i]?.data?.data ?? []).map((p) => ({
        name: p.name ?? "",
        id: p.id,
      })),
    }))
    .filter((g) => g.products.length > 0);

  const refetch = () => {
    orgsQuery.refetch();
    productQueries.forEach((q) => q.refetch());
  };

  return { data, isLoading, isError, refetch };
}

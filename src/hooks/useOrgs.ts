import { useQuery } from "@tanstack/react-query";
import { customInstance } from "../api/mutator/custom-instance";
import { useAuth } from "../context/AuthContext";

/**
 * Manual hook — the /orgs endpoint is not in the OpenAPI spec,
 * so Orval doesn't generate a hook for it.
 */
export function useOrgs() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["/orgs"],
    queryFn: ({ signal }) =>
      customInstance<{ data: { name: string }[] }>({
        url: "/orgs",
        method: "GET",
        signal,
      }),
    enabled: !!token,
    staleTime: 30_000,
  });
}

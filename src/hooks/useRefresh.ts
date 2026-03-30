import { useCallback, useRef, useState } from "react";

/**
 * Wraps a refetch function with local refreshing state.
 * Only tracks manual pull-to-refresh, not background refetches.
 */
export function useRefresh(refetchFn: () => Promise<any>) {
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const onRefresh = useCallback(() => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    refetchFn().finally(() => {
      refreshingRef.current = false;
      setRefreshing(false);
    });
  }, [refetchFn]);

  return { refreshing, onRefresh };
}

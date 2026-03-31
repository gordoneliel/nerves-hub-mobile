import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { storage, STORAGE_KEYS } from "../utils/storage";
import { isDemoMode } from "../utils/demoMode";

interface OrgProductState {
  orgId: string | null;
  productId: string | null;
}

interface OrgProductContextValue extends OrgProductState {
  selectOrgAndProduct: (orgId: string, productId: string) => void;
  resetOrgAndProduct: () => void;
}

const OrgProductContext = createContext<OrgProductContextValue | null>(null);

export function OrgProductProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<OrgProductState>({
    orgId: null,
    productId: null,
  });

  // Rehydrate from MMKV on mount
  useEffect(() => {
    if (isDemoMode()) {
      setState({ orgId: "acme", productId: "smart-sensor" });
      return;
    }
    const orgId = storage.getString(STORAGE_KEYS.ORG) ?? null;
    const productId = storage.getString(STORAGE_KEYS.PRODUCT) ?? null;
    setState({ orgId, productId });
  }, []);

  const selectOrgAndProduct = useCallback(
    (orgId: string, productId: string) => {
      storage.setString(STORAGE_KEYS.ORG, orgId);
      storage.setString(STORAGE_KEYS.PRODUCT, productId);
      setState({ orgId, productId });
    },
    [],
  );

  const resetOrgAndProduct = useCallback(() => {
    storage.remove(STORAGE_KEYS.ORG);
    storage.remove(STORAGE_KEYS.PRODUCT);
    setState({ orgId: null, productId: null });
  }, []);

  const value = useMemo<OrgProductContextValue>(
    () => ({ ...state, selectOrgAndProduct, resetOrgAndProduct }),
    [state, selectOrgAndProduct, resetOrgAndProduct],
  );

  return (
    <OrgProductContext.Provider value={value}>
      {children}
    </OrgProductContext.Provider>
  );
}

export function useOrgProduct(): OrgProductContextValue {
  const ctx = useContext(OrgProductContext);
  if (!ctx)
    throw new Error("useOrgProduct must be used within OrgProductProvider");
  return ctx;
}

// Boolean hooks for React Navigation static `if` directives
export function useHasOrgProduct() {
  const { orgId, productId } = useOrgProduct();
  return !!orgId && !!productId;
}

export function useNeedsOrgProduct() {
  const { orgId, productId } = useOrgProduct();
  return !orgId || !productId;
}

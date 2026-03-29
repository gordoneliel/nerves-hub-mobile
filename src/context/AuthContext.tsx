import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  configureAxios,
  resetAxios,
} from "../api/mutator/custom-instance";
import { deleteToken, getToken, setToken } from "../utils/secureStorage";
import { storage, STORAGE_KEYS } from "../utils/storage";
import type { AuthResponse } from "../api/generated/schemas";

interface AuthState {
  ready: boolean;
  instanceUrl: string | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  loginWithCredentials: (
    instanceUrl: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Instance URL is sync from MMKV
const initialInstanceUrl =
  storage.getString(STORAGE_KEYS.INSTANCE_URL) ?? null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ready: false,
    instanceUrl: initialInstanceUrl,
    token: null,
  });

  // Read token from Keychain on boot
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token && initialInstanceUrl) {
        configureAxios(initialInstanceUrl, token);
        setState({ ready: true, instanceUrl: initialInstanceUrl, token });
      } else {
        setState((prev) => ({ ...prev, ready: true }));
      }
    })();
  }, []);

  // Reconfigure axios whenever auth changes
  useMemo(() => {
    if (state.instanceUrl && state.token) {
      configureAxios(state.instanceUrl, state.token);
    }
  }, [state.instanceUrl, state.token]);

  const loginWithCredentials = useCallback(
    async (instanceUrl: string, email: string, password: string) => {
      const authResponse = await axios.post<AuthResponse>(
        `${instanceUrl}/api/users/login`,
        { email, password, note: "mobile-app" },
      );

      const responseData = authResponse.data?.data;
      const authToken = responseData?.token;
      if (!authToken || !responseData) {
        throw new Error("No token received");
      }

      await setToken(authToken);
      storage.setString(STORAGE_KEYS.INSTANCE_URL, instanceUrl);

      // Store instance URL in history array
      storage.addItem(STORAGE_KEYS.INSTANCE_URLS, instanceUrl);

      configureAxios(instanceUrl, authToken);
      setState({
        ready: true,
        instanceUrl,
        token: authToken,
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    await deleteToken();
    storage.remove(STORAGE_KEYS.INSTANCE_URL);
    storage.remove(STORAGE_KEYS.ORG);
    storage.remove(STORAGE_KEYS.PRODUCT);
    resetAxios();
    setState({
      ready: true,
      instanceUrl: null,
      token: null,
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      loginWithCredentials,
      logout,
    }),
    [state, loginWithCredentials, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Boolean hooks for React Navigation static `if` directives
export function useIsSignedIn() {
  const { token } = useAuth();
  return !!token;
}

export function useIsSignedOut() {
  const { token } = useAuth();
  return !token;
}

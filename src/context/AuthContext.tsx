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
  customInstance,
  resetAxios,
} from "../api/mutator/custom-instance";
import { deleteToken, getToken, setToken } from "../utils/secureStorage";
import { storage, STORAGE_KEYS } from "../utils/storage";
import type {
  AuthResponse,
  User,
  UserResponse,
} from "../api/generated/schemas";

interface AuthState {
  isLoading: boolean;
  instanceUrl: string | null;
  token: string | null;
  user: User | null;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    instanceUrl: null,
    token: null,
    user: null,
  });

  // Rehydrate on boot
  useEffect(() => {
    (async () => {
      const token = await getToken();
      const instanceUrl = storage.getString(STORAGE_KEYS.INSTANCE_URL) ?? null;

      let user: User | null = null;
      if (token && instanceUrl) {
        configureAxios(instanceUrl, token);
        try {
          const res = await customInstance<UserResponse>({
            url: "/api/users/me",
            method: "GET",
          });
          user = res?.data ?? null;
        } catch {
          // Token may be expired; continue without user
        }
      }

      setState({ isLoading: false, instanceUrl, token, user });
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

      const { token: _, ...user } = responseData;

      await setToken(authToken);
      storage.setString(STORAGE_KEYS.INSTANCE_URL, instanceUrl);

      // Store instance URL in history array
      storage.addItem(STORAGE_KEYS.INSTANCE_URLS, instanceUrl);

      configureAxios(instanceUrl, authToken);
      setState((prev) => ({
        ...prev,
        instanceUrl,
        token: authToken,
        user: {
          name: responseData.name ?? "",
          email: responseData.email ?? "",
        },
      }));
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
      isLoading: false,
      instanceUrl: null,
      token: null,
      user: null,
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

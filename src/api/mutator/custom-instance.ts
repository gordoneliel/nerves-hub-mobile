import Axios, { AxiosRequestConfig } from "axios";
import { isDemoMode } from "../../utils/demoMode";
import { getDemoResponse } from "../../utils/demoData";

/**
 * Serialize query params the way Phoenix/Plug expects: nested objects use
 * bracket notation (`pagination[page]=1`, `filters[connection]=connected`) and
 * arrays use `key[]=a&key[]=b`. Axios's default serializer doesn't produce
 * this, and NervesHub's API reads pagination/filters from nested params.
 */
const serializeParams = (obj: Record<string, unknown>, prefix = ""): string => {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const path = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      for (const v of value) {
        parts.push(
          `${encodeURIComponent(`${path}[]`)}=${encodeURIComponent(String(v))}`,
        );
      }
    } else if (typeof value === "object") {
      const nested = serializeParams(value as Record<string, unknown>, path);
      if (nested) parts.push(nested);
    } else {
      parts.push(
        `${encodeURIComponent(path)}=${encodeURIComponent(String(value))}`,
      );
    }
  }
  return parts.join("&");
};

const baseConfig: AxiosRequestConfig = {
  paramsSerializer: {
    serialize: (params) => serializeParams(params as Record<string, unknown>),
  },
};

// Lazy-initialized instance — set at login time via `configureAxios()`
let AXIOS_INSTANCE = Axios.create(baseConfig);

/**
 * Call once after the user logs in to point the generated hooks
 * at the correct NervesHub instance.
 */
export const configureAxios = (instanceUrl: string, token: string) => {
  AXIOS_INSTANCE = Axios.create({
    ...baseConfig,
    baseURL: `${instanceUrl}/api`,
    headers: {
      Authorization: `token ${token}`,
    },
  });
};

/**
 * Reset the instance on logout.
 */
export const resetAxios = () => {
  AXIOS_INSTANCE = Axios.create(baseConfig);
};

/**
 * Orval mutator — every generated hook calls this function
 * instead of a raw Axios call.
 */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  if (isDemoMode() && config.url) {
    const demo = getDemoResponse(config.url);
    if (demo !== undefined) {
      return Promise.resolve(demo as T);
    }
  }
  return AXIOS_INSTANCE(config).then(({ data }) => data);
};

export default customInstance;

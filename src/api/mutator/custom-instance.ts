import Axios, { AxiosRequestConfig } from "axios";
import { isDemoMode } from "../../utils/demoMode";
import { getDemoResponse } from "../../utils/demoData";

// Lazy-initialized instance — set at login time via `configureAxios()`
let AXIOS_INSTANCE = Axios.create();

/**
 * Call once after the user logs in to point the generated hooks
 * at the correct NervesHub instance.
 */
export const configureAxios = (instanceUrl: string, token: string) => {
  AXIOS_INSTANCE = Axios.create({
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
  AXIOS_INSTANCE = Axios.create();
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

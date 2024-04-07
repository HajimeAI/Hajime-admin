import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types.d";
import { stringify } from "qs";
import NProgress from "../progress";
import { getToken, formatToken } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";
import { useRouter } from "vue-router";
const defaultConfig: AxiosRequestConfig = {
  // timeout
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** After the token expires, the pending request is staged */
  private static requests = [];

  /** Prevent duplicate token refresh */
  private static isRefreshing = false;

  /** Initialize configuration object */
  private static initConfig: PureHttpRequestConfig = {};

  /** Save the current Axios instance object */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** Reconnect original request */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.requests.push((token: string) => {
        config.headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        NProgress.start();
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        /** Request a whitelist and place some interfaces that do not require tokens (set a request whitelist to prevent the problem of endless loops caused by requests after the token expires) */
        const whiteList = ["/refresh-token", "/user/doLogin"];
        return whiteList.find(url => url === config.url)
          ? config
          : new Promise(resolve => {
            const data = getToken();
            if (data) {
              const now = new Date().getTime();
              const expired = parseInt(data.expires) - now <= 0;
              if (expired) {
                if (!PureHttp.isRefreshing) {
                  PureHttp.isRefreshing = true;
                  // The token expires and is refreshed
                  useUserStoreHook()
                    .handRefreshToken({ refreshToken: data.refreshToken })
                    .then(res => {
                      const token = res.data.accessToken;
                      config.headers["Authorization"] = formatToken(token);
                      PureHttp.requests.forEach(cb => cb(token));
                      PureHttp.requests = [];
                    })
                    .finally(() => {
                      PureHttp.isRefreshing = false;
                    });
                }
                resolve(PureHttp.retryOriginalRequest(config));
              } else {
                config.headers["Authorization"] = formatToken(
                  data.accessToken
                );
                resolve(config);
              }
            } else {
              resolve(config);
            }
          });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** Respond to interception */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        NProgress.done();
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return response.data;
      },
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        NProgress.done();
        return Promise.reject($error);
      }
    );
  }

  /** Generic request utility functions */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig;

    // Handle custom request/response callbacks separately
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          switch (response?.code) {
            case 401:
              message(response.msg, { type: "error" });
              useUserStoreHook().logOut()
              resolve(response);
              break;
            case 500:
            case 501:
              message(response.msg, { type: "error" });
              reject(response)
              break;
          }
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /** Separately extracted post utility function */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>("post", url, params, config);
  }

  /** Get utility function that is extracted separately */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>("get", url, params, config);
  }
}

export const http = new PureHttp();

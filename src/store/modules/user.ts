import { defineStore } from "pinia";
import { store } from "@/store";
import type { userType } from "./types";
import { routerArrays } from "@/layout/types";
import { router, resetRouter } from "@/router";
import { storageLocal } from "@pureadmin/utils";
import { getLogin, getLoginByWallet } from "@/api/login";
import { refreshTokenApi } from "@/api/user";
import type { UserResult, RefreshTokenResult } from "@/api/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    isRemembered: false,
    loginDay: 7
  }),
  actions: {
    /** username */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** roles */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** isRemembered */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** loginDay */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** login */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    async loginByWallet(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLoginByWallet(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** logout */
    logOut() {
      this.username = "";
      this.roles = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    },
    /** refresh `token` */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}

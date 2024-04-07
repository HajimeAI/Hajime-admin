import Cookies from "js-cookie";
import { storageLocal } from "@pureadmin/utils";
import { useUserStoreHook } from "@/store/modules/user";

export interface DataInfo<T> {
  accessToken: string;
  expires: T;
  refreshToken: string;
  username?: string;
  roles?: Array<string>;
}

export const userKey = "user-info";
export const TokenKey = "authorized-token";
/**
 * Check whether the user is logged in to the system by whether the 'multiple-tabs' are in the 'cookie' or not.
 * This allows you to support multiple tabs and no need to log in after opening the system that you have logged into.
 * 'multiple-tabs' will be automatically destroyed from 'cookies' when the browser is completely closed,
 * You will need to log in to the system again when you open the browser again
 * */
export const multipleTabsKey = "multiple-tabs";

/** `token` */
export function getToken(): DataInfo<number> {
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : storageLocal().getItem(userKey);
}

/**
 * @description Set the 'token' and some necessary information and use the non-inductive refresh 'token' scheme
 * Inductive refresh: The backend returns 'accessToken' (the 'token' used by the access interface), 'refreshToken' (the 'token' required to call the API to refresh the 'accessToken', the expiration time of 'refreshToken' (for example, 30 days) should be greater than the expiration time of 'accessToken' (for example, 2 hours)), 'expires' (' accessToken')
 * Put the two pieces of information 'accessToken' and 'expires' in the cookie with the key value of authorized-token (automatically destroyed after expiration)
 * Put the four pieces of information 'username', 'roles', 'refreshToken', and 'expires' in the localStorage with the key value of 'user-info' (use 'multipleTabsKey' to automatically destroy when the browser is completely closed)
 */
export function setToken(data: DataInfo<Date>) {
  let expires = 0;
  const { accessToken, refreshToken } = data;
  const { isRemembered, loginDay } = useUserStoreHook();
  expires = new Date(data.expires).getTime(); // 如果后端直接设置时间戳，将此处代码改为expires = data.expires，然后把上面的DataInfo<Date>改成DataInfo<number>即可
  const cookieString = JSON.stringify({ accessToken, expires });

  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
        expires: (expires - Date.now()) / 86400000
      })
    : Cookies.set(TokenKey, cookieString);

  Cookies.set(
    multipleTabsKey,
    "true",
    isRemembered
      ? {
          expires: loginDay
        }
      : {}
  );

  function setUserKey(username: string, roles: Array<string>) {
    useUserStoreHook().SET_USERNAME(username);
    useUserStoreHook().SET_ROLES(roles);
    storageLocal().setItem(userKey, {
      refreshToken,
      expires,
      username,
      roles
    });
  }

  if (data.username && data.roles) {
    const { username, roles } = data;
    setUserKey(username, roles);
  } else {
    const username =
      storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "";
    const roles =
      storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
    setUserKey(username, roles);
  }
}

/** Delete the 'token' and localStorage information with the key value of 'user-info' */
export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(multipleTabsKey);
  storageLocal().removeItem(userKey);
}

/** Format token (jwt format) */
export const formatToken = (token: string): string => {
  return  token;
};

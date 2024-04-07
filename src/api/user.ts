import { http } from "@/utils/http";

export type UserResult = {
  success: boolean;
  data: {
    /** username */
    username: string;
    /** roles */
    roles: Array<string>;
    /** `token` */
    accessToken: string;
    /** refreshToken */
    refreshToken: string;
    /** `accessToken`expires */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** refreshToken */
    refreshToken: string;
    /** `accessToken`expires */
    expires: Date;
  };
};

/** Login */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/login", { data });
};

/** refresh token */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

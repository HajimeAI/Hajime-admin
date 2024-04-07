import { http } from "@/utils/http";

export type UserResult = {
  code: number;
  data: {
    /** `token` */
    token: string;
  };
  msg: string;
};

/** Login */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/api/user/doLogin", { data });
};

/**wallet Login */
export const getLoginByWallet = (data?: object) => {
  return http.request<UserResult>("post", "/api/user/doLoginByWallet", {
    data
  });
};

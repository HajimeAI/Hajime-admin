import { http } from "@/utils/http";

export type ModelResult = {
  code: number;
  data: [];
  msg: string;
};

/** Login */
export const getList = (data?: object) => {
  return http.request<ModelResult>("get", "/api/logVo/getList", { data });
};

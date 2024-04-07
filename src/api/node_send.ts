import { http } from "@/utils/http";
import { FormItemProps } from "@/views/nodeSend/utils/types";
export type ModelResult = {
  code: number;
  data: [];
  msg: string;
};

export const getNodeList = (data?: object) => {
  console.log("data", data);
  return http.request<ModelResult>("post", "/api/nodeSendVo/page", {
    data: data
  });
};

export const create = (data?: object) => {
  return http.request<FormItemProps>("post", "/api/nodeSendVo/save", {
    data
  });
};
export const edit = (data?: object) => {
  return http.request<FormItemProps>("put", "/api/nodeSendVo/update", {
    data
  });
};
export const del = (row: any) => {
  return http.request<any>("delete", "/api/nodeSendVo/remove/" + row.id);
};

export const send = (row: any) => {
  return http.request<any>("get", "/api/nodeSendVo/download/" + row.id);
};

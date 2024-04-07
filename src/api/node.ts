import { http } from "@/utils/http";
import { FormItemProps } from "@/views/allDevices/utils/types";
export type ModelResult<T> = {
  code: number;
  data: T;
  msg: string;
};

type pageResult = {
  records: Array<any>;
  totalRow: number;
  totalPage: number;
  pageSize: number;
  pageNumber: number;
};

export const getNodeList = (data?: object) => {
  console.log("data", data);
  return http.request<ModelResult<pageResult>>("post", "/api/nodeVo/page", {
    data: data
  });
};
export const getMyDeviceList = (data?: object) => {
  console.log("data", data);
  return http.request<ModelResult<pageResult>>("post", "/api/myDeviceVo/page", {
    data: data
  });
};

export const create = (data?: object) => {
  return http.request<FormItemProps>("post", "/api/nodeVo/save", {
    data
  });
};

export const createMe = (data?: object) => {
  return http.request<FormItemProps>("post", "/api/myDeviceVo/save", {
    data
  });
};
export const edit = (data?: object) => {
  return http.request<FormItemProps>("put", "/api/nodeVo/update", {
    data
  });
};
export const del = (row: any) => {
  return http.request<any>("delete", "/api/nodeVo/remove/" + row.id);
};

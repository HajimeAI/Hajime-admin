import { http } from "@/utils/http";
import { FormItemProps } from "@/views/indexed/utils/types";
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

export const getIndexList = (data?: object) => {
  console.log("data", data);
  return http.request<ModelResult<pageResult>>("post", "/api/indexedVo/page", {
    data: data
  });
};
export const getIndexListAll = () => {
  return http.request<ModelResult<[]>>("get", "/api/indexedVo/list");
};

export const create = (data?: object) => {
  return http.request<FormItemProps>("post", "/api/indexedVo/save", {
    data
  });
};
export const edit = (data?: object) => {
  return http.request<FormItemProps>("post", "/api/indexedVo/update", {
    data
  });
};
export const del = (row: any) => {
  return http.request<any>("delete", "/api/indexedVo/remove/" + row.id);
};

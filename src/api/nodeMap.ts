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

export const getNodeList = () => {
  return http.request<ModelResult<any>>("get", "/api/nodeVo/list");
};

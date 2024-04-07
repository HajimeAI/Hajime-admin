import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  // return http.request<Result>("get", "/get-async-routes");
  return new Promise(resolve => {
    resolve({
      success: true,
      data: []
    });
  })
};

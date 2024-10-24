import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import { i18n } from "@/utils/common";
interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

const baseURL = "https://siyuan-plugin-task-list.sylwair.com";

// const baseURL = "http://localhost:8787";
// console.log("当前环境", import.meta.env.MODE);

const instance: AxiosInstance = axios.create({
  baseURL,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
  timeout: 3 * 60 * 1000,
});

// Add response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      ElMessage({
        message: i18n.aiRoast.toast.netWorkError,
        grouping: true,
        type: "error",
      });
    }
    return Promise.reject(error);
  }
);

export const request = {
  get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await instance.get(url, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error in GET request:", error);
      throw error;
    }
  },

  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await instance.post(
        url,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error in POST request:", error);
      throw error;
    }
  },
};

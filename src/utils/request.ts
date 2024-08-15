import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ElMessage } from "element-plus";

interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

const instance: AxiosInstance = axios.create({
  baseURL: "http://localhost:8787",
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
        message: "网络连接已断开，请检查您的网络设置。",
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

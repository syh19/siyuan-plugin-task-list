import axios from "axios";

import { taskListForAI } from "../utils/ai";

const instance = axios.create({
  maxBodyLength: Infinity, // 允许无限大小的请求体
  maxContentLength: Infinity, // 允许无限大小的响应体
  timeout: 3 * 60 * 1000, // 增加超时时间（毫秒）
});

const baseUrl = "http://localhost:8787";

export async function getAuthCodeInfo(id: string) {
  try {
    const response = await instance.get(
      `${baseUrl}/auth-code?id=${id}`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching auth code info:", error);
    return null;
  }
}
export async function getAiSummary({
  authCode,
  retries = 3,
}: {
  authCode: string;
  retries?: number;
}) {
  try {
    console.log("authCode", authCode);
    const response = await instance.post(
      `${baseUrl}/ai`,
      {
        taskList: taskListForAI,
        authCode,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.log(`请求失败,剩余重试次数: ${retries - 1}`);
      return getAiSummary({ authCode, retries: retries - 1 });
    }
    // console.error("Error fetching tags:", error);
    if (error.response) {
      // 服务器响应的错误
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // 请求发送成功，但没有收到响应
      console.error("No response received:", error.request);
    } else {
      // 设置请求时发生的错误
      console.error("Error setting up request:", error.message);
    }
    return [];
  }
}

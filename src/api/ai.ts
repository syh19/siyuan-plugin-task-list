import { request } from "../utils/request";
import { taskListForAI } from "../utils/ai";
import { ElMessage } from "element-plus";

export async function getAuthCodeInfo(id: string) {
  try {
    const response = await request.get<any>(`/auth-code?id=${id}`);
    return response.data;
  } catch (error) {
    // console.error("Error fetching auth code info:", error);
    return new Error(error.message === "Network Error" ? "未连接网络" : error);
  }
}

export async function getAiSummary({
  authCode,
  name,
  retries = 3,
}: {
  authCode: string;
  name: string;
  retries?: number;
}) {
  try {
    const response = await request.post<any>("/ai", {
      taskList: taskListForAI,
      authCode,
      name,
    });

    if (response.code === 200) {
      return response.data;
    }
  } catch (error) {
    if (retries > 0) {
      console.log(`请求失败,剩余重试次数: ${retries - 1}`);
      return getAiSummary({ authCode, name, retries: retries - 1 });
    }
    return [];
  }
}

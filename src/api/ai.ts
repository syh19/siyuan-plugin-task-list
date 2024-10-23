import { request } from "@/utils/request";
import { taskListForAI } from "@/utils/ai";
import { i18n } from "@/utils/common";
export async function getAuthCodeInfo(id: string) {
  try {
    const response = await request.get<any>(`/auth-code?id=${id}`);
    return response;
  } catch (error) {
    return new Error(error.message === "Network Error" ? "未连接网络" : error);
  }
}

export async function getAiSummary({
  authCode,
  name,
  deviceId,
  retries = 3,
}: {
  authCode: string;
  name: string;
  deviceId: string;
  retries?: number;
}) {
  try {
    const response = await request.post<any>("/ai", {
      taskList: taskListForAI,
      authCode,
      name,
      deviceId,
      lang: i18n.language,
    });

    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`请求失败,剩余重试次数: ${retries - 1}`);
      return getAiSummary({ authCode, name, deviceId, retries: retries - 1 });
    }
  }
}

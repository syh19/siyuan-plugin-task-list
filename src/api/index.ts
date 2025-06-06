import * as sySDK from "@siyuan-community/siyuan-sdk";
import type { TSqlResItem, TResponse } from "@/types";
import * as utils from "@/utils/common";
import {
  IFile,
  IPayload,
} from "@siyuan-community/siyuan-sdk/dist/types/kernel/api/file/putFile";

/* 初始化客户端 (默认使用 Axios 发起 XHR 请求) */
export const client = new sySDK.Client();

type TSqlReq = {
  isGetAll: boolean;
  status?: string;
  docId?: string;
  boxId?: string;
};

/** 获取指定范围的taskNode节点列表 */
export async function getTaskListBySql(
  params: TSqlReq
): Promise<TResponse<Array<TSqlResItem>>> {
  let stmtStr = "SELECT * FROM blocks WHERE type = 'i' AND subtype = 't'";

  if (!params.isGetAll && false) {
    // 根据配置项排除特定任务
    const { data: storage } = await getLocalStorage();
    if (storage["plugin-task-list-settings"]?.["nodeListForHideTask"]) {
      storage["plugin-task-list-settings"]?.["nodeListForHideTask"].forEach(
        (item: any) => {
          if (item.type === "box") {
            stmtStr += ` AND box != '${item.key}'`;
          } else if (item.type === "doc") {
            item.hideTaskInNodeStatus === 1 &&
              (stmtStr += ` AND root_id != '${item.key}'`);
            item.hideTaskInNodeStatus === 2 &&
              (stmtStr += ` AND path NOT LIKE '%/${item.key}%'`);
          }
        }
      );
    }

    // 最开头的 '* [ ]'或者 '* [_]' 才表示当前任务节点
    if (params.status === "todo") {
      stmtStr += ` AND markdown LIKE '* [ ]%'`;
    } else if (params.status === "done") {
      stmtStr += ` AND markdown LIKE '* [_]%' AND markdown NOT LIKE '* [ ]%'`; // 已完成可能有两种：[x] 和 [X]
    } else if (params.status === "all") {
      stmtStr += "";
    }

    params.docId && (stmtStr += ` AND root_id = '${params.docId}'`);
    params.boxId && (stmtStr += ` AND box = '${params.boxId}'`);
  }

  const { data: storage } = await getLocalStorage();
  const taskCountLimit = storage["plugin-task-list-settings"]?.["taskCountLimit"] || 2000;
  stmtStr += ` ORDER BY created ASC LIMIT ${taskCountLimit}`;

  let taskRes: any = await client.sql({
    stmt: stmtStr,
    // SELECT * FROM blocks WHERE type = 'i' AND subtype = 't' AND markdown LIKE '%[ ]%' AND root_id = 'xxx' AND box = 'xxx' ORDER BY created DESC LIMIT 1000
  });
  let notebooks: any = await lsNotebooks();
  utils.setNotebooks(notebooks);
  let notebooksObj = {};
  notebooks.forEach((item: any) => {
    notebooksObj[item.id] = item.name;
  });
  taskRes.data.forEach((item: any) => {
    item.boxName = notebooksObj[item.box];
  });
  return taskRes;
}

/**
 * 获取单个任务节点的信息
 * @param taskId
 * @returns {object} 单个任务节点的信息
 */
export async function getSingleTaskInfoBySql(taskId: string): Promise<object> {
  let stmtStr: string = `SELECT * FROM blocks WHERE id='${taskId}'`;
  const res: any = await client.sql({
    stmt: stmtStr,
  });
  if (res?.code === 0) {
    return res.data[0];
  }
}

/** 设置持久化本地存储数据 */
export async function setLocalStorage(params: {
  app?: string;
  val: { [key: string]: any };
}): Promise<void> {
  const { data: previousVal } = await client.getLocalStorage();
  params.val = { ...previousVal, ...params.val };
  await client.setLocalStorage(params);
}

/**
 * 设置持久化本地存储数据
 * 设置单个键值对
 */
export async function setLocalStorageVal(params: {
  key: string;
  val: any;
}): Promise<void> {
  await client.setLocalStorageVal({
    app: utils.plugin.app.appId,
    key: params.key,
    val: params.val,
  });
}

/** 获取持久化本地存储数据 */
export async function getLocalStorage(): Promise<any> {
  return await client.getLocalStorage();
}

/**
 * 设置块属性
 * @param params
 */
export async function setBlockAttrs(params: {
  id: string;
  attrs: { [key: string]: any };
}): Promise<void> {
  await client.setBlockAttrs(params);
}

/**
 * 获取块属性
 * @param params
 */
// export async function getBlockAttrs(params: { id: string }): Promise<void> {
//   await client.getBlockAttrs(params)
// }

/**
 * 获取当前文档信息
 * @param params
 * @returns
 */
export async function getDocInfo(params: { id: string }): Promise<any> {
  return await client.getDocInfo(params);
}

/**
 * 获取当前笔记本信息
 * @param params
 * @returns
 */
export async function getNotebookConf(params: {
  notebook: string;
}): Promise<any> {
  return await client.getNotebookConf(params);
}

export async function lsNotebooks(): Promise<any> {
  let notebookRes = await client.lsNotebooks();
  return notebookRes.data.notebooks;
}

export async function putFile(params: IFile): Promise<any> {
  return await client.putFile(params);
}

export async function getFile(params: {
  path: string;
  emptyDataType: string;
}): Promise<any> {
  try {
    const res: any = await client.getFile(params, "arraybuffer");
    const decoder = new TextDecoder("utf-8");
    const jsonString = decoder.decode(res);
    return JSON.parse(jsonString);
  } catch (error) {
    if (params.emptyDataType === "string") {
      return "";
    } else if (params.emptyDataType === "object") {
      return {};
    } else if (params.emptyDataType === "array") {
      return [];
    }
  }
}

export async function removeFile(params: { path: string }): Promise<any> {
  return await client.removeFile(params);
}

export async function readDir(params: { path: string }): Promise<any> {
  return await client.readDir(params);
}

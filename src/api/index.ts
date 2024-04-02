import * as sySDK from '@siyuan-community/siyuan-sdk'
import type { TSqlResItem, TResponse } from '../types'

/* 初始化客户端 (默认使用 Axios 发起 XHR 请求) */
export const client = new sySDK.Client()

type TSqlReq = {
  isGetAll: boolean
  status?: string
  docId?: string
  boxId?: string
}

/** 获取指定范围的taskNode节点列表 */
export async function getTaskListBySql(
  params: TSqlReq
): Promise<TResponse<Array<TSqlResItem>>> {
  let stmtStr = "SELECT * FROM blocks WHERE type = 'i' AND subtype = 't'"

  if (!params.isGetAll) {
    // 根据配置项排除特定任务
    const { data: storage } = await getLocalStorage()
    if (storage['plugin-task-list-nodeListForHideTask']) {
      storage['plugin-task-list-nodeListForHideTask'].forEach((item: any) => {
        if (item.type === 'box') {
          stmtStr += ` AND box != '${item.key}'`
        } else if (item.type === 'doc') {
          item.hideTaskInNodeStatus === 1 &&
            (stmtStr += ` AND root_id != '${item.key}'`)
          item.hideTaskInNodeStatus === 2 &&
            (stmtStr += ` AND path NOT LIKE '%/${item.key}%'`)
        }
      })
    }

    if (params.status === 'todo') {
      stmtStr += ` AND markdown LIKE '%[ ]%'`
    } else if (params.status === 'done') {
      stmtStr += ` AND markdown LIKE '%[_]%' AND markdown NOT LIKE '%[ ]%'` // 已完成可能有两种：[x] 和 [X]
    } else if (params.status === 'all') {
      stmtStr += ''
    }

    params.docId && (stmtStr += ` AND root_id = '${params.docId}'`)
    params.boxId && (stmtStr += ` AND box = '${params.boxId}'`)
  }

  stmtStr += ` ORDER BY created DESC LIMIT 1000`

  let taskRes = await client.sql({
    stmt: stmtStr,
    // SELECT * FROM blocks WHERE type = 'i' AND subtype = 't' AND markdown LIKE '%[ ]%' AND root_id = 'xxx' AND box = 'xxx' ORDER BY created DESC LIMIT 1000
  })
  let notebookRes = await client.lsNotebooks()
  let notebooksObj = {}
  notebookRes.data.notebooks.forEach((item: any) => {
    notebooksObj[item.id] = item.name
  })
  taskRes.data.forEach((item: any) => {
    item.boxName = notebooksObj[item.box]
  })
  return taskRes
}

/** 设置持久化本地存储数据 */
export async function setLocalStorage(params: {
  app?: string
  val: { [key: string]: any }
}): Promise<void> {
  const { data: previousVal } = await client.getLocalStorage()
  params.val = { ...previousVal, ...params.val }
  await client.setLocalStorage(params)
}

/** 获取持久化本地存储数据 */
export async function getLocalStorage(): Promise<any> {
  return await client.getLocalStorage()
}

/**
 * 设置块属性
 * @param params
 */
export async function setBlockAttrs(params: {
  id: string
  attrs: { [key: string]: any }
}): Promise<void> {
  await client.setBlockAttrs(params)
}

/**
 * 获取块属性
 * @param params
 */
// export async function getBlockAttrs(params: { id: string }): Promise<void> {
//   await client.getBlockAttrs(params)
// }

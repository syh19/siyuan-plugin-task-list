import * as sySDK from '@siyuan-community/siyuan-sdk'
import type { TSqlResItem, TResponse } from '../types'

/* 初始化客户端 (默认使用 Axios 发起 XHR 请求) */
export const client = new sySDK.Client()

/** 获取指定范围的taskNode节点列表 */
export async function getTaskListBySql(params: {
  status: string
  docId?: string
  boxId?: string
}): Promise<TResponse<Array<TSqlResItem>>> {
  let stmtStr = "SELECT * FROM blocks WHERE type = 'i' AND subtype = 't'"

  if (params.status === 'todo') {
    stmtStr += ` AND markdown LIKE '%[ ]%'`
  } else if (params.status === 'done') {
    stmtStr += ` AND markdown LIKE '%[_]%' AND markdown NOT LIKE '%[ ]%'` // 已完成可能有两种：[x] 和 [X]
  } else if (params.status === 'all') {
    stmtStr += ''
  }

  params.docId && (stmtStr += ` AND root_id = '${params.docId}'`)
  params.boxId && (stmtStr += ` AND box = '${params.boxId}'`)

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

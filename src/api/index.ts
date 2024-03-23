import * as sySDK from '@siyuan-community/siyuan-sdk'

/* 初始化客户端 (默认使用 Axios 发起 XHR 请求) */
export const client = new sySDK.Client()

/** 获取指定范围的taskNode节点列表 */
export async function getTaskListBySql({
  status,
  boxId,
  docId,
}: {
  status: string
  docId?: string
  boxId?: string
}): Promise<any> {
  let stmtStr = "SELECT * FROM blocks WHERE type = 'i' AND subtype = 't'"

  if (status === 'todo') {
    stmtStr += ` AND markdown LIKE '%[ ]%'`
  } else if (status === 'done') {
    stmtStr += ` AND markdown LIKE '%[x]%' AND markdown NOT LIKE '%[ ]%'`
  } else if (status === 'all') {
    stmtStr += ''
  }

  docId && (stmtStr += ` AND root_id = '${docId}'`)
  boxId && (stmtStr += ` AND box = '${boxId}'`)

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

/**
 * 兼容旧版本数据：迁移旧版本数据到新版本
 */
import * as API from '@/api/index'
import * as utils from '@/utils/common'

import * as sySDK from '@siyuan-community/siyuan-sdk'

/* 初始化客户端 (默认使用 Axios 发起 XHR 请求) */
export const client = new sySDK.Client()

/**
 * 迁移旧版本数据到新版本
 * { 'plugin-task-list-nodeListForHideTask': [] } ==> { 'plugin-task-list-settings': { nodeListForHideTask: [] } }
 */
export async function makeLocalStorageNew() {
  const { data: storage } = await API.getLocalStorage()
  if (storage.hasOwnProperty('plugin-task-list-nodeListForHideTask')) {
    const nodeListForHideTask = storage['plugin-task-list-nodeListForHideTask']
    delete storage['plugin-task-list-nodeListForHideTask']
    await client.setLocalStorage({
      app: utils.plugin.app.appId,
      val: {
        ...storage,
        'plugin-task-list-settings': {
          nodeListForHideTask: nodeListForHideTask,
        },
      },
    })
  }
}

makeLocalStorageNew()

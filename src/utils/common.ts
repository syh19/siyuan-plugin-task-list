import * as sy from 'siyuan'
import TaskListPlugin from '../index'
import * as sySDK from '@siyuan-community/siyuan-sdk'
import * as API from '../api/index'
import type { IRange, TSqlResItem, TResponse } from '../types'

/* 初始化客户端 (默认使用 Axios 发起 XHR 请求) */
export const client = new sySDK.Client()

/** 当前的额运行环境是否是移动端 */
export const isMobile = ['mobile', 'browser-mobile'].includes(sy.getFrontend())

/**
 * 延迟函数
 * @param time 时间
 * @returns 返回后需await
 */
export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

/** i18n全局实例 */
export let i18n: any
export function setI18n(_i18n: any) {
  i18n = _i18n
}

/** 插件全局对象 */
export let plugin: TaskListPlugin
export function setPlugin(_plugin: any) {
  plugin = _plugin
}

/** 当前的文档ID root_id */
export let currentDocId: string
export function setCurrentDocId(_currentDocId: string) {
  currentDocId = _currentDocId
}

/** 当前文档所在的笔记本ID box */
export let currentBoxId: string
export function setCurrentBoxId(_currentBoxId: string) {
  currentBoxId = _currentBoxId
}

/** 当前工作空间的名称 */
export let workSpaceName: string
export function setWorkSpaceName() {
  workSpaceName = document
    .getElementById('toolbar')
    .querySelector('#barWorkspace .toolbar__text').innerHTML
}

/**
 * 将接口返回的数据转换为树形数据
 * @param sqlData 接口返回的数据
 * @returns
 */
export function convertSqlToTree(sqlData: any) {
  const tree = []
  // 递归函数，将数组转换为树形结构
  function convertToTreeNode(sqlItem: any) {
    const {
      box,
      boxName,
      hpath,
      id,
      fcontent,
      parent_id,
      path,
      markdown,
      ...otherAttr
    } = sqlItem

    // 查找或创建box节点
    let boxNode = tree.find(
      (node: any) => node.type === 'box' && node.key === box
    )
    if (!boxNode) {
      boxNode = {
        type: 'box',
        label: boxName,
        key: box,
        children: [],
      }
      tree.push(boxNode)
    }

    // 根据path拆分成数组
    const pathParts = path.slice(1, -3).split('/').filter(Boolean)
    const hpathParts = hpath.slice(1).split('/').filter(Boolean)

    // 查找或创建doc节点
    let parentNode = boxNode
    pathParts.forEach((path: any, index: number) => {
      let docNode = parentNode.children.find(
        (node: any) => node.type === 'doc' && node.key === path
      )
      if (!docNode) {
        docNode = {
          type: 'doc',
          label: hpathParts[index],
          key: path,
          children: [],
        }
        parentNode.children.push(docNode)
      }
      parentNode = docNode
    })

    // 创建task节点
    const taskNode = {
      ...otherAttr,
      type: 'task',
      label: fcontent,
      highlightLabel: fcontent,
      key: id,
      status: markdown.includes('* [ ]') ? 'todo' : 'done',
      children: null,
    }
    parentNode.children.push(taskNode)

    // 如果有父节点，则递归处理
    if (parent_id) {
      const parentObj = sqlData.find((item: any) => item.id === parent_id)
      if (parentObj) {
        convertToTreeNode(parentObj)
      }
    }
  }
  sqlData.forEach((obj: any) => convertToTreeNode(obj))
  return tree
}

/**
 * 将树形数据转换为列表数据
 * @param tree 树形数据
 * @returns
 */
export function convertToList(tree: any) {
  const list = []
  // 递归函数，将树形结构转换为列表数据
  function convertToTaskList(node: any, box: any, pathList: any) {
    if (node.type === 'task') {
      const taskNode = {
        ...node,
        type: 'task',
        label: node.label,
        key: node.key,
        box: { key: box.key, label: box.label },
        pathList: pathList.map((doc: any) => ({
          key: doc.key,
          label: doc.label,
        })),
      }
      list.push(taskNode)
    }

    if (node.children) {
      if (node.type === 'box') {
        box = { key: node.key, label: node.label }
      } else if (node.type === 'doc') {
        pathList.push({ key: node.key, label: node.label })
      }

      node.children.forEach((child: any) => {
        convertToTaskList(child, box, pathList)
      })

      if (node.type === 'doc') {
        pathList.pop()
      }
    }
  }

  tree.forEach((node: any) => {
    convertToTaskList(node, {}, [])
  })

  return list
}

/**
 * 获取任务列表
 * @param range {IRange} 模式：doc, box, workspace
 * @param status {string} 模式：todo, doing, done
 * @param isList {boolean} 是否想要列表形式的数据，默认是树形结构
 */
export async function getTaskListBySql({
  range,
  status,
}: {
  range: IRange
  status: string
}) {
  let params = {
    status,
  }
  if (range === 'doc') {
    Object.assign(params, {
      boxId: currentBoxId,
      docId: currentDocId,
    })
  } else if (range === 'box') {
    Object.assign(params, {
      boxId: currentBoxId,
    })
  }
  const res: TResponse<Array<TSqlResItem>> = await API.getTaskListBySql(params)

  let treeData = convertSqlToTree(res.data)
  if (range === 'doc') {
    treeData = convertToList(treeData)
  } else if (range === 'box') {
    treeData = treeData[0]?.children
  }

  return treeData
}

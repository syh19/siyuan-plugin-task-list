import * as sy from 'siyuan'
import TaskListPlugin from '../index'
import * as sySDK from '@siyuan-community/siyuan-sdk'
import * as API from '../api/index'
import type { IRange, TSqlResItem, TResponse } from '../types'
import * as func from './func'
import eventBus from './eventBus'
import * as date from './date'
import * as tree from './handleTreeData'

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
      box: { key: box, label: boxName },
      key: id,
      pathList: pathParts.map((doc: any, index: number) => ({
        label: hpathParts[index],
        key: path,
      })),
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
 * 隐藏树中的doc节点，只保留box和task的层级结构
 */
export function convertTreeToBoxTaskTree(tree: any) {
  // 递归处理其中的doc节点，将所有doc节点内部的task节点全部放到box.children中，去掉doc节点
  function getTaskListInDoc(doc: any) {
    const taskList = []
    doc.children.forEach((node: any) => {
      if (node.type === 'task') {
        taskList.push(node)
      } else if (node.type === 'doc') {
        taskList.push(...getTaskListInDoc(node))
      }
    })
    return taskList
  }
  const newTree = []
  tree.forEach((box: any) => {
    const newBox = {
      ...box,
      children: [],
    }

    box.children.forEach((node: any) => {
      if (node.type === 'doc') {
        newBox.children.push(...getTaskListInDoc(node))
      } else {
        newBox.children.push(node)
      }
    })
    newTree.push(newBox)
  })
  return newTree
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
 * @param status {string} 模式：todo, done, all
 * @param isList {boolean} 是否想要列表形式的数据，默认是树形结构
 */
export async function getTaskListForDisplay({
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
  const res: TResponse<Array<TSqlResItem>> = await API.getTaskListBySql({
    ...params,
    isGetAll: false,
  })

  let taskList: any[] = formatSqlTaskList(res.data)
  const { data: storage } = await API.getLocalStorage()

  taskList = filterTaskListByDateRange(taskList, storage)
  let treeData = convertSqlToTree(taskList)

  if (
    storage['plugin-task-list-settings']?.['taskTreeDisplayMode'] ===
    'box-doc-task'
  ) {
    if (range === 'doc') {
      treeData = convertToList(treeData)
    } else if (range === 'box') {
      treeData = treeData[0]?.children || []
    }
  } else if (
    storage['plugin-task-list-settings']?.['taskTreeDisplayMode'] === 'box-task'
  ) {
    treeData = convertTreeToBoxTaskTree(treeData)
    if (range === 'doc') {
      treeData = treeData[0]?.children || []
    } else if (range === 'box') {
      // const newTreeData = []
      // treeData.forEach((box: any) => {
      //   newTreeData.push(...box.children)
      // })
      // treeData = newTreeData
      treeData = treeData[0]?.children || []
    }
  }

  treeData = tree.sortTaskTreeData(
    treeData,
    storage['plugin-task-list-settings']['taskSortBy'] || 'createdAsc'
  )
  return treeData
}

function formatSqlTaskList(sqlTaskList: any[]) {
  return sqlTaskList.map((item: any) => {
    return {
      ...item,
      label: item.fcontent,
      key: item.id,
      status: item.markdown.substring(0, 5) === '* [ ]' ? 'todo' : 'done',
      finished:
        func.parseStringToKeyValuePairs(item.ial)[
          'custom-plugin-task-list-finished'
        ] || '',
      handleAt:
        func.parseStringToKeyValuePairs(item.ial)[
          'custom-plugin-task-list-handleAt'
        ] || item.created,
    }
  })
}

/** 周视图中选择的日期；通过事件weekly-date-clicked进行更新 */
let dateForWeeklyCalendar: string = date.formatDate(new Date())
eventBus.on('weekly-date-clicked', (dataStr: string) => {
  dateForWeeklyCalendar = dataStr
})

function filterTaskListByDateRange(taskList: any[], storage: any) {
  // 根据日期范围进行过滤
  const taskFilterWay: string =
    storage['plugin-task-list-filters']?.['taskFilterWay']
  if (taskFilterWay === 'weekSingle') {
    taskList = taskList.filter((task: any) => {
      if (dateForWeeklyCalendar) {
        return (
          (dateForWeeklyCalendar || date.formatDate(new Date())).substring(
            0,
            8
          ) === task.handleAt.substring(0, 8)
        )
      } else {
        return true
      }
    })
  } else {
    const dateRangeFormat: string =
      storage['plugin-task-list-filters']?.['dateRangeFormat']

    // 如果设置了筛选范围
    if (dateRangeFormat) {
      let startDate = ''
      let endDate = ''
      // 动态日期范围
      if (dateRangeFormat === 'dynamic') {
        const dynamicDateRange: string =
          storage['plugin-task-list-filters']['dynamicDateRange']
        if (dynamicDateRange) {
          startDate = date.getDateRangeByEnumValue(dynamicDateRange).start
          endDate = date.getDateRangeByEnumValue(dynamicDateRange).end

          taskList = taskList.filter((task: any) => {
            return date.isDateInRange(task.handleAt, startDate, endDate)
          })
        }
      }
      // 静态日期范围
      else {
        const staticDateRange: string[] =
          storage['plugin-task-list-filters']['staticDateRange']
        if (staticDateRange.length) {
          startDate = staticDateRange[0]
          endDate = staticDateRange[1]

          taskList = taskList.filter((task: any) => {
            return date.isDateInRange(task.handleAt, startDate, endDate)
          })
        }
      }
    }
  }
  return taskList
}

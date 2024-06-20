import * as API from '../api'

/**
 * 【未使用】
 * 根据配置中的列表对 treeData 进行过滤，删掉存在于 配置 中的 doc 节点，需要递归
 * @param e
 * @param treeData
 */
export const refreshTaskAfterHideDocChecked = async (
  treeData: any
): Promise<Array<any>> => {
  const { data: storage } = await API.getLocalStorage()
  let checkedNodeList =
    storage['plugin-task-list-settings']?.['nodeListForHideTask']
  // 递归删除选中的doc节点
  function removeDocNode(node: any) {
    let findedNodeInChecked = checkedNodeList.find(
      (item: any) => item.key === node.key
    )
    // 如果找到了需要删除任务的节点
    if (findedNodeInChecked) {
      if (findedNodeInChecked.hideTaskInNodeStatus === 1) {
        // 删除children中type===task的孩子
        node.children = node.children?.filter((item: any) => {
          if (item.type === 'task') {
            return false
          }
          if (item.children) {
            removeDocNode(item)
          }
          return true
        })
      } else if (findedNodeInChecked.hideTaskInNodeStatus === 2) {
        // #syh-fix-me  如何删除节点本身
        node.children = []
      }
    }
    // 如果没找到，进行递归处理
    else {
      node.children = node.children?.map((item: any) => {
        if (item.children) {
          removeDocNode(item)
        }
        return item
      })
    }

    return node
  }
  return treeData?.map((item: any) => {
    return removeDocNode(item)
  })
}

/**
 * 根据localStorage中的数据设置树节点的勾选状态
 */
export const handleCheckStatusForTreeData = async (
  treeData: any
): Promise<Array<any>> => {
  const { data: storage } = await API.getLocalStorage()

  let nodeListForHideTask =
    storage['plugin-task-list-settings']?.['nodeListForHideTask']
  function setCheckStatus(node: any) {
    if (nodeListForHideTask) {
      nodeListForHideTask.forEach((item: any) => {
        if (item.key === node.key) {
          node.hideTaskInNodeStatus = item.hideTaskInNodeStatus
        }
      })
    }
    if (node.children?.length) {
      node.children.forEach((item: any) => {
        setCheckStatus(item)
      })
    }
    return node
  }
  return treeData.map((item: any) => {
    return setCheckStatus(item)
  })
}

/**
 * 找到树数据中被勾选的用于隐藏任务的节点列表
 * @returns 树数据中被勾选的用于隐藏任务的节点列表
 */
export const findHiddenTaskNodesInTreeData = (treeData: any): Array<any> => {
  let hiddenTaskNodes: any[] = []
  function findHiddenTaskNodes(node: any) {
    // 勾选了仅自身
    if (node.hideTaskInNodeStatus === 1) {
      hiddenTaskNodes.push({
        ...node,
        children: null,
      })
    }
    // 勾选了包含子节点则直接忽略子节点
    else if (node.hideTaskInNodeStatus === 2) {
      node.children = []
      hiddenTaskNodes.push({
        ...node,
        children: null,
      })
    }
    if (node.children?.length) {
      node.children.forEach((item: any) => {
        findHiddenTaskNodes(item)
      })
    }
  }
  treeData.forEach((item: any) => {
    findHiddenTaskNodes(item)
  })
  return hiddenTaskNodes
}

/**
 * 将树数据中的任务节点过滤掉
 */
export const handleTreeDataWithoutTaskNode = (
  treeData: Array<any>
): Array<any> => {
  function removeTaskNode(node: any) {
    node.hideTaskInNodeStatus = 0
    node.children = node.children.filter((item: any) => {
      if (item.type === 'task') {
        return false
      }
      if (item.children) {
        removeTaskNode(item)
      }
      return true
    })
    return node
  }
  treeData.forEach((item: any) => {
    item = removeTaskNode(item)
  })
  return treeData
}

/**
 * 额外的置顶排序
 * @param a
 * @param b
 * @param sortBy
 * @param isDesc
 * @returns
 */
const sortByTopNum = (a: any, b: any, sortBy: string, isDesc: boolean) => {
  if (a.topNum > 0 && b.topNum > 0) {
    return b.topNum - a.topNum // topNum 大的置顶
  } else if (a.topNum > 0) {
    return -1 // a 置顶
  } else if (b.topNum > 0) {
    return 1 // b 置顶
  } else {
    if (isDesc) {
      return b[sortBy] - a[sortBy]
    } else {
      return a[sortBy] - b[sortBy]
    }
  }
}

/** 节点的排序方法 */
const sortNodeMethod = (a: any, b: any, sortBy: string) => {
  // const taskTopSorted: number = a.topNum - b.topNum
  let sortRes: number = 0
  // 根据sortBy进行排序，有创建时间、更新时间、完成时间等
  if (['createdDesc', 'createdAsc'].includes(sortBy)) {
    if (sortBy === 'createdDesc') {
      sortRes = sortByTopNum(a, b, 'created', true)
    } else {
      sortRes = sortByTopNum(a, b, 'created', false)
    }
  } else if (['updatedDesc', 'updatedAsc'].includes(sortBy)) {
    if (sortBy === 'updatedDesc') {
      sortRes = sortByTopNum(a, b, 'updated', true)
    } else {
      sortRes = sortByTopNum(a, b, 'updated', false)
    }
  } else if (['finishedDesc', 'finishedAsc'].includes(sortBy)) {
    if (sortBy === 'finishedDesc') {
      sortRes = sortByTopNum(a, b, 'finished', true)
    } else {
      sortRes = sortByTopNum(a, b, 'finished', false)
    }
  }
  return sortRes
}

/** 判断某个节点下是否有任务节点 */
// const isNodeHasChildrenTask = (node: any): boolean => {
//   if (node.children?.length) {
//     return node.children.some((item: any) => item.type === 'task')
//   } else {
//     return false
//   }
// }

/**
 * 任务节点的排序方法
 * @param treeData
 * @param sortBy
 * @returns treeData 排序后的树形数据
 */
export const sortTaskTreeData = (treeData: any, sortBy: string): Array<any> => {
  function sortTaskNode(node: any): any {
    if (node.children) {
      node.children.sort((a: any, b: any) => {
        return sortNodeMethod(a, b, sortBy)
      })
      node.children.forEach((item: any) => {
        sortTaskNode(item)
      })
    }
    return node
  }

  if (treeData.length === 0) return treeData

  // 如果显示的任务节点没有层级，即只有一层
  if (treeData[0].type === 'task') {
    treeData.sort((a: any, b: any) => {
      return sortNodeMethod(a, b, sortBy)
    })
  } else {
    treeData = treeData?.map((item: any) => {
      return sortTaskNode(item)
    })
  }
  return treeData
}

/**
 * 统计各个维度的任务数量或者统计某个笔记本下的任务数量
 * @param treeData 树形数据
 * @param boxId 笔记本ID，统计某个笔记本中的任务数量
 * @param docId 文档ID，统计某个文档中的任务数量
 * @returns 任务数量
 */
// export const getTaskNodeCountsInTree = (
//   treeData: any = [],
//   boxId?: string,
//   docId?: string
// ): number => {
//   let count = 0
//   function getTaskNodeCounts(node: any) {
//     if (node.type === 'doc' && docId && node.key === docId) {
//       count = node.filter((item: any) => item.type === 'task').length
//       return
//     }

//     if (node.type === 'task') {
//       count++
//     }
//     if (node.children?.length) {
//       node.children.forEach((item: any) => {
//         getTaskNodeCounts(item)
//       })
//     }
//   }
//   for (let i = 0; i < treeData.length; i++) {
//     if (boxId && treeData[i].key === boxId) {
//       count = 0
//       getTaskNodeCounts(treeData[i])
//       break
//     }
//     getTaskNodeCounts(treeData[i])
//   }
//   return count
// }

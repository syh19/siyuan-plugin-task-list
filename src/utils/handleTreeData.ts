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
  let checkedNodeList = storage.nodeListForHideTask
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

  let nodeListForHideTask = storage.nodeListForHideTask
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

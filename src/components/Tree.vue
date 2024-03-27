<template>
  <div class="tree-wrap">
    <el-tree
      style="max-width: 1000px"
      :data="treeData"
      ref="treeRef"
      node-key="key"
      check-strictly
      :default-expand-all="defaultExpandAll"
      :show-checkbox="false"
      :empty-text="i18n.emptyText"
      highlight-current
      :filter-node-method="filterTreeNode"
      :props="defaultProps"
      @node-click="clickNode"
      @check="checkNode"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node" :title="node.label">
          <svg
            v-if="data.type === 'box'"
            class="icon icon-box"
            aria-hidden="true"
          >
            <use xlink:href="#icon-notebook_bookmarked"></use>
          </svg>

          <svg
            v-else-if="data.type === 'doc'"
            class="icon icon-doc"
            aria-hidden="true"
          >
            <use xlink:href="#icon-document_text"></use>
          </svg>
          <svg
            v-else-if="data.status === 'todo'"
            class="icon icon-todo"
            aria-hidden="true"
          >
            <use xlink:href="#icon-time-circle-fill"></use>
          </svg>
          <svg
            v-else-if="data.status === 'done'"
            class="icon icon-done"
            aria-hidden="true"
          >
            <use xlink:href="#icon-check-circle-fill"></use>
          </svg>
          <span
            style="padding-left: 10px"
            v-html="data.highlightLabel || data.label"
          ></span>
          <div class="hide-task-in-node-checkbox-wrap">
            <el-checkbox
              v-for="range in hideRangeList"
              v-model="data.hideTaskInNodeStatus"
              v-show="!(data.type === 'box' && range.value === 1)"
              :key="range.value"
              :label="range.label"
              :true-value="range.value"
              :false-value="0"
              @click.stop
              @change="changeNodeHideStatus($event, range, data)"
            />
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, defineProps } from 'vue'
import { toRaw } from '@vue/reactivity'
import * as utils from '../utils/common'
import { i18n } from '../utils/common'
import * as sy from 'siyuan'
import type { IRange } from '../types/index'
import { ElTree } from 'element-plus'
/** 选择隐藏任务节点方式的复选框选项 */
const hideRangeList = ref<Array<any>>([
  { label: '仅自身', value: 1 },
  { label: '包含子节点', value: 2 },
])
interface Tree {
  [key: string]: any
}
interface Props {
  treeData: Array<any>
  filterText: string
  defaultExpandAll: boolean
}

const treeRef = ref<InstanceType<typeof ElTree>>()

const props = withDefaults(defineProps<Props>(), {
  treeData: () => [],
  filterText: '',
  defaultExpandAll: false,
})

watch(
  () => props.treeData,
  (val: any) => {
    if (val.length) {
      setDiffClassForNode()
    }
  },
  { immediate: false }
)

const app = ref<sy.App>({ plugins: [], appId: '' })

/** 高亮搜索的关键字 */
const handleHighLightSearchText = (text: string) => {
  return text.replace(
    new RegExp(props.filterText, 'g'),
    `<span style="color: #5182ee; font-weight: bold">${props.filterText}</span>`
  )
}

const range = ref<IRange>('doc')

const trigger = ref<'tab' | 'tree'>('tab')
utils.plugin.eventBus.on('switch-protyle', () => {
  // 如果是点击树的节点导致文档TAB切换了，不要重新刷新数据
  if (trigger.value === 'tree') {
    trigger.value = 'tab'
    return
  }
  // 如果当前的筛选范围是整个工作区，不需要重新刷新数据
  if (range.value === 'workspace') {
    return
  }
})

/**
 * 过滤树节点
 * @param value
 * @param data
 */
const filterTreeNode = (value: string, data: any) => {
  // if (!value) return true
  if (data.type !== 'task') return false
  data.highlightLabel = handleHighLightSearchText(data.label)
  return data.label.indexOf(value) !== -1
}

/**
 * 折叠或者展开所有节点
 */
const toggleExpand = (isExpandNew: boolean) => {
  let nodes = treeRef.value.store.nodesMap
  for (let i in nodes) {
    nodes[i].expanded = isExpandNew
  }
}

/**
 * 勾选用于隐藏任务的文档或者笔记本节点
 * @param e 复选框选中的值
 * @param range 当前点击的是哪个复选框
 * @param data 所在的树节点
 */
const changeNodeHideStatus = (e: any, range: any, data: any) => {
  let nodeEle = document.querySelector(
    `div.el-tree-node[data-key="${data.key}"]`
  )
  nodeEle.classList.remove('hide-task-only-self')
  nodeEle.classList.remove('hide-task-include-child')
  if (e !== 0) {
    // 仅自身
    if (range.value === 1) {
      data.hideTaskInNodeStatus = 1
      nodeEle.classList.add('hide-task-only-self')
    }
    // 包含子节点
    else {
      data.hideTaskInNodeStatus = 2
      nodeEle.classList.add('hide-task-include-child')
    }
  } else {
    data.hideTaskInNodeStatus = 0
  }
}

/**
 * 设置节点的样式
 */
const setDiffClassForNode = () => {
  let nodes = treeRef.value.store.nodesMap
  for (let i in nodes) {
    let node = nodes[i]
    let data = node.data
    let nodeEle = document.querySelector(
      `div.el-tree-node[data-key="${data.key}"]`
    )
    nodeEle.classList.remove('hide-task-only-self')
    nodeEle.classList.remove('hide-task-include-child')
    if (data.hideTaskInNodeStatus === 1) {
      nodeEle.classList.add('hide-task-only-self')
    } else if (data.hideTaskInNodeStatus === 2) {
      nodeEle.classList.add('hide-task-include-child')
    }
  }
}

const isExpand = ref<boolean>(true)
watch(
  isExpand,
  (val) => {
    toggleExpand(val)
  },
  { immediate: false }
)

/**
 * 打开文档并滚动到指定任务节点
 * @param docId 文档ID，即数据库中的root_id
 * @param taskNodeId 任务节点ID
 */
const openDocAndScrollTaskNode = async (docId: string, taskNodeId: string) => {
  if (docId !== utils.currentDocId) {
    // 打开文档
    sy.openTab({
      app: app.value,
      doc: {
        id: docId,
        zoomIn: false,
      },
    })
    // 延时滚动到指定的node节点
    await utils.sleep(300)
  }
  let taskEle: any = document.querySelector(
    `.layout-tab-container .protyle-content .protyle-wysiwyg [data-node-id="${taskNodeId}"][data-type="NodeListItem"] div:nth-child(2)[data-type="NodeParagraph"]`
  )
  taskEle?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  })
  // 临时高亮节点
  nextTick(async () => {
    taskEle.classList.add('plugin-task-list__hightlight-node')
    await utils.sleep(1500)
    taskEle.classList.remove('plugin-task-list__hightlight-node')
  })
}
// ---------------------------方法 Start-------------------------
/**
 * 获取所有子节点
 * @param node
 */
const getChildNodes = (node: any) => {
  let nodes: any[] = []
  if (node.children) {
    node.children.forEach((item: any) => {
      nodes.push(item)
      nodes = nodes.concat(getChildNodes(item))
    })
  }
  return nodes
}

// ---------------------------方法 End-------------------------

interface Tree {
  label: string
  children?: Tree[]
}

const clickNode = async (data: Tree) => {
  if (data.type === 'task') {
    trigger.value = 'tree'
    await utils.sleep(10)
    openDocAndScrollTaskNode(data.root_id, data.key)
  }
}

/**
 * 如果勾选的节点有子节点，就一并勾选所有子节点
 * 如果取消勾选，就取消所有子节点
 */
const checkNode = (data: any) => {
  console.log(toRaw(data))
  let checkedNodes: any[] = treeRef.value!.getCheckedNodes(false)
  let childNodes = getChildNodes(data)
  let isNodeChacked = checkedNodes.find((node: any) => node.key === data.key)
  // 如果勾选，就勾选所有子节点
  if (isNodeChacked) {
    checkedNodes = checkedNodes.concat(childNodes)
  } else {
    checkedNodes = checkedNodes.filter(
      (node: any) => !childNodes.find((item: any) => item.key === node.key)
    )
  }
  treeRef.value!.setCheckedNodes(checkedNodes)
  // emit('check', checkedNodes)
}

const defaultProps = {
  children: 'children',
  label: 'label',
  disabled: 'disabled',
  isLeaf: (data: any) => {
    return data.type === 'task'
  },
  class: (data: any) => {
    return data.type === 'task' ? 'tree-task-node' : 'tree-dir-node'
  },
}
</script>

<style lang="scss">
@import '../styles/handle.scss';
.tree-wrap {
  .el-tree {
    background-color: transparent !important;
    height: calc(100% - 103px);
    overflow: auto;
    padding-bottom: 30px;
    // margin-top: 8px;

    &::-webkit-scrollbar {
      display: none;
    }

    .el-tree-node {
      &.tree-dir-node.is-current {
        .el-tree-node__content {
          background-color: transparent !important;
          &:hover {
            @include background_color('hoverBgColor');
          }
        }
      }
      &.is-current.tree-task-node {
        .el-tree-node__content {
          @include background_color('activeBgColor');
        }
      }
      .el-tree-node__content {
        &:hover {
          @include background_color('hoverBgColor');
        }

        // 修改el-checkbox的位置为右侧对齐
        .el-checkbox {
          // position: absolute;
          // right: 10px;
          // margin: 0;
        }
        div.custom-tree-node {
          width: calc(100% - 20px);
          display: flex;
          justify-content: flex-start;
          align-items: center;
          @include color('fontColor');
          svg.icon {
            font-size: 18px;
            &.icon-box {
              @include color('notebookColor');
            }
            &.icon-doc {
              @include color('docColor');
            }
            &.icon-todo {
              @include color('todoColor');
            }
            &.icon-done {
              @include color('doneColor');
            }
          }
          span {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .hide-task-in-node-checkbox-wrap {
            flex-shrink: 0;
            width: 170px;
            .el-checkbox {
              width: 80px;

              .el-checkbox__input {
                width: 16px;
              }
            }
            .el-checkbox:first-child {
              margin-right: 10px;
            }
          }
        }
      }
    }

    /**
     * 勾选【仅自身】或者【包含子节点】选项后对相应的节点做样式区分处理
     * 【仅自身】时将节点自身中的文字添加划线，并将字体颜色变成灰色
      * 【包含子节点】时则同时处理节点自身以及所属子节点 
     */
    div.el-tree-node.hide-task-only-self {
      > .el-tree-node__content {
        span {
          text-decoration: line-through;
          color: #ccc;
        }
      }
    }

    div.el-tree-node.hide-task-include-child {
      .el-tree-node__content {
        span {
          text-decoration: line-through;
          color: #ccc;
        }
      }
      .el-tree-node__children {
        .el-tree-node__content {
          .el-checkbox {
            display: none;
          }
        }
      }
    }
  }
}
</style>

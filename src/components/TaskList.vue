<template>
  <div class="plugin-task-list-wrap">
    <div class="head-wrap">
      <!-- 头部区域 -->
      <div class="title">
        <div class="title-text">
          <h3 @click="openDrawer">
            <svg style="margin-right: 5px" class="icon" aria-hidden="true">
              <use xlink:href="#icon-task3"></use></svg
            >{{ i18n.pluginTitle }}
          </h3>
          <span @click="toggleTaskStatus"
            >({{ taskStatusMap[taskStatus] }})</span
          >
        </div>
        <div v-show="!isInputShow" class="btn-list">
          <el-tooltip
            effect="dark"
            :content="i18n.options.refresh"
            placement="bottom"
          >
            <svg class="icon" aria-hidden="true" @click="refreshData">
              <use xlink:href="#icon-sync"></use>
            </svg>
          </el-tooltip>

          <el-tooltip
            effect="dark"
            :content="isExpand ? i18n.options.collapse : i18n.options.expand"
            placement="bottom"
          >
            <svg class="icon" aria-hidden="true" @click="isExpand = !isExpand">
              <use
                :xlink:href="
                  isExpand ? '#icon-vertical-align-middl' : '#icon-colum-height'
                "
              ></use>
            </svg>
          </el-tooltip>

          <el-tooltip
            effect="dark"
            :content="i18n.options.switch"
            placement="bottom"
          >
            <svg class="icon" aria-hidden="true" @click="toggleTaskStatus">
              <use xlink:href="#icon-repeat"></use>
            </svg>
          </el-tooltip>

          <el-tooltip
            effect="dark"
            :content="i18n.options.search"
            placement="bottom"
          >
            <svg class="icon" aria-hidden="true" @click="showInput">
              <use xlink:href="#icon-search3"></use>
            </svg>
          </el-tooltip>
        </div>
        <el-input
          v-show="isInputShow"
          ref="inputRef"
          :placeholder="i18n.searchPlaceholder"
          v-model="filterText"
          @blur="isInputShow = false"
          @keyup.enter="triggerFiltrateTreeNode(filterText)"
        ></el-input>
      </div>
      <!-- tabs选项 -->
      <el-tabs v-model="range" stretch type="card" @tab-change="refreshData">
        <!-- 文档 -->
        <el-tab-pane name="doc" :label="i18n.range.doc">
          <template #label>
            <span>{{ i18n.range.doc }}</span>
          </template>
        </el-tab-pane>
        <!-- 笔记本 -->
        <el-tab-pane name="box" :label="i18n.range.box">
          <template #label>
            <span>{{ i18n.range.box }}</span>
          </template>
        </el-tab-pane>
        <!-- 工作空间 -->
        <el-tab-pane name="workspace" :label="i18n.range.workspace">
          <template #label>
            <span>{{ i18n.range.workspace }}</span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 树形数据区域 -->
    <el-tree
      style="max-width: 600px"
      :data="data"
      ref="treeRef"
      :empty-text="i18n.emptyText"
      highlight-current
      :filter-node-method="filterTreeNode"
      :props="defaultProps"
      @node-click="handleNodeClick"
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
        </div>
      </template>
    </el-tree>

    <Setting ref="settingRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
// import { toRaw } from '@vue/reactivity'
import * as utils from '../utils/common'
import { i18n } from '../utils/common'
import * as API from '../api'
import * as sy from 'siyuan'
import type { IRange } from '../types/index'
import { ElTree, ElInput } from 'element-plus'
import Setting from './Setting.vue'
import eventBus from '../utils/eventBus'
import * as treeFn from '../utils/handleTreeData'

interface Tree {
  [key: string]: any
}

let settingRef = ref<InstanceType<typeof Setting>>()

const openDrawer = () => {
  settingRef.value?.open()
  nextTick(() => {
    document.body.style.width = '100%'
  })
}
const treeRef = ref<InstanceType<typeof ElTree>>()
const inputRef = ref<InstanceType<typeof ElInput>>()
const showInput = () => {
  isInputShow.value = true
  nextTick(() => {
    inputRef.value.focus()
  })
}
const isInputShow = ref<boolean>(false)

const app = ref<sy.App>({ plugins: [], appId: '' })
let data = ref<any>([])
let taskStatus = ref<string>('todo')
const taskStatusMap = ref<any>({
  todo: i18n.taskStatus.todo,
  done: i18n.taskStatus.done,
  all: i18n.taskStatus.all,
})

/** 高亮搜索的关键字 */
const handleHighLightSearchText = (text: string) => {
  return text.replace(
    new RegExp(filterText.value, 'g'),
    `<span style="color: #5182ee; font-weight: bold">${filterText.value}</span>`
  )
}
const toggleTaskStatus = () => {
  const statusList = ['todo', 'done', 'all']
  // 循环切换状态
  let index = statusList.indexOf(taskStatus.value)
  index = index === statusList.length - 1 ? 0 : index + 1
  taskStatus.value = statusList[index]

  refreshData()
}

const range = ref<IRange>('doc')
const filterText = ref<string>('')

/**
 * 刷新数据重新获取el-tree的数据
 */
const refreshData = async () => {
  let res = await utils.getTaskListForDisplay({
    range: range.value,
    status: taskStatus.value,
  })
  // data.value = await treeFn.refreshTaskAfterHideDocChecked(res)
  data.value = res

  // 根据按钮状态展开或者收起所有节点
  nextTick(() => {
    toggleExpand(isExpand.value)
  })
}
eventBus.on('node-list-for-hide-task-changed', refreshData)

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

  refreshData()
})

watch(filterText, (val: string) => {
  triggerFiltrateTreeNode(val)
})

/**
 * 触发过滤树节点
 * @param val
 */
const triggerFiltrateTreeNode = (val: string) => {
  treeRef.value!.filter(val)
}

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

const isExpand = ref<boolean>(true)
watch(
  isExpand,
  (val) => {
    toggleExpand(val)
  },
  { immediate: false }
)

refreshData()

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

// ---------------------------方法 End-------------------------

interface Tree {
  label: string
  children?: Tree[]
}

const handleNodeClick = async (data: Tree) => {
  if (data.type === 'task') {
    trigger.value = 'tree'
    await utils.sleep(10)
    openDocAndScrollTaskNode(data.root_id, data.key)
  }
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

#siyuan-plugin-task-list {
  .plugin-task-list-wrap {
    height: 100%;
    max-width: 100%;
    .head-wrap {
      .title {
        padding: 0px 10px;
        height: 36px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        div.title-text {
          display: flex;
          align-items: center;
          h3 {
            margin: 0px;
          }
          span {
            margin-left: 5px;
            font-size: 12px;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 4px;
            &:hover {
              @include background_color('activeBgColor');
            }
          }
        }

        div.btn-list {
          display: flex;
          align-items: center;
          span + span {
            margin-left: 5px;
          }
          span {
            padding: 5px;
            border-radius: 5px;
            &:hover {
              cursor: pointer;
              @include background_color('activeBgColor');
            }
            svg.icon {
              font-size: 18px;
            }
          }
        }
        .el-input {
          // min-width: 200px;
          max-width: 60%;
          height: 30px;
          .el-input__wrapper {
            background-color: transparent;
          }
        }
      }
      .el-tabs {
        --el-tabs-header-height: 36px;
        .el-tabs__header {
          // @include border_color('tabsBorderColor');
          margin: 0px !important;
          .el-tabs__nav {
            @include border_color('tabsBorderColor');
            border-radius: 0px;
            .el-tabs__item {
              @include border_color('tabsBorderColor');
              @include color('fontColor');
              &:hover {
                @include background_color('hoverBgColor');
              }
              &.is-active {
                font-weight: bold;
                @include background_color('activeBgColor');
              }
            }
          }
        }
        .el-tabs__content {
          display: none;
        }
      }
    }
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
          }
        }
      }
    }
  }
}
</style>

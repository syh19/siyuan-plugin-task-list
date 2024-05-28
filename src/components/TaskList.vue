<template>
  <div class="plugin-task-list-wrap">
    <div class="head-wrap">
      <!-- 头部区域 -->
      <div class="title">
        <div class="title-text">
          <h3>
            <svg style="margin-right: 5px" class="icon" aria-hidden="true">
              <use xlink:href="#icon-task-green"></use></svg
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
          <el-badge is-dot :hidden="isHideBadge">
            <el-tooltip
              effect="dark"
              :content="i18n.options.filter"
              placement="bottom"
            >
              <svg
                class="icon"
                aria-hidden="true"
                @click="isTaskFilterDialogVisible = true"
              >
                <use xlink:href="#icon-filter1"></use>
              </svg>
            </el-tooltip>
          </el-badge>
          <el-tooltip
            effect="dark"
            :content="i18n.setting.title"
            placement="bottom"
          >
            <svg class="icon" aria-hidden="true" @click="openSettingDrawer">
              <use xlink:href="#icon-setting"></use>
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

      <DatePicker
        v-if="isShowWeekDateFilter"
        v-model="dateForShowTask"
        expanded
        :view="dockCalendarDisplayMode"
        transparent
        mode="date"
        :attributes="datePickerAttributes"
        :locale="datePickerLocale"
        @update:modelValue="dateChanged"
        @daymouseenter="handleDayMouseEnter"
      />

      <!-- tabs选项 -->
      <el-tabs v-model="range" stretch type="card" @tab-change="tabChanged">
        <!-- 文档 -->
        <el-tab-pane name="doc" :label="i18n.range.doc">
          <template #label>
            <span>{{ i18n.range.doc + ` (${docRangetaskCounter})` }}</span>
          </template>
        </el-tab-pane>
        <!-- 笔记本 -->
        <el-tab-pane name="box" :label="i18n.range.box">
          <template #label>
            <span>{{ i18n.range.box + ` (${boxRangetaskCounter})` }}</span>
          </template>
        </el-tab-pane>
        <!-- 工作空间 -->
        <el-tab-pane name="workspace" :label="i18n.range.workspace">
          <template #label>
            <span>{{
              i18n.range.workspace + ` (${workBenchRangetaskCounter})`
            }}</span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 树形数据区域 -->
    <el-tree
      :data="treeData"
      ref="treeRef"
      :empty-text="i18n.emptyText"
      highlight-current
      :filter-node-method="filterTreeNode"
      :props="defaultProps"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div
          class="custom-tree-node icon-label-wrap"
          @mouseenter="handleMouseEnter($event, data)"
        >
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
            @click.stop="changeTaskHandleDate(data)"
            @mouseenter="data.todoIcon = '#icon-handle'"
            @mouseleave="data.todoIcon = '#icon-time-circle-fill'"
          >
            <use :xlink:href="data.todoIcon || '#icon-time-circle-fill'"></use>
          </svg>
          <svg
            v-else-if="data.status === 'done'"
            class="icon icon-done"
            aria-hidden="true"
          >
            <use xlink:href="#icon-check-circle-fill"></use>
          </svg>
          <span>
            <span v-html="data.highlightLabel || data.label"> </span>
            <span v-if="data.type === 'box'">
              {{ ' (' + taskCountForEachBox[data.key] + ')' }}
            </span>
          </span>
        </div>
      </template>
    </el-tree>

    <Setting ref="settingRef" />
    <TaskFilter
      :visible="isTaskFilterDialogVisible"
      @close="isTaskFilterDialogVisible = false"
      @submit-success="taskFilterSubmitSuccess"
    />

    <AddHandleDate
      :visible="isAddHandleDateDialogVisible"
      :task-id="taskIdToAddHandleDate"
      @close="isAddHandleDateDialogVisible = false"
      @submit-success="addHandleDateSbumitSuccess"
    />
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
import TaskFilter from './TaskFilter.vue'
import eventBus from '../utils/eventBus'
import * as treeFn from '../utils/handleTreeData'
import infoCard from './infoCard/index'
import { Calendar, DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import * as date from '../utils/date'

interface Tree {
  [key: string]: any
}

let settingRef = ref<InstanceType<typeof Setting>>()

let dateForShowTask = ref<Date>(new Date())
const dateChanged = (e: Date) => {
  let dateParam: string = ''
  e && (dateParam = date.formatDate(e))
  eventBus.emit('weekly-date-clicked', dateParam)
  refreshData()
}

const handleDayMouseEnter = (day: any) => {
  const todoTaskNumInCurrentDay = datePickerAttributes.value[0].dateNumMap.get(
    day.id
  )
  const doneTaskNumInCurrentDay = datePickerAttributes.value[1].dateNumMap.get(
    day.id
  )

  datePickerAttributes.value[0].popover.label =
    '待处理 任务数量：' + todoTaskNumInCurrentDay
  datePickerAttributes.value[1].popover.label =
    '已完成 任务数量：' + doneTaskNumInCurrentDay
}

let isTaskFilterDialogVisible = ref<boolean>(false)
let isAddHandleDateDialogVisible = ref<boolean>(false)
/** 需要添加处理日期的任务ID */
let taskIdToAddHandleDate = ref<string>('')

const openSettingDrawer = () => {
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

const tabChanged = (e: string) => {
  API.setLocalStorageVal({
    key: 'plugin-task-list-taskRangeTabClicked',
    val: e,
  })

  refreshData()
}

const app = ref<sy.App>({ plugins: [], appId: '' })
let treeData = ref<any>([])
let taskStatus = ref<string>('todo')
const taskStatusMap = ref<any>({
  todo: i18n.taskStatus.todo,
  done: i18n.taskStatus.done,
  all: i18n.taskStatus.all,
})

const datePickerLocale = ref({
  id: i18n.language === 'English' ? 'en' : 'cn',
  firstDayOfWeek: 2,
  masks: { weekdays: 'WWW' },
})
const datePickerAttributes = ref([])
const handleMouseEnter = (e: any, data: any) => {
  infoCard.update(data, e.target)
}

const updateDateTask = () => {
  eventBus.on('each-day-task-list-changed', (e: any) => {
    datePickerAttributes.value = [
      e.todoTaskPopover,
      e.doneTaskPopover,
      // 今天的日期样式
      {
        content: 'blue',
        dates: new Date(),
      },
    ]
  })
}
updateDateTask()

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

let isShowWeekDateFilter = ref<boolean>(false)
const taskFilterSubmitSuccess = () => {
  refreshData()
  initConfig()
}

const addHandleDateSbumitSuccess = () => {
  // syh-fixeme 这里接口很慢，需要延迟刷新
  setTimeout(() => {
    refreshData()
  }, 3000)
}
const workBenchRangetaskCounter = ref<number>(0)
const boxRangetaskCounter = ref<number>(0)
const docRangetaskCounter = ref<number>(0)
/**
 * 刷新数据重新获取el-tree的数据
 */
const refreshData = async () => {
  let res = await utils.getTaskListForDisplay({
    range: range.value,
    status: taskStatus.value as any,
  })
  // treeData.value = await treeFn.refreshTaskAfterHideDocChecked(res)
  treeData.value = res

  // 根据按钮状态展开或者收起所有节点
  nextTick(() => {
    toggleExpand(isExpand.value)
  })
}

const taskCountForEachBox = ref<any>({})

eventBus.on('task-counts-in-three-ranges-changed', (e: any) => {
  taskCountForEachBox.value = e.taskCountForEachBox

  docRangetaskCounter.value = e.taskCountInDoc
  boxRangetaskCounter.value = e.taskCountForEachBox[utils.currentBoxId] || 0
  workBenchRangetaskCounter.value = Object.keys(e.taskCountForEachBox).reduce(
    (prev, cur) => {
      return prev + e.taskCountForEachBox[cur]
    },
    0
  )
})

eventBus.on('node-list-for-hide-task-changed', refreshData)
eventBus.on('add-handle-date-for-task-node', (taskId: string) => {
  isAddHandleDateDialogVisible.value = true
  taskIdToAddHandleDate.value = taskId
})

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

const changeTaskHandleDate = (taskInfo: any) => {
  isAddHandleDateDialogVisible.value = true
  taskIdToAddHandleDate.value = taskInfo.key
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

const isHideBadge = ref<boolean>(true)
const initTaskRangeTab = (storage: any) => {
  const currentTab: IRange = storage['plugin-task-list-taskRangeTabClicked']
  currentTab && (range.value = currentTab)
}

const dockCalendarDisplayMode = ref<'weekly' | 'monthly'>('weekly')
/**
 * 初始化时显示周视图以及判断是否显示badge
 */
const initConfig = async () => {
  const { data: storage } = await API.getLocalStorage()
  // 初始化展示哪个维度的TAB
  initTaskRangeTab(storage)

  const taskFilterWay: string =
    storage['plugin-task-list-filters']?.['taskFilterWay']
  isShowWeekDateFilter.value = taskFilterWay === 'dockCalendar'

  // 控制是否展示已经设置了过滤项的小红点
  if (isShowWeekDateFilter.value) {
    isHideBadge.value = true
  } else {
    const dateRangeFormat: string =
      storage['plugin-task-list-filters']?.['dateRangeFormat']
    if (dateRangeFormat) {
      // 动态日期范围
      if (dateRangeFormat === 'dynamic') {
        const dynamicDateRange: string =
          storage['plugin-task-list-filters']?.['dynamicDateRange']
        if (dynamicDateRange) {
          isHideBadge.value = false
        } else {
          isHideBadge.value = true
        }
      }
      // 静态日期范围
      else {
        const staticDateRange: string[] =
          storage['plugin-task-list-filters']?.['staticDateRange']
        if (staticDateRange.length) {
          isHideBadge.value = false
        } else {
          isHideBadge.value = true
        }
      }
    } else {
      isHideBadge.value = true
    }
  }

  // 设置日历视图的显示形式：周视图 OR 月视图
  const calendarMode: 'weekly' | 'monthly' =
    storage['plugin-task-list-filters']?.['dockCalendarDisplayMode']
  calendarMode && (dockCalendarDisplayMode.value = calendarMode)
}

initConfig()

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
    await utils.sleep(350)
  }
  let taskEle: any = document.querySelector(
    `.layout-tab-container .protyle-content .protyle-wysiwyg >div:not([data-type="NodeBlockQueryEmbed"]) [data-node-id="${taskNodeId}"][data-type="NodeListItem"] div:nth-child(2)[data-type="NodeParagraph"]`
  )
  taskEle?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  })
  // 临时高亮节点
  nextTick(async () => {
    taskEle?.classList.add('plugin-task-list__hightlight-node')
    await utils.sleep(1500)
    taskEle?.classList.remove('plugin-task-list__hightlight-node')
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
#siyuan-plugin-task-list {
  .plugin-task-list-wrap {
    height: 100%;
    max-width: 100%;
    .head-wrap {
      .title {
        padding: 0px 3px 0px 10px;
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
              background-color: var(--tl-color-active-bg);
            }
          }
        }

        div.btn-list {
          display: flex;
          align-items: center;
          span + span {
            margin-left: 4px;
          }
          span {
            padding: 4px;
            border-radius: 5px;
            &:hover {
              cursor: pointer;
              background-color: var(--tl-color-active-bg);
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
          // border-color: var(--tl-color-tabs-border);
          margin: 0px !important;
          .el-tabs__nav {
            border-color: var(--tl-color-tabs-border);
            border-radius: 0px;
            .el-tabs__item {
              border-color: var(--tl-color-tabs-border);
              color: var(--tl-color-text);
              &:hover {
                background-color: var(--tl-color-hover-bg);
              }
              &.is-active {
                font-weight: bold;
                background-color: var(--tl-color-active-bg);
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
      --el-tree-node-hover-bg-color: var(--tl-color-hover-bg);
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
              background-color: var(--tl-color-hover-bg);
            }
          }
        }
        &.is-current.tree-task-node {
          .el-tree-node__content {
            background-color: var(--tl-color-active-bg);
          }
        }
        .el-tree-node__content {
          &:hover {
            background-color: var(--tl-color-hover-bg);
          }
          div.custom-tree-node {
            width: calc(100% - 20px);
            height: 100%;
          }
        }
      }
    }
    &:has(.vc-container) .el-tree {
      height: calc(100% - 214px);
    }
  }
}
</style>

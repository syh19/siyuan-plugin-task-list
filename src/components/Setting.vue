<template>
  <el-drawer
    v-model="isShow"
    class="plugin-task-list-config-wrap"
    direction="ltr"
    append-to-body
    size="50%"
    :title="i18n.setting.title"
  >
    <template #default>
      <!-- 设置任务列表排序方式 -->
      <div class="setting-item setting-item__horizontal">
        <div class="setting-item__label">
          {{ i18n.setting.sortItem.sortBy }}
        </div>
        <div class="setting-item__content">
          <el-select
            v-model="localSettings.taskSortBy"
            :placeholder="i18n.setting.sortItem.placeholder"
            size="default"
            style="width: 240px"
          >
            <el-option
              v-for="item in sortOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <!-- 设置任务列表的展示方式 -->
      <div class="setting-item setting-item__horizontal">
        <div class="setting-item__label">
          {{ i18n.setting.taskListDisplayLabel }}
        </div>
        <div class="setting-item__content">
          <el-radio-group
            v-model="localSettings.taskTreeDisplayMode"
            class="ml-4"
          >
            <el-radio
              value="box-doc-task"
              :label="i18n.setting.boxDocTask"
              size="large"
            />
            <el-radio
              value="box-task"
              :label="i18n.setting.boxTask"
              size="large"
            />
          </el-radio-group>
        </div>
      </div>
      <!-- 设置任务列表某些节点不显示的树形组件 -->
      <div class="setting-item setting-item__vertical">
        <div class="setting-item__label">
          {{ i18n.setting.hideTaskTreeDesc }}
        </div>
        <div class="setting-item__content setting-tree-wrap">
          <Tree
            :treeData="treeData"
            :defaultExpandAll="true"
            @check="handleChecked2HideTask"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancel">{{ i18n.setting.cancel }}</el-button>
        <el-button type="primary" @click="submit">{{
          i18n.setting.confirm
        }}</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, defineExpose, watch } from 'vue'
import * as utils from '../utils/common'
import { i18n } from '../utils/common'
import * as API from '../api'
import eventBus from '../utils/eventBus'
import * as treeFn from '../utils/handleTreeData'

const isShow = ref<boolean>(false)
const treeData = ref<Array<any>>([])
// const taskTreeDisplayMode = ref<'box-doc-task' | 'box-task'>('box-doc-task')

watch(
  isShow,
  (val) => {
    if (val) {
      init()
    }
  },
  { immediate: false }
)

const init = async () => {
  getTreeData()
  getLocalStorage()
}

/**
 * 本地设置
 *
 */
const localSettings = ref<any>({
  /** 需要隐藏任务的节点，包括笔记本节点或者是文档节点 */
  nodeListForHideTask: [],
  /** 任务列表树的显示模式 */
  taskTreeDisplayMode: 'box-doc-task',
  /** 任务节点的排序方式 */
  taskSortBy: 'createdAsc',
})

const sortOptions = ref<Array<{ value: string; label: string }>>([
  {
    value: 'createdAsc',
    label: i18n.setting.sortItem.createdAsc,
  },
  {
    value: 'createdDesc',
    label: i18n.setting.sortItem.createdDesc,
  },
  {
    value: 'updatedAsc',
    label: i18n.setting.sortItem.updatedAsc,
  },
  {
    value: 'updatedDesc',
    label: i18n.setting.sortItem.updatedDesc,
  },
  {
    value: 'finishedAsc',
    label: i18n.setting.sortItem.finishedAsc,
  },
  {
    value: 'finishedDesc',
    label: i18n.setting.sortItem.finishedDesc,
  },
])

const getLocalStorage = async () => {
  const { data: storage } = await API.getLocalStorage()
  if (!storage['plugin-task-list-settings']) return
  const { nodeListForHideTask, taskTreeDisplayMode, taskSortBy } =
    storage['plugin-task-list-settings']

  nodeListForHideTask &&
    (localSettings.value.nodeListForHideTask = nodeListForHideTask)
  taskTreeDisplayMode &&
    (localSettings.value.taskTreeDisplayMode = taskTreeDisplayMode)
  taskSortBy && (localSettings.value.taskSortBy = taskSortBy)
}

/**
 * 获取el-tree的数据
 */
const getTreeData = async () => {
  let res: any = await API.getTaskListBySql({
    isGetAll: true,
  })
  let resTreeData: any = utils.convertSqlToTree(res.data)
  // 这里必须这么写，因为子组件做了watch监听，如果直接赋值，子组件不会触发watch
  treeData.value = treeFn.handleTreeDataWithoutTaskNode(resTreeData)
  treeData.value = await treeFn.handleCheckStatusForTreeData(treeData.value)
}

const checkedNodes = ref<Array<any>>([])
const handleChecked2HideTask = async (e: any) => {
  checkedNodes.value = e
}

const cancel = () => {
  isShow.value = false
}

const submit = async () => {
  // 找到treeData中被勾选的节点
  let hiddenTaskNodes: any[] = treeFn.findHiddenTaskNodesInTreeData(
    treeData.value
  )
  await API.setLocalStorageVal({
    app: utils.plugin.app.appId,
    key: 'plugin-task-list-settings',
    val: {
      /** 需要隐藏任务的节点，包括笔记本节点或者是文档节点 */
      nodeListForHideTask: hiddenTaskNodes,
      /** 任务列表树的显示模式 */
      taskTreeDisplayMode: localSettings.value.taskTreeDisplayMode,
      taskSortBy: localSettings.value.taskSortBy,
    },
  })
  isShow.value = false

  eventBus.emit('node-list-for-hide-task-changed', hiddenTaskNodes)
}

const open = () => {
  isShow.value = true
}
defineExpose({
  open,
})
</script>

<style lang="scss">
.plugin-task-list-config-wrap {
  background-color: var(--b3-theme-background) !important;

  .el-drawer__body {
    .setting-item {
      margin-bottom: 20px;
      // 通用样式
      .setting-item__label {
        color: var(--b3-text-color);
      }

      // 特殊样式
      .setting-tree-wrap {
        height: 500px;
        overflow: auto;
        &::-webkit-scrollbar {
          display: none;
        }

        border: 1px solid var(--b3-border-color);
        border-radius: 8px;
        padding: 10px;
        background-color: var(--b3-theme-surface);
      }
    }

    .setting-item__horizontal {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .setting-item__label {
        margin-right: 80px;
      }
    }
    .setting-item__vertical {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      .setting-item__label {
        margin-bottom: 5px;
      }
    }

    // .el-button {
    //   box-shadow: inset 0 0 0 0.6px var(--b3-theme-primary) !important;
    //   background-color: rgba(0, 0, 0, 0) !important;
    // }
    // .el-button.el-button--primary {
    //   color: var(--b3-theme-primary) !important;
    //   box-shadow: inset 0 0 0 0.6px var(--b3-theme-primary) !important;
    //   background-color: rgba(0, 0, 0, 0) !important;
    // }
  }
}
</style>

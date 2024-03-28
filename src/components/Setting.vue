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
      <div class="tree-check-info">{{ i18n.setting.hideTaskTreeDesc }}</div>
      <div class="setting-tree-wrap">
        <Tree
          :treeData="treeData"
          :defaultExpandAll="true"
          @check="handleChecked2HideTask"
        />
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
  await getTreeData()
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
  await API.setLocalStorage({
    app: utils.plugin.app.appId,
    val: {
      nodeListForHideTask: hiddenTaskNodes,
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
  .tree-check-info {
    font-size: 18px;
    // color: #606266;
    margin-bottom: 10px;
    text-align: center;
  }
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
</style>

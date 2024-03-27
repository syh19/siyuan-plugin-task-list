<template>
  <el-drawer
    v-model="isShow"
    class="plugin-task-list-config-wrap"
    direction="ltr"
    append-to-body
    size="50%"
    title="设置"
  >
    <template #default>
      <div class="tree-check-info">您所勾选的节点，其中的任务会将被隐藏</div>
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
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, defineExpose, watch } from 'vue'
import * as utils from '../utils/common'
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

<style scoped lang="scss">
.plugin-task-list-config-wrap {
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

    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 10px;
    background-color: #f6f6f6;
  }
}
</style>

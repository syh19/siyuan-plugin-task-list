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
      <div style="border: 1px solid black">
        <Tree
          :treeData="allTreeData"
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

const isShow = ref<boolean>(true)
const allTreeData = ref<Array<any>>([])

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
  await refreshData()
  allTreeData.value = await treeFn.handleCheckStatusForTreeData(
    allTreeData.value
  )
}

/**
 * 刷新数据重新获取el-tree的数据
 */
const refreshData = async () => {
  let res: any = await API.getTaskListBySql({
    isGetAll: true,
  })
  let resTreeData: any = utils.convertSqlToTree(res.data)
  allTreeData.value = treeFn.handleTreeDataWithoutTaskNode(resTreeData)
}

const checkedNodes = ref<Array<any>>([])
const handleChecked2HideTask = async (e: any) => {
  checkedNodes.value = e
}

const cancel = () => {
  isShow.value = false
}

const submit = async () => {
  // 找到allTreeData中被勾选的节点
  let hiddenTaskNodes: any[] = treeFn.findHiddenTaskNodesInTreeData(
    allTreeData.value
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
}
</style>

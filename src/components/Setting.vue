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
import { ref, defineExpose } from 'vue'
import * as utils from '../utils/common'
import * as API from '../api'

const isShow = ref<boolean>(true)
const allTreeData = ref<Array<any>>([])

const emit = defineEmits(['submit-success'])

/**
 * 刷新数据重新获取el-tree的数据
 */
const refreshData = async () => {
  let res = await utils.getTaskListBySql({
    range: 'workspace',
    status: 'all',
  })
  allTreeData.value = handleTreeDataWithoutTaskNode(res)
}

const checkedNodes = ref<Array<any>>([])
const handleChecked2HideTask = async (e: any) => {
  checkedNodes.value = e
}

/**
 * 将树数据中的任务节点过滤掉
 */
const handleTreeDataWithoutTaskNode = (treeData: Array<any>): any => {
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
  console.log('传递给抽屉中树的数据', treeData)
  return treeData
}

refreshData()

const cancel = () => {
  isShow.value = false
}
const submit = async () => {
  await API.setLocalStorage({
    app: utils.plugin.app.appId,
    val: {
      docListForHideTask: checkedNodes.value,
    },
  })
  isShow.value = false
  emit('submit-success', checkedNodes.value)
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

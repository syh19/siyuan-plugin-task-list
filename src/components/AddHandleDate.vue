<template>
  <div class="plugin-task-list__add-handle-date-dialog-wrap">
    <el-dialog v-model="visible" title="添加任务处理时间" width="500">
      <div>
        <Calendar expanded :attributes="attrs" @dayclick="dayClicked" />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="submit"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineExpose, defineEmits, watch } from 'vue'
import { Calendar, DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import { i18n } from '../utils/common'
import * as API from '../api'
import * as func from '../utils/func'

interface Props {
  visible: boolean
  taskId: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  taskId: '',
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      init()
    }
  },
  { immediate: false }
)

const init = async () => {
  getTaskNodeInfo()
}
const getTaskNodeInfo = async () => {
  const taskInfoRes: any = await API.getSingleTaskInfoBySql(props.taskId)
  const realHandleDate: string = func.formatDateTime(
    func.parseStringToKeyValuePairs(taskInfoRes.ial)[
      'custom-plugin-task-list-handleAt'
    ]
  )
  const created: string = func.formatDateTime(taskInfoRes.created)

  // 优先使用实际的处理时间，如果没有就使用创建时间
  const handleAt: string = realHandleDate || created
  const handleDateAttr: any = attrs.value.find(
    (item: any) => item.key === 'handleDate'
  )
  handleDateAttr.dates = new Date(handleAt)
}

const attrs = ref([
  {
    key: 'today',
    highlight: true,
    dates: new Date(),
  },
  {
    key: 'handleDate',
    highlight: {
      style: 'background-color: #f4538a',
    },
    dates: new Date(),
  },
])

const handleDate = ref<string>('')
const dayClicked = (day: any, mouseEvent: MouseEvent) => {
  handleDate.value = day.id

  const handleDateAttr: any = attrs.value.find(
    (item: any) => item.key === 'handleDate'
  )
  handleDateAttr.dates = new Date(day.id)
}
const emit = defineEmits(['submit-success', 'close'])

const setTaskNodeHandleDate = async (taskId: string, handleDate: string) => {
  await API.setBlockAttrs({
    id: taskId,
    attrs: {
      'custom-plugin-task-list-handleAt': handleDate,
    },
  })
}
const close = () => {
  emit('close')
}
const submit = async () => {
  emit('close')
  let handleData: string = func.formatHandleDateToStorage(handleDate.value)
  await setTaskNodeHandleDate(props.taskId, handleData)
  emit('submit-success')
}
</script>

<style lang="scss"></style>

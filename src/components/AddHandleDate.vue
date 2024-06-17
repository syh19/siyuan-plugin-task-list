<template>
  <div class="plugin-task-list__add-handle-date-dialog-wrap">
    <el-dialog
      v-model="visible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :title="i18n.addHandleDate"
      width="500"
    >
      <div>
        <DatePicker
          v-model="handleDate"
          expanded
          transparent
          mode="date"
          :attributes="datePickerAttributes"
          :locale="datePickerLocale"
          @update:modelValue="dateChanged"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="close">{{ i18n.cancel }}</el-button>
          <el-button type="primary" @click="submit">
            {{ i18n.confirm }}
          </el-button>
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
import * as date from '../utils/date'
import { useDatePicker } from '../hooks/useDatePicker'

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
  const realHandleDate: string = date.formatDateTime(
    func.parseStringToKeyValuePairs(taskInfoRes.ial)[
      'custom-plugin-task-list-handleAt'
    ]
  )
  const created: string = date.formatDateTime(taskInfoRes.created)

  // 优先使用实际的处理时间，如果没有就使用创建时间
  const handleAt: string = realHandleDate || created
  const handleDateAttr: any = datePickerAttributes.value.find(
    (item: any) => item.key === 'handleDate'
  )
  handleDateAttr.dates = new Date(handleAt)
}

const { datePickerLocale, datePickerAttributes } =
  useDatePicker('addHandleDate')

const handleDate = ref<Date>(new Date())

const dateChanged = (e: Date) => {
  // #syh-info hooks中是共用同一个属性值
  const handleDateAttr: any = datePickerAttributes.value.find(
    (item: any) => item.key === 'handleDate'
  )
  handleDateAttr.dates = e
}
const emit = defineEmits(['submit-success', 'close'])

const setTaskNodeHandleDate = async (taskId: string, handleDate: string) => {
  return await API.setBlockAttrs({
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
  let handleData: string = date.formatHandleDateToStorage(handleDate.value)
  await setTaskNodeHandleDate(props.taskId, handleData)
  emit('submit-success')
}
</script>

<style lang="scss">
.plugin-task-list__add-handle-date-dialog-wrap {
  div.el-dialog {
    background-color: var(--tl-color-surface-bg);
  }
}
</style>

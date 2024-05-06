<template>
  <div class="plugin-task-list__task-filter-dialog-wrap">
    <el-dialog v-model="dialogVisible" title="任务筛选" width="500">
      <div>
        <Calendar expanded />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            确认
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

const props = defineProps<{
  taskList: any[]
}>()

const dialogVisible = ref(true)
const emit = defineEmits(['submit-success'])

const submit = () => {
  dialogVisible.value = false
  emit('submit-success')
}

/**
 * 本地设置
 */
const localFilters = ref<any>({
  /** 是否在docker栏中显示周日历视图 */
  isShowWeekCalendarInDocker: false,
  /** 是否是动态日期范围 */
  isDynamicDateRange: false,
  dynamicDateRange: [],
  staticDateRange: '',
})

const getLocalStorage = async () => {
  const { data: storage } = await API.getLocalStorage()
  const {
    isShowWeekCalendarInDocker,
    isDynamicDateRange,
    dynamicDateRange,
    staticDateRange,
  } = storage['plugin-task-list-filters']

  isShowWeekCalendarInDocker &&
    (localFilters.value.isShowWeekCalendarInDocker = isShowWeekCalendarInDocker)
  isDynamicDateRange &&
    (localFilters.value.isDynamicDateRange = isDynamicDateRange)
  dynamicDateRange && (localFilters.value.dynamicDateRange = dynamicDateRange)
  staticDateRange && (localFilters.value.staticDateRange = staticDateRange)
}
</script>

<style lang="scss"></style>

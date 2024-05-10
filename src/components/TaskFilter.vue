<template>
  <div class="plugin-task-list__task-filter-dialog-wrap">
    <el-dialog
      v-model="visible"
      class="plugin-task-list__task-filter-dialog-wrap"
      title="任务筛选"
      width="600"
    >
      <!-- 是否显示周视图 -->
      <div class="setting-item setting-item__horizontal">
        <div class="setting-item__label">
          {{ '是否显示周视图' }}
        </div>
        <div class="setting-item__content">
          <el-radio-group
            v-model="localFilters.isShowWeekCalendarInDocker"
            class="ml-4"
          >
            <el-radio :value="false" :label="'否'" size="large" />
            <el-radio :value="true" :label="'是'" size="large" />
          </el-radio-group>
        </div>
      </div>
      <template v-if="!localFilters.isShowWeekCalendarInDocker">
        <!-- 是否使用动态日期范围 -->
        <div class="setting-item setting-item__horizontal">
          <div class="setting-item__label">
            {{ '是否显示动态日期范围' }}
          </div>
          <div class="setting-item__content">
            <el-radio-group
              v-model="localFilters.isDynamicDateRange"
              class="ml-4"
            >
              <el-radio :value="false" :label="'否'" size="large" />
              <el-radio :value="true" :label="'是'" size="large" />
            </el-radio-group>
          </div>
        </div>
        <!-- 静态日期范围：日历视图 -->
        <div
          v-if="!localFilters.isDynamicDateRange"
          class="setting-item setting-item__horizontal"
        >
          <div class="setting-item__label">
            {{ '请选择日期范围' }}
          </div>
          <div class="setting-item__content">
            <DatePicker
              v-model="dateRange"
              :is-dark="false"
              :locale="datePickerLocale"
              :first-day-of-week="1"
              is-range
              :popover="datePickerPopover"
            >
              <template #default="{ inputValue, inputEvents }">
                <div class="date-range-input-wrap">
                  <el-input
                    readonly
                    :value="inputValue.start"
                    v-on="inputEvents.start"
                  />
                  <!-- <IconArrowRight /> -->
                  <span>哈哈哈</span>
                  <el-input
                    readonly
                    :value="inputValue.end"
                    v-on="inputEvents.end"
                  />
                </div>
              </template>
            </DatePicker>
            <span @click="clearDateRange">清空</span>
          </div>
        </div>
        <!-- 动态日期:范围下拉框 -->
        <div v-else class="setting-item setting-item__horizontal">
          <div class="setting-item__label">
            {{ '请选择日期范围' }}
          </div>
          <div class="setting-item__content">
            <el-select
              v-model="localFilters.dynamicDateRange"
              :placeholder="i18n.setting.sortItem.placeholder"
              clearable
              size="default"
              style="width: 240px"
            >
              <el-option
                v-for="item in staticDateRangeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </template>

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
import * as date from '../utils/date'

interface Props {
  visible: boolean
  taskId: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  taskId: '',
})

const datePickerPopover = ref({
  visibility: 'click',
  placement: 'right',
})

const datePickerLocale = ref({
  id: i18n.language === 'English' ? 'en' : 'cn',
  firstDayOfWeek: 2,
  masks: { weekdays: 'WWW' },
})

let dateRange = ref<any>({
  start: new Date(),
  end: new Date(),
})
const emit = defineEmits(['submit-success', 'close'])

const init = () => {
  getLocalStorage()
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      init()
    }
  },
  { immediate: false }
)

const close = () => {
  emit('close')
}

const clearDateRange = () => {
  dateRange.value = null
}

const submit = async () => {
  close()
  let startDate: string = ''
  let endDate: string = ''
  if (dateRange.value?.start && dateRange.value.end) {
    startDate = date.formatHandleDateToStorage(dateRange.value.start)
    endDate = date.formatHandleDateToStorage(dateRange.value.end)
    localFilters.value.staticDateRange = [startDate, endDate]
  } else {
    localFilters.value.staticDateRange = []
  }
  setLocalStorageVal().then(() => {
    emit('submit-success')
  })
}

/**
 * 本地设置
 */
const localFilters = ref<any>({
  /** 是否在docker栏中显示周日历视图 */
  isShowWeekCalendarInDocker: false,
  /** 是否是动态日期范围 */
  isDynamicDateRange: false,
  /** 动态日期范围：下拉框选择的值 */
  dynamicDateRange: '',
  /** 静态日期范围：日历视图选择的日期 */
  staticDateRange: [],
})

const staticDateRangeOptions = ref<Array<{ value: string; label: string }>>([
  {
    value: 'currentMonth',
    label: '本月',
  },
  {
    value: 'currentWeek',
    label: '本周',
  },
  {
    value: 'pastThreeDays',
    label: '过去三天',
  },
  {
    value: 'futureThreeDays',
    label: '未来三天',
  },
  {
    value: 'today',
    label: '今天',
  },
])

const getLocalStorage = async () => {
  const { data: storage } = await API.getLocalStorage()
  let {
    isShowWeekCalendarInDocker,
    isDynamicDateRange,
    dynamicDateRange,
    staticDateRange,
  } = storage['plugin-task-list-filters']

  typeof isShowWeekCalendarInDocker === 'boolean' &&
    (localFilters.value.isShowWeekCalendarInDocker = isShowWeekCalendarInDocker)
  typeof isDynamicDateRange === 'boolean' &&
    (localFilters.value.isDynamicDateRange = isDynamicDateRange)
  dynamicDateRange && (localFilters.value.dynamicDateRange = dynamicDateRange)
  staticDateRange?.length &&
    (localFilters.value.staticDateRange = staticDateRange)

  dateRange.value = {
    start: date.formatDateTime(staticDateRange[0]),
    end: date.formatDateTime(staticDateRange[1]),
  }
}

const setLocalStorageVal = async () => {
  await API.setLocalStorageVal({
    key: 'plugin-task-list-filters',
    val: {
      isShowWeekCalendarInDocker: localFilters.value.isShowWeekCalendarInDocker,
      isDynamicDateRange: localFilters.value.isDynamicDateRange,
      dynamicDateRange: localFilters.value.dynamicDateRange || '',
      staticDateRange: localFilters.value.staticDateRange,
    },
  })
}
</script>

<style lang="scss" scoped>
.plugin-task-list__task-filter-dialog-wrap {
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

  .date-range-input-wrap {
    display: flex;
    align-items: center;
    .el-input {
      width: 120px;
    }
    span {
      margin: 0 10px;
    }
  }
}
</style>

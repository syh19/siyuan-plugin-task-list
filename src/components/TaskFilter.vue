<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="plugin-task-list__task-filter-dialog-wrap"
    :title="i18n.filterConfig.title"
    width="700"
  >
    <!-- 是否显示周视图 -->
    <div class="setting-item setting-item__horizontal">
      <div class="setting-item__label">
        {{ i18n.filterConfig.taskFilterWay }}
      </div>
      <div class="setting-item__content">
        <el-radio-group v-model="localFilters.taskFilterWay">
          <el-radio
            value="monthRange"
            :label="i18n.filterConfig.monthRange"
            size="large"
          />
          <el-radio
            value="dockCalendar"
            :label="i18n.filterConfig.dockCalendar"
            size="large"
          />
        </el-radio-group>
      </div>
    </div>
    <template v-if="localFilters.taskFilterWay === 'dockCalendar'">
      <!-- Dock栏中日期筛选方式：周视图 OR 月视图 -->
      <div class="setting-item setting-item__horizontal">
        <div class="setting-item__label">
          {{ i18n.filterConfig.dockCalendarDisplayMode }}
        </div>
        <div class="setting-item__content">
          <el-radio-group v-model="localFilters.dockCalendarDisplayMode">
            <el-radio
              value="weekly"
              :label="i18n.filterConfig.dockWeekMode"
              size="large"
            />
            <el-radio
              value="monthly"
              :label="i18n.filterConfig.dockMonthMode"
              size="large"
            />
          </el-radio-group>
        </div>
      </div>
    </template>
    <template v-if="localFilters.taskFilterWay === 'monthRange'">
      <!-- 日期范围筛选形式：动态 OR 静态 -->
      <div class="setting-item setting-item__horizontal">
        <div class="setting-item__label">
          {{ i18n.filterConfig.dateRangeFormat }}
        </div>
        <div class="setting-item__content">
          <el-radio-group v-model="localFilters.dateRangeFormat">
            <el-radio
              value="static"
              :label="i18n.filterConfig.static"
              size="large"
            />
            <el-radio
              value="dynamic"
              :label="i18n.filterConfig.dynamic"
              size="large"
            />
          </el-radio-group>
        </div>
      </div>
      <!-- 静态日期范围：日历视图 -->
      <div
        v-if="localFilters.dateRangeFormat === 'static'"
        class="setting-item setting-item__horizontal"
      >
        <div class="setting-item__label">
          {{ i18n.filterConfig.dateRangeValue }}
        </div>
        <div class="setting-item__content flex-wrap">
          <DatePicker
            v-model="dateRange"
            :is-dark="false"
            transparent
            :locale="datePickerLocale"
            :attributes="datePickerAttributes"
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
                <svg style="width: 50px" class="icon" aria-hidden="true">
                  <use xlink:href="#icon-arrow-right"></use>
                </svg>
                <el-input
                  readonly
                  :value="inputValue.end"
                  v-on="inputEvents.end"
                />
              </div>
            </template>
          </DatePicker>
          <el-button
            style="margin-left: 20px"
            size="small"
            type="danger"
            @click="clearDateRange"
          >
            {{ i18n.filterConfig.clearBtn }}
          </el-button>
        </div>
      </div>
      <!-- 动态日期:范围下拉框 -->
      <div v-else class="setting-item setting-item__horizontal">
        <div class="setting-item__label">
          {{ i18n.filterConfig.dateRangeValue }}
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
        <el-button @click="close">{{ i18n.cancel }}</el-button>
        <el-button type="primary" @click="submit">
          {{ i18n.confirm }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineExpose, defineEmits, watch } from 'vue'
import { Calendar, DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import { i18n } from '../utils/common'
import * as API from '../api'
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

const datePickerPopover = ref({
  visibility: 'click',
  placement: 'right',
})

const { datePickerLocale, datePickerAttributes } = useDatePicker('dateFilter')

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
  /** 任务筛选方式：月视图范围筛选 OR Dock栏中日历视图日期筛选 */
  taskFilterWay: 'monthRange',
  /** Dock栏中日历视图日期筛选形式：周视图、月视图 */
  dockCalendarDisplayMode: 'weekly',
  /** 日期范围筛选格式：动态 OR 静态 */
  dateRangeFormat: 'static',
  /** 动态日期范围：下拉框选择的值 */
  dynamicDateRange: '',
  /** 静态日期范围：日历视图选择的日期 */
  staticDateRange: [],
})

const staticDateRangeOptions = ref<Array<{ value: string; label: string }>>([
  {
    value: 'currentMonth',
    label: i18n.filterConfig.dynamicDateRangeList.month,
  },
  {
    value: 'currentWeek',
    label: i18n.filterConfig.dynamicDateRangeList.week,
  },
  {
    value: 'pastThreeDays',
    label: i18n.filterConfig.dynamicDateRangeList.pastThreeDays,
  },
  {
    value: 'futureThreeDays',
    label: i18n.filterConfig.dynamicDateRangeList.futureThreeDays,
  },
  {
    value: 'today',
    label: i18n.filterConfig.dynamicDateRangeList.today,
  },
])

const getLocalStorage = async () => {
  const { data: storage } = await API.getLocalStorage()
  let {
    taskFilterWay,
    dockCalendarDisplayMode,
    dateRangeFormat,
    dynamicDateRange,
    staticDateRange,
  } = storage?.['plugin-task-list-filters'] || {}

  taskFilterWay && (localFilters.value.taskFilterWay = taskFilterWay)
  dockCalendarDisplayMode &&
    (localFilters.value.dockCalendarDisplayMode = dockCalendarDisplayMode)
  dateRangeFormat && (localFilters.value.dateRangeFormat = dateRangeFormat)
  dynamicDateRange && (localFilters.value.dynamicDateRange = dynamicDateRange)
  if (staticDateRange?.length) {
    localFilters.value.staticDateRange = staticDateRange
    dateRange.value = {
      start: date.formatDateTime(staticDateRange[0]),
      end: date.formatDateTime(staticDateRange[1]),
    }
  }
}

const setLocalStorageVal = async () => {
  await API.setLocalStorageVal({
    key: 'plugin-task-list-filters',
    val: {
      taskFilterWay: localFilters.value.taskFilterWay,
      dockCalendarDisplayMode: localFilters.value.dockCalendarDisplayMode,
      dateRangeFormat: localFilters.value.dateRangeFormat,
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
      color: var(--tl-color-text);
    }

    // 特殊样式
    .setting-tree-wrap {
      height: 500px;
      overflow: auto;
      &::-webkit-scrollbar {
        display: none;
      }

      border: 1px solid var(--tl-color-border);
      border-radius: 8px;
      padding: 10px;
      background-color: var(--tl-color-surface-deep-bg);
    }

    .setting-item__content.flex-wrap {
      display: flex;
      align-items: center;
    }
  }

  .setting-item__horizontal {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .setting-item__label {
      // margin-right: 80px;
      width: 220px;
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

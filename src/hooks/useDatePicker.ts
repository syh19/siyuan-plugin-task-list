import { ref } from 'vue'
import { i18n } from '@/utils/common'
import eventBus from '@/utils/eventBus'

/** 调用方 */
type Caller = 'addHandleDate' | 'dateFilter' | 'taskList'

type Res = {
  datePickerLocale: any
  datePickerAttributes: any
  handleDayMouseEnter?: any
}

/**
 *
 * @param caller 调用该hook的主体
 * @returns
 */
export function useDatePicker(caller: Caller): Res {
  const datePickerLocale = ref({
    id: i18n.language === 'English' ? 'en' : 'cn',
    firstDayOfWeek: 2,
    masks: { weekdays: 'WWW' },
  })

  const datePickerAttributes = ref<any>([])

  const initDatePickerAttributes = () => {
    if (caller === 'addHandleDate') {
      datePickerAttributes.value = [
        {
          key: 'today',
          dot: true,
          // highlight: false,
          dates: new Date(),
        },
        {
          key: 'handleDate',
          highlight: {
            style: 'background-color: var(--tl-color-todo-icon)',
          },
          dates: new Date(),
        },
      ]
    } else if (caller === 'dateFilter') {
      datePickerAttributes.value = [{ dates: new Date(), dot: true }]
    } else if (caller === 'taskList') {
      datePickerAttributes.value = []
    }
  }

  initDatePickerAttributes()

  const updateDateTask = () => {
    eventBus.on('each-day-task-list-changed', (e: any) => {
      datePickerAttributes.value = [
        e.todoTaskPopover,
        e.doneTaskPopover,
        // 今天的日期样式
        {
          content: 'blue',
          dates: new Date(),
        },
      ]
    })
  }
  if (caller === 'taskList') {
    updateDateTask()
  }

  //
  const handleDayMouseEnter = (day: any) => {
    const todoTaskNumInCurrentDay =
      datePickerAttributes.value[0].dateNumMap.get(day.id)
    const doneTaskNumInCurrentDay =
      datePickerAttributes.value[1].dateNumMap.get(day.id)

    datePickerAttributes.value[0].popover.label =
      i18n.dockCalendar.todoTaskNumPopover + todoTaskNumInCurrentDay
    datePickerAttributes.value[1].popover.label =
      i18n.dockCalendar.doneTaskNumPopover + doneTaskNumInCurrentDay
  }

  let res: Res = { datePickerLocale, datePickerAttributes }

  if (caller === 'taskList') {
    res.handleDayMouseEnter = handleDayMouseEnter
  }

  return res
}

/**
 * 如果是第一次使用插件，就初始化需要 持久化的数据
 */
import * as API from '@/api/index'

export async function initLocalStorageWhenFirstUsePlugin() {
  try {
    const { data: storage } = await API.getLocalStorage()

    const tasks = []

    const createTask = (key: string, val: any) => {
      return API.setLocalStorageVal({ key, val }).catch((error: any) => {
        console.error(`Failed to set ${key}:`, error)
      })
    }

    const range = 'plugin-task-list-taskRangeTabClicked'
    if (!storage.hasOwnProperty(range)) {
      tasks.push(createTask(range, 'doc'))
    }

    const filters = 'plugin-task-list-filters'
    if (!storage.hasOwnProperty(filters)) {
      tasks.push(
        createTask(filters, {
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
      )
    }

    const settings = 'plugin-task-list-settings'
    if (!storage.hasOwnProperty(settings)) {
      tasks.push(
        createTask(settings, {
          /** 信息卡片的配置 */
          infoCardConfig: {
            dateTimeDisplayMode: 'date',
            fieldsForHidden: [],
          },
          /** 需要隐藏任务的节点，包括笔记本节点或者是文档节点 */
          nodeListForHideTask: [],
          /** 任务列表树的显示模式 */
          taskTreeDisplayMode: 'box-doc-task',
          /** 任务节点的排序方式 */
          taskSortBy: 'createdAsc',
        })
      )
    }

    // 等待所有任务完成，即使某些任务失败
    const results = await Promise.allSettled(tasks)

    // 可以在这里处理结果，例如记录哪些操作成功，哪些失败
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Task ${index} failed:`, result.reason)
      }
    })
  } catch (error) {
    console.error('Failed to initialize local storage:', error)
  }
}

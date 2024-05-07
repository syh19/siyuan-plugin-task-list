import { Plugin } from 'siyuan'
import * as utils from './utils/common'
import * as addBtn from './utils/addButton'
import './styles/index.scss'
import './utils/iconfont.js'
import * as task from '../src/utils/handleTaskNode'
import '@/utils/compatible'

export default class TaskListPlugin extends Plugin {
  async onload() {
    console.log(
      `%c任务列表插件 siyuan-plugin-task-list  加载完成`,
      'color: #429077;font-size:22px'
    )
    this.init()
    await addBtn.addDock()
    this.eventBus.on('switch-protyle', (e: any) => {
      utils.setCurrentDocId(e.detail.protyle.block.rootID)
      utils.setCurrentBoxId(e.detail.protyle.notebookId)
      // utils.addOperationForTaskNode(e)
    })

    // 编辑事件 & 其他消息事件
    this.eventBus.on('ws-main', (e: any) => {
      task.taskNodeFinishedSetAttrs(e)
    })

    // 块菜单打开事件
    this.eventBus.on('click-blockicon', (e: any) => {
      addBtn.addBlockMenuForTaskNode(e)
    })
  }

  onLayoutReady(): void {
    utils.setWorkSpaceName()
    console.log('当前APP对象：', this.app)
  }

  onunload() {
    console.log(
      `%c任务列表插件 siyuan-plugin-task-list  卸载完成`,
      'color: #e25f8a;font-size:22px'
    )
  }

  /**
   * 获取i18n和插件类实例
   */
  init() {
    utils.setI18n(this.i18n)
    utils.setPlugin(this)
  }
}

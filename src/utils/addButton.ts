import { plugin, i18n } from './common'
import App from '@/App.vue'
import { createApp } from 'vue'
import eventBus from '../utils/eventBus'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = () => createApp(App)
// size 用于设置表单组件的默认尺寸，zIndex 用于设置弹出组件的层级，zIndex 的默认值为 2000。
app().use(ElementPlus, { size: 'small', zIndex: 3000 })

/**
 * 添加右下角 dock 按钮
 */
export async function addDock() {
  plugin.addDock({
    config: {
      position: 'RightTop',
      size: { width: 200, height: 0 },
      icon: `icon-task3`,
      title: i18n.pluginTitle,
      show: false,
    },
    data: {
      text: i18n.pluginTitle,
    },
    type: 'dock_tab',
    async init() {
      // 添加id
      this.element.id = 'siyuan-plugin-task-list'
      this.element.style.height = '100%'
      app().mount(this.element)
    },
    destroy() {
      console.log('destroy dock: dock_tab')
    },
  })
}

/**
 * 为任务节点添加额外的菜单项
 * 事件 click-blockicon 的监听函数
 * @param e
 */
export function addBlockMenuForTaskNode(e: CustomEvent<any>): void {
  const detail = e.detail // 获取菜单信息
  const taskId: string = isClickedTaskNodeIcon(detail)
  if (taskId) {
    detail.menu.addItem({
      icon: 'icon-task3',
      label: '任务处理时间',
      click: () => {
        eventBus.emit('add-handle-date-for-task-node', taskId)
      },
    })
  }
}

/**
 * 判断点击的是不是task节点的图标，并返回task节点ID
 * @param detail
 * @returns {string} 任务节点ID
 */
function isClickedTaskNodeIcon(detail: any): string {
  const blockEle: HTMLElement = detail.blockElements[0]

  // const dataType: string =
  //   blockEle.attributes.getNamedItem('data-type').nodeValue

  const dataSubType: string =
    blockEle.attributes.getNamedItem('data-subtype').nodeValue

  const dataNodeId: string =
    blockEle.attributes.getNamedItem('data-node-id').nodeValue

  if (dataSubType === 't') {
    return dataNodeId
  } else {
    return ''
  }
}

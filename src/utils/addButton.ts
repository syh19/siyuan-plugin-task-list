import { plugin, i18n } from './common'
import App from '@/App.vue'
import { createApp } from 'vue'
import eventBus from '../utils/eventBus'
import { addIcons } from '../utils/addIcon'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// size 用于设置表单组件的默认尺寸，zIndex 用于设置弹出组件的层级，zIndex 的默认值为 2000。
app.use(ElementPlus, { size: 'small', zIndex: 3000 })

/**
 * 添加右下角 dock 按钮
 */
export async function addDock() {
  addIcons()
  plugin.addDock({
    config: {
      position: 'RightTop',
      size: { width: 200, height: 0 },
      icon: `tl-task`,
      hotkey: '⇧⌘T',
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
      // 由于本插件依赖于当前编辑区中的文档，所以等到编辑区加载完毕后再初始化组件
      setTimeout(() => {
        app.mount(this.element)
      }, 100)
    },
    destroy() {
      // console.log('destroy dock: dock_tab')
    },
  })
}

/**
 * 为任务节点添加额外的菜单项
 * 事件 click-blockicon 的监听函数
 * @param e
 */
export function addBlockMenuForTaskNode(e: CustomEvent<any>): void {
  const taskId: string = isClickedTaskNodeIcon(e.detail)
  if (taskId) {
    e.detail.menu.addItem({
      icon: 'tl-greenTask',
      label: i18n.addHandleDate,
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

  const dataType: string =
    blockEle.attributes.getNamedItem('data-type')?.nodeValue

  const dataSubType: string =
    blockEle.attributes.getNamedItem('data-subtype')?.nodeValue

  const dataNodeId: string =
    blockEle.attributes.getNamedItem('data-node-id')?.nodeValue

  // 点击的是任务列表子节点才会展示设置
  if (dataSubType === 't') {
    if (dataType === 'NodeListItem') {
      return dataNodeId
    } else if (dataType === 'NodeList') {
      const realTaskBlock: HTMLElement = blockEle.querySelector(
        'div[data-subtype="t"][data-subtype="t"][data-type="NodeListItem"]'
      )
      return realTaskBlock.attributes.getNamedItem('data-node-id').nodeValue
    }
  } else {
    return ''
  }
}

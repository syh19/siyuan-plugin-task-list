import { plugin, i18n } from './common'
import App from '@/App.vue'
import { createApp } from 'vue'

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

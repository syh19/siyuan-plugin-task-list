import InfoCardVue from '@/components/infoCard/index.vue'
import { render, h } from 'vue'

class InfoCard {
  /** 在该元素上时才需要显示信息 */
  reference?: HTMLElement
  /** 要显示的信息数据 */
  info?: any

  constructor(info?: any, reference?: HTMLElement) {
    this.info = info
    this.reference = reference

    this.mount()
  }
  mount() {
    const VNode = h(InfoCardVue, {
      info: this.info,
      reference: this.reference,
    })
    render(VNode, document.body)
  }

  update(info: any, reference: HTMLElement) {
    this.info = info
    this.reference = reference
    this.mount()
  }

  destroy() {
    render(null, document.body)
  }
}

export default new InfoCard()

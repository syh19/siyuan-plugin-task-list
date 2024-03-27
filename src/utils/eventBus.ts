/**
 * 事件类——发布者、订阅者模式
 */
class EventBus {
  private events: {}
  constructor() {
    this.events = {}
  }

  //发布
  on(event: any, listener: any) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  //关闭
  off(event: any, listener: any) {
    if (!this.events[event]) {
      return
    }
    const index = this.events[event].indexOf(listener)
    if (index >= 0) {
      this.events[event].splice(index, 1)
    }
  }

  //订阅
  emit(event: any, ...args: any[]) {
    if (!this.events[event]) {
      return
    }
    this.events[event].forEach((listener: any) => {
      listener.apply(this, args)
    })
  }

  //订阅一次
  once(event: any, listener: any) {
    function callback(...args: any[]) {
      listener.apply(this, args)
      this.off(event, callback)
    }
    this.on(event, callback)
  }
}

export default new EventBus()

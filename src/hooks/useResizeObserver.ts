import { ref, Ref } from 'vue'

export function useResizeObserver(): Ref<boolean> {
  /** dock 栏容器的宽度 */
  const isSmallWidth = ref<boolean>(false)

  const initResizeObserver = () => {
    const observer = new ResizeObserver((entries: any) => {
      for (let entry of entries) {
        const rect = getComputedStyle(entry.target)
        if (+rect.width.slice(0, -2) < 280) {
          isSmallWidth.value = true
        } else {
          isSmallWidth.value = false
        }
      }
    })

    const rootDom = document.getElementById('siyuan-plugin-task-list')
    observer.observe(rootDom)
  }

  initResizeObserver()

  return isSmallWidth
}

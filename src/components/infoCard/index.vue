<template>
  <div v-if="info" class="plugin-task-list__info-card-wrap">
    {{ info }}
  </div>
</template>
<script setup lang="ts">
import { ref, onUpdated } from 'vue'
const props = defineProps<{
  reference?: any
  info?: any
}>()

const infoEle = ref<HTMLElement | null>(
  document.querySelector('.plugin-task-list__info-card-wrap')
)
const updateXY = (e: MouseEvent) => {
  // 获取鼠标的位置
  let x = e.clientX + 10
  let y = e.clientY + 10
  infoEle.value && ((infoEle.value as HTMLElement).style.display = 'block')
  infoEle.value && ((infoEle.value as HTMLElement).style.pointerEvents = 'none')
  infoEle.value && ((infoEle.value as HTMLElement).style.left = `${x}px`)
  infoEle.value && ((infoEle.value as HTMLElement).style.top = `${y}px`)

  // 处理浮层元素右边界到达屏幕边缘的情况
  let rect = infoEle.value?.getBoundingClientRect()
  if (rect) {
    if (rect.right > window.innerWidth) {
      infoEle.value &&
        ((infoEle.value as HTMLElement).style.left = `${
          window.innerWidth - rect.width
        }px`)
    }
  }
}

onUpdated(() => {
  infoEle.value = document.querySelector('.plugin-task-list__info-card-wrap')

  props.reference?.addEventListener('mouseenter', () => {
    infoEle.value && ((infoEle.value as HTMLElement).style.display = 'block')
  })
  props.reference?.addEventListener('mousemove', updateXY)

  props.reference?.addEventListener('mouseleave', () => {
    infoEle.value && ((infoEle.value as HTMLElement).style.display = 'none')
  })
})
</script>

<style lang="scss" scoped>
.plugin-task-list__info-card-wrap {
  position: fixed;
  z-index: 3000;
}
</style>

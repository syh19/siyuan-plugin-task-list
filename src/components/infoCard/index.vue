<template>
  <div v-if="info && info.status" class="plugin-task-list__info-card-wrap">
    <div class="info-card-item">
      <div class="info-card-item__label">任务名称</div>
      <div class="info-card-item__value">{{ info.label }}</div>
    </div>

    <div class="info-card-item">
      <div class="info-card-item__label">创建时间</div>
      <div class="info-card-item__value">
        {{ formatDateTime(info.created) }}
      </div>
    </div>

    <div class="info-card-item">
      <div class="info-card-item__label">更新时间</div>
      <div class="info-card-item__value">
        {{ formatDateTime(info.updated) || '暂无' }}
      </div>
    </div>

    <div class="info-card-item">
      <div class="info-card-item__label">完成时间</div>
      <div class="info-card-item__value">
        {{ formatDateTime(info.finished) || '暂未完成' }}
      </div>
    </div>

    <div class="info-card-item">
      <div class="info-card-item__label">笔记本</div>
      <div class="info-card-item__value">{{ info.box.label }}</div>
    </div>

    <div class="info-card-item">
      <div class="info-card-item__label">文档路径</div>
      <div class="info-card-item__value">
        {{ info.pathList.map((item) => item.label).join(' / ') }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onUpdated, computed } from 'vue'
import { formatDateTime } from '@/utils/func'
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
    if (rect.bottom > window.innerHeight) {
      infoEle.value &&
        ((infoEle.value as HTMLElement).style.top = `${
          window.innerHeight - rect.height
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
  display: none;
  background-color: var(--b3-theme-background) !important;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  color: var(--b3-text-color);
  max-width: 300px;
  min-width: 250px;
  // white-space: nowrap;
  // overflow: hidden;
  // text-overflow: ellipsis;
  // transition: all 0.3s;
  pointer-events: none;
  .info-card-item {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    .info-card-item__label {
      width: 80px;
      color: var(--b3-text-color);
    }
    .info-card-item__value {
      flex: 1;
      color: var(--b3-text-color);
    }
  }
  .info-card-item + .info-card-item {
    margin-top: 5px;
  }
}
</style>

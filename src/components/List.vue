// 该组件暂未使用
<template>
  <div class="plugin-task-list__list-display">
    <div v-for="task in taskList" :key="task.key" class="list-item">
      <div class="task-name icon-label-wrap">
        <svg
          v-if="task.status === 'todo'"
          class="icon icon-todo"
          aria-hidden="true"
        >
          <use xlink:href="#icon-time-circle-fill"></use>
        </svg>
        <svg v-else class="icon icon-done" aria-hidden="true">
          <use xlink:href="#icon-check-circle-fill"></use>
        </svg>

        <span>{{ task.label }}</span>
      </div>

      <div class="task-path">
        <div class="icon-label-wrap">
          <svg class="icon icon-box" aria-hidden="true">
            <use xlink:href="#icon-notebook_bookmarked"></use>
          </svg>
          <span style="padding-left: 10px">{{ task.box.label }}</span>
        </div>

        <div class="icon-label-wrap">
          <svg class="icon icon-doc" aria-hidden="true">
            <use xlink:href="#icon-document_text"></use>
          </svg>
          <span style="padding-left: 10px">{{
            task.pathList.map((item) => item.label).join('/')
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { ref, defineExpose, watch } from 'vue'
import { i18n } from '../utils/common'

const props = defineProps<{
  taskList: any[]
}>()
</script>

<style lang="scss">
.plugin-task-list__list-display {
  $mainfontsize: 14px;
  $subfontsize: 12px;
  @mixin text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  display: flex;
  flex-direction: column;
  .list-item {
    border: 1px solid #f0f0f0;
    border-radius: 5px;
    padding: 0px 5px;
    display: flex;
    flex-direction: column;
    .task-name {
      font-size: $mainfontsize;
      font-weight: bold;
      color: #333;
      @include text-ellipsis;
    }
    .task-path {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-size: $subfontsize;
      span {
        display: inline-block;
      }
      // margin-top: 5px;
      span:first-child {
        margin-right: 5px;
        // color: black;
      }
      span:last-child {
        @include text-ellipsis;
        color: #666;
      }
    }

    &:hover {
      background-color: #f0f0f0;
      // 阴影
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }
  .list-item + .list-item {
    margin-top: 10px;
  }
}
</style>

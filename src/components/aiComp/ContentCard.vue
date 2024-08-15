<template>
  <div :id="elementId" class="ai-summary-content-card-comp" :class="{ 'profile-card': isProfileCard }">
    <div class="ai-summary-content-card">
      <el-tooltip
        effect="dark"
        content="分享为图片"
        placement="top"
        show-after="10"
      >
        <svg
          style="margin-right: 5px"
          class="icon share-icon"
          aria-hidden="true"
          @click="shareCard"
        >
          <use xlink:href="#icon-share"></use>
        </svg>
      </el-tooltip>
      <slot name="content"></slot>
      <br />
      <footer>
        <div class="footer-item">
          <span>由<strong>思源笔记</strong></span>
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconSiYuan"></use>
          </svg>
        </div>
        <div class="footer-item">
          <span>插件：<strong>任务列表</strong></span>
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-task-green"></use>
          </svg>
        </div>
        <div class="footer-item">
          <span>通过 AI 生成</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { downloadAsImage } from "../../utils/ai";

const props = defineProps<{
  elementId: string;
  isProfileCard?: boolean;
  title: string;
}>();

const shareCard = () => {
  downloadAsImage({
    elementId: props.elementId,
    fileName: props.title,
  });
};
</script>

<style lang="scss" scoped>
.ai-summary-content-card-comp {
  
  box-sizing: border-box;
  display: flex;
  // flex-grow: 1;
  width: calc(50% - 5px); // 改为固定宽度，考虑间距
  // margin-bottom: 10px; // 添加底部间距

  &.profile-card {
    width: 100%; // 概述卡片宽度为100%
  }
  .ai-summary-content-card {
    box-sizing: border-box;
    width: 100%;
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    line-height: 1.5;
    color: #333;
    text-align: justify;
    font-family: __Inter_36bd41, __Inter_Fallback_36bd41; /* 选择好看的字体，兼容性好 */
    word-wrap: break-all; /* 保证文本换行 */
    white-space: pre-line; /* 保留文本换行符 \n */
    display: flex;
    flex-direction: column;
    flex: 1;

    &:hover svg.share-icon {
      visibility: visible;
    }
    svg.share-icon {
      visibility: hidden;
      position: absolute;
      top: 10px;
      right: 10px;
    }

    footer {
      position: absolute;
      bottom: 10px;
      right: 10px;
      font-size: 12px;
      color: #666;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 15px;

      .footer-item {
        display: flex;
        align-items: center;
        margin: 0 3px;

        span {
          margin-right: 2px;
        }

        .icon {
          width: 14px;
          height: 14px;
        }
      }
    }
  }
}
</style>
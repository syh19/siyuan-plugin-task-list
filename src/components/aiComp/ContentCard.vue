<template>
  <div
    :id="elementId"
    class="ai-summary-content-card-comp"
    :style="{
      backgroundColor: aiTitleBgColorList[index],
    }"
    :class="{ 'profile-card': isProfileCard }"
  >
    <div class="ai-summary-content-card">
      <el-tooltip
        effect="dark"
        :content="`${i18n.aiRoast.shareAs} ${pcOrMobilePic === 'pc' ? 'PC' : 'Mobile'} ${i18n.aiRoast.img}`"
        placement="top"
      >
        <div class="share-icon-wrapper">
          <svg
            class="icon share-icon"
            aria-hidden="true"
            @click="
              downloadAsImage({
                elementId: elementId,
                fileName: title,
                pcOrMobilePic: pcOrMobilePic,
              })
            "
          >
            <use xlink:href="#tl-share"></use>
          </svg>
        </div>
      </el-tooltip>
      <slot name="content"></slot>
      <br />
      <footer>
        <div class="footer-item">
          <span>{{ i18n.aiRoast.footer.by }} <strong>{{ i18n.aiRoast.footer.siYuanNote }}</strong></span>
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconSiYuan"></use>
          </svg>
        </div>
        <div class="footer-item">
          <span>{{ i18n.aiRoast.footer.plugin }}: <strong>{{ i18n.aiRoast.footer.taskList }}</strong></span>
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#tl-greenTask"></use>
          </svg>
        </div>
        <div class="footer-item">
          <span>{{ i18n.aiRoast.footer.generatedByAI }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { downloadAsImage } from "@/utils/ai";
import { i18n } from "@/utils/common";

defineProps<{
  elementId: string;
  isProfileCard?: boolean;
  title: string;
  pcOrMobilePic: string;
  index: number;
}>();


const aiTitleBgColorList: string[] = [
  "#FFFACD",
  "#FFE4E1",
  "#E6E6FA",
  "#E0FFF0",
  "#E6F3FF",
  "#FFE5B4",
  "#E0EEE0",
];
// {
//   [lang === "简体中文" ? "人物概述" : "Character Profile"]: "#FFFACD",
//   [lang === "简体中文" ? "无情吐槽" : "Ruthless Roast"]: "#FFE4E1",
//   [lang === "简体中文" ? "办公室八卦" : "Office Gossip"]: "#E6E6FA",
//   [lang === "简体中文" ? "极具创意的搭讪台词" : "Clever Pick-up Lines"]:
//     "#E0FFF0",
//   [lang === "简体中文" ? "灵魂双胞胎名人" : "Soul Twin Celebrity"]: "#E6F3FF",
//   [lang === "简体中文" ? "荒诞前世" : "Absurd Past Life"]: "#FFE5B4",
//   [lang === "简体中文" ? "命中注定的职业" : "Predestined Profession"]: "#E0EEE0",
// };
</script>

<style lang="scss" scoped>
.ai-summary-content-card-comp {
  box-sizing: border-box;
  border-radius: 8px;
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
    // background-color: #fff;
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

    .share-icon-wrapper {
      position: absolute;
      top: 10px;
      right: 10px;
    }

    &:hover .share-icon-wrapper {
      visibility: visible;
    }

    .share-icon-wrapper {
      visibility: hidden;
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

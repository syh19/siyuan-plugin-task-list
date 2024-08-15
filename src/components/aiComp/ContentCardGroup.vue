<template>
  <div
    v-if="content.length > 0"
    class="ai-summary-content-card-wrapper"
    :id="wrapperElementId"
  >
    <ContentCard
      elementId="ai-profile-card"
      title="概述"
      v-if="content[0]"
      :isProfileCard="true"
      class="full-width-card"
    >
      <template #content>
        <h3>
          {{ content[0]["content"][0]["宇宙赐予的讽刺绰号"] }}
        </h3>
        <p class="emoji">
          {{ content[0]["content"][1]["灵魂表情包"] }}
        </p>
        <p class="goal">
          {{ content[0]["content"][2]["讽刺性人生目标"] }}
        </p>
      </template>
    </ContentCard>
    <ContentCard
      :elementId="`ai-content-card-${index}`"
      :title="item.title"
      v-for="(item, index) in content.slice(1)"
      :key="item.title"
    >
      <template #content>
        <h3>{{ item.title }}</h3>
        <p>{{ item.content }}</p>
      </template>
    </ContentCard>
    <!-- 添加一个空的占位 div -->
    <div class="placeholder"></div>
  </div>
</template>

<script setup lang="ts">
import ContentCard from "./ContentCard.vue";

defineProps<{
  content: any[];
  wrapperElementId: string;
}>();
</script>

<style lang="scss" scoped>
.ai-summary-content-card-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  align-items: stretch;
  padding: 10px;
}

.full-width-card {
  width: 100%;
  margin: 0; // 只保留底部 margin
  padding: 0; // 确保没有额外的 padding
}

#ai-profile-card {
  :deep(.ai-summary-content-card) {
    width: 100%;
    box-sizing: border-box;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1em;

  h3 {
    font-size: 2.5em;
    color: #2c3e50;
    text-align: center;
  }

  .emoji {
    font-size: 2em;
    text-align: center;
  }

  .goal {
    font-weight: bold;
    color: #3a5a78;
    text-align: center;
  }
}
.placeholder {
  min-width: 42%;
  max-width: 48%;
  flex-grow: 1;
}

</style>

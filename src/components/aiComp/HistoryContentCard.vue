<template>
  <div class="history-content-card-wrapper">
    <el-collapse v-model="activeNames">
      <el-collapse-item
        v-for="(record, index) in historyRecords"
        :key="index"
        :name="index"
      >
        <template #title>
          <div class="slot-title-wrapper">
            <span>{{ record.dateTime }}</span>
            <el-button
              link
              @click.stop="
                downloadAsImage({
                  elementId: `history-content-wrapper-${index}`,
                  fileName: `全部-${record.dateTime}`,
                  pcOrMobilePic: pcOrMobilePic,
                })
              "
            >
              分享为 {{ pcOrMobilePic === "pc" ? "PC" : "Mobile" }} 图片
            </el-button>
          </div>
        </template>
        <ContentCardGroup
          :pcOrMobilePic="pcOrMobilePic"
          :content="record.content"
          :wrapperElementId="`history-content-wrapper-${index}`"
        />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElCollapse, ElCollapseItem } from "element-plus";
import ContentCardGroup from "./ContentCardGroup.vue";
import { downloadAsImage } from "../../utils/ai";
import * as API from "../../api";

interface HistoryRecord {
  dateTime: string;
  content: any[];
}
const props = defineProps<{
  pcOrMobilePic: string;
}>();
const activeNames = ref<number[]>([]);
const historyRecords = ref<HistoryRecord[]>([]);

const getHistoryRecords = async () => {
  try {
    const response = await API.getFile({
      path: "/data/storage/petal/siyuan-plugin-task-list/ai-summary.json",
    });
    console.log("response============", response);
    historyRecords.value = response;
  } catch (error) {
    console.error("Error fetching history records:", error);
  }
};

getHistoryRecords();
</script>

<style scoped lang="scss">
.history-content-card-wrapper {
  :deep(.el-collapse) {
    border: none;
    background-color: transparent;

    .el-collapse-item {
      margin-bottom: 10px;
      border-radius: 8px;
      overflow: hidden;
      border-color: transparent;

      transition: box-shadow 0.3s ease;
      button.el-collapse-item__header {
        background-color: rgba(255, 255, 255, 0.1);
        border: none;

        padding: 12px 20px;
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);

        &:hover {
          background-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          .slot-title-wrapper button {
            display: block;
          }
        }

        .slot-title-wrapper {
          display: flex;
          align-items: center;
          button {
            display: none;
            margin-left: 20px;
            color: #000;
            &:hover {
              color: #0055ff;
            }
          }
        }
        .el-collapse-item__arrow {
          margin-right: 8px;
          font-size: 18px;
        }
      }
      .el-collapse-item__wrap {
        background-color: rgba(255, 255, 255, 0.1);
        border: none;
        .el-collapse-item__content {
          background-color: transparent;
          padding: 20px;
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>

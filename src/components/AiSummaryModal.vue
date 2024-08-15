<template>
  <div class="ai-summary-drawer">
    <el-drawer
      v-model="modelValue"
      title="AI总结"
      size="75%"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      :show-close="true"
      direction="ltr"
      @close="handleClose"
    >
      <!-- 头部按钮区域 -->
      <template #header>
        <div class="operation-header">
          <div class="auth-code-section">
            <div class="auth-code-wrapper">
              <el-input
                v-model="authCode"
                :type="hideAuthCode ? 'text' : 'password'"
                :disabled="!isEditAuthCode"
                placeholder="请输入授权码"
              >
                <template #prepend>授权码</template>
              </el-input>
              <div class="auth-code-buttons">
                <el-button
                  :icon="isEditAuthCode ? CircleCheck : Edit"
                  circle
                  size="small"
                  @click="isEditAuthCode ? getAuthCodeInfo() : editAuthCode()"
                />
                <el-button
                  :icon="hideAuthCode ? View : Hide"
                  circle
                  size="small"
                  @click="toggleHideAuthCode"
                />
                <el-button
                  :icon="Refresh"
                  circle
                  size="small"
                  @click="getAuthCodeInfo"
                />
              </div>
            </div>
            <div class="auth-code-info">
              <span>总次数：{{ authCodeInfo.totalUses }}</span>
              <span>剩余次数：{{ authCodeInfo.remainingUses }}</span>
            </div>
          </div>

          <div class="operation-section">
            <el-radio-group
              v-model="currentOrHistory"
              size="small"
              style="margin-bottom: 4px"
            >
              <el-radio-button value="current">当前</el-radio-button>
              <el-radio-button value="history">历史</el-radio-button>
            </el-radio-group>
            <div class="operation-buttons">
              <template v-if="currentOrHistory === 'current'">
                <el-input
                  v-model="name"
                  size="small"
                  style="width: 120px"
                  placeholder="想让我如何称呼您"
                />
                <el-button
                  size="small"
                  :loading="btnLoading"
                  @click="getAiSummary"
                  >AI 生成</el-button
                >
                <el-button
                  size="small"
                  @click="
                    downloadAsImage({
                      elementId: 'ai-summary-content-wrapper',
                      fileName: '全部',
                      pcOrMobilePic: pcOrMobilePic,
                    })
                  "
                >
                  分享为 {{ pcOrMobilePic === "pc" ? "PC" : "Mobile" }} 图片
                </el-button>
              </template>
              <el-radio-group v-model="pcOrMobilePic" size="small">
                <el-radio-button value="pc">PC</el-radio-button>
                <el-radio-button value="mobile">Mobile</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>
      </template>

      <!-- 内容卡片区域 -->
      <ContentCardGroup
        v-if="currentOrHistory === 'current'"
        :content="currentAiSummary.content"
        :pcOrMobilePic="pcOrMobilePic"
        wrapperElementId="ai-summary-content-wrapper"
      />

      <HistoryContentCard
        v-if="currentOrHistory === 'history'"
        :pcOrMobilePic="pcOrMobilePic"
      />

      <!-- 底部按钮区域 -->
      <template #footer>
        <slot name="footer">
          <span class="dialog-footer">
            <el-button type="primary" @click="handleConfirm"> 关闭 </el-button>
          </span>
        </slot>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElMessage } from "element-plus";
import {
  Edit,
  CircleCheck,
  View,
  Hide,
  Refresh,
} from "@element-plus/icons-vue";
import { downloadAsImage } from "../utils/ai";
import { formatDateToLocaleString } from "../utils/date";
import { ref, watch } from "vue";
import ContentCardGroup from "./aiComp/ContentCardGroup.vue";
import HistoryContentCard from "./aiComp/HistoryContentCard.vue";
import * as aiAPI from "../api/ai";
import * as API from "../api";

const modelValue = defineModel<boolean>();

const currentOrHistory = ref<string>("current");
const isEditAuthCode = ref<boolean>(false);
const currentAiSummary = ref<{ dateTime: string; content: any }>({
  dateTime: "",
  content: [],
});
const authCode = ref<string>("clzskkxml0000x4lj8e0v1i17");
const authCodeInfo = ref<{ totalUses: number; remainingUses: number }>({
  totalUses: 0,
  remainingUses: 0,
});
const hideAuthCode = ref<boolean>(false);
const name = ref<string>("");
const editAuthCode = () => {
  isEditAuthCode.value = true;
};

const toggleHideAuthCode = () => {
  hideAuthCode.value = !hideAuthCode.value;
};

const getAuthCodeInfo = () => {
  try {
    aiAPI.getAuthCodeInfo(authCode.value).then((res) => {
      authCodeInfo.value = res;
      isEditAuthCode.value = false;
    });
  } catch (err) {
    console.log("啊乐山大佛", err);
    ElMessage.error("获取授权码信息失败");
  }
};

const formatAiSummary = (aiSummaryContent: object) => {
  let resList: any[] = [];
  let profileList: any[] = [];
  Object.entries(aiSummaryContent).forEach(([key, value]) => {
    if (["宇宙赐予的讽刺绰号", "讽刺性人生目标", "灵魂表情包"].includes(key)) {
      profileList.push({
        [key]: value,
      });
    } else {
      resList.push({
        title: key,
        content: value,
      });
    }
  });
  resList.unshift({
    title: "人物概述",
    content: profileList,
  });
  return resList;
};

const btnLoading = ref<boolean>(false);
const pcOrMobilePic = ref<string>("pc");
// 使用示例
const getAiSummary = async () => {
  if (!authCode.value) {
    ElMessage.error("请输入授权码");
    return;
  }
  btnLoading.value = true;
  try {
    const res: any = await aiAPI.getAiSummary({
      authCode: authCode.value,
      name: name.value,
    });
    currentAiSummary.value = {
      content: formatAiSummary(res.aiResult),
      dateTime: formatDateToLocaleString(new Date()),
    };
    authCodeInfo.value = res.authCodeInfo;
  } catch (err) {
    ElMessage.error("获取AI总结失败");
  } finally {
    btnLoading.value = false;
  }
  const dataForSave: any[] = [currentAiSummary.value, ...allAiSummary.value];
  await API.putFile({
    path: "/data/storage/petal/siyuan-plugin-task-list/ai-summary.json",
    file: JSON.stringify(dataForSave),
  });
};

watch(modelValue, async () => {
  if (modelValue.value) {
    getAuthCodeInfo();
    getFile();
  }
});

const allAiSummary = ref<any[]>([]);
/**
 * 获取文件并进行回显
 */
const getFile = async () => {
  const res = await API.getFile({
    path: "/data/storage/petal/siyuan-plugin-task-list/ai-summary.json",
  });
  console.log("res============", res);
  if (!res) return;
  allAiSummary.value = res;
  currentAiSummary.value = allAiSummary.value[0];
};

const handleClose = () => {
  modelValue.value = false;
};

const handleConfirm = () => {
  handleClose();
};
</script>

<style lang="scss" scoped>
.ai-summary-drawer {
  ::v-deep(.el-drawer) {
    background: linear-gradient(-45deg, #f0fd7f 0%, #f98787 100%);
    .el-drawer__header {
      padding: 15px 15px 15px 15px !important;
      margin-bottom: 0px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
      .el-drawer__close-btn {
        display: none !important;
      }
    }
    .el-drawer__footer {
      padding: 15px !important;
      box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1) !important;
    }
  }

  .operation-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }

  .auth-code-section {
    flex: 0 1 auto;
  }

  .auth-code-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .auth-code-wrapper .el-input {
    width: 280px;
  }

  .auth-code-buttons {
    display: flex;
    gap: 4px;
  }

  .auth-code-info {
    margin-top: 3px;
    display: flex;
    gap: 16px;
    font-size: 1.1em;
    // font-weight: bold;
    color: #ffffff;
  }

  .operation-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .operation-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .el-button {
    padding: 8px 15px;
  }

  .el-button.is-circle {
    padding: 8px;
  }

  #ai-summary-content-wrapper {
    padding: 10px;
    // background-color: #80a7e1;
  }
}
</style>

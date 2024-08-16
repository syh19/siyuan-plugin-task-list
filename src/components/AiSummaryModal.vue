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
                :type="isHideAuthCode ? 'password' : 'text'"
                :disabled="!isEditAuthCode"
                placeholder="请输入认证码"
              >
                <template #prepend>认证码</template>
              </el-input>
              <div class="auth-code-buttons">
                <el-button
                  :icon="isEditAuthCode ? CircleCheck : Edit"
                  circle
                  size="small"
                  @click="isEditAuthCode ? saveAuthCodeInfo() : editAuthCode()"
                />
                <el-button
                  :icon="isHideAuthCode ? View : Hide"
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
              <a
                href="https://flowus.cn/sylwair/share/6e1cc6d8-50a4-4b1f-a7fc-cf681dc02817"
                target="_blank"
                rel="noopener noreferrer"
                >获取认证码？</a
              >
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
const authCode = ref<string>("");
const authCodeInfo = ref<{ totalUses: number; remainingUses: number }>({
  totalUses: 0,
  remainingUses: 0,
});
const isHideAuthCode = ref<boolean>(true);
const name = ref<string>("");
const editAuthCode = () => {
  isEditAuthCode.value = true;
  isHideAuthCode.value = false;
};

const toggleHideAuthCode = () => {
  isHideAuthCode.value = !isHideAuthCode.value;
};

const getAuthCodeInfo = () => {
  aiAPI
    .getAuthCodeInfo(authCode.value)
    .then((res: any) => {
      if (res.code === 0) {
        authCodeInfo.value = res.data;
      } else {
        ElMessage.error(res.msg);
      }
    })
    .finally(() => {
      isEditAuthCode.value = false;
    });
};

const saveAuthCodeInfo = () => {
  API.putFile({
    path: "/data/storage/petal/siyuan-plugin-task-list/ai-config.json",
    file: JSON.stringify({ authCode: authCode.value }),
  });
  getAuthCodeInfo();
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
  if (!authCode.value && allAiSummary.value.length >= 3) {
    ElMessage.error("免费次数已用完，请使用认证码");
    return;
  }
  btnLoading.value = true;
  try {
    const res: any = await aiAPI.getAiSummary({
      authCode: authCode.value,
      name: name.value,
    });
    if (res.code === 0) {
      currentAiSummary.value = {
        content: formatAiSummary(res.data.aiJson),
        dateTime: formatDateToLocaleString(new Date()),
      };
      authCodeInfo.value = res.data.authCodeInfo;
    } else {
      ElMessage.error(res.msg);
    }
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
    getAiConfigFromFile().then(() => {
      getAuthCodeInfo();
    });
    getAllAiSummaryFromFile();
  }
});

const getAiConfigFromFile = async () => {
  const res: any = await API.getFile({
    path: "/data/storage/petal/siyuan-plugin-task-list/ai-config.json",
  });
  if (!res) return;
  authCode.value = res.authCode;
};
const allAiSummary = ref<any[]>([]);
/**
 * 获取文件并进行回显
 */
const getAllAiSummaryFromFile = async () => {
  const res: Array<any> = await API.getFile({
    path: "/data/storage/petal/siyuan-plugin-task-list/ai-summary.json",
  });
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
    align-items: center;
    gap: 16px;
    font-size: 1.1em;
    // font-weight: bold;
    color: #ffffff;
    &:hover {
      a {
        display: block;
      }
    }
    a {
      display: none;
      margin-left: 30px;
      color: #007bff; /* Link color */
      text-decoration: none; /* No underline */
      transition: color 0.2s ease; /* Smooth transition for hover effect */
    }
    a:hover {
      color: #0056b3; /* Hover link color */
    }
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

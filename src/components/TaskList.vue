<template>
  <div class="plugin-task-list-wrap">
    <div class="head-wrap">
      <!-- 头部区域 -->
      <div class="title">
        <div class="title-text">
          <h3>
            <svg
              style="margin-right: 5px"
              class="icon ai-enter"
              aria-hidden="true"
              @click="showAiSummaryModal"
            >
              <use xlink:href="#tl-greenTask"></use>
            </svg>
            {{ isSmallWidth ? "" : i18n.pluginTitle }}
          </h3>
          <span @click="toggleTaskStatus"
            >({{ taskStatusMap[taskStatus] }})</span
          >
        </div>
        <div v-show="!isInputShow" class="btn-list">
          <el-tooltip
            effect="dark"
            :content="i18n.options.ai"
            placement="bottom"
          >
            <svg
              class="icon ai-enter"
              aria-hidden="true"
              @click="showAiSummaryModal"
            >
              <use xlink:href="#tl-ai"></use>
            </svg>
          </el-tooltip>
          <el-tooltip
            effect="dark"
            :content="i18n.options.refresh"
            placement="bottom"
          >
            <svg class="icon" aria-hidden="true" @click="refreshData">
              <use xlink:href="#tl-sync"></use>
            </svg>
          </el-tooltip>

          <el-tooltip
            effect="dark"
            :content="isExpand ? i18n.options.collapse : i18n.options.expand"
            placement="bottom"
          >
            <svg class="icon" aria-hidden="true" @click="isExpand = !isExpand">
              <use
                :xlink:href="isExpand ? '#tl-verticalAlign' : '#tl-columHeight'"
              ></use>
            </svg>
          </el-tooltip>

          <el-tooltip
            effect="dark"
            :content="i18n.options.switch"
            placement="bottom"
          >
            <svg class="icon" aria-hidden="true" @click="toggleTaskStatus">
              <use xlink:href="#tl-repeat"></use>
            </svg>
          </el-tooltip>

          <el-tooltip
            effect="dark"
            :content="i18n.options.search"
            placement="bottom"
          >
            <svg class="icon" aria-hidden="true" @click="showInput">
              <use xlink:href="#tl-search"></use>
            </svg>
          </el-tooltip>
          <el-badge is-dot :hidden="isHideBadge">
            <el-tooltip
              effect="dark"
              :content="i18n.options.filter"
              placement="bottom"
            >
              <svg
                class="icon"
                aria-hidden="true"
                @click="isTaskFilterDialogVisible = true"
              >
                <use xlink:href="#tl-filter"></use>
              </svg>
            </el-tooltip>
          </el-badge>
          <el-tooltip
            effect="dark"
            :content="i18n.setting.title"
            placement="bottom"
          >
            <svg class="icon" aria-hidden="true" @click="openSettingDrawer">
              <use xlink:href="#tl-setting"></use>
            </svg>
          </el-tooltip>
        </div>
        <el-input
          v-show="isInputShow"
          ref="inputRef"
          :placeholder="i18n.searchPlaceholder"
          v-model="filterText"
          @blur="isInputShow = false"
          @keyup.enter="triggerFiltrateTreeNode(filterText)"
        ></el-input>
      </div>

      <DatePicker
        v-if="isShowWeekDateFilter"
        v-model="dateForShowTask"
        expanded
        :view="dockCalendarDisplayMode"
        transparent
        mode="date"
        :attributes="datePickerAttributes"
        :locale="datePickerLocale"
        @update:modelValue="dateChanged"
        @daymouseenter="handleDayMouseEnter"
      />

      <!-- tabs选项 -->
      <el-tabs v-model="range" stretch type="card" @tab-change="tabChanged">
        <!-- 文档 -->
        <el-tab-pane name="doc" :label="i18n.range.doc">
          <template #label>
            <span>{{ i18n.range.doc + ` (${docRangetaskCounter})` }}</span>
            <span :title="globalStore.currentDocInfo.name">{{
              globalStore.currentDocInfo.name
            }}</span>
          </template>
        </el-tab-pane>
        <!-- 笔记本 -->
        <el-tab-pane name="box" :label="i18n.range.box">
          <template #label>
            <span>{{ i18n.range.box + ` (${boxRangetaskCounter})` }}</span>
            <span :title="globalStore.currentBoxInfo.name">{{
              globalStore.currentBoxInfo.name
            }}</span>
          </template>
        </el-tab-pane>
        <!-- 工作空间 -->
        <el-tab-pane name="workspace" :label="i18n.range.workspace">
          <template #label>
            <span>{{
              i18n.range.workspace + ` (${workBenchRangetaskCounter})`
            }}</span>
            <span :title="globalStore.currentWorkSpaceName">{{
              globalStore.currentWorkSpaceName
            }}</span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 树形数据区域 -->
    <el-tree
      :data="treeData"
      ref="treeRef"
      :empty-text="emptyText"
      highlight-current
      :filter-node-method="filterTreeNode"
      :props="defaultProps"
      @node-click="handleNodeClick"
      @node-contextmenu="handleNodeContextMenu"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node icon-label-wrap">
          <div v-show="data.topNum" class="top-triangle">
            <svg class="icon top-pin" aria-hidden="true">
              <use xlink:href="#iconPin"></use>
            </svg>
          </div>
          <svg
            v-if="data.type === 'box'"
            class="icon icon-box"
            aria-hidden="true"
          >
            <use xlink:href="#tl-notebook"></use>
          </svg>

          <svg
            v-else-if="data.type === 'doc'"
            class="icon icon-doc"
            aria-hidden="true"
          >
            <use xlink:href="#tl-document"></use>
          </svg>
          <svg
            v-else-if="data.status === 'todo'"
            class="icon icon-todo"
            aria-hidden="true"
            @click.stop="changeTaskHandleDate(data)"
            @mouseenter="handleMouseEnter($event, data)"
          >
            <use xlink:href="#tl-timeCircleFill"></use>
          </svg>
          <svg
            v-else-if="data.status === 'done'"
            class="icon icon-done"
            aria-hidden="true"
            @mouseenter="handleMouseEnter($event, data)"
          >
            <use xlink:href="#tl-checkCircleFill"></use>
          </svg>
          <span>
            <span v-html="data.highlightLabel || data.label"> </span>
            <span v-if="data.type === 'box'">
              {{ " (" + taskCountForEachBox[data.key] + ")" }}
            </span>
          </span>
        </div>
      </template>
    </el-tree>

    <Setting ref="settingRef" />
    <TaskFilter
      :visible="isTaskFilterDialogVisible"
      @close="isTaskFilterDialogVisible = false"
      @submit-success="taskFilterSubmitSuccess"
    />

    <AddHandleDate
      :visible="isAddHandleDateDialogVisible"
      :task-id="taskIdToAddHandleDate"
      @close="isAddHandleDateDialogVisible = false"
      @submit-success="addHandleDateSbumitSuccess"
    />
    <AiSummaryModal v-model="isShowAiSummaryModal"> </AiSummaryModal>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, h } from "vue";
// import { toRaw } from '@vue/reactivity'
import * as utils from "@/utils/common";
import { i18n } from "@/utils/common";
import * as sy from "siyuan";
import * as API from "@/api";
import * as AI from "@/api/ai";
import type { IRange } from "@/types/index";
import { ElTree, ElInput } from "element-plus";
import SetTaskNodeTop from "@/components/taskMain/SetTaskNodeTop.vue";
import Setting from "@/components/Setting.vue";
import eventBus from "@/utils/eventBus";
import * as treeFn from "@/utils/handleTreeData";
import infoCard from "@/components/infoCard/index";
import { Calendar, DatePicker } from "v-calendar";
import "v-calendar/style.css";
import * as date from "@/utils/date";
import { useDatePicker } from "@/hooks/useDatePicker";
import "@imengyu/vue3-context-menu/lib/vue3-context-menu.css";
import ContextMenu from "@imengyu/vue3-context-menu";

import { useResizeObserver } from "@/hooks/useResizeObserver";
import { useGlobalStore } from "@/store/index";
import { addHandleDateToTaskNode } from "@/utils/addInfoToHtmlNode";
const globalStore = useGlobalStore();

const isSmallWidth = useResizeObserver();
interface Tree {
  [key: string]: any;
}

let settingRef = ref<InstanceType<typeof Setting>>();

let dateForShowTask = ref<Date>(new Date());
const dateChanged = (e: Date) => {
  let dateParam: string = "";
  e && (dateParam = date.formatDate(e));
  eventBus.emit("weekly-date-clicked", dateParam);
  refreshData();
};

let isShowAiSummaryModal = ref<boolean>(false);
const showAiSummaryModal = () => {
  isShowAiSummaryModal.value = true;
};

let isTaskFilterDialogVisible = ref<boolean>(false);
let isAddHandleDateDialogVisible = ref<boolean>(false);
/** 需要添加处理日期的任务ID */
let taskIdToAddHandleDate = ref<string>("");

const openSettingDrawer = () => {
  settingRef.value?.open();
  nextTick(() => {
    document.body.style.width = "100%";
  });
};
const treeRef = ref<InstanceType<typeof ElTree>>();
const inputRef = ref<InstanceType<typeof ElInput>>();
const showInput = () => {
  isInputShow.value = true;
  nextTick(() => {
    inputRef.value.focus();
  });
};
const isInputShow = ref<boolean>(false);

const tabChanged = (e: string) => {
  API.setLocalStorageVal({
    key: "plugin-task-list-taskRangeTabClicked",
    val: e,
  });

  refreshData();
};

const app = ref<sy.App>({ plugins: [], appId: "" });
let treeData = ref<any>([]);
let taskStatus = ref<string>("todo");
const taskStatusMap = ref<any>({
  todo: i18n.taskStatus.todo,
  done: i18n.taskStatus.done,
  all: i18n.taskStatus.all,
});

const { datePickerLocale, datePickerAttributes, handleDayMouseEnter } =
  useDatePicker("taskList");

const handleMouseEnter = (e: any, data: any) => {
  infoCard.update(data, e.target);
};

/** 高亮搜索的关键字 */
const handleHighLightSearchText = (text: string) => {
  return text.replace(
    new RegExp(filterText.value, "gi"),
    (match) => `<span style="color: #5182ee; font-weight: bold">${match}</span>`
  );
};
const toggleTaskStatus = () => {
  const statusList = ["todo", "done", "all"];
  // 循环切换状态
  let index = statusList.indexOf(taskStatus.value);
  index = index === statusList.length - 1 ? 0 : index + 1;
  taskStatus.value = statusList[index];

  refreshData();
};

const range = ref<IRange>("doc");
const filterText = ref<string>("");

let isShowWeekDateFilter = ref<boolean>(false);
const taskFilterSubmitSuccess = () => {
  refreshData();
  initConfig();
};

const addHandleDateSbumitSuccess = () => {
  // syh-fixeme 这里接口很慢，需要延迟刷新
  setTimeout(() => {
    refreshData();
  }, 3000);
};
const workBenchRangetaskCounter = ref<number>(0);
const boxRangetaskCounter = ref<number>(0);
const docRangetaskCounter = ref<number>(0);
/**
 * 刷新数据重新获取el-tree的数据
 */
const refreshData = async () => {
  let res = await utils.getTaskListForDisplay({
    range: range.value,
    status: taskStatus.value as any,
  });
  // treeData.value = await treeFn.refreshTaskAfterHideDocChecked(res)
  treeData.value = res;

  // 根据按钮状态展开或者收起所有节点
  nextTick(() => {
    toggleExpand(isExpand.value);
  });

  const { data: storage } = await API.getLocalStorage();
  getEmptyReason(storage);
};

const taskCountForEachBox = ref<any>({});

eventBus.on("task-counts-in-three-ranges-changed", (e: any) => {
  taskCountForEachBox.value = e.taskCountForEachBox;

  docRangetaskCounter.value = e.taskCountInDoc;
  boxRangetaskCounter.value = e.taskCountForEachBox[utils.currentBoxId] || 0;
  workBenchRangetaskCounter.value = Object.keys(e.taskCountForEachBox).reduce(
    (prev, cur) => {
      return prev + e.taskCountForEachBox[cur];
    },
    0
  );
});

eventBus.on("node-list-for-hide-task-changed", refreshData);
eventBus.on("add-handle-date-for-task-node", (taskId: string) => {
  isAddHandleDateDialogVisible.value = true;
  taskIdToAddHandleDate.value = taskId;
});

const trigger = ref<"tab" | "tree">("tab");
utils.plugin.eventBus.on("switch-protyle", () => {
  // 如果是点击树的节点导致文档TAB切换了，不要重新刷新数据
  if (trigger.value === "tree") {
    trigger.value = "tab";
    return;
  }
  // 如果当前的筛选范围是整个工作区，不需要重新刷新数据
  if (range.value === "workspace") {
    return;
  }

  refreshData();
});

watch(filterText, (val: string) => {
  triggerFiltrateTreeNode(val);
});

/**
 * 触发过滤树节点
 * @param val
 */
const triggerFiltrateTreeNode = (val: string) => {
  treeRef.value!.filter(val);
};

const changeTaskHandleDate = (taskInfo: any) => {
  isAddHandleDateDialogVisible.value = true;
  taskIdToAddHandleDate.value = taskInfo.key;
};
/**
 * 过滤树节点
 * @param value
 * @param data
 */
const filterTreeNode = (value: string, data: any) => {
  // if (!value) return true
  if (data.type !== "task") return false;
  data.highlightLabel = handleHighLightSearchText(data.label);
  return data.label.toLowerCase().indexOf(value.toLowerCase()) !== -1;
};

/**
 * 折叠或者展开所有节点
 */
const toggleExpand = (isExpandNew: boolean) => {
  let nodes = treeRef.value.store.nodesMap;
  for (let i in nodes) {
    nodes[i].expanded = isExpandNew;
  }
};

const isHideBadge = ref<boolean>(true);
const initTaskRangeTab = (storage: any) => {
  const currentTab: IRange = storage["plugin-task-list-taskRangeTabClicked"];
  currentTab && (range.value = currentTab);
};

const emptyText = ref<string>("");
const getEmptyReason = async (storage: any) => {
  const hideList =
    storage["plugin-task-list-settings"]?.["nodeListForHideTask"] || [];
  // 隐藏了整个工作空间的所有笔记本
  let notebooks = await API.lsNotebooks();
  let notebooksOpened: any[] = notebooks.filter(
    (notebook: any) => !notebook.closed
  );

  let isAllNotebookHidden: boolean = notebooksOpened.every((notebook: any) => {
    if (
      hideList.find(
        (item: any) => item.type === "box" && item.key === notebook.id
      )
    ) {
      return true;
    } else {
      return false;
    }
  });
  if (isAllNotebookHidden) {
    emptyText.value = i18n.emptyText.allNotebooksHidden;
    return;
  }

  for (let item of hideList) {
    if (item.type === "box" && utils.currentBoxId === item.key) {
      emptyText.value = i18n.emptyText.currentNotebook;
      return;
    }
  }

  for (let item of hideList) {
    if (item.type === "doc") {
      for (let docPath of utils.docPathSet) {
        const hideDocPathIndex: number = docPath.indexOf(item.key);
        const currentDocPathIndex: number = docPath.indexOf(utils.currentDocId);
        if (hideDocPathIndex !== -1 && currentDocPathIndex !== -1) {
          if (currentDocPathIndex >= hideDocPathIndex) {
            emptyText.value = i18n.emptyText.currentDoc;
            return;
          }
        }
      }
    }
  }

  emptyText.value = utils.taskEmptyReasonAfterFilter;
};

const dockCalendarDisplayMode = ref<"weekly" | "monthly">("weekly");
/**
 * 初始化时显示周视图以及判断是否显示badge
 */
const initConfig = async () => {
  const { data: storage } = await API.getLocalStorage();
  // 初始化展示哪个维度的TAB
  initTaskRangeTab(storage);
  refreshData();

  const taskFilterWay: string =
    storage["plugin-task-list-filters"]?.["taskFilterWay"];
  isShowWeekDateFilter.value = taskFilterWay === "dockCalendar";

  // 控制是否展示已经设置了过滤项的小红点
  if (isShowWeekDateFilter.value) {
    isHideBadge.value = true;
  } else {
    const dateRangeFormat: string =
      storage["plugin-task-list-filters"]?.["dateRangeFormat"];
    if (dateRangeFormat) {
      // 动态日期范围
      if (dateRangeFormat === "dynamic") {
        const dynamicDateRange: string =
          storage["plugin-task-list-filters"]?.["dynamicDateRange"];
        if (dynamicDateRange) {
          isHideBadge.value = false;
        } else {
          isHideBadge.value = true;
        }
      }
      // 静态日期范围
      else {
        const staticDateRange: string[] =
          storage["plugin-task-list-filters"]?.["staticDateRange"];
        if (staticDateRange.length) {
          isHideBadge.value = false;
        } else {
          isHideBadge.value = true;
        }
      }
    } else {
      isHideBadge.value = true;
    }
  }

  // 设置日历视图的显示形式：周视图 OR 月视图
  const calendarMode: "weekly" | "monthly" =
    storage["plugin-task-list-filters"]?.["dockCalendarDisplayMode"];
  calendarMode && (dockCalendarDisplayMode.value = calendarMode);
};

initConfig();

const isExpand = ref<boolean>(true);
watch(
  isExpand,
  (val) => {
    toggleExpand(val);
  },
  { immediate: false }
);

// 刷新数据
// setTimeout(() => {
//   refreshData()
// })

/**
 * 打开文档并滚动到指定任务节点
 * @param docId 文档ID，即数据库中的root_id
 * @param taskNodeId 任务节点ID
 */
const openDocAndScrollTaskNode = async (docId: string, taskNodeId: string) => {
  if (docId !== utils.currentDocId) {
    // 打开文档
    sy.openTab({
      app: app.value,
      doc: {
        id: docId,
        zoomIn: false,
      },
    });
    // 延时滚动到指定的node节点
    await utils.sleep(350);
  }
  addHandleDateToTaskNode()
  let taskEle: any = document.querySelector(
    `.layout-tab-container .protyle-content .protyle-wysiwyg >div:not([data-type="NodeBlockQueryEmbed"]) [data-node-id="${taskNodeId}"][data-type="NodeListItem"] div:nth-child(2)[data-type="NodeParagraph"]`
  );
  taskEle?.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });
  // 临时高亮节点
  nextTick(async () => {
    taskEle?.classList.add("plugin-task-list__hightlight-node");
    await utils.sleep(1500);
    taskEle?.classList.remove("plugin-task-list__hightlight-node");
  });
};
// ---------------------------方法 Start-------------------------

// ---------------------------方法 End-------------------------

interface Tree {
  label: string;
  children?: Tree[];
}

const handleNodeClick = async (data: Tree) => {
  if (data.type === "task") {
    trigger.value = "tree";
    await utils.sleep(10);
    openDocAndScrollTaskNode(data.root_id, data.key);
  }
};

const handleNodeContextMenu = async (e: any, data: any) => {
  taskNodeTopNum.value = data.topNum;
  const theme: string =
    globalStore.currentThemeMode === "light" ? "mac" : "mac dark";
  const hideTaskOption = {
    label: i18n.hideSingleTask,
    icon: h(
      "svg",
      {
        class: "icon",
      },
      [h("use", { "xlink:href": "#tl-eyeClose" })]
    ),
    onClick: () => {
      hideTaskNode(data.key);
    },
  };
  let options: any = [hideTaskOption];
  /** 置顶功能操作项 */
  const setTaskNodeTopOption: any = {
    label: h(SetTaskNodeTop, {
      num: taskNodeTopNum.value,
      onChange(e: number) {
        taskNodeTopNum.value = e;
      },
    }),
    icon: h(
      "svg",
      {
        class: "icon",
      },
      [h("use", { "xlink:href": "#tl-toTop" })]
    ),
    onClick: () => {
      setTaskNodeTopNum(data.key, taskNodeTopNum.value);
    },
  };
  if (data.type === "box") {
    // 笔记本节点添加"隐藏节点自身中的任务"选项
    const hideBoxTaskOption = {
      label: i18n.hideSelfTask,
      icon: h(
        "svg",
        {
          class: "icon",
        },
        [h("use", { "xlink:href": "#tl-eyeClose" })]
      ),
      onClick: () => {
        hideNodeTask(data, 1);
      },
    };
    options = [hideBoxTaskOption];
  } else if (data.type === "doc") {
    // 文档节点添加两个选项
    const hideDocSelfTaskOption = {
      label: i18n.hideSelfTask,
      icon: h(
        "svg",
        {
          class: "icon",
        },
        [h("use", { "xlink:href": "#tl-eyeClose" })]
      ),
      onClick: () => {
        hideNodeTask(data, 1);
      },
    };
    const hideDocAndChildrenTaskOption = {
      label: i18n.hideChildTask,
      icon: h(
        "svg",
        {
          class: "icon",
        },
        [h("use", { "xlink:href": "#tl-eyeClose" })]
      ),
      onClick: () => {
        hideNodeTask(data, 2);
      },
    };
    options = [hideDocSelfTaskOption, hideDocAndChildrenTaskOption];
  } else if (data.type === "task") {
    if (data.status === "todo") {
      /** 添加任务处理时间的选项 */
      let addHandleDateOption = {
        label: i18n.addHandleDate,
        icon: h(
          "svg",
          {
            class: "icon",
          },
          [h("use", { "xlink:href": "#tl-handleDate" })]
        ),
        onClick: () => {
          changeTaskHandleDate(data);
        },
      };
      // const finishTaskOption = {
      //   label: "完成任务",
      //   icon: h(
      //     "svg",
      //     {
      //       class: "icon",
      //     },
      //     [h("use", { "xlink:href": "#tl-checkDone" })]
      //   ),
      //   onClick: () => {
      //     console.log("完成任务");
      //   },
      // };
      options.push(addHandleDateOption, setTaskNodeTopOption);
    } else {
      // const unfinishTaskOption = {
      //   label: "取消完成",
      //   icon: h(
      //     "svg",
      //     {
      //       width: "16",
      //       height: "16",
      //       class: "icon",
      //     },
      //     [h("use", { "xlink:href": "#tl-closeCancel" })]
      //   ),
      //   onClick: () => {
      //     console.log("取消完成");
      //   },
      // };
      options.push(setTaskNodeTopOption);
    }
  } else {
    return;
  }

  e.preventDefault();
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: options,
    theme: theme,
  });
};

/**
 * 隐藏节点中的任务
 * @param nodeData 节点数据
 * @param hideStatus 隐藏状态：1-仅自身，2-自身及子节点
 */
const hideNodeTask = async (nodeData: any, hideStatus: number) => {
  // 获取本地存储的隐藏任务节点列表
  const { data: storage } = await API.getLocalStorage();
  let nodeListForHideTask = storage["plugin-task-list-settings"]?.["nodeListForHideTask"] || [];
  
  // 检查是否已存在该节点
  const existingNodeIndex = nodeListForHideTask.findIndex((item: any) => 
    item.key === nodeData.key && item.type === nodeData.type
  );
  
  if (existingNodeIndex !== -1) {
    // 如果存在，更新隐藏状态
    nodeListForHideTask[existingNodeIndex].hideTaskInNodeStatus = hideStatus;
  } else {
    // 如果不存在，添加新节点
    nodeListForHideTask.push({
      key: nodeData.key,
      type: nodeData.type,
      label: nodeData.label,
      hideTaskInNodeStatus: hideStatus
    });
  }
  
  // 保存到本地存储
  await API.setLocalStorageVal({
    key: "plugin-task-list-settings",
    val: {
      ...storage["plugin-task-list-settings"],
      nodeListForHideTask
    }
  });
  
  // 通知更新
  eventBus.emit("node-list-for-hide-task-changed");
  
  // 刷新数据
  refreshData();
};

const setTaskNodeTopNum = async (blockId: string, topNum: number) => {
  return await API.setBlockAttrs({
    id: blockId,
    attrs: {
      "custom-plugin-task-list-top-priority": topNum === 0 ? "" : topNum + "",
    },
  }).then(() => {
    // 需要延时刷新数据，因为setBlockAttrs接口写入数据后更新没那么快
    setTimeout(() => {
      refreshData();
    }, 1800);
  });
};

const hideTaskNode = async (blockId: string) => {
  return await API.setBlockAttrs({
    id: blockId,
    attrs: {
      "custom-plugin-task-list-isTaskHidden": 'true',
    },
  }).then(() => {
    // 需要延时刷新数据，因为setBlockAttrs接口写入数据后更新没那么快
    setTimeout(() => {
      refreshData();
    }, 1800);
  });
};

/** 任务节点置顶的值 */
const taskNodeTopNum = ref<number>(0);

const defaultProps = {
  children: "children",
  label: "label",
  disabled: "disabled",
  isLeaf: (data: any) => {
    return data.type === "task";
  },
  class: (data: any) => {
    return data.type === "task" ? "tree-task-node" : "tree-dir-node";
  },
};
</script>

<style lang="scss">
@import "@/styles/index.scss";

#siyuan-plugin-task-list {
  .plugin-task-list-wrap {
    // AI入口动画效果
    .ai-enter {
      cursor: pointer;
      transition: transform 0.1s ease-in-out;

      @keyframes jitter {
        0% {
          transform: translate(0, 0);
        }
        25% {
          transform: translate(-2px, -2px);
        }
        50% {
          transform: translate(2px, 2px);
        }
        75% {
          transform: translate(-2px, 2px);
        }
        100% {
          transform: translate(2px, -2px);
        }
      }

      &:hover {
        animation: jitter 0.3s infinite;
      }
    }

    height: 100%;
    max-width: 100%;
    .head-wrap {
      .title {
        padding: 0px 3px 0px 10px;
        height: 36px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        div.title-text {
          display: flex;
          align-items: center;
          h3 {
            margin: 0px;
          }
          span {
            margin-left: 5px;
            font-size: 12px;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 4px;
            &:hover {
              background-color: var(--tl-color-active-bg);
            }
          }
        }

        div.btn-list {
          flex: 1;
          max-width: 170px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          span + span {
            margin-left: 4px;
          }
          span {
            padding: 3px;
            border-radius: 5px;
            &:hover {
              cursor: pointer;
              background-color: var(--tl-color-active-bg);
            }
            svg.icon {
              font-size: 16px;
            }
          }
        }
        .el-input {
          // min-width: 200px;
          max-width: 60%;
          height: 30px;
          .el-input__wrapper {
            background-color: transparent;
          }
        }
      }
      .el-tabs {
        --el-tabs-header-height: 36px;
        .el-tabs__header {
          z-index: 1;
          // border-color: var(--tl-color-tabs-border);
          margin: 0px !important;
          .el-tabs__nav {
            width: 100%;
            border-color: var(--tl-color-tabs-border);
            border-radius: 0px;
            .el-tabs__item {
              padding: 0 5px;
              display: flex;
              flex-direction: column;
              flex: 0 0 33.33%;
              overflow: hidden;
              span {
                flex: 1;
                min-width: 0; /* 确保子元素在容器变小时能收缩 */
              }
              span:nth-child(2) {
                width: 100%;
                color: var(--tl-color-text);
                font-size: 12px;
                line-height: 12px;
                @include text-ellipsis;
              }
              border-color: var(--tl-color-tabs-border);
              color: var(--tl-color-text);
              &:hover {
                background-color: var(--tl-color-hover-bg);
              }
              &.is-active {
                font-weight: bold;
                background-color: var(--tl-color-active-bg);
              }
            }
          }
        }
        .el-tabs__content {
          display: none;
        }
      }
    }
    .el-tree {
      background-color: transparent !important;
      --el-tree-node-hover-bg-color: var(--tl-color-hover-bg);
      height: calc(100% - 103px);
      overflow: auto;
      padding-bottom: 30px;
      // margin-top: 8px;

      &::-webkit-scrollbar {
        display: none;
      }

      .el-tree-node {
        svg.icon {
          height: 100%;
        }
        &.tree-dir-node.is-current {
          .el-tree-node__content {
            background-color: transparent !important;
            &:hover {
              background-color: var(--tl-color-hover-bg);
            }
          }
        }
        &.is-current.tree-task-node {
          .el-tree-node__content {
            background-color: var(--tl-color-active-bg);
          }
        }
        .el-tree-node__content {
          &:hover {
            background-color: var(--tl-color-hover-bg);
          }
          div.custom-tree-node {
            width: calc(100% - 24px);
            height: 100%;
            position: relative;

            .top-triangle {
              border-color: #999 #999 transparent transparent;
              border-style: solid;
              border-width: 9px 12px;
              right: 0;
              position: absolute;
              top: 0;
            }

            .top-pin {
              position: absolute;
              height: 10px;
              left: -4px;
              top: -8px;
              color: #fff;
              transform: rotate(305deg);
            }
          }
        }
      }
    }
    &:has(.vc-container.vc-weekly) .el-tree {
      height: calc(100% - 192px);
    }
    &:has(.vc-container.vc-monthly) .el-tree {
      height: calc(100% - 296px);
    }
  }
}
</style>

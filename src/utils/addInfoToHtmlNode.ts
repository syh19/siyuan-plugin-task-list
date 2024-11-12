/**
 * 为任务节点添加日期信息
 * 当任务节点被勾选以及取消勾选时，添加日期信息
 * 当切换任务节点时，添加日期信息
 */
import { formatDateTime } from "@/utils/date";
import { i18n } from "@/utils/common";
import * as API from "@/api";

const judgeIsShowExtraInfoOnDocTask = async () => {
  const { data: storage } = await API.getLocalStorage();
  if (!storage["plugin-task-list-settings"]) return;
  const { docTaskConfig } = storage["plugin-task-list-settings"];
  let isShow: boolean = false;
  if (typeof docTaskConfig?.isShowExtraInfoOnDocTask === "boolean") {
    isShow = docTaskConfig.isShowExtraInfoOnDocTask;
  } else {
    // 默认显示
    isShow = true;
  }
  return isShow;
};

export async function addHandleDateToTaskNode() {

  // 获取编辑器容器
  const editor = document.querySelector(".protyle-wysiwyg");
  if (!editor) return;

  // 清除所有已存在的日期信息元素和包装器
  const existingWrappers = document.querySelectorAll(
    ".siyuan-plugin-task-date-info-wrapper"
  );
  existingWrappers.forEach((el) => el.remove());

  // 清除可能存在的 NodeHTMLBlock
  const htmlBlocks = document.querySelectorAll(
    'div[data-type="NodeHTMLBlock"]'
  );
  htmlBlocks.forEach((block) => {
    if (block.innerHTML.includes("siyuan-plugin-task-date-info")) {
      block.remove();
    }
  });

  const isShow = await judgeIsShowExtraInfoOnDocTask();
  if (!isShow) return;

  // 获取所有任务节点
  const taskNodes = document.querySelectorAll(
    'div[data-marker="*"][data-type="NodeListItem"][data-subtype="t"]'
  );

  taskNodes.forEach((node) => {
    const handleDate = node.getAttribute("custom-plugin-task-list-handleat");
    const finishedDate = node.getAttribute("custom-plugin-task-list-finished");

    if (handleDate || finishedDate) {
      const dateInfo = document.createElement("div");
      dateInfo.className = "siyuan-plugin-task-date-info";

      // 设置样式和属性
      dateInfo.style.cssText = `
        position: absolute;
        font-size: 10px;
        color: #888;
        pointer-events: none !important;
        text-align: right;
        right: 5px;
        top: -15px;
        user-select: none !important;
        -webkit-user-select: none !important;
      `;

      // 使用多重保护确保元素不可编辑
      dateInfo.setAttribute("contenteditable", "false");
      dateInfo.setAttribute("data-editable", "false");
      dateInfo.setAttribute("spellcheck", "false");
      dateInfo.setAttribute("data-type", "siyuan-plugin-custom-date-info");

      // 设置日期文本
      let dateText = [];
      if (handleDate) {
        dateText.push(
          `${i18n.infoCard.handleAt}: ${formatDateTime(handleDate, "date")}`
        );
      }
      if (finishedDate) {
        dateText.push(
          `${i18n.infoCard.finished}: ${formatDateTime(finishedDate, "date")}`
        );
      }
      dateInfo.textContent = dateText.join(" ");

      // 确保任务节点是相对定位
      (node as HTMLElement).style.position = "relative";

      // 创建一个包装器来进一步隔离编辑状态
      const wrapper = document.createElement("div");
      wrapper.className = "siyuan-plugin-task-date-info-wrapper";
      wrapper.style.cssText =
        "pointer-events: none !important; position: absolute; top: 0; right: 0; left: 0;";
      wrapper.setAttribute("contenteditable", "false");
      wrapper.setAttribute("data-type", "siyuan-plugin-custom-wrapper");

      wrapper.appendChild(dateInfo);
      node.appendChild(wrapper);
    }
  });
}

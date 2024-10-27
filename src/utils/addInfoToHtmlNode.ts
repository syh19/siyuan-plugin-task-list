/**
 * 为任务节点添加日期信息
 * 当任务节点被勾选以及取消勾选时，添加日期信息
 * 当切换任务节点时，添加日期信息
 */
import { formatDateTime } from "@/utils/date";
import { i18n } from "@/utils/common";

export function addHandleDateToTaskNode() {
  const taskNodes = document.querySelectorAll('div[data-subtype="t"]');

  taskNodes.forEach((node) => {
    const handleDate = node.getAttribute("custom-plugin-task-list-handleat");
    const finishedDate = node.getAttribute("custom-plugin-task-list-finished");

    // 先清除已存在的日期信息元素
    const existingDateInfo = node.querySelector(".task-date-info");
    if (existingDateInfo) {
      existingDateInfo.remove();
    }

    if (handleDate || finishedDate) {
      const dateInfo = document.createElement("div");
      dateInfo.className = "task-date-info";
      dateInfo.style.cssText = `
        position: absolute;
        top: -5px;
        right: 5px;
        font-size: 10px;
        color: #888;
        pointer-events: none;
        text-align: right;
      `;

      let dateText = "";
      if (handleDate) {
        dateText += `${i18n.infoCard.handleAt}: ${formatDateTime(handleDate, "date")}`;
      }
      if (finishedDate) {
        if (dateText) dateText += " "; // 使用HTML实体空白符增加间隙
        dateText += `${i18n.infoCard.finished}: ${formatDateTime(finishedDate, "date")}`;
      }

      dateInfo.textContent = dateText;
      // dateInfo.innerHTML = dateText; // 使用innerHTML代替textContent以正确渲染HTML实体，但是这样可能会导致渲染出 html 元素到页面上

      if ((node as HTMLElement).style.position !== "relative") {
        (node as HTMLElement).style.position = "relative";
      }

      node.appendChild(dateInfo);
    }
  });
}

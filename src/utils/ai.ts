import * as date from "@/utils/date";
import { ElMessage } from "element-plus";
import html2canvas from "html2canvas";
import { i18n } from "@/utils/common";

export let taskListForAI: any[] = [];

export function handleTaskListForAI(taskList: any[]) {
  taskListForAI = taskList.map((item) => ({
    boxName: item.boxName,
    hpath: item.hpath,
    label: item.label,
    status: item.status,
    created: date.formatDateTime(item.created, "dateTime"),
    // updated: date.formatDateTime(item.updated, 'dateTime'),
    handleAt: date.formatDateTime(item.handleAt, "dateTime"),
    finished: date.formatDateTime(item.finished, "dateTime"),
  }));
}

const imgWidthMap = {
  pc: {
    whole: 1200,
    single: 800,
  },
  mobile: {
    whole: 800,
    single: 350,
  },
};

/**
 * 下载为图片
 * @param elementId 元素ID
 * @param fileName 文件名【如果fileName以“全部”开头，则单独处理图片宽度】
 * @param pcOrMobilePic pc或mobile
 */
export async function downloadAsImage({
  elementId,
  fileName,
  pcOrMobilePic,
  isAll = false,
}: {
  elementId: string;
  fileName: string;
  pcOrMobilePic: string;
  isAll?: boolean;
}) {
  try {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      ElMessage.error("未找到指定元素");
      return;
    }

    let wrapperWidth: number = 0;
    if (isAll) {
      wrapperWidth = imgWidthMap[pcOrMobilePic].whole;
    } else {
      wrapperWidth = imgWidthMap[pcOrMobilePic].single;
    }
    // 创建包装元素
    const wrapper = document.createElement("div");
    wrapper.style.padding = "20px";
    wrapper.style.width = `${wrapperWidth}px`;
    // wrapper.style.height = `${wrapperWidth * 1.414}px`;
    wrapper.style.background =
      "linear-gradient(-45deg, #fc00ff 0%, #00dbde 100%)";
    // wrapper.style.borderRadius = "16px";
    wrapper.style.boxShadow =
      "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)";
    wrapper.style.display = "inline-block";

    // 克隆原始元素的内容
    const clone = originalElement.cloneNode(true) as HTMLElement;
    // clone.style.background = "transparent";
    clone.style.borderRadius = "16px";
    clone.style.padding = "20px";
    clone.style.wordBreak = "break-word";
    clone.style.whiteSpace = "pre-wrap";
    clone.style.overflow = "hidden";
    clone.style.fontSize = "16px";
    clone.style.lineHeight = "1.5";
    clone.style.letterSpacing = "0.5px"; // 防止文字粘连
    clone.style.maxWidth = "100%";
    clone.style.width = "100%";

    wrapper.appendChild(clone);

    // 处理SVG图标
    const svgIcons = wrapper.querySelectorAll("svg");
    await Promise.all(
      Array.from(svgIcons).map(async (svg) => {
        const use = svg.querySelector("use");
        if (use) {
          const iconId = use.getAttribute("xlink:href");
          if (iconId) {
            // 尝试获取原始SVG内容
            const originalIcon = document.querySelector(iconId);
            if (originalIcon) {
              // 如果找到原始SVG，直接复制其内容
              svg.innerHTML = originalIcon.innerHTML;
              svg.setAttribute(
                "viewBox",
                originalIcon.getAttribute("viewBox") || ""
              );
            } else {
              // 如果找不到原始SVG，尝试加载外部SVG
              try {
                const response = await fetch(iconId);
                const svgContent = await response.text();
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(
                  svgContent,
                  "image/svg+xml"
                );
                const svgElement = svgDoc.documentElement;
                svg.innerHTML = svgElement.innerHTML;
                svg.setAttribute(
                  "viewBox",
                  svgElement.getAttribute("viewBox") || ""
                );
              } catch (error) {
                console.error("无法加载SVG图标:", error);
              }
            }
          }
        }
        // 确保SVG有合适的尺寸
        if (!svg.getAttribute("width")) svg.setAttribute("width", "1em");
        if (!svg.getAttribute("height")) svg.setAttribute("height", "1em");
      })
    );

    // 临时将包装器添加到body，定位到页面外面
    wrapper.style.position = "fixed";
    wrapper.style.top = "-10000px";
    wrapper.style.left = "-10000px";
    document.body.appendChild(wrapper);

    // 使用html2canvas捕获图像
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      logging: false,
      // allowTaint: true,
      // foreignObjectRendering: true,
    });

    // 移除临时元素
    document.body.removeChild(wrapper);

    // 将画布转换为图像并下载
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${i18n.aiRoast.toast.fileNamePrefix}—${fileName}-${pcOrMobilePic}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ElMessage.success(i18n.aiRoast.toast.downloadSuccess);
  } catch (error) {
    console.error(i18n.aiRoast.toast.downloadError + ": ", error);
    ElMessage.error(i18n.aiRoast.toast.downloadError);
  }
}

export type SortOptionValue =
  | "createdAsc"
  | "createdDesc"
  | "updatedAsc"
  | "updatedDesc"
  | "finishedAsc"
  | "finishedDesc";

export type LocalSettings = {
  /** 信息卡片的配置 */
  infoCardConfig: {
    dateTimeDisplayMode: "date" | "dateTime";
    fieldsForHidden: string[];
  };
  /** 需要隐藏任务的节点，包括笔记本节点或者是文档节点 */
  nodeListForHideTask: any[];
  /** 任务列表树的显示模式 */
  taskTreeDisplayMode: "box-doc-task" | "box-task";
  /** 任务节点的排序方式 */
  taskSortBy: SortOptionValue;
};

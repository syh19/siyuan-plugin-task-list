[中文](https://github.com/syh19/siyuan-plugin-task-list/blob/main/README_zh_CN.md)

# Task List Plugin

<img src="https://github.com/syh19/siyuan-plugin-task-list/blob/main/preview.png?raw=true" alt="">

When using Siyuan Notes, you will inevitably have some doubts that puzzle you during the learning or recording process. These doubts may not affect the subsequent learning of the content, so you want to record and skip them temporarily and solve them when you have time. At this time, you need a tool that can organize all the doubt points scattered throughout the workspace to facilitate subsequent viewing and resolution.

Therefore, the **Task List** plugin came into being. It can help you quickly generate a task list for all **Task List Block** type of doubt points and place it in the `Dock` column on the right to facilitate subsequent learning.

## Ability

**This plugin can be used directly without any configuration.**

**Status**: All task list block type nodes (collectively referred to as **task nodes** for convenience) have two states, namely **Unfinished** and **Completed**, click on the note Click the check box in front of the task node to switch the status of the task node.

**Scope**: **Task List** plugin summarizes all task nodes according to three dimensions:

- Document: All task nodes in the currently active open document block
- Notebook: All task nodes in the notebook to which the currently activated document block belongs
- Workspace: All task nodes in all open notebooks in the entire workspace

**Display form**: Task nodes in the **Notebook** and **Workspace** dimensions are displayed in a tree, which can clearly indicate the documents and notebooks to which each task node belongs; **Document** dimension The task nodes under are displayed directly in the list.

Task node descriptions that are too long will be truncated, and the complete task node description will be displayed when the mouse is hovering over the task node.

<img src="https://github.com/syh19/siyuan-plugin-task-list/blob/main/src/assets/imgs/overflow.png?raw=true" style="width:50%" align="center" alt="">

**Ability List：**

**Quick positioning**: Clicking on a task node can automatically open the document where the task node is located, scroll the task node into the visible area, and temporarily highlight it to facilitate quick positioning.

<img src="https://github.com/syh19/siyuan-plugin-task-list/raw/main/src/assets/imgs/location.png" style="width:60%" align="center" alt="">

**Top Button Area:**

<img src="https://github.com/syh19/siyuan-plugin-task-list/raw/main/src/assets/imgs/button.png" style="width:50%" align="center" alt="">

- Refresh: Retrieve the latest data of the task list
- Expand and collapse: Quickly expand and collapse all task nodes
- Switch status: Switch the status of task nodes, including **Unfinished**, **Completed** and **All**; click the status copy next to the plugin to also switch
- Search: Search for task nodes within the current scope and highlight the search terms

# Feedback

If you encounter problems during use or have good suggestions, please leave a message [here](https://github.com/syh19/siyuan-plugin-task-list/issues) for feedback.

- [Siyuan Notes official website](https://b3log.org/siyuan/)
- [SiYuan English Discussion Forum](https://liuyun.io/)
- [Repository Address](https://github.com/syh19/siyuan-plugin-task-list)

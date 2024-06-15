[中文](https://github.com/syh19/siyuan-plugin-task-list/blob/main/README_zh_CN.md)

# Latest version `v0.2.7` change log

**Enhancement**

- Optimize the prompt when the task list is empty
  - You set the hidden scope of the task: all notebooks
  - You set the hidden scope of the task: current notebook
  - You set the hidden scope of the task: current document or a document and its subdocuments
  - You have filtered tasks: There are no tasks for the current date
  - You have filtered tasks: There are no tasks in the current state
  - You have filtered tasks: There are no tasks in the current dimension

**Bugfix**

- Get the task list data of the document in time during initialization [#23](https://github.com/syh19/siyuan-plugin-task-list/issues/23)

> - [For more information about the plugin, please view here](https://liuyun.io/article/1711344682726)
> - [Please view the CHANGE LOG of all versions here](https://github.com/syh19/siyuan-plugin-task-list/blob/main/CHANGELOG_EN.md)

---

# Task List Plugin

<img src="https://github.com/syh19/siyuan-plugin-task-list/blob/main/src/assets/imgs/preview-en.jpg?raw=true" alt="">

When using Siyuan Notes, you will inevitably have some doubts that puzzle you during the learning or recording process. These doubts may not affect the subsequent learning of the content, so you want to record and skip them temporarily and solve them when you have time. At this time, you need a tool that can organize all the doubt points scattered throughout the workspace to facilitate subsequent viewing and resolution.

Therefore, the **Task list plug-in** came into being, which can help you quickly generate a task list for all **task list block** type doubt points and place it in the right `Dock` to facilitate subsequent learning and organization.

## Ability

**This plugin can be used directly without any configuration.**

**Status**: All task list block type nodes (collectively referred to as **task nodes** for convenience) have two status, namely **unfinished** and **completed**. The status of the **task node** can be switched by clicking the check box in front of the **task node** in the note.

**Scope**: **The Task List plug-in** summarizes all task nodes according to three dimensions:

- Document: All task nodes in the currently active open document block
- Notebook: All task nodes in the notebook to which the currently activated document block belongs
- Workspace: All task nodes in all open notebooks in the entire workspace

**Display form**: Task nodes in the **Notebook** and **Workspace** dimensions are displayed in a tree, which can clearly indicate the documents and notebooks to which each task node belongs; **Document** dimension The task nodes under are displayed directly in the list.

Task node descriptions that are too long will be truncated, and the complete task node description will be displayed when the mouse is hovering over the task node.

<img src="https://github.com/syh19/siyuan-plugin-task-list/blob/main/src/assets/imgs/overflow-en.jpg?raw=true" style="width:50%" align="center" alt="">

**Function Points：**

**Quick positioning**: Clicking on a task node can automatically open the document where the task node is located, scroll the task node into the visible area, and temporarily highlight it to facilitate quick positioning.

<img src="https://github.com/syh19/siyuan-plugin-task-list/raw/main/src/assets/imgs/location-en.jpg?raw=true" style="width:80%" align="center" alt="">

**Top Button Area:**

<img src="https://github.com/syh19/siyuan-plugin-task-list/blob/main/src/assets/imgs/button-en.jpg?raw=true" style="width:50%" align="center" alt="">

- Refresh: Retrieve the latest data of the task list
- Expand and collapse: Quickly expand and collapse all task nodes
- Switch status: Switch the status of task nodes, including **Unfinished**, **Completed** and **All**; click the status copy next to the plugin to also switch
- Search: Search for task nodes within the current scope and highlight the search terms

# Feedback

This plug-in uses `Vue3` and `Element Plus` to realize the drawing of `UI Layout` . Due to limited technical capabilities, there will inevitably be some problems during the use of the plug-in. If you encounter problems during use or have good suggestions, please leave a message [here](https://github.com/syh19/siyuan-plugin-task-list/issues) for feedback.

- [Siyuan Notes official website](https://b3log.org/siyuan/en/?lang=en)
- [SiYuan English Discussion Forum](https://liuyun.io/)
- [Github Repository Address](https://github.com/syh19/siyuan-plugin-task-list)

# Donate

I hope this plug-in can be helpful to you. If you like this plug-in, please support me. Thank you very much.

<img src="https://xhir-website-blog.oss-cn-beijing.aliyuncs.com/picgo/donate-QR-code.jpg" style="width:90%" align="center" alt="">

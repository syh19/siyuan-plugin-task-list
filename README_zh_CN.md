[English](https://github.com/syh19/siyuan-plugin-task-list/blob/main/README.md)

# 最新版本`v1.0.4`更新记录

**改进功能**

- ✨✨✨ AI 吐槽模式来袭，让你的任务列表不再 boring ！

**修复缺陷**

- [切换日间/夜间模式时，图标丢失](https://github.com/syh19/siyuan-plugin-task-list/issues/4)

> - [所有功能的详情描述请看这里](https://ld246.com/article/1711244396256)
> - [所有版本的更新记录请看这里](https://github.com/syh19/siyuan-plugin-task-list/blob/main/CHANGELOG.md)

---

# 任务列表插件

<img src="https://github.com/syh19/siyuan-plugin-task-list/blob/main/preview.png?raw=true" align="center" alt="">

## 初衷

在使用思源笔记时，学习或者记录过程中难免会有一些令自己疑惑的问题点，这些疑问点可能不影响后续内容的学习，所以想要暂时记录并跳过，等到有时间时再来解决。这个时候，就需要有一个工具能够将所有散落在整个工作空间的疑问点整理到一起，方便后续查看和解决。

因此，**任务列表**插件应运而生，它可以帮助你将所有的**任务列表块**类型的疑问点快速生成一个任务列表，放置在右侧`Dock`栏中，方便后续学习整理。

## 功能

**本插件开箱即用，无需任何配置。**

**状态**：所有的任务列表块类型的节点（为了方便后续统称**任务节点**）有两种状态，分别是**未完成**和**已完成**，通过点击笔记中任务节点前的复选框可以切换任务节点的状态。

**所属范围**：**任务列表**插件将所有的任务节点按照三个维度进行汇总：

- 文档：当前激活打开的文档块中的所有任务节点
- 笔记本：当前激活打开的文档块所属笔记本中的所有任务节点
- 工作空间：整个工作空间中所有打开的笔记本中的所有任务节点

**展现形式**：**笔记本**和**工作空间**维度下的任务节点通过树的方式展示，可以清晰地表示出各个任务节点所属的文档以及笔记本；**文档**维度下的任务节点则直接展示在列表中。

过长的任务节点描述会被截断，鼠标悬停在任务节点上时会显示完整的任务节点描述。

<img src="https://github.com/syh19/siyuan-plugin-task-list/blob/main/src/assets/imgs/overflow.png?raw=true" style="width:50%" align="center" alt="">

**功能点：**

**快速定位**：点击任务节点可以自动打开该任务节点所在的文档，并将该任务节点滚动到可视区域内，同时做临时高亮处理，方便快速定位。

<img src="https://github.com/syh19/siyuan-plugin-task-list/raw/main/src/assets/imgs/location.png" style="width:80%" align="center" alt="">

**顶部按钮区域：**

<img src="https://github.com/syh19/siyuan-plugin-task-list/raw/main/src/assets/imgs/button.png" style="width:50%" align="center" alt="">

- 刷新：重新获取任务列表最新数据
- 展开收起：快速展开收起所有任务节点
- 切换状态：切换任务节点的状态，包括**未完成**、**已完成**以及**全部**；点击插件旁边的状态文案同样可以进行切换
- 搜索：搜索当前范围内的任务节点，并对搜索词做高亮处理

# 反馈

如果在使用过程中遇到问题或者有好的建议，欢迎在[这里](https://github.com/syh19/siyuan-plugin-task-list/issues)进行留言反馈。

- [思源笔记官方网站](https://b3log.org/siyuan/)
- [链滴社区-思源笔记版块](https://ld246.com/tag/siyuan)
- [仓库地址](https://github.com/syh19/siyuan-plugin-task-list)

# 捐赠

希望本插件能够对您有所帮助，如果您喜欢本插件的话，欢迎充电支持，万分感谢。

<img src="https://xhir-website-blog.oss-cn-beijing.aliyuncs.com/picgo/donate-QR-code.jpg" style="width:90%" align="center" alt="">

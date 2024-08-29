# CHANGE LOG

## v1.0.4

> **2024-08-29**

**Bugfix**

- [Icon lost when switching between day and night mode](https://github.com/syh19/siyuan-plugin-task-list/issues/4)

## v0.4.2

> **2024-08-09**

- Adjust the font color of some parts of the dock panel [#32](https://github.com/syh19/siyuan-plugin-task-list/issues/32)

## v0.4.1

> **2024-07-29**

**Bugfix**

- When using the plug-in for the first time, if no hidden tasks are set, an error will be reported on the console and the task list will display abnormally.

**Enhancement**

- Initialize configuration data when using the plug-in for the first time.

## v0.4.0

> **2024-07-22**

**Enhancement**

- Information card support configure hidden fields and date formats [#30](https://github.com/syh19/siyuan-plugin-task-list/issues/30)

## v0.3.4

> **2024-07-09**

**Bugfix**

- Optimize the display effect when the `dock` column is too narrow. [#3](https://github.com/syh19/siyuan-plugin-task-list/issues/3)

## v0.3.3

> **2024-07-02**

**Bugfix**

- The console reports an error when the pop-up window is closed. [#28](https://github.com/syh19/siyuan-plugin-task-list/issues/28)
- When filtering with a static date range, tasks with an end date on the current day are not included. [#29](https://github.com/syh19/siyuan-plugin-task-list/issues/29)

**Enhancement**

- Completed tasks support displaying information cards

## v0.3.2

> **2024-06-30**

**Bugfix**

- Right-click the task list item to fix the console error [#25](https://github.com/syh19/siyuan-plugin-task-list/issues/25)

## v0.3.1

> **2024-06-21**

**Enhancement**

- Modify the custom attribute name on top in time before going online.

## v0.3.0

> **2024-06-21**

**Enhancement**

- ✨✨✨ The task list in the `dock` bar supports right-click menu.
- ✨✨✨ Added task pin function. [#21](https://github.com/syh19/siyuan-plugin-task-list/issues/21)
- Move [add task handle date] to the right-click menu.
- Shrink the trigger area of ​​the information card to the icon itself.
- Optimize the height of the list in the `dock` bar.

## v0.2.8

> **2024-06-15**

**Bugfix**

- Delete useless console logs
- Fix the prompt when the task list is empty

## v0.2.7

> **2024-06-15**

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

## v0.2.6

> **2024-06-12**

**Bugfix**

- Fixed the issue where the TAB bar level is too high [#22](https://github.com/syh19/siyuan-plugin-task-list/issues/22)

## v0.2.5

> **2024-06-03**

**Enhancement**

- ✨✨✨ Dimension TAB supports displaying specific document, notebook, and workspace names

## v0.2.4

> **2024-05-29**

**Bugfix**

- Daily task quantity information may display abnormally

## v0.2.3

> **2024-05-28**

**Enhancement**

- The calendar display mode in the dock bar supports choosing week view or month view
- Reduce the size of the calendar in the dock bar to display more tasks
- ✨✨✨ Mark the number of daily todo and done tasks in the calendar view in the dock bar
- Documents, notebooks, and workspace TAB support simultaneously displaying the number of tasks in the current dimension

## v0.2.2

> **2024-05-26**

**Enhancement**

- Add a hotkey key to open and close the plug-in `dock` bar #20
- Remove the maximum width limit for task lists

**Bugfix**

- The timing of the red dot display in the upper right corner of the filter icon is inaccurate
- The height of the task list is inaccurate when there is a week view in the `dock` bar

## v0.2.1

> **2024-05-20**

**Enhancement**

- Task dimension TAB supports persistent storage

## v0.2.0

> **2024-05-14**

**Enhancement**

- ✨✨✨ Task nodes implement customized processing time through calendar view #7 #15
- ✨✨✨ Implement calendar view filtering of task nodes #7 #15

## v0.1.4

> **2024-05-08**

**Bugfix**

- The **sorting function** fails when the task list display mode is "notebook & doc & task". #19

## v0.1.3

> **2024-04-27**

**Enhancement**

- Display the number of tasks. #14

## v0.1.2

> **2024-04-24**

**Bugfix**

- The plug-in reports an error when no setting configuration is saved in the drawer.

## v0.1.1

> **2024-04-23**

**Bugfix**

- Task nodes cannot be displayed normally under the document dimension

## v0.1.0

> **2024-04-22**

**Enhancement**

- Add time-based sorting functionality to task nodes #9
- Reduce packaged file size

  **Bugfix**

  - Moving the `dock` bar plugin icon causes the plugin to become unusable

## v0.0.7

> **2024-04-14**

**Bugfix**

- The text in the information card may display abnormally if it is too long
- Improve custom attribute parsing function
- [Add `DOM` element empty judgment logic](https://github.com/syh19/siyuan-plugin-task-list/issues/13)

## v0.0.6

> **2024-04-08**

**Bugfix**

- Emergency repair: Repair the judgment logic of task completion status

## v0.0.5

> **2024-04-08**

**Enhancement**

- ✨✨✨ Task nodes support automatically adding finished time through custom attributes
- Added information card floating window for task nodes
- [Support switching between task list mode and tree mode through configuration items
  ](https://github.com/syh19/siyuan-plugin-task-list/issues/1)

**Bugfix**

- Fixed the problem of inaccurate judgment of the completion status of nested task nodes

**Others**

- Modify the storage structure of configuration data and realize automatic migration of old data

## v0.0.4

> **2024-04-01**

**Bugfix**

- When running in the browser through the server, an error occurs and the plug-in cannot be used.

## v0.0.3

> **2024-04-01**

**Enhancement**

- [✨✨✨ Add the configuration of hiding task nodes in the specified document. Two hiding methods are supported: **Only the document itself** and **Document and children**](https://github.com/syh19/siyuan-plugin-task-list/issues/5)
- Hide the task node configuration of the specified document support **persistent storage**
- [✨✨✨ In the plug-in configuration, the restriction that it is only available on `PC` is removed. In theory, it is available on all platforms.](https://github.com/syh19/siyuan-plugin-task-list/issues/10)

**Bugfix**

- [When you click on a task node to locate it, in a few scenarios it is possible to locate the task in the **embedded block**.](https://github.com/syh19/siyuan-plugin-task-list/issues/11)

## v0.0.2

> **2024-03-24**

**Enhancement**

- In the initial state, all nodes in the tree are expanded by default.
- After the search input box is hidden, if there is a value in the input box, the data filtering operation can be re-triggered by pressing the `Enter` key on the keyboard.

**Bugfix**

- In some cases, task nodes cannot be displayed normally in the completed state.
- Under the **document dimension**, task nodes in documents that are nested too deeply cannot be displayed.
- After refreshing data and switching [Document, Notebook, Workspace] TAB, the **Expand and Collapse** button may be inconsistent with the actual expand and collapse state.

## v0.0.1

> **2024-03-23**

- Preliminary project development completed

# CHANGE LOG

## v0.0.1

> **2024-03-23**

- Preliminary project development completed

## v0.0.2

> **2024-03-24**

**Enhancement**

- In the initial state, all nodes in the tree are expanded by default.
- After the search input box is hidden, if there is a value in the input box, the data filtering operation can be re-triggered by pressing the `Enter` key on the keyboard.

**Bugfix**

- In some cases, task nodes cannot be displayed normally in the completed state.
- Under the **document dimension**, task nodes in documents that are nested too deeply cannot be displayed.
- After refreshing data and switching [Document, Notebook, Workspace] TAB, the **Expand and Collapse** button may be inconsistent with the actual expand and collapse state.

## v0.0.3

> **2024-04-01**

**Enhancement**

- [✨✨✨ Add the configuration of hiding task nodes in the specified document. Two hiding methods are supported: **Only the document itself** and **Document and children**](https://github.com/syh19/siyuan-plugin-task-list/issues/5)
- Hide the task node configuration of the specified document support **persistent storage**
- [✨✨✨ In the plug-in configuration, the restriction that it is only available on `PC` is removed. In theory, it is available on all platforms.](https://github.com/syh19/siyuan-plugin-task-list/issues/10)

**Bugfix**

- [When you click on a task node to locate it, in a few scenarios it is possible to locate the task in the **embedded block**.](https://github.com/syh19/siyuan-plugin-task-list/issues/11)

## v0.0.4

> **2024-04-01**

**Bugfix**

- When running in the browser through the server, an error occurs and the plug-in cannot be used.

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

## v0.0.6

> **2024-04-08**

**Bugfix**

- Emergency repair: Repair the judgment logic of task completion status

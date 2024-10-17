<template>
  <div class="hidden-tasks-list">
    <ul v-if="hiddenTasks.length">
      <li
        v-for="task in hiddenTasks"
        :key="task.id"
        :class="{ 'task-completed': task.status === 'done' }"
      >
        <div class="task-content">
          <span class="task-icon">
            <svg
              v-if="task.status === 'todo'"
              class="icon icon-todo"
              aria-hidden="true"
            >
              <use xlink:href="#tl-timeCircleFill"></use>
            </svg>
            <svg
              v-if="task.status === 'done'"
              class="icon icon-done"
              aria-hidden="true"
            >
              <use xlink:href="#tl-checkCircleFill"></use>
            </svg>
          </span>
          <div class="task-details">
            <span class="task-text">{{ task.content }}</span>
            <span class="task-path">{{ task.path }}</span>
          </div>
        </div>
        <button @click="showTask(task.id)">{{ i18n.setting.showTask }}</button>
      </li>
    </ul>
    <p v-else>{{ i18n.setting.noHiddenTask }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as API from "../../api";
import * as func from "../../utils/func";
import { i18n } from '../../utils/common'
interface Task {
  id: string;
  content: string;
  path: string;
  status: "todo" | "done";
}

const hiddenTasks = ref<Task[]>([]);

onMounted(async () => {
  await fetchHiddenTasks();
});

const fetchHiddenTasks = async () => {
  const res = await API.getTaskListBySql({ isGetAll: true });
  hiddenTasks.value = res.data
    .filter(
      (task: any) =>
        func.parseStringToKeyValuePairs(task.ial)[
          "custom-plugin-task-list-isTaskHidden"
        ]
    )
    .map((task: any) => ({
      id: task.id,
      content: task.fcontent,
      path: `${task.boxName} > ${task.hpath}`,
      status: task.markdown.substring(0, 5) === "* [ ]" ? "todo" : "done",
    }));
};

const showTask = async (taskId: string) => {
  await API.setBlockAttrs({
    id: taskId,
    attrs: {
      "custom-plugin-task-list-isTaskHidden": "",
    },
  });
  await fetchHiddenTasks();
};
</script>

<style lang="scss" scoped>
.hidden-tasks-list {
  margin-top: 15px;
}

ul {
  list-style-type: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 6px;
  background-color: var(--tl-color-hover-bg);
  transition: all 0.3s ease;
  border: 1px solid var(--tl-color-border);
}

li:hover {
  box-shadow: 0 2px 8px var(--tl-color-border);
  transform: translateY(-1px);
}

.task-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.task-icon {
  font-size: 16px;
  margin-right: 10px;
  color: var(--tl-color-todo-icon);
}

.task-completed .task-icon {
  color: var(--tl-color-done-icon);
}

.task-details {
  display: flex;
  flex-direction: column;
}

.task-text {
  font-size: 14px;
  color: var(--tl-color-text);
  margin-bottom: 3px;
}

.task-path {
  font-size: 11px;
  color: var(--b3-theme-on-surface);
}

button {
  padding: 6px 12px;
  background-color: var(--b3-theme-primary);
  color: var(--b3-theme-on-primary);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 12px;
}

button:hover {
  background-color: var(--b3-theme-primary-light);
}

// .task-completed {
//   background-color: var(--tl-color-active-bg);
// }

// .task-completed .task-text {
//   text-decoration: line-through;
//   color: var(--tl-color-done-icon);
// }
</style>

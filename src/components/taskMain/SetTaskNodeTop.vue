<template>
  <div class="task-maim__set-node-top-wrap">
    <span>{{ i18n.top }}</span>
    <el-input
      v-model="innerNum"
      size="small"
      type="number"
      style="width: 75px"
      :step="1"
      :min="0"
      :max="999"
      @input="handleInput"
      @click.stop
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { i18n } from '@/utils/common'

const props = withDefaults(defineProps<{ num: number }>(), {
  num: 0,
})
const innerNum = ref<number>(0)

innerNum.value = props.num
const emit = defineEmits(['change'])

const handleInput = (e: string) => {
  innerNum.value = +e.replace(/^0|[^0-9]/g, '')
  emit('change', innerNum.value)
}
</script>

<style lang="scss" scoped>
.task-maim__set-node-top-wrap {
  display: flex;
  align-items: center;
  > span {
    margin-right: 5px;
  }
}
</style>

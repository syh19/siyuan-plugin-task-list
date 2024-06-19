<template>
  <div class="task-maim__set-node-top-wrap">
    置顶
    <el-input
      v-model="innerNum"
      size="small"
      type="number"
      style="width: 75px"
      :step="1"
      :min="0"
      :max="999"
      placeholder="0 表示不置顶，数字越大越优先"
      @input="handleInput"
      @click.stop
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'

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

<style lang="scss"></style>

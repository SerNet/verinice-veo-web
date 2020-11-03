<template>
  <div :class="`drag-level-${level}`">
    <div>### Level: {{ level }} ###</div>
    <draggable class="dragArea" tag="ul" :list="tasks" :group="{ name: 'g1' }">
      <li v-for="el in tasks" :key="el.name">
        <p>{{ el.name }}</p>
        <nested-draggable :tasks="el.tasks" :level="level + 1" />
      </li>
    </draggable>
  </div>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'
import draggable from 'vuedraggable'

export default Vue.extend({
  name: 'nested-draggable',
  props: {
    tasks: {
      required: true,
      type: Array
    } as PropOptions<any[]>,
    level: {
      type: Number
    }
  },
  components: {
    draggable
  }
})
</script>
<style scoped>
.dragArea {
  min-height: 50px;
  outline: 1px dashed;
}
.drag-level-1 {
  background-color: #ee4035;
  opacity: 0.9;
}
.drag-level-2 {
  background-color: #f37736;
  opacity: 0.9;
}
.drag-level-3 {
  background-color: #fdf498;
  opacity: 0.9;
}
.drag-level-4 {
  background-color: #7bc043;
  opacity: 0.9;
}
.drag-level-5 {
  background-color: #0392cf;
  opacity: 0.9;
}
.drag-level-6 {
  background-color: #a7226e;
  opacity: 0.9;
}
</style>

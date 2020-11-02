<template>
  <draggable class="dragArea" tag="ul" :list="tasks" :group="{ name: 'g1' }">
    <li v-for="el in tasks" :key="el.name">
      <p>{{ el.name }}</p>
      <nested-draggable :tasks="el.tasks" />
    </li>
  </draggable>
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
    } as PropOptions<any[]>
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
</style>

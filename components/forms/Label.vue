<template>
  <div
    v-if="visible"
    class="vf-label-text py-2"
    :class="options && options.class"
    :style="options && options.style"
  >
    {{ text }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'Label',
  props: {
    text: { type: String, default: () => '' },
    options: { type: Object, default: undefined },
    disabled: Boolean,
    visible: Boolean
  }
})
</script>

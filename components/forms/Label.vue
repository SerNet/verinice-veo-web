<template>
  <v-col class="vf-label">
    <div>
      <div
        v-if="visible"
        class="vf-label-text"
        :class="options && options.class"
        :style="options && options.style"
      >
        {{ text }}
      </div>
    </div>
  </v-col>
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

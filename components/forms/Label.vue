<template>
  <div v-if="visible" class="vf-label" :class="options && options.class" :style="options && options.style">
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

<style lang="scss" scoped>
.vf-label {
  margin-bottom: 10px !important;
}
</style>

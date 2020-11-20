<template>
  <FseLayoutFormat
    v-bind="$props"
    @input="$emit('input', $event)"
    @change="$emit('input', $event)"
  >
    <slot />
  </FseLayoutFormat>
</template>

<script lang="ts">
import Vue from 'vue'
import FseLayoutFormat from './Collection/LayoutFormats/FseLayoutFormat.vue'

export default Vue.extend({
  components: {
    FseLayoutFormat
  },
  props: {
    options: { type: Object, default: undefined },
    formSchema: { type: Object, default: undefined },
    disabled: Boolean,
    visible: Boolean
  }
})
</script>

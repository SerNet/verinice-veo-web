<template>
  <FseLayoutFormat
    v-bind="$props"
    @input="$emit('input', $event)"
    @change="$emit('input', $event)"
    @delete="$emit('delete', $event)"
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
    value: { type: Object, default: undefined },
    formSchemaPointer: String,
    level: Number,
    disabled: Boolean,
    visible: Boolean
  }
})
</script>

<template>
  <LayoutFormat v-bind="$props" @input="$emit('input', $event)" @change="$emit('input', $event)">
    <slot />
  </LayoutFormat>
</template>

<script lang="ts">
import Vue from 'vue'
import LayoutFormat from '~/components/forms/Collection/LayoutFormats/LayoutFormat.vue'

export default Vue.extend({
  components: {
    LayoutFormat
  },
  props: {
    options: { type: Object, default: undefined },
    formSchemaPointer: String,
    disabled: Boolean,
    visible: Boolean
  }
})
</script>

<template>
  <LayoutFormat
    v-bind="$props"
    @input="$emit('input', $event)"
    @change="$emit('input', $event)"
  >
    <Draggable class="dragArea" tag="div" :list="elements" group="dragelements" style="padding: 8px;">
      <slot />
    </Draggable>
  </LayoutFormat>
</template>

<script lang="ts">
import Vue from 'vue'
import LayoutFormat from '~/components/editor/FormSchema/forms/Collection/LayoutFormats/LayoutFormat.vue'
import Draggable from 'vuedraggable'

export default Vue.extend({
  components: {
    LayoutFormat,
    Draggable
  },
  props: {
    options: { type: Object, default: undefined },
    disabled: Boolean,
    visible: Boolean,
    elements: { type: Array, default: undefined }
  }
})
</script>

<style lang="scss" scoped></style>
